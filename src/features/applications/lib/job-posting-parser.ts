import * as cheerio from "cheerio";

import type { ImportedJobPosting } from "@/features/applications/types/job-posting-import";

type JsonRecord = Record<string, unknown>;

type SalaryResult = {
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
};

const knownJobBoardSources = new Set([
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "ZipRecruiter",
  "Greenhouse",
  "Lever",
  "Ashby",
  "Workday",
  "SmartRecruiters",
]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.replace(/[$,\s]/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function truncate(
  value: string | undefined,
  maximumLength: number,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, maximumLength);
}

function htmlToPlainText(
  value: string | undefined,
  maximumLength: number,
): string | undefined {
  if (!value) {
    return undefined;
  }

  let currentValue = value;

  // Some job boards HTML-encode markup inside JSON-LD.
  // Run another pass when decoded text still contains tags.
  for (let pass = 0; pass < 2; pass += 1) {
    const $ = cheerio.load(
      `<body>${currentValue}</body>`,
    );

    $("script, style, noscript").remove();

    $("br").replaceWith("\n");

    $("li").each((_index, element) => {
      $(element).prepend("• ");
      $(element).append("\n");
    });

    $(
      "p, div, section, article, h1, h2, h3, h4, h5, h6",
    ).each((_index, element) => {
      $(element).append("\n");
    });

    currentValue = $("body").text();

    if (!/<\/?[a-z][^>]*>/i.test(currentValue)) {
      break;
    }
  }

  const normalized = currentValue
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line.replace(/[ \t]+/g, " ").trim(),
    )
    .filter(Boolean)
    .join("\n")
    .trim();

  return normalized
    ? normalized.slice(0, maximumLength)
    : undefined;
}

function structuredListToPlainText(
  value: unknown,
  maximumLength: number,
): string | undefined {
  const rawValue = asString(value);

  if (!rawValue) {
    return undefined;
  }

  // Some JobPosting JSON-LD uses &nbsp; rather than
  // arrays or <li> elements to separate individual items.
  const withSeparators = rawValue
    .replace(/&nbsp;/gi, "\n")
    .replace(/\u00a0+/g, "\n");

  const plainText = htmlToPlainText(
    withSeparators,
    maximumLength,
  );

  if (!plainText) {
    return undefined;
  }

  const lines = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return plainText.slice(0, maximumLength);
  }

  return lines
    .map((line) =>
      line.startsWith("• ")
        ? line
        : `• ${line}`,
    )
    .join("\n")
    .slice(0, maximumLength);
}

function normalizedForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionAlreadyIncluded(
  overview: string | undefined,
  section: string | undefined,
) {
  if (!overview || !section) {
    return false;
  }

  const normalizedOverview =
    normalizedForComparison(overview);

  const normalizedSection =
    normalizedForComparison(section);

  if (!normalizedSection) {
    return false;
  }

  const sample = normalizedSection.slice(0, 100);

  return sample.length >= 40 &&
    normalizedOverview.includes(sample);
}

function buildStructuredJobDescription(
  jobPosting: JsonRecord | null,
): string | undefined {
  if (!jobPosting) {
    return undefined;
  }

  const overview = htmlToPlainText(
    asString(jobPosting.description),
    10_000,
  );

  const responsibilities =
    structuredListToPlainText(
      jobPosting.responsibilities,
      7_000,
    );

  const qualifications =
    structuredListToPlainText(
      jobPosting.qualifications,
      7_000,
    );

  const skills =
    structuredListToPlainText(
      jobPosting.skills,
      5_000,
    );

  const sections: string[] = [];

  if (overview) {
    sections.push(overview);
  }

  if (
    responsibilities &&
    !sectionAlreadyIncluded(
      overview,
      responsibilities,
    )
  ) {
    sections.push(
      `Responsibilities\n${responsibilities}`,
    );
  }

  if (
    qualifications &&
    !sectionAlreadyIncluded(
      overview,
      qualifications,
    )
  ) {
    sections.push(
      `Qualifications\n${qualifications}`,
    );
  }

  if (
    skills &&
    !sectionAlreadyIncluded(
      overview,
      skills,
    )
  ) {
    sections.push(
      `Skills\n${skills}`,
    );
  }

  if (sections.length === 0) {
    return undefined;
  }

  return sections
    .join("\n\n")
    .slice(0, 10_000);
}

function cleanSingleLine(
  value: string | undefined,
  maximumLength: number,
): string | undefined {
  const cleaned = htmlToPlainText(
    value,
    maximumLength * 2,
  );

  if (!cleaned) {
    return undefined;
  }

  return cleaned
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);
}

function getTypeNames(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string",
    );
  }

  return [];
}

function findJobPosting(
  value: unknown,
): JsonRecord | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJobPosting(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const types = getTypeNames(
    value["@type"],
  );

  if (
    types.some(
      (type) =>
        type.toLowerCase() ===
        "jobposting",
    )
  ) {
    return value;
  }

  for (const nestedValue of Object.values(value)) {
    const found =
      findJobPosting(nestedValue);

    if (found) {
      return found;
    }
  }

  return null;
}

function extractStructuredJobPosting(
  $: ReturnType<typeof cheerio.load>,
): JsonRecord | null {
  const scripts = $(
    'script[type="application/ld+json"]',
  ).toArray();

  for (const script of scripts) {
    const rawValue =
      $(script).html()?.trim();

    if (!rawValue) {
      continue;
    }

    const normalized = rawValue
      .replace(/^\s*<!--/, "")
      .replace(/-->\s*$/, "")
      .trim();

    try {
      const parsed: unknown =
        JSON.parse(normalized);

      const jobPosting =
        findJobPosting(parsed);

      if (jobPosting) {
        return jobPosting;
      }
    } catch {
      // Ignore unrelated or malformed JSON-LD.
    }
  }

  return null;
}

function organizationName(
  value: unknown,
): string | undefined {
  if (typeof value === "string") {
    return cleanSingleLine(
      value,
      120,
    );
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return cleanSingleLine(
    asString(value.name),
    120,
  );
}

function addressCountryName(
  value: unknown,
): string | undefined {
  if (typeof value === "string") {
    return cleanSingleLine(
      value,
      80,
    );
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return cleanSingleLine(
    asString(value.name),
    80,
  );
}

function extractLocationFromItem(
  value: unknown,
): string | undefined {
  if (typeof value === "string") {
    return cleanSingleLine(
      value,
      160,
    );
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const address = value.address;

  if (typeof address === "string") {
    return cleanSingleLine(
      address,
      160,
    );
  }

  if (isRecord(address)) {
    const parts = [
      asString(address.addressLocality),
      asString(address.addressRegion),
      addressCountryName(
        address.addressCountry,
      ),
    ].filter(
      (part): part is string =>
        Boolean(part),
    );

    if (parts.length > 0) {
      return truncate(
        Array.from(
          new Set(parts),
        ).join(", "),
        160,
      );
    }
  }

  return cleanSingleLine(
    asString(value.name),
    160,
  );
}

function extractLocation(
  value: unknown,
): string | undefined {
  if (Array.isArray(value)) {
    const locations = value
      .map(extractLocationFromItem)
      .filter(
        (
          location,
        ): location is string =>
          Boolean(location),
      );

    if (locations.length === 0) {
      return undefined;
    }

    return truncate(
      Array.from(
        new Set(locations),
      )
        .slice(0, 3)
        .join(" / "),
      160,
    );
  }

  return extractLocationFromItem(value);
}

function extractRequirementLocation(
  value: unknown,
): string | undefined {
  if (Array.isArray(value)) {
    const names = value
      .map(
        extractRequirementLocation,
      )
      .filter(
        (
          name,
        ): name is string =>
          Boolean(name),
      );

    return names.length
      ? truncate(
          Array.from(
            new Set(names),
          )
            .slice(0, 3)
            .join(", "),
          140,
        )
      : undefined;
  }

  if (typeof value === "string") {
    return cleanSingleLine(
      value,
      140,
    );
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return cleanSingleLine(
    asString(value.name),
    140,
  );
}

function deriveWorkArrangement(
  jobPosting: JsonRecord | null,
  roleTitle: string | undefined,
  location: string | undefined,
):
  | "ONSITE"
  | "HYBRID"
  | "REMOTE"
  | undefined {
  const locationTypes = getTypeNames(
    jobPosting?.jobLocationType,
  )
    .join(" ")
    .toUpperCase();

  if (
    locationTypes.includes(
      "TELECOMMUTE",
    )
  ) {
    return "REMOTE";
  }

  const explicitText =
    `${roleTitle ?? ""} ${location ?? ""}`.toLowerCase();

  if (/\bhybrid\b/.test(explicitText)) {
    return "HYBRID";
  }

  if (/\bremote\b/.test(explicitText)) {
    return "REMOTE";
  }

  if (
    /\bon[- ]?site\b/.test(
      explicitText,
    )
  ) {
    return "ONSITE";
  }

  return undefined;
}

function firstRecord(
  value: unknown,
): JsonRecord | null {
  if (isRecord(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (isRecord(item)) {
        return item;
      }
    }
  }

  return null;
}

function normalizeSalaryNumber(
  value: number | undefined,
): number | undefined {
  if (
    value === undefined ||
    value < 0 ||
    value > 10_000_000
  ) {
    return undefined;
  }

  return Math.round(value);
}

function extractSalary(
  jobPosting: JsonRecord | null,
): SalaryResult {
  const baseSalary = firstRecord(
    jobPosting?.baseSalary,
  );

  if (!baseSalary) {
    return {};
  }

  const value = firstRecord(
    baseSalary.value,
  );

  if (!value) {
    return {};
  }

  const unitText =
    asString(value.unitText) ??
    asString(baseSalary.unitText);

  // The tracker stores annual salary ranges.
  // Do not import hourly/daily compensation as annual salary.
  if (
    !unitText ||
    !/\b(YEAR|YEARLY|ANNUAL|ANNUALLY)\b/i.test(
      unitText,
    )
  ) {
    return {};
  }

  let salaryMin =
    normalizeSalaryNumber(
      asNumber(value.minValue),
    );

  let salaryMax =
    normalizeSalaryNumber(
      asNumber(value.maxValue),
    );

  const exactValue =
    normalizeSalaryNumber(
      asNumber(value.value),
    );

  if (
    exactValue !== undefined &&
    salaryMin === undefined &&
    salaryMax === undefined
  ) {
    salaryMin = exactValue;
    salaryMax = exactValue;
  }

  const rawCurrency =
    asString(baseSalary.currency) ??
    asString(value.currency);

  const salaryCurrency =
    rawCurrency &&
    /^[A-Za-z]{3}$/.test(
      rawCurrency,
    )
      ? rawCurrency.toUpperCase()
      : undefined;

  return {
    salaryMin,
    salaryMax,
    salaryCurrency:
      salaryMin !== undefined ||
      salaryMax !== undefined
        ? salaryCurrency
        : undefined,
  };
}

function sourceFromUrl(
  url: string,
): string {
  const hostname = new URL(url)
    .hostname
    .toLowerCase()
    .replace(/^www\./, "");

  if (
    hostname === "linkedin.com" ||
    hostname.endsWith(
      ".linkedin.com",
    )
  ) {
    return "LinkedIn";
  }

  if (
    hostname === "indeed.com" ||
    hostname.endsWith(".indeed.com")
  ) {
    return "Indeed";
  }

  if (
    hostname === "glassdoor.com" ||
    hostname.endsWith(
      ".glassdoor.com",
    )
  ) {
    return "Glassdoor";
  }

  if (
    hostname ===
      "ziprecruiter.com" ||
    hostname.endsWith(
      ".ziprecruiter.com",
    )
  ) {
    return "ZipRecruiter";
  }

  if (
    hostname.includes(
      "greenhouse.io",
    )
  ) {
    return "Greenhouse";
  }

  if (
    hostname === "lever.co" ||
    hostname.endsWith(".lever.co")
  ) {
    return "Lever";
  }

  if (
    hostname.includes(
      "ashbyhq.com",
    )
  ) {
    return "Ashby";
  }

  if (
    hostname.includes(
      "myworkdayjobs.com",
    ) ||
    hostname.includes(
      "workdayjobs.com",
    )
  ) {
    return "Workday";
  }

  if (
    hostname.includes(
      "smartrecruiters.com",
    )
  ) {
    return "SmartRecruiters";
  }

  return hostname.slice(0, 100);
}

function stripSourceSuffix(
  title: string,
  source: string,
): string {
  let normalized = title.trim();

  for (const separator of [
    " | ",
    " - ",
    " – ",
    " — ",
  ]) {
    const suffix =
      `${separator}${source}`.toLowerCase();

    if (
      normalized
        .toLowerCase()
        .endsWith(suffix)
    ) {
      normalized = normalized.slice(
        0,
        normalized.length -
          suffix.length,
      );

      break;
    }
  }

  return normalized.trim();
}

function inferTitleAndCompany(
  title: string | undefined,
  source: string,
): {
  roleTitle?: string;
  companyName?: string;
} {
  if (!title) {
    return {};
  }

  const normalized =
    stripSourceSuffix(
      title.replace(
        /^Job Application for\s+/i,
        "",
      ),
      source,
    );

  const atMatch =
    normalized.match(
      /^(.+?)\s+(?:at|@)\s+(.+)$/i,
    );

  if (atMatch) {
    return {
      roleTitle:
        cleanSingleLine(
          atMatch[1],
          160,
        ),
      companyName:
        cleanSingleLine(
          atMatch[2],
          120,
        ),
    };
  }

  return {
    roleTitle:
      cleanSingleLine(
        normalized,
        160,
      ),
  };
}

export function parseJobPostingHtml(
  html: string,
  finalUrl: string,
): ImportedJobPosting {
  const $ = cheerio.load(html);

  const structuredJobPosting =
    extractStructuredJobPosting($);

  const source =
    sourceFromUrl(finalUrl);

  const metaTitle =
    $(
      "meta[property='og:title']",
    ).attr("content") ??
    $(
      "meta[name='twitter:title']",
    ).attr("content") ??
    $("title").first().text();

  const inferred =
    inferTitleAndCompany(
      cleanSingleLine(
        metaTitle,
        300,
      ),
      source,
    );

  const structuredRoleTitle =
    cleanSingleLine(
      asString(
        structuredJobPosting?.title,
      ),
      160,
    ) ??
    cleanSingleLine(
      asString(
        structuredJobPosting?.name,
      ),
      160,
    );

  const structuredCompanyName =
    organizationName(
      structuredJobPosting
        ?.hiringOrganization,
    );

  const siteName =
    cleanSingleLine(
      $(
        "meta[property='og:site_name']",
      ).attr("content"),
      120,
    );

  const fallbackCompanyName =
    siteName &&
    !knownJobBoardSources.has(
      source,
    ) &&
    siteName.toLowerCase() !==
      source.toLowerCase()
      ? siteName
      : undefined;

  const roleTitle =
    structuredRoleTitle ??
    inferred.roleTitle;

  const companyName =
    structuredCompanyName ??
    inferred.companyName ??
    fallbackCompanyName;

  const structuredDescription =
    buildStructuredJobDescription(
      structuredJobPosting,
    );

  const metaDescription =
    htmlToPlainText(
      $(
        "meta[property='og:description']",
      ).attr("content") ??
        $(
          "meta[name='description']",
        ).attr("content"),
      10_000,
    );

  let location =
    extractLocation(
      structuredJobPosting
        ?.jobLocation,
    );

  const locationTypes =
    getTypeNames(
      structuredJobPosting
        ?.jobLocationType,
    )
      .join(" ")
      .toUpperCase();

  if (
    locationTypes.includes(
      "TELECOMMUTE",
    )
  ) {
    const remoteRequirement =
      extractRequirementLocation(
        structuredJobPosting
          ?.applicantLocationRequirements,
      );

    location = remoteRequirement
      ? truncate(
          `Remote · ${remoteRequirement}`,
          160,
        )
      : location ?? "Remote";
  }

  const workArrangement =
    deriveWorkArrangement(
      structuredJobPosting,
      roleTitle,
      location,
    );

  const salary =
    extractSalary(
      structuredJobPosting,
    );

  return {
    jobUrl: finalUrl,
    companyName,
    roleTitle,
    jobDescription:
      structuredDescription ??
      metaDescription,
    location,
    workArrangement,
    salaryMin: salary.salaryMin,
    salaryMax: salary.salaryMax,
    salaryCurrency:
      salary.salaryCurrency,
    source,
  };
}