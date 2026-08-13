import { describe, expect, it } from "vitest";

import { parseJobPostingHtml } from "./job-posting-parser";

function makeHtml(jobPosting: Record<string, unknown>) {
  return `
    <!doctype html>
    <html>
      <head>
        <script type="application/ld+json">
          ${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            ...jobPosting,
          })}
        </script>
      </head>
      <body></body>
    </html>
  `;
}

describe("parseJobPostingHtml", () => {
  it("extracts structured job posting details", () => {
    const html = makeHtml({
      title: "Software Engineer",
      description:
        "<p>Build reliable systems for customers.</p>",
      responsibilities:
        "Own backend APIs&nbsp;Ship production features",
      qualifications:
        "3+ years of experience&nbsp;Strong TypeScript skills",
      hiringOrganization: {
        "@type": "Organization",
        name: "Acme",
      },
      jobLocation: [
        {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Newark",
            addressRegion: "NJ",
            addressCountry: "US",
          },
        },
        {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "New York",
            addressRegion: "NY",
            addressCountry: "US",
          },
        },
      ],
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: 120000,
          maxValue: 150000,
          unitText: "YEAR",
        },
      },
    });

    const result = parseJobPostingHtml(
      html,
      "https://boards.greenhouse.io/acme/jobs/123",
    );

    expect(result).toEqual(
      expect.objectContaining({
        companyName: "Acme",
        roleTitle: "Software Engineer",
        jobUrl:
          "https://boards.greenhouse.io/acme/jobs/123",
        source: "Greenhouse",
        location:
          "Newark, NJ, US / New York, NY, US",
        salaryMin: 120000,
        salaryMax: 150000,
        salaryCurrency: "USD",
      }),
    );

    expect(result.jobDescription).toContain(
      "Build reliable systems for customers.",
    );

    expect(result.jobDescription).toContain(
      "Responsibilities",
    );

    expect(result.jobDescription).toContain(
      "• Own backend APIs",
    );

    expect(result.jobDescription).toContain(
      "Qualifications",
    );

    expect(result.jobDescription).toContain(
      "• Strong TypeScript skills",
    );
  });

  it("extracts remote work arrangement and remote location requirements", () => {
    const html = makeHtml({
      title: "Frontend Engineer",
      description: "Build the product.",
      hiringOrganization: {
        "@type": "Organization",
        name: "Northstar",
      },
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: {
        "@type": "Country",
        name: "United States",
      },
    });

    const result = parseJobPostingHtml(
      html,
      "https://jobs.example.com/frontend-engineer",
    );

    expect(result.workArrangement).toBe("REMOTE");
    expect(result.location).toBe(
      "Remote · United States",
    );
  });

  it("removes encoded HTML from imported descriptions", () => {
    const html = makeHtml({
      title: "Web Developer",
      hiringOrganization: {
        "@type": "Organization",
        name: "Example Company",
      },
      description:
        "&lt;div&gt;&lt;p&gt;Build web applications.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Ship code&lt;/li&gt;&lt;/ul&gt;&lt;/div&gt;",
    });

    const result = parseJobPostingHtml(
      html,
      "https://jobs.example.com/web-developer",
    );

    expect(result.jobDescription).toContain(
      "Build web applications.",
    );

    expect(result.jobDescription).toContain(
      "Ship code",
    );

    expect(result.jobDescription).not.toMatch(
      /<\/?[a-z][^>]*>/i,
    );
  });

  it("falls back to metadata when structured job data is unavailable", () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Software Engineer at Acme</title>
          <meta
            property="og:title"
            content="Software Engineer at Acme"
          />
          <meta
            property="og:description"
            content="Build useful products for customers."
          />
          <script type="application/ld+json">
            { this is not valid json }
          </script>
        </head>
        <body></body>
      </html>
    `;

    const result = parseJobPostingHtml(
      html,
      "https://careers.acme.com/jobs/123",
    );

    expect(result.roleTitle).toBe(
      "Software Engineer",
    );

    expect(result.companyName).toBe("Acme");

    expect(result.jobDescription).toBe(
      "Build useful products for customers.",
    );

    expect(result.source).toBe(
      "careers.acme.com",
    );
  });

  it("does not import hourly compensation as annual salary", () => {
    const html = makeHtml({
      title: "Support Engineer",
      description: "Help customers.",
      hiringOrganization: {
        "@type": "Organization",
        name: "Acme",
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: {
          "@type": "QuantitativeValue",
          minValue: 25,
          maxValue: 35,
          unitText: "HOUR",
        },
      },
    });

    const result = parseJobPostingHtml(
      html,
      "https://jobs.example.com/support",
    );

    expect(result.salaryMin).toBeUndefined();
    expect(result.salaryMax).toBeUndefined();
    expect(result.salaryCurrency).toBeUndefined();
  });
});