import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { FollowUpActions } from "@/features/applications/components/follow-up-actions";
import {
  getFollowUpApplications,
  type FollowUpApplication,
} from "@/features/applications/server/get-follow-up-applications";
import { updateFollowUp } from "@/features/applications/server/update-follow-up";

const statusLabels: Record<FollowUpApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const statusStyles: Record<FollowUpApplication["status"], string> = {
  SAVED: "border-slate-700 bg-slate-800 text-slate-300",
  APPLIED: "border-blue-900 bg-blue-950 text-blue-300",
  RECRUITER_SCREEN: "border-cyan-900 bg-cyan-950 text-cyan-300",
  INTERVIEW: "border-violet-900 bg-violet-950 text-violet-300",
  ASSESSMENT: "border-amber-900 bg-amber-950 text-amber-300",
  OFFER: "border-emerald-900 bg-emerald-950 text-emerald-300",
  REJECTED: "border-red-900 bg-red-950 text-red-300",
  WITHDRAWN: "border-slate-700 bg-slate-900 text-slate-400",
};

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

type FollowUpSectionTone = "overdue" | "today" | "upcoming";

type FollowUpSectionProps = {
  title: string;
  eyebrow: string;
  description: string;
  applications: FollowUpApplication[];
  emptyMessage: string;
  tone: FollowUpSectionTone;
};

const sectionToneStyles: Record<
  FollowUpSectionTone,
  {
    eyebrow: string;
    count: string;
    border: string;
  }
> = {
  overdue: {
    eyebrow: "text-red-400",
    count: "border-red-950 bg-red-950/40 text-red-300",
    border: "border-red-950/70",
  },
  today: {
    eyebrow: "text-amber-400",
    count: "border-amber-950 bg-amber-950/40 text-amber-300",
    border: "border-amber-950/70",
  },
  upcoming: {
    eyebrow: "text-blue-400",
    count: "border-slate-800 bg-slate-950 text-slate-300",
    border: "border-slate-800",
  },
};

function FollowUpSection({
  title,
  eyebrow,
  description,
  applications,
  emptyMessage,
  tone,
}: FollowUpSectionProps) {
  const toneStyles = sectionToneStyles[tone];

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-slate-900/60 ${toneStyles.border}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${toneStyles.eyebrow}`}
          >
            {eyebrow}
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${toneStyles.count}`}
        >
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-slate-500">
            ✓
          </div>

          <p className="mt-4 text-sm text-slate-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-800 md:hidden">
            {applications.map((application) => {
              const updateFollowUpWithId = updateFollowUp.bind(
                null,
                application.id,
              );

              return (
                <article className="p-5" key={application.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        className="font-semibold text-white transition hover:text-blue-300"
                        href={`/applications/${application.id}`}
                      >
                        {application.companyName}
                      </Link>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {application.roleTitle}
                      </p>
                    </div>

                    <Link
                      aria-label={`View ${application.companyName} application`}
                      className="shrink-0 text-slate-600 transition hover:text-blue-400"
                      href={`/applications/${application.id}`}
                    >
                      →
                    </Link>
                  </div>

                  <div className="mt-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        statusStyles[application.status]
                      }`}
                    >
                      {statusLabels[application.status]}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
                        Location
                      </dt>

                      <dd className="mt-1 text-sm text-slate-300">
                        {application.location || "Not specified"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
                        Applied
                      </dt>

                      <dd className="mt-1 text-sm text-slate-300">
                        {formatDate(application.appliedAt)}
                      </dd>
                    </div>

                    <div className="col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
                        Follow-up date
                      </dt>

                      <dd className="mt-1 text-sm font-semibold text-slate-100">
                        {formatDate(application.followUpAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 border-t border-slate-800 pt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Manage follow-up
                    </p>

                    <FollowUpActions
                      currentFollowUpAt={application.followUpAt}
                      updateAction={updateFollowUpWithId}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Position</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Applied</th>
                  <th className="px-5 py-3 font-medium">Follow-up</th>
                  <th className="px-5 py-3 font-medium">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {applications.map((application) => {
                  const updateFollowUpWithId = updateFollowUp.bind(
                    null,
                    application.id,
                  );

                  return (
                    <tr
                      className="group align-top transition hover:bg-slate-800/30"
                      key={application.id}
                    >
                      <td className="px-5 py-4">
                        <Link
                          className="font-semibold text-white transition group-hover:text-blue-300"
                          href={`/applications/${application.id}`}
                        >
                          {application.companyName}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {application.roleTitle}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            statusStyles[application.status]
                          }`}
                        >
                          {statusLabels[application.status]}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {application.location || "Not specified"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(application.appliedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-200">
                          {formatDate(application.followUpAt)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="min-w-[220px]">
                          <FollowUpActions
                            currentFollowUpAt={application.followUpAt}
                            updateAction={updateFollowUpWithId}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default async function FollowUpsPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const applications = await getFollowUpApplications({
    ownerId: userId,
  });

  const todayKey = getDateKey(new Date());

  const overdue = applications.filter((application) => {
    if (!application.followUpAt) {
      return false;
    }

    return getDateKey(application.followUpAt) < todayKey;
  });

  const dueToday = applications.filter((application) => {
    if (!application.followUpAt) {
      return false;
    }

    return getDateKey(application.followUpAt) === todayKey;
  });

  const upcoming = applications.filter((application) => {
    if (!application.followUpAt) {
      return false;
    }

    return getDateKey(application.followUpAt) > todayKey;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/80 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            className="text-sm font-semibold uppercase tracking-widest text-blue-400 transition hover:text-blue-300"
            href="/dashboard"
          >
            Application Tracker
          </Link>

          <UserButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
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

          <span className="text-slate-200">Follow-ups</span>
        </nav>

        <section className="mt-8 flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-900 bg-blue-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Next actions
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Follow-ups
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              See what is overdue, handle today&apos;s follow-ups, and keep
              upcoming outreach from slipping through the cracks.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href="/applications"
            >
              All applications
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              href="/applications/new"
            >
              + Add application
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-red-950/80 bg-red-950/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-300">
                  Overdue
                </p>

                <p className="mt-1 text-xs text-red-300/60">
                  Past the planned date
                </p>
              </div>

              <span className="text-lg text-red-400">!</span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-white">
              {overdue.length}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-950/80 bg-amber-950/20 p-5">
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Due today
              </p>

              <p className="mt-1 text-xs text-amber-300/60">
                Planned for today
              </p>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-white">
              {dueToday.length}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Upcoming
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Scheduled ahead
              </p>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-white">
              {upcoming.length}
            </p>
          </article>
        </section>

        <div className="mt-8 space-y-8">
          <FollowUpSection
            applications={overdue}
            description="These planned follow-up dates have already passed and should be handled first."
            emptyMessage="Nothing is overdue."
            eyebrow="Needs attention"
            title="Overdue"
            tone="overdue"
          />

          <FollowUpSection
            applications={dueToday}
            description="Applications you planned to contact or review today."
            emptyMessage="No follow-ups are due today."
            eyebrow="Today"
            title="Due today"
            tone="today"
          />

          <FollowUpSection
            applications={upcoming}
            description="Future follow-up dates already scheduled in your pipeline."
            emptyMessage="No upcoming follow-ups are scheduled."
            eyebrow="Scheduled"
            title="Upcoming"
            tone="upcoming"
          />
        </div>
      </div>
    </main>
  );
}