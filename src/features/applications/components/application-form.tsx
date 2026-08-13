"use client";

import Link from "next/link";
import { useActionState } from "react";

import { JobPostingImportPanel } from "@/features/applications/components/job-posting-import-panel";
import { createApplication } from "@/features/applications/server/create-application";
import type { ApplicationActionState } from "@/features/applications/types/application-action-state";

const initialState: ApplicationActionState = {
  status: "idle",
};

type ApplicationFormAction = (
  previousState: ApplicationActionState,
  formData: FormData,
) => Promise<ApplicationActionState>;

export type ApplicationFormValues = {
  companyName?: string | null;
  roleTitle?: string | null;
  jobUrl?: string | null;
  jobDescription?: string | null;
  status?:
    | "SAVED"
    | "APPLIED"
    | "RECRUITER_SCREEN"
    | "INTERVIEW"
    | "ASSESSMENT"
    | "OFFER"
    | "REJECTED"
    | "WITHDRAWN";
  workArrangement?: "ONSITE" | "HYBRID" | "REMOTE" | null;
  location?: string | null;
  source?: string | null;
  appliedAt?: string | null;
  followUpAt?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  resumeVersion?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactLinkedInUrl?: string | null;
  notes?: string | null;
};

type ApplicationFormProps = {
  action?: ApplicationFormAction;
  initialValues?: ApplicationFormValues;
  cancelHref?: string;
  submitLabel?: string;
  pendingLabel?: string;
  enableJobImport?: boolean;
};

type FieldErrorProps = {
  errors?: string[];
};

type FormSectionProps = {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-red-400" role="alert">
      {errors[0]}
    </p>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-900 bg-blue-950 text-sm font-semibold text-blue-300">
          {number}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

const inputClasses =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white shadow-sm outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClasses = "text-sm font-medium text-slate-200";

const helperClasses = "mt-1.5 text-xs leading-5 text-slate-500";

export function ApplicationForm({
  action = createApplication,
  initialValues = {},
  cancelHref = "/dashboard",
  submitLabel = "Save application",
  pendingLabel = "Saving...",
  enableJobImport = false,
}: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          className="rounded-xl border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <p className="font-medium">Something needs your attention</p>
          <p className="mt-1 text-red-300/90">{state.message}</p>
        </div>
      ) : null}

      <FormSection
        description="Start with the essentials. These details identify the opportunity throughout your tracker."
        number="1"
        title="Position"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="companyName">
              Company name
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.companyName ?? ""}
              id="companyName"
              name="companyName"
              placeholder="Example Company"
              required
              type="text"
            />

            <FieldError errors={state.fieldErrors?.companyName} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="roleTitle">
              Position title
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.roleTitle ?? ""}
              id="roleTitle"
              name="roleTitle"
              placeholder="Software Engineer"
              required
              type="text"
            />

            <FieldError errors={state.fieldErrors?.roleTitle} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClasses} htmlFor="jobUrl">
            Job posting URL
          </label>

          <input
            className={inputClasses}
            defaultValue={initialValues.jobUrl ?? ""}
            id="jobUrl"
            name="jobUrl"
            placeholder="https://company.com/jobs/..."
            type="url"
          />

          <p className={helperClasses}>
            Save the original posting so you can reference it later.
          </p>

          <FieldError errors={state.fieldErrors?.jobUrl} />

          {enableJobImport ? <JobPostingImportPanel /> : null}
        </div>

        <div className="mt-5">
          <label className={labelClasses} htmlFor="jobDescription">
            Job description
          </label>

          <textarea
            className={`${inputClasses} min-h-52 resize-y leading-6`}
            defaultValue={initialValues.jobDescription ?? ""}
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the job description here..."
          />

          <p className={helperClasses}>
            Keeping the description helps when preparing for interviews after
            the posting disappears.
          </p>

          <FieldError errors={state.fieldErrors?.jobDescription} />
        </div>
      </FormSection>

      <FormSection
        description="Track where the opportunity currently stands and when you need to take action."
        number="2"
        title="Application progress"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="status">
              Status
            </label>

            <select
              className={inputClasses}
              defaultValue={initialValues.status ?? "SAVED"}
              id="status"
              name="status"
            >
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="RECRUITER_SCREEN">Recruiter screen</option>
              <option value="INTERVIEW">Interview</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            <FieldError errors={state.fieldErrors?.status} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="source">
              Application source
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.source ?? ""}
              id="source"
              name="source"
              placeholder="LinkedIn, company site, referral..."
              type="text"
            />

            <FieldError errors={state.fieldErrors?.source} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="appliedAt">
              Date applied
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.appliedAt ?? ""}
              id="appliedAt"
              name="appliedAt"
              type="date"
            />

            <FieldError errors={state.fieldErrors?.appliedAt} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="followUpAt">
              Follow-up date
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.followUpAt ?? ""}
              id="followUpAt"
              name="followUpAt"
              type="date"
            />

            <p className={helperClasses}>
              Use this to surface the application in your follow-up workflow.
            </p>

            <FieldError errors={state.fieldErrors?.followUpAt} />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Add location and work-arrangement details so opportunities are easier to compare."
        number="3"
        title="Location & work"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="location">
              Location
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.location ?? ""}
              id="location"
              name="location"
              placeholder="Newark, NJ"
              type="text"
            />

            <FieldError errors={state.fieldErrors?.location} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="workArrangement">
              Work arrangement
            </label>

            <select
              className={inputClasses}
              defaultValue={initialValues.workArrangement ?? ""}
              id="workArrangement"
              name="workArrangement"
            >
              <option value="">Not specified</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>

            <FieldError errors={state.fieldErrors?.workArrangement} />
          </div>
        </div>
      </FormSection>

      <FormSection
        description="Record the compensation range and the résumé version used for this application."
        number="4"
        title="Compensation & résumé"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_140px]">
          <div>
            <label className={labelClasses} htmlFor="salaryMin">
              Minimum salary
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.salaryMin ?? ""}
              id="salaryMin"
              min="0"
              name="salaryMin"
              placeholder="65000"
              step="1"
              type="number"
            />

            <FieldError errors={state.fieldErrors?.salaryMin} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="salaryMax">
              Maximum salary
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.salaryMax ?? ""}
              id="salaryMax"
              min="0"
              name="salaryMax"
              placeholder="85000"
              step="1"
              type="number"
            />

            <FieldError errors={state.fieldErrors?.salaryMax} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="salaryCurrency">
              Currency
            </label>

            <input
              className={`${inputClasses} uppercase`}
              defaultValue={initialValues.salaryCurrency ?? "USD"}
              id="salaryCurrency"
              maxLength={3}
              name="salaryCurrency"
              type="text"
            />

            <FieldError errors={state.fieldErrors?.salaryCurrency} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClasses} htmlFor="resumeVersion">
            Résumé version
          </label>

          <select
            className={inputClasses}
            defaultValue={initialValues.resumeVersion ?? ""}
            id="resumeVersion"
            name="resumeVersion"
          >
            <option value="">Not specified</option>
            <option value="Frontend/Web">Frontend/Web</option>
            <option value="Software/Full-Stack">Software/Full-Stack</option>
            <option value="Adjacent Technical">Adjacent Technical</option>
          </select>

          <p className={helperClasses}>
            Track which résumé was submitted so you know what the employer
            received.
          </p>

          <FieldError errors={state.fieldErrors?.resumeVersion} />
        </div>
      </FormSection>

      <FormSection
        description="Keep recruiter or hiring-manager information attached to the application."
        number="5"
        title="Contact"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="contactName">
              Contact name
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.contactName ?? ""}
              id="contactName"
              name="contactName"
              placeholder="Recruiter or hiring manager"
              type="text"
            />

            <FieldError errors={state.fieldErrors?.contactName} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="contactEmail">
              Contact email
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.contactEmail ?? ""}
              id="contactEmail"
              name="contactEmail"
              placeholder="recruiter@company.com"
              type="email"
            />

            <FieldError errors={state.fieldErrors?.contactEmail} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClasses} htmlFor="contactLinkedInUrl">
            Contact LinkedIn URL
          </label>

          <input
            className={inputClasses}
            defaultValue={initialValues.contactLinkedInUrl ?? ""}
            id="contactLinkedInUrl"
            name="contactLinkedInUrl"
            placeholder="https://www.linkedin.com/in/..."
            type="url"
          />

          <FieldError errors={state.fieldErrors?.contactLinkedInUrl} />
        </div>
      </FormSection>

      <FormSection
        description="Capture anything useful for future follow-ups, interviews, or decision-making."
        number="6"
        title="Notes"
      >
        <div>
          <label className={labelClasses} htmlFor="notes">
            Private notes
          </label>

          <textarea
            className={`${inputClasses} min-h-40 resize-y leading-6`}
            defaultValue={initialValues.notes ?? ""}
            id="notes"
            name="notes"
            placeholder="Referral details, interview notes, recruiter conversations, next steps..."
          />

          <p className={helperClasses}>
            These notes stay attached to this application in your tracker.
          </p>

          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          <span className="text-red-400">*</span> Required fields
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            href={cancelHref}
          >
            Cancel
          </Link>

          <button
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}