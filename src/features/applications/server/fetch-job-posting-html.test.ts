import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  lookup: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock(
  "node:dns/promises",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("node:dns/promises")
      >();

    return {
      ...actual,

      // Vitest/Node interop can access this built-in
      // through either the named or default export.
      default: {
        ...actual,
        lookup: mocks.lookup,
      },

      lookup: mocks.lookup,
    };
  },
);

vi.mock("undici", () => ({
  fetch: mocks.fetch,
}));

import { fetchJobPostingHtml } from "./fetch-job-posting-html";

function htmlResponse(
  html = "<html><body>Job posting</body></html>",
  init: ResponseInit = {},
) {
  const headers = new Headers(
    init.headers,
  );

  if (!headers.has("content-type")) {
    headers.set(
      "content-type",
      "text/html; charset=utf-8",
    );
  }

  return new Response(html, {
    ...init,
    headers,
  });
}

describe("fetchJobPostingHtml", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.lookup.mockResolvedValue([
      {
        address: "93.184.216.34",
        family: 4,
      },
    ]);

    mocks.fetch.mockResolvedValue(
      htmlResponse(),
    );
  });

  it("blocks localhost IPv4 addresses before making a request", async () => {
    const result =
      await fetchJobPostingHtml(
        "http://127.0.0.1",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "Local or private network URLs cannot be imported.",
    });

    expect(
      mocks.lookup,
    ).not.toHaveBeenCalled();

    expect(
      mocks.fetch,
    ).not.toHaveBeenCalled();
  });

  it("blocks localhost IPv6 addresses before making a request", async () => {
    const result =
      await fetchJobPostingHtml(
        "http://[::1]",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "Local or private network URLs cannot be imported.",
    });

    expect(
      mocks.lookup,
    ).not.toHaveBeenCalled();

    expect(
      mocks.fetch,
    ).not.toHaveBeenCalled();
  });

  it("rejects unsupported URL protocols", async () => {
    const result =
      await fetchJobPostingHtml(
        "file:///etc/passwd",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "The job posting URL must use HTTP or HTTPS.",
    });

    expect(
      mocks.lookup,
    ).not.toHaveBeenCalled();

    expect(
      mocks.fetch,
    ).not.toHaveBeenCalled();
  });

  it("blocks hostnames that resolve to private network addresses", async () => {
    mocks.lookup.mockResolvedValue([
      {
        address: "10.0.0.25",
        family: 4,
      },
    ]);

    const result =
      await fetchJobPostingHtml(
        "https://jobs.example.com/posting/123",
      );

    expect(
      mocks.lookup,
    ).toHaveBeenCalledWith(
      "jobs.example.com",
      {
        all: true,
      },
    );

    expect(result).toEqual({
      ok: false,
      message:
        "Local or private network URLs cannot be imported.",
    });

    expect(
      mocks.fetch,
    ).not.toHaveBeenCalled();
  });

  it("allows public IPv6 addresses", async () => {
    mocks.lookup.mockResolvedValue([
      {
        address:
          "2600:9000:24eb:f200:a:a89d:8a00:93a1",
        family: 6,
      },
    ]);

    const result =
      await fetchJobPostingHtml(
        "https://careers.example.com/jobs/123",
      );

    expect(result).toEqual({
      ok: true,
      html:
        "<html><body>Job posting</body></html>",
      finalUrl:
        "https://careers.example.com/jobs/123",
    });

    expect(
      mocks.fetch,
    ).toHaveBeenCalledTimes(1);
  });

  it("blocks redirects that point to private network addresses", async () => {
    mocks.lookup.mockResolvedValue([
      {
        address: "93.184.216.34",
        family: 4,
      },
    ]);

    mocks.fetch.mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: {
          location:
            "http://169.254.169.254/latest/meta-data",
        },
      }),
    );

    const result =
      await fetchJobPostingHtml(
        "https://jobs.example.com/posting/123",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "Local or private network URLs cannot be imported.",
    });

    // Only the original public URL should
    // ever make it to fetch().
    expect(
      mocks.fetch,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejects responses that exceed the maximum allowed size", async () => {
    mocks.fetch.mockResolvedValue(
      htmlResponse("too large", {
        headers: {
          "content-type":
            "text/html; charset=utf-8",
          "content-length":
            "3000001",
        },
      }),
    );

    const result =
      await fetchJobPostingHtml(
        "https://jobs.example.com/posting/123",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "That job posting is too large to import automatically.",
    });
  });

  it("rejects non-HTML responses", async () => {
    mocks.fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "not html",
        }),
        {
          status: 200,
          headers: {
            "content-type":
              "application/json",
          },
        },
      ),
    );

    const result =
      await fetchJobPostingHtml(
        "https://jobs.example.com/posting/123",
      );

    expect(result).toEqual({
      ok: false,
      message:
        "That URL did not return a web page that can be imported.",
    });
  });
});