import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveApplicationButton } from "@/features/applications/components/archive-application-button";
import { archiveApplication } from "@/features/applications/server/archive-application";
import { getApplicationById } from "@/features/applications/server/get-application-by-id";

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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          href="/dashboard"
        >
          ← Back to dashboard
        </Link>

        <section className="mt-6 flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">
                {application.roleTitle}
              </h1>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                  statusStyles[application.status]
                }`}
              >
                {statusLabels[application.status]}
              </span>
            </div>

            <p className="mt-3 text-xl text-slate-300">
              {application.companyName}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Last updated {formatDate(application.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {application.jobUrl ? (
              <a
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
                href={application.jobUrl}
                rel="noreferrer"
                target="_blank"
              >
                View job posting
              </a>
            ) : null}

            <Link
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              href={`/applications/${application.id}/edit`}
            >
              Edit application
            </Link>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">
                Application details
              </h2>

              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-400">Location</dt>
                  <dd className="mt-1 text-slate-100">
                    {displayValue(application.location)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">
                    Work arrangement
                  </dt>
                  <dd className="mt-1 text-slate-100">
                    {formatWorkArrangement(application.workArrangement)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">Date applied</dt>
                  <dd className="mt-1 text-slate-100">
                    {formatDate(application.appliedAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">
                    Follow-up date
                  </dt>
                  <dd className="mt-1 text-slate-100">
                    {formatDate(application.followUpAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">Salary</dt>
                  <dd className="mt-1 text-slate-100">
                    {formatSalary(
                      application.salaryMin,
                      application.salaryMax,
                      application.salaryCurrency,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">
                    Application source
                  </dt>
                  <dd className="mt-1 text-slate-100">
                    {displayValue(application.source)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">
                    Résumé version
                  </dt>
                  <dd className="mt-1 text-slate-100">
                    {displayValue(application.resumeVersion)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">Created</dt>
                  <dd className="mt-1 text-slate-100">
                    {formatDate(application.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">Job description</h2>

              {application.jobDescription ? (
                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">
                  {application.jobDescription}
                </p>
              ) : (
                <p className="mt-4 text-slate-400">
                  No job description was saved.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">Notes</h2>

              {application.notes ? (
                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">
                  {application.notes}
                </p>
              ) : (
                <p className="mt-4 text-slate-400">
                  No notes have been added.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">Contact</h2>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-sm text-slate-400">Name</dt>
                  <dd className="mt-1 text-slate-100">
                    {displayValue(application.contactName)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-slate-400">Email</dt>
                  <dd className="mt-1 break-words text-slate-100">
                    {application.contactEmail ? (
                      <a
                        className="text-blue-400 hover:text-blue-300"
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
                  <dt className="text-sm text-slate-400">LinkedIn</dt>
                  <dd className="mt-1 break-words text-slate-100">
                    {application.contactLinkedInUrl ? (
                      <a
                        className="text-blue-400 hover:text-blue-300"
                        href={application.contactLinkedInUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View profile
                      </a>
                    ) : (
                      "Not specified"
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">Activity</h2>

              {application.activities.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  No activity has been recorded yet.
                </p>
              ) : (
                <ol className="mt-5 space-y-5">
                  {application.activities.map((activity) => (
                    <li
                      className="border-l border-slate-700 pl-4"
                      key={activity.id}
                    >
                      <p className="font-medium text-slate-100">
                        {activity.title || activity.type}
                      </p>

                      {activity.description ? (
                        <p className="mt-1 text-sm text-slate-400">
                          {activity.description}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(activity.occurredAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="rounded-xl border border-red-950 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold text-white">
                Danger zone
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Archive this application to remove it from your active
                dashboard.
              </p>

              <div className="mt-5">
                <ArchiveApplicationButton
                  archiveAction={archiveApplicationWithId}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}