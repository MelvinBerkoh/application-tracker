import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveApplicationButton } from "@/features/applications/components/archive-application-button";
import { ScheduleInterviewDialog } from "@/features/applications/components/schedule-interview-dialog";
import { UpcomingInterviewCard } from "@/features/applications/components/upcoming-interview-card";
import { archiveApplication } from "@/features/applications/server/archive-application";
import { getApplicationById } from "@/features/applications/server/get-application-by-id";
import { manageInterview } from "@/features/applications/server/manage-interview";
import { scheduleInterview } from "@/features/applications/server/schedule-interview";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabels = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
} as const;

const statusStyles = {
  SAVED: "border-slate-700 bg-slate-800 text-slate-300",
  APPLIED: "border-blue-900 bg-blue-950 text-blue-300",
  RECRUITER_SCREEN: "border-cyan-900 bg-cyan-950 text-cyan-300",
  INTERVIEW: "border-violet-900 bg-violet-950 text-violet-300",
  ASSESSMENT: "border-amber-900 bg-amber-950 text-amber-300",
  OFFER: "border-emerald-900 bg-emerald-950 text-emerald-300",
  REJECTED: "border-red-900 bg-red-950 text-red-300",
  WITHDRAWN: "border-slate-700 bg-slate-900 text-slate-400",
} as const;

function formatDate(date: Date | null) {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatActivityDate(
  date: Date,
  type: string,
) {
  if (type === "INTERVIEW") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSalary(
  minimum: number | null,
  maximum: number | null,
  currency: string,
) {
  if (minimum === null && maximum === null) {
    return "Not specified";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (minimum !== null && maximum !== null) {
    return `${formatter.format(minimum)} – ${formatter.format(maximum)}`;
  }

  if (minimum !== null) {
    return `${formatter.format(minimum)}+`;
  }

  return `Up to ${formatter.format(maximum ?? 0)}`;
}

function displayValue(value: string | null) {
  return value || "Not specified";
}

function formatWorkArrangement(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  if (value === "ONSITE") {
    return "On-site";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}

function activityAccent(type: string) {
  if (type === "INTERVIEW") {
    return "border-violet-900/70 bg-violet-950/10";
  }

  if (type === "FOLLOW_UP") {
    return "border-amber-900/60 bg-amber-950/10";
  }

  if (type === "STATUS_CHANGE") {
    return "border-blue-900/60 bg-blue-950/10";
  }

  return "border-slate-800 bg-slate-950/30";
}

function activityDot(type: string) {
  if (type === "INTERVIEW") {
    return "bg-violet-400";
  }

  if (type === "FOLLOW_UP") {
    return "bg-amber-400";
  }

  if (type === "STATUS_CHANGE") {
    return "bg-blue-400";
  }

  return "bg-slate-500";
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const { id } = await params;

  const application = await getApplicationById({
    applicationId: id,
    ownerId: userId,
  });

  if (!application) {
    notFound();
  }

  const archiveApplicationWithId = archiveApplication.bind(
    null,
    application.id,
  );

  const scheduleInterviewWithId = scheduleInterview.bind(
    null,
    application.id,
  );

  const now = new Date();

  const upcomingInterviews = application.activities
    .filter(
      (activity) =>
        activity.type === "INTERVIEW" &&
        activity.occurredAt >= now,
    )
    .sort(
      (first, second) =>
        first.occurredAt.getTime() -
        second.occurredAt.getTime(),
    );

  const upcomingInterview = upcomingInterviews[0] ?? null;

  const serializedUpcomingInterview = upcomingInterview
    ? {
        id: upcomingInterview.id,
        title: upcomingInterview.title,
        description: upcomingInterview.description,
        occurredAt: upcomingInterview.occurredAt.toISOString(),
      }
    : null;

  const manageInterviewWithId = manageInterview.bind(
    null,
    upcomingInterview?.id ?? "",
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/80 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            className="text-sm font-semibold uppercase tracking-widest text-blue-400 transition hover:text-blue-300"
            href="/dashboard"
          >
            Application Tracker
          </Link>

          <UserButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            className="text-slate-400 transition hover:text-white"
            href="/dashboard"
          >
            Dashboard
          </Link>

          <span className="text-slate-700">/</span>

          <Link
            className="text-slate-400 transition hover:text-white"
            href="/applications"
          >
            Applications
          </Link>

          <span className="text-slate-700">/</span>

          <span className="max-w-64 truncate text-slate-200">
            {application.companyName}
          </span>
        </nav>

        <section className="mt-8 flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  statusStyles[application.status]
                }`}
              >
                {statusLabels[application.status]}
              </span>

              {application.workArrangement ? (
                <span className="inline-flex rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
                  {formatWorkArrangement(application.workArrangement)}
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {application.roleTitle}
            </h1>

            <p className="mt-3 text-xl font-medium text-slate-300">
              {application.companyName}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span>
                {application.location || "Location not specified"}
              </span>

              <span aria-hidden="true">•</span>

              <span>
                Updated {formatDate(application.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {application.jobUrl ? (
              <a
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
                href={application.jobUrl}
                rel="noreferrer"
                target="_blank"
              >
                View posting ↗
              </a>
            ) : null}

            <ScheduleInterviewDialog
              scheduleAction={scheduleInterviewWithId}
            />

            <Link
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              href={`/applications/${application.id}/edit`}
            >
              Edit application
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Date applied
            </p>

            <p className="mt-2 font-medium text-slate-100">
              {formatDate(application.appliedAt)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Follow-up
            </p>

            <p className="mt-2 font-medium text-slate-100">
              {formatDate(application.followUpAt)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Salary
            </p>

            <p className="mt-2 font-medium text-slate-100">
              {formatSalary(
                application.salaryMin,
                application.salaryMax,
                application.salaryCurrency,
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Résumé
            </p>

            <p className="mt-2 font-medium text-slate-100">
              {displayValue(application.resumeVersion)}
            </p>
          </article>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Opportunity
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Application details
                </h2>
              </div>

              <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">
                    Location
                  </dt>

                  <dd className="mt-1 font-medium text-slate-100">
                    {displayValue(application.location)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    Work arrangement
                  </dt>

                  <dd className="mt-1 font-medium text-slate-100">
                    {formatWorkArrangement(application.workArrangement)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    Application source
                  </dt>

                  <dd className="mt-1 font-medium text-slate-100">
                    {displayValue(application.source)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    Created
                  </dt>

                  <dd className="mt-1 font-medium text-slate-100">
                    {formatDate(application.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Reference
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Job description
                </h2>
              </div>

              {application.jobDescription ? (
                <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-300">
                  {application.jobDescription}
                </p>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No job description was saved for this application.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Personal
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Notes
                </h2>
              </div>

              {application.notes ? (
                <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-300">
                  {application.notes}
                </p>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  No private notes have been added yet.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Contact
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Hiring contact
              </h2>

              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm text-slate-500">
                    Name
                  </dt>

                  <dd className="mt-1 font-medium text-slate-100">
                    {displayValue(application.contactName)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    Email
                  </dt>

                  <dd className="mt-1 break-words font-medium text-slate-100">
                    {application.contactEmail ? (
                      <a
                        className="text-blue-400 transition hover:text-blue-300"
                        href={`mailto:${application.contactEmail}`}
                      >
                        {application.contactEmail}
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-500">
                    LinkedIn
                  </dt>

                  <dd className="mt-1 font-medium">
                    {application.contactLinkedInUrl ? (
                      <a
                        className="text-blue-400 transition hover:text-blue-300"
                        href={application.contactLinkedInUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View profile ↗
                      </a>
                    ) : (
                      <span className="text-slate-100">
                        Not specified
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <UpcomingInterviewCard
              interview={serializedUpcomingInterview}
              manageAction={manageInterviewWithId}
              upcomingCount={upcomingInterviews.length}
            />

            <section className="rounded-2xl border border-red-950 bg-red-950/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Danger zone
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Archive application
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Remove this opportunity from active views without deleting
                its history or data.
              </p>

              <div className="mt-5">
                <ArchiveApplicationButton
                  archiveAction={archiveApplicationWithId}
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                History
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Activity
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Status changes, follow-ups, interviews, and other important
                updates for this opportunity.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
              {application.activities.length}{" "}
              {application.activities.length === 1
                ? "activity"
                : "activities"}
            </span>
          </div>

          {application.activities.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-6">
              <p className="text-sm font-medium text-slate-300">
                No activity yet
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Status changes, follow-ups, and interviews will appear here.
              </p>
            </div>
          ) : (
            <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {application.activities.map((activity) => (
                <li
                  className={`relative rounded-xl border p-5 ${activityAccent(
                    activity.type,
                  )}`}
                  key={activity.id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityDot(
                        activity.type,
                      )}`}
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100">
                        {activity.title || activity.type}
                      </p>

                      {activity.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {activity.description}
                        </p>
                      ) : null}

                      <p className="mt-3 text-xs text-slate-600">
                        {formatActivityDate(
                          activity.occurredAt,
                          activity.type,
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}