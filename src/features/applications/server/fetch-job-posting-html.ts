import "server-only";

import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

import { fetch } from "undici";

const MAX_URL_LENGTH = 2048;
const MAX_REDIRECTS = 4;
const MAX_RESPONSE_BYTES = 3_000_000;
const REQUEST_TIMEOUT_MS = 10_000;

const blockedAddresses = new BlockList();

// IPv4 private, loopback, link-local, benchmarking,
// documentation, multicast, and reserved ranges.
blockedAddresses.addSubnet(
  "0.0.0.0",
  8,
  "ipv4",
);
blockedAddresses.addSubnet(
  "10.0.0.0",
  8,
  "ipv4",
);
blockedAddresses.addSubnet(
  "100.64.0.0",
  10,
  "ipv4",
);
blockedAddresses.addSubnet(
  "127.0.0.0",
  8,
  "ipv4",
);
blockedAddresses.addSubnet(
  "169.254.0.0",
  16,
  "ipv4",
);
blockedAddresses.addSubnet(
  "172.16.0.0",
  12,
  "ipv4",
);
blockedAddresses.addSubnet(
  "192.0.0.0",
  24,
  "ipv4",
);
blockedAddresses.addSubnet(
  "192.0.2.0",
  24,
  "ipv4",
);
blockedAddresses.addSubnet(
  "192.88.99.0",
  24,
  "ipv4",
);
blockedAddresses.addSubnet(
  "192.168.0.0",
  16,
  "ipv4",
);
blockedAddresses.addSubnet(
  "198.18.0.0",
  15,
  "ipv4",
);
blockedAddresses.addSubnet(
  "198.51.100.0",
  24,
  "ipv4",
);
blockedAddresses.addSubnet(
  "203.0.113.0",
  24,
  "ipv4",
);
blockedAddresses.addSubnet(
  "224.0.0.0",
  3,
  "ipv4",
);

// IPv6 unspecified, loopback, mapped IPv4,
// discard-only, documentation, private/link-local,
// deprecated site-local, and multicast ranges.
blockedAddresses.addSubnet(
  "::",
  128,
  "ipv6",
);
blockedAddresses.addSubnet(
  "::1",
  128,
  "ipv6",
);

blockedAddresses.addSubnet(
  "100::",
  64,
  "ipv6",
);
blockedAddresses.addSubnet(
  "2001:db8::",
  32,
  "ipv6",
);
blockedAddresses.addSubnet(
  "fc00::",
  7,
  "ipv6",
);
blockedAddresses.addSubnet(
  "fe80::",
  10,
  "ipv6",
);
blockedAddresses.addSubnet(
  "fec0::",
  10,
  "ipv6",
);
blockedAddresses.addSubnet(
  "ff00::",
  8,
  "ipv6",
);

const blockedHostnameSuffixes = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".home",
  ".test",
  ".invalid",
  ".example",
];

class FetchValidationError extends Error {}

export type FetchJobPostingHtmlResult =
  | {
      ok: true;
      html: string;
      finalUrl: string;
    }
  | {
      ok: false;
      message: string;
    };

function normalizedHostname(
  url: URL,
): string {
  return url.hostname
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function isBlockedAddress(
  address: string,
  family?: number,
): boolean {
  const detectedFamily =
    family ?? isIP(address);

  if (detectedFamily === 4) {
    return blockedAddresses.check(
      address,
      "ipv4",
    );
  }

  if (detectedFamily === 6) {
    return blockedAddresses.check(
      address,
      "ipv6",
    );
  }

  return true;
}

async function validateRemoteUrl(
  rawUrl: string,
): Promise<URL> {
  if (
    !rawUrl ||
    rawUrl.length > MAX_URL_LENGTH
  ) {
    throw new FetchValidationError(
      "Enter a valid job posting URL.",
    );
  }

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new FetchValidationError(
      "Enter a valid job posting URL.",
    );
  }

  if (
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new FetchValidationError(
      "The job posting URL must use HTTP or HTTPS.",
    );
  }

  if (url.username || url.password) {
    throw new FetchValidationError(
      "URLs containing credentials cannot be imported.",
    );
  }

  if (
    url.port &&
    url.port !== "80" &&
    url.port !== "443"
  ) {
    throw new FetchValidationError(
      "The job posting URL uses an unsupported port.",
    );
  }

  const hostname =
    normalizedHostname(url);

  if (
    !hostname ||
    hostname === "localhost" ||
    blockedHostnameSuffixes.some(
      (suffix) =>
        hostname.endsWith(suffix),
    )
  ) {
    throw new FetchValidationError(
      "Local or private network URLs cannot be imported.",
    );
  }

  const literalAddressFamily =
    isIP(hostname);

  if (literalAddressFamily) {
    if (
      isBlockedAddress(
        hostname,
        literalAddressFamily,
      )
    ) {
      throw new FetchValidationError(
        "Local or private network URLs cannot be imported.",
      );
    }

    return url;
  }

  // Single-label hostnames are commonly internal
  // network names rather than public websites.
  if (!hostname.includes(".")) {
    throw new FetchValidationError(
      "Enter a public job posting URL.",
    );
  }

  let addresses: Array<{
  address: string;
  family: number;
}>;

  try {
    addresses = await lookup(
      hostname,
      {
        all: true,
      },
    );
  } catch {
    throw new FetchValidationError(
      "We could not resolve that job posting address.",
    );
  }

  if (
    addresses.length === 0 ||
    addresses.some((result) =>
      isBlockedAddress(
        result.address,
        result.family,
      ),
    )
  ) {
    throw new FetchValidationError(
      "Local or private network URLs cannot be imported.",
    );
  }

  return url;
}

async function cancelResponseBody(
  response: Awaited<
    ReturnType<typeof fetch>
  >,
) {
  if (!response.body) {
    return;
  }

  try {
    await response.body.cancel();
  } catch {
    // Nothing else to do. The request is already being abandoned.
  }
}

async function readLimitedHtml(
  response: Awaited<
    ReturnType<typeof fetch>
  >,
): Promise<string> {
  const contentLengthHeader =
    response.headers.get(
      "content-length",
    );

  if (contentLengthHeader) {
    const contentLength = Number.parseInt(
      contentLengthHeader,
      10,
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength >
        MAX_RESPONSE_BYTES
    ) {
      await cancelResponseBody(response);

      throw new FetchValidationError(
        "That job posting is too large to import automatically.",
      );
    }
  }

  if (!response.body) {
    return "";
  }

  const reader =
    response.body.getReader();

  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let html = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (
      receivedBytes >
      MAX_RESPONSE_BYTES
    ) {
      await reader.cancel();

      throw new FetchValidationError(
        "That job posting is too large to import automatically.",
      );
    }

    html += decoder.decode(value, {
      stream: true,
    });
  }

  html += decoder.decode();

  return html;
}

function isRedirectStatus(
  status: number,
) {
  return [
    301,
    302,
    303,
    307,
    308,
  ].includes(status);
}

export async function fetchJobPostingHtml(
  rawUrl: string,
): Promise<FetchJobPostingHtmlResult> {
  const controller =
    new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    let currentUrl =
      await validateRemoteUrl(
        rawUrl.trim(),
      );

    for (
      let redirectCount = 0;
      redirectCount <=
      MAX_REDIRECTS;
      redirectCount += 1
    ) {
      // Validate again before every request.
      // This also validates each redirect destination.
      currentUrl =
        await validateRemoteUrl(
          currentUrl.toString(),
        );

      const response = await fetch(
        currentUrl,
        {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: {
            accept:
              "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
            "accept-language":
              "en-US,en;q=0.9",
            "user-agent":
              "Mozilla/5.0 (compatible; ApplicationTracker/1.0; JobPostingImporter)",
          },
        },
      );

      if (
        isRedirectStatus(
          response.status,
        )
      ) {
        const location =
          response.headers.get(
            "location",
          );

        await cancelResponseBody(
          response,
        );

        if (!location) {
          return {
            ok: false,
            message:
              "The job posting returned an invalid redirect.",
          };
        }

        if (
          redirectCount ===
          MAX_REDIRECTS
        ) {
          return {
            ok: false,
            message:
              "The job posting redirected too many times.",
          };
        }

        currentUrl = new URL(
          location,
          currentUrl,
        );

        continue;
      }

      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 429
      ) {
        await cancelResponseBody(
          response,
        );

        return {
          ok: false,
          message:
            "That site blocked automated access. You can still enter the job details manually.",
        };
      }

      if (!response.ok) {
        await cancelResponseBody(
          response,
        );

        return {
          ok: false,
          message:
            "We could not load that job posting. You can still enter the details manually.",
        };
      }

      const contentType =
        response.headers
          .get("content-type")
          ?.toLowerCase();

      if (
        contentType &&
        !contentType.includes(
          "text/html",
        ) &&
        !contentType.includes(
          "application/xhtml+xml",
        )
      ) {
        await cancelResponseBody(
          response,
        );

        return {
          ok: false,
          message:
            "That URL did not return a web page that can be imported.",
        };
      }

      const html =
        await readLimitedHtml(
          response,
        );

      return {
        ok: true,
        html,
        finalUrl:
          currentUrl.toString(),
      };
    }

    return {
      ok: false,
      message:
        "The job posting redirected too many times.",
    };
  } catch (error) {
    if (error instanceof FetchValidationError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    if (controller.signal.aborted) {
      return {
        ok: false,
        message:
          "The job posting took too long to respond. You can still enter the details manually.",
      };
    }

    console.error(
      "Failed to fetch job posting:",
      error,
    );

    return {
      ok: false,
      message:
        "We could not reach that job posting. You can still enter the details manually.",
    };
  } finally {
    clearTimeout(timeout);
  }
}