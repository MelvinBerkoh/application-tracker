
// ownerId is intentionally absent. The browser must never choose the owner; the server will get it from Clerk.
import { z } from "zod";

export const applicationStatuses = [
  "SAVED",
  "APPLIED",
  "RECRUITER_SCREEN",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export const workArrangements = [
  "ONSITE",
  "HYBRID",
  "REMOTE",
] as const;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalString = (maximumLength: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(maximumLength).optional(),
  );

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url("Enter a valid URL.").max(2048).optional(),
);

const optionalEmail = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().email("Enter a valid email address.").max(254).optional(),
);

const optionalNonNegativeInteger = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  },
  z
    .number()
    .int("Salary must be a whole number.")
    .nonnegative("Salary cannot be negative.")
    .optional(),
);

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string") {
      return new Date(value);
    }

    return value;
  },
  z.date("Enter a valid date.").optional(),
);

export const applicationSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required.")
      .max(120, "Company name cannot exceed 120 characters."),

    roleTitle: z
      .string()
      .trim()
      .min(1, "Role title is required.")
      .max(160, "Role title cannot exceed 160 characters."),

    jobDescription: optionalString(10_000),
    jobUrl: optionalUrl,
    location: optionalString(160),

    workArrangement: z.preprocess(
      emptyStringToUndefined,
      z.enum(workArrangements).optional(),
    ),

    salaryMin: optionalNonNegativeInteger,
    salaryMax: optionalNonNegativeInteger,

    salaryCurrency: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{3}$/, "Currency must use a three-letter code.")
        .default("USD"),
    ),

    source: optionalString(100),
    resumeVersion: optionalString(100),

    status: z.enum(applicationStatuses).default("SAVED"),

    appliedAt: optionalDate,
    followUpAt: optionalDate,

    contactName: optionalString(120),
    contactEmail: optionalEmail,
    contactLinkedInUrl: optionalUrl,

    notes: optionalString(10_000),
  })
  .superRefine((data, context) => {
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMax < data.salaryMin
    ) {
      context.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message:
          "Maximum salary must be greater than or equal to minimum salary.",
      });
    }
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;