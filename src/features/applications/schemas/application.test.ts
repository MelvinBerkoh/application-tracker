import { describe, expect, it } from "vitest";

import { applicationSchema } from "./application";

const validApplication = {
  companyName: "OpenAI",
  roleTitle: "Software Engineer",
};

describe("applicationSchema", () => {
  it("accepts the minimum required application data", () => {
    const result = applicationSchema.safeParse(validApplication);

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.companyName).toBe("OpenAI");
    expect(result.data.roleTitle).toBe("Software Engineer");
    expect(result.data.status).toBe("SAVED");
    expect(result.data.salaryCurrency).toBe("USD");
  });

  it("trims required string fields", () => {
    const result = applicationSchema.safeParse({
      companyName: "  OpenAI  ",
      roleTitle: "  Frontend Engineer  ",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.companyName).toBe("OpenAI");
    expect(result.data.roleTitle).toBe("Frontend Engineer");
  });

  it("rejects blank required fields", () => {
    const result = applicationSchema.safeParse({
      companyName: "   ",
      roleTitle: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    const fieldErrors = result.error.flatten().fieldErrors;

    expect(fieldErrors.companyName).toContain(
      "Company name is required.",
    );
    expect(fieldErrors.roleTitle).toContain(
      "Role title is required.",
    );
  });

  it("converts blank optional strings to undefined", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      location: "   ",
      source: "",
      contactName: " ",
      notes: "",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.location).toBeUndefined();
    expect(result.data.source).toBeUndefined();
    expect(result.data.contactName).toBeUndefined();
    expect(result.data.notes).toBeUndefined();
  });

  it("coerces salary values from form strings into numbers", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryMin: "70000",
      salaryMax: "90000",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.salaryMin).toBe(70000);
    expect(result.data.salaryMax).toBe(90000);
  });

  it("rejects negative salary values", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryMin: "-1",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.flatten().fieldErrors.salaryMin).toContain(
      "Salary cannot be negative.",
    );
  });

  it("rejects a maximum salary lower than the minimum salary", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryMin: "90000",
      salaryMax: "70000",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.flatten().fieldErrors.salaryMax).toContain(
      "Maximum salary must be greater than or equal to minimum salary.",
    );
  });

  it("normalizes the salary currency to uppercase", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryCurrency: "eur",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.salaryCurrency).toBe("EUR");
  });

  it("rejects an invalid currency code", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryCurrency: "US",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(
      result.error.flatten().fieldErrors.salaryCurrency,
    ).toContain("Currency must use a three-letter code.");
  });

  it("accepts valid URLs and rejects invalid URLs", () => {
    const validResult = applicationSchema.safeParse({
      ...validApplication,
      jobUrl: "https://example.com/jobs/123",
      contactLinkedInUrl: "https://www.linkedin.com/in/example",
    });

    expect(validResult.success).toBe(true);

    const invalidResult = applicationSchema.safeParse({
      ...validApplication,
      jobUrl: "not-a-url",
    });

    expect(invalidResult.success).toBe(false);

    if (invalidResult.success) {
      return;
    }

    expect(invalidResult.error.flatten().fieldErrors.jobUrl).toContain(
      "Enter a valid URL.",
    );
  });

  it("accepts a valid contact email and rejects an invalid one", () => {
    const validResult = applicationSchema.safeParse({
      ...validApplication,
      contactEmail: "recruiter@example.com",
    });

    expect(validResult.success).toBe(true);

    const invalidResult = applicationSchema.safeParse({
      ...validApplication,
      contactEmail: "not-an-email",
    });

    expect(invalidResult.success).toBe(false);

    if (invalidResult.success) {
      return;
    }

    expect(
      invalidResult.error.flatten().fieldErrors.contactEmail,
    ).toContain("Enter a valid email address.");
  });

  it("converts date strings into Date objects", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      appliedAt: "2026-08-10",
      followUpAt: "2026-08-15",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    expect(result.data.appliedAt).toBeInstanceOf(Date);
    expect(result.data.followUpAt).toBeInstanceOf(Date);

    expect(result.data.appliedAt?.toISOString()).toBe(
      "2026-08-10T00:00:00.000Z",
    );
    expect(result.data.followUpAt?.toISOString()).toBe(
      "2026-08-15T00:00:00.000Z",
    );
  });

  it("rejects invalid application statuses", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      status: "GHOSTED",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid work arrangements", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      workArrangement: "FLEXIBLE",
    });

    expect(result.success).toBe(false);
  });
});