"use client";

import Link from "next/link";
import { useActionState } from "react";

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
};

type FieldErrorProps = {
  errors?: string[];
};

function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-400" role="alert">
      {errors[0]}
    </p>
  );
}

const inputClasses =
  "mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClasses = "text-sm font-medium text-slate-200";

export function ApplicationForm({
  action = createApplication,
  initialValues = {},
  cancelHref = "/dashboard",
  submitLabel = "Save application",
  pendingLabel = "Saving...",
}: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <div
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Position information
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Add the company and position you are tracking.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="companyName">
              Company name
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

        <div>
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

          <FieldError errors={state.fieldErrors?.jobUrl} />
        </div>

        <div>
          <label className={labelClasses} htmlFor="jobDescription">
            Job description
          </label>

          <textarea
            className={`${inputClasses} min-h-40 resize-y`}
            defaultValue={initialValues.jobDescription ?? ""}
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the job description here..."
          />

          <FieldError errors={state.fieldErrors?.jobDescription} />
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-800 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Application details
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Record the current stage, location, and relevant dates.
          </p>
        </div>

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
            <label className={labelClasses} htmlFor="source">
              Application source
            </label>

            <input
              className={inputClasses}
              defaultValue={initialValues.source ?? ""}
              id="source"
              name="source"
              placeholder="LinkedIn, company website, referral..."
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

            <FieldError errors={state.fieldErrors?.followUpAt} />
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-800 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Compensation and résumé
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
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
              className={inputClasses}
              defaultValue={initialValues.salaryCurrency ?? "USD"}
              id="salaryCurrency"
              maxLength={3}
              name="salaryCurrency"
              type="text"
            />

            <FieldError errors={state.fieldErrors?.salaryCurrency} />
          </div>
        </div>

        <div>
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
            <option value="Software/Full-Stack">
              Software/Full-Stack
            </option>
            <option value="Adjacent Technical">Adjacent Technical</option>
          </select>

          <FieldError errors={state.fieldErrors?.resumeVersion} />
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-800 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Contact and notes
          </h2>
        </div>

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

        <div>
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

        <div>
          <label className={labelClasses} htmlFor="notes">
            Notes
          </label>

          <textarea
            className={`${inputClasses} min-h-32 resize-y`}
            defaultValue={initialValues.notes ?? ""}
            id="notes"
            name="notes"
            placeholder="Referral information, interview details, follow-up notes..."
          />

          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-6">
        <Link
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          href={cancelHref}
        >
          Cancel
        </Link>

        <button
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}