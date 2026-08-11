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

type FollowUpSectionProps = {
  title: string;
  description: string;
  applications: FollowUpApplication[];
  emptyMessage: string;
};

function FollowUpSection({
  title,
  description,
  applications,
  emptyMessage,
}: FollowUpSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>

          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300">
          {applications.length}
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Position</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Applied</th>
                <th className="px-5 py-3 font-medium">Follow-up</th>
                <th className="px-5 py-3 font-medium">Actions</th>
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
                    className="align-top transition hover:bg-slate-800/40"
                    key={application.id}
                  >
                    <td className="px-5 py-4 font-medium">
                      <Link
                        className="text-white transition hover:text-blue-400"
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

                    <td className="px-5 py-4 font-medium text-slate-200">
                      {formatDate(application.followUpAt)}
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
      <header className="border-b border-slate-800">
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

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          href="/dashboard"
        >
          ← Back to dashboard
        </Link>

        <section className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Follow-ups
            </h1>

            <p className="mt-2 text-slate-400">
              Keep track of applications that need your attention.
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
            href="/applications"
          >
            View all applications
          </Link>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-red-950 bg-red-950/20 p-5">
            <p className="text-sm font-medium text-red-300">
              Overdue
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {overdue.length}
            </p>
          </article>

          <article className="rounded-xl border border-amber-950 bg-amber-950/20 p-5">
            <p className="text-sm font-medium text-amber-300">
              Due today
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {dueToday.length}
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm font-medium text-slate-300">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {upcoming.length}
            </p>
          </article>
        </div>

        <div className="mt-8 space-y-8">
          <FollowUpSection
            applications={overdue}
            description="These follow-up dates have already passed."
            emptyMessage="Nothing overdue. Nice."
            title="Overdue"
          />

          <FollowUpSection
            applications={dueToday}
            description="Applications you planned to follow up on today."
            emptyMessage="No follow-ups are due today."
            title="Due today"
          />

          <FollowUpSection
            applications={upcoming}
            description="Follow-ups scheduled for a future date."
            emptyMessage="No upcoming follow-ups are scheduled."
            title="Upcoming"
          />
        </div>
      </div>
    </main>
  );
}