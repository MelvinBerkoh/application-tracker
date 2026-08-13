"use client";

import Link from "next/link";

type DashboardAttentionPanelProps = {
  followUpsDue: number;
  nextInterview: {
    applicationId: string;
    companyName: string;
    roleTitle: string;
    title: string | null;
    occurredAt: string;
  } | null;
};

export function DashboardAttentionPanel({
  followUpsDue,
  nextInterview,
}: DashboardAttentionPanelProps) {
  const isUpToDate = followUpsDue === 0;

  const formattedInterviewTime = nextInterview
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(nextInterview.occurredAt))
    : null;

  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-2">
      <div
        className={`rounded-2xl border p-5 ${
          isUpToDate
            ? "border-emerald-900/70 bg-emerald-950/20"
            : "border-amber-900/70 bg-amber-950/20"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${
                isUpToDate ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isUpToDate ? "Up to date" : "Needs attention"}
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              {isUpToDate
                ? "Nothing overdue"
                : `${followUpsDue} overdue ${
                    followUpsDue === 1 ? "follow-up" : "follow-ups"
                  }`}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isUpToDate
                ? "Your application follow-ups are currently on track."
                : "Take care of overdue follow-ups to keep opportunities moving."}
            </p>
          </div>

          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isUpToDate
                ? "border-emerald-900 bg-emerald-950 text-emerald-400"
                : "border-amber-900 bg-amber-950 text-amber-400"
            }`}
          >
            {isUpToDate ? "✓" : "!"}
          </span>
        </div>

        {!isUpToDate ? (
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-amber-300 transition hover:text-amber-200"
            href="/applications/follow-ups"
          >
            Review follow-ups →
          </Link>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Next interview
            </p>

            {nextInterview ? (
              <>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {nextInterview.title ?? "Interview"}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {nextInterview.companyName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {nextInterview.roleTitle}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  No interview scheduled
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Scheduled interviews will appear here so your next meeting is
                  always visible.
                </p>
              </>
            )}
          </div>

          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-900 bg-blue-950/60 text-blue-400"
          >
            ◷
          </span>
        </div>

        {nextInterview ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <time
              className="text-sm font-medium text-slate-300"
              dateTime={nextInterview.occurredAt}
              suppressHydrationWarning
            >
              {formattedInterviewTime}
            </time>

            <Link
              className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              href={`/applications/${nextInterview.applicationId}`}
            >
              View application →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}