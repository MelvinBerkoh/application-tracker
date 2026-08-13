"use server";

import { auth } from "@clerk/nextjs/server";

import { parseJobPostingHtml } from "@/features/applications/lib/job-posting-parser";
import { fetchJobPostingHtml } from "@/features/applications/server/fetch-job-posting-html";
import type { ImportJobPostingActionState } from "@/features/applications/types/job-posting-import";

export async function importJobPosting(
  _previousState: ImportJobPostingActionState,
  formData: FormData,
): Promise<ImportJobPostingActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message:
        "You must be signed in to import a job posting.",
    };
  }

  const jobUrlValue =
    formData.get("jobUrl");

  const jobUrl =
    typeof jobUrlValue === "string"
      ? jobUrlValue.trim()
      : "";

  if (!jobUrl) {
    return {
      status: "error",
      message:
        "Enter a job posting URL first.",
      fieldErrors: {
        jobUrl: [
          "Enter a job posting URL first.",
        ],
      },
    };
  }

  const fetchedPage =
    await fetchJobPostingHtml(jobUrl);

  if (!fetchedPage.ok) {
    return {
      status: "error",
      message:
        fetchedPage.message,
      fieldErrors: {
        jobUrl: [
          fetchedPage.message,
        ],
      },
    };
  }

  let imported;

  try {
    imported =
      parseJobPostingHtml(
        fetchedPage.html,
        fetchedPage.finalUrl,
      );
  } catch (error) {
    console.error(
      "Failed to parse job posting:",
      error,
    );

    return {
      status: "error",
      message:
        "We loaded the posting but could not read its job details. You can still enter them manually.",
    };
  }

  const hasUsefulDetails = Boolean(
    imported.companyName ||
      imported.roleTitle ||
      imported.jobDescription,
  );

  if (!hasUsefulDetails) {
    return {
      status: "error",
      message:
        "We reached the page but could not find enough job details to import. You can still fill out the application manually.",
    };
  }

  const savedJobUrl =
    fetchedPage.finalUrl.length <=
    2048
      ? fetchedPage.finalUrl
      : jobUrl;

  return {
    status: "success",
    message:
      "Job details imported. Review the fields before saving.",
    data: {
      ...imported,
      jobUrl: savedJobUrl,
    },
  };
}