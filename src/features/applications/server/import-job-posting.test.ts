import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ImportJobPostingActionState } from "@/features/applications/types/job-posting-import";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  fetchJobPostingHtml: vi.fn(),
  parseJobPostingHtml: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock(
  "@/features/applications/server/fetch-job-posting-html",
  () => ({
    fetchJobPostingHtml:
      mocks.fetchJobPostingHtml,
  }),
);

vi.mock(
  "@/features/applications/lib/job-posting-parser",
  () => ({
    parseJobPostingHtml:
      mocks.parseJobPostingHtml,
  }),
);

import { importJobPosting } from "./import-job-posting";

const initialState: ImportJobPostingActionState = {
  status: "idle",
};

function makeFormData(jobUrl = "") {
  const formData = new FormData();

  formData.set("jobUrl", jobUrl);

  return formData;
}

describe("importJobPosting", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.auth.mockResolvedValue({
      userId: "user_123",
    });

    mocks.fetchJobPostingHtml.mockResolvedValue({
      ok: true,
      html: "<html></html>",
      finalUrl:
        "https://careers.example.com/jobs/123",
    });

    mocks.parseJobPostingHtml.mockReturnValue({
      jobUrl:
        "https://careers.example.com/jobs/123",
      companyName: "Example Company",
      roleTitle: "Software Engineer",
      jobDescription:
        "Build useful products.",
      source: "careers.example.com",
    });
  });

  it("rejects unauthenticated requests before fetching a posting", async () => {
    mocks.auth.mockResolvedValue({
      userId: null,
    });

    const result = await importJobPosting(
      initialState,
      makeFormData(
        "https://careers.example.com/jobs/123",
      ),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "You must be signed in to import a job posting.",
    });

    expect(
      mocks.fetchJobPostingHtml,
    ).not.toHaveBeenCalled();

    expect(
      mocks.parseJobPostingHtml,
    ).not.toHaveBeenCalled();
  });

  it("rejects an empty job posting URL", async () => {
    const result = await importJobPosting(
      initialState,
      makeFormData(),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "Enter a job posting URL first.",
      fieldErrors: {
        jobUrl: [
          "Enter a job posting URL first.",
        ],
      },
    });

    expect(
      mocks.fetchJobPostingHtml,
    ).not.toHaveBeenCalled();
  });

  it("returns fetch validation errors without parsing", async () => {
    mocks.fetchJobPostingHtml.mockResolvedValue({
      ok: false,
      message:
        "Local or private network URLs cannot be imported.",
    });

    const result = await importJobPosting(
      initialState,
      makeFormData(
        "http://127.0.0.1",
      ),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "Local or private network URLs cannot be imported.",
      fieldErrors: {
        jobUrl: [
          "Local or private network URLs cannot be imported.",
        ],
      },
    });

    expect(
      mocks.parseJobPostingHtml,
    ).not.toHaveBeenCalled();
  });

  it("imports parsed job details successfully", async () => {
    const result = await importJobPosting(
      initialState,
      makeFormData(
        "https://careers.example.com/jobs/123",
      ),
    );

    expect(
      mocks.fetchJobPostingHtml,
    ).toHaveBeenCalledWith(
      "https://careers.example.com/jobs/123",
    );

    expect(
      mocks.parseJobPostingHtml,
    ).toHaveBeenCalledWith(
      "<html></html>",
      "https://careers.example.com/jobs/123",
    );

    expect(result).toEqual({
      status: "success",
      message:
        "Job details imported. Review the fields before saving.",
      data: {
        jobUrl:
          "https://careers.example.com/jobs/123",
        companyName: "Example Company",
        roleTitle: "Software Engineer",
        jobDescription:
          "Build useful products.",
        source: "careers.example.com",
      },
    });
  });

  it("rejects pages that do not contain useful job details", async () => {
    mocks.parseJobPostingHtml.mockReturnValue({
      jobUrl:
        "https://careers.example.com/jobs/123",
      source: "careers.example.com",
    });

    const result = await importJobPosting(
      initialState,
      makeFormData(
        "https://careers.example.com/jobs/123",
      ),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "We reached the page but could not find enough job details to import. You can still fill out the application manually.",
    });
  });

  it("returns a safe error when parsing unexpectedly fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mocks.parseJobPostingHtml.mockImplementation(
      () => {
        throw new Error("Parser exploded");
      },
    );

    const result = await importJobPosting(
      initialState,
      makeFormData(
        "https://careers.example.com/jobs/123",
      ),
    );

    expect(result).toEqual({
      status: "error",
      message:
        "We loaded the posting but could not read its job details. You can still enter them manually.",
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});