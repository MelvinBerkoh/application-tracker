"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import { createResumeVersion } from "@/features/settings/server/create-resume-version";
import { deleteResumeVersion } from "@/features/settings/server/delete-resume-version";
import type { ResumeVersionActionState } from "@/features/settings/types/resume-version-action-state";

type ResumeVersion = {
  id: string;
  name: string;
};

type ResumeVersionSettingsProps = {
  resumeVersions: ResumeVersion[];
};

const initialState: ResumeVersionActionState = {
  status: "idle",
};

export function ResumeVersionSettings({
  resumeVersions,
}: ResumeVersionSettingsProps) {
  const [state, formAction, isPending] =
    useActionState(
      createResumeVersion,
      initialState,
    );

  const formRef =
    useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Résumé versions
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              Save the résumé names you use when
              applying. They will appear in the
              application form so you can track
              exactly which version each employer
              received.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
            {resumeVersions.length}/20
          </span>
        </div>

        <form
          action={formAction}
          className="mt-5"
          ref={formRef}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label
                className="sr-only"
                htmlFor="resume-version-name"
              >
                Résumé version name
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                id="resume-version-name"
                maxLength={100}
                name="name"
                placeholder="e.g. Frontend 2026"
                type="text"
              />

              {state.fieldErrors?.name?.[0] ? (
                <p
                  className="mt-2 text-sm text-red-400"
                  role="alert"
                >
                  {
                    state.fieldErrors
                      .name[0]
                  }
                </p>
              ) : null}
            </div>

            <button
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                isPending ||
                resumeVersions.length >= 20
              }
              type="submit"
            >
              {isPending
                ? "Adding..."
                : "Add résumé"}
            </button>
          </div>

          {state.message ? (
            <p
              className={`mt-3 text-sm ${
                state.status === "success"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
              role={
                state.status === "error"
                  ? "alert"
                  : "status"
              }
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </div>

      <div>
        {resumeVersions.length === 0 ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-5">
              <p className="font-medium text-slate-200">
                No résumé versions yet
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Add the résumé names you actually
                use. You can always choose
                &quot;Not specified&quot; when
                creating an application.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {resumeVersions.map(
              (resumeVersion) => (
                <li
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  key={resumeVersion.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {resumeVersion.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Available when creating or
                      editing applications
                    </p>
                  </div>

                  <form
                    action={
                      deleteResumeVersion
                    }
                  >
                    <input
                      name="resumeVersionId"
                      type="hidden"
                      value={resumeVersion.id}
                    />

                    <button
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-800 hover:bg-red-950/40 hover:text-red-300"
                      type="submit"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/40 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          Removing a résumé version only removes
          it from future dropdowns. Applications
          you already tracked keep their original
          résumé value.
        </p>
      </div>
    </section>
  );
}