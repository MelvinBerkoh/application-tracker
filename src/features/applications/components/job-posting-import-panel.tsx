"use client";

import { useRef, useState } from "react";

import { importJobPosting } from "@/features/applications/server/import-job-posting";
import type {
  ImportJobPostingActionState,
  ImportedJobPosting,
} from "@/features/applications/types/job-posting-import";

const initialState: ImportJobPostingActionState = {
  status: "idle",
};

type FeedbackState =
  | {
      status: "success" | "error";
      message: string;
    }
  | null;

type SupportedFormField =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

function isSupportedFormField(
  element: Element | RadioNodeList | null,
): element is SupportedFormField {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

function setFormField(
  form: HTMLFormElement,
  name: string,
  value: string | number | undefined,
) {
  if (value === undefined) {
    return;
  }

  const element = form.elements.namedItem(name);

  if (!isSupportedFormField(element)) {
    return;
  }

  element.value = String(value);

  element.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );

  element.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );
}

function populateImportedFields(
  form: HTMLFormElement,
  data: ImportedJobPosting,
) {
  setFormField(form, "jobUrl", data.jobUrl);
  setFormField(form, "companyName", data.companyName);
  setFormField(form, "roleTitle", data.roleTitle);
  setFormField(form, "jobDescription", data.jobDescription);
  setFormField(form, "location", data.location);
  setFormField(form, "workArrangement", data.workArrangement);
  setFormField(form, "salaryMin", data.salaryMin);
  setFormField(form, "salaryMax", data.salaryMax);
  setFormField(form, "salaryCurrency", data.salaryCurrency);
  setFormField(form, "source", data.source);
}

export function JobPostingImportPanel() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  async function handleImport() {
    const form = buttonRef.current?.form;

    if (!form) {
      setFeedback({
        status: "error",
        message:
          "The application form could not be found. Please refresh and try again.",
      });

      return;
    }

    const jobUrlElement =
      form.elements.namedItem("jobUrl");

    if (
      !isSupportedFormField(jobUrlElement) ||
      !jobUrlElement.value.trim()
    ) {
      setFeedback({
        status: "error",
        message:
          "Paste a job posting URL above before importing.",
      });
if (jobUrlElement instanceof HTMLElement) {
  jobUrlElement.focus();
}

      return;
    }

    setIsImporting(true);
    setFeedback(null);

    const formData = new FormData();

    formData.set(
      "jobUrl",
      jobUrlElement.value.trim(),
    );

    try {
      const result = await importJobPosting(
        initialState,
        formData,
      );

      if (
        result.status === "success" &&
        result.data
      ) {
        populateImportedFields(
          form,
          result.data,
        );

        setFeedback({
          status: "success",
          message:
            result.message ??
            "Job details imported. Review them before saving.",
        });

        return;
      }

      setFeedback({
        status: "error",
        message:
          result.message ??
          "We could not import that job posting.",
      });
    } catch (error) {
      console.error(
        "Failed to import job posting:",
        error,
      );

      setFeedback({
        status: "error",
        message:
          "Something went wrong while importing the posting. You can still enter the details manually.",
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Auto-fill from posting
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            Paste a public job posting URL above and import any details we can
            find. Always review the imported information before saving.
          </p>
        </div>

        <button
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-blue-800 bg-blue-950/60 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:border-blue-700 hover:bg-blue-950 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isImporting}
          onClick={handleImport}
          ref={buttonRef}
          type="button"
        >
          {isImporting ? (
            <>
              <span
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-300"
              />
              Importing...
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="mr-2"
              >
                ↓
              </span>
              Import job details
            </>
          )}
        </button>
      </div>

      {feedback ? (
        <div
          aria-live={
            feedback.status === "success"
              ? "polite"
              : "assertive"
          }
          className={`mt-4 rounded-lg border px-3 py-2.5 text-sm ${
            feedback.status === "success"
              ? "border-emerald-900 bg-emerald-950/40 text-emerald-300"
              : "border-red-900 bg-red-950/40 text-red-300"
          }`}
          role={
            feedback.status === "success"
              ? "status"
              : "alert"
          }
        >
          {feedback.status === "success" ? (
            <span
              aria-hidden="true"
              className="mr-2 font-bold"
            >
              ✓
            </span>
          ) : null}

          {feedback.message}
        </div>
      ) : null}
    </div>
  );
}