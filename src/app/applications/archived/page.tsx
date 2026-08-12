import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { RestoreApplicationButton } from "@/features/applications/components/restore-application-button";
import {
  getArchivedApplications,
  type ArchivedApplication,
} from "@/features/applications/server/get-archived-applications";
import { restoreApplication } from "@/features/applications/server/restore-application";

const statusLabels: Record<ArchivedApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const statusStyles: Record<ArchivedApplication["status"], string> = {
  SAVED: "border-slate-700 bg-slate-800 text-slate-300",
  APPLIED: "border-blue-900 bg-blue-950 text-blue-300",
  RECRUITER_SCREEN: "border-cyan-900 bg-cyan-950 text-cyan-300",
  INTERVIEW: "border-violet-900 bg-violet-950 text-violet-300",
  ASSESSMENT: "border-amber-900 bg-amber-950 text-amber-300",
  OFFER: "border-emerald-900 bg-emerald-950 text-emerald-300",
  REJECTED: "border-red-900 bg-red-950 text-red-300",
  WITHDRAWN: "border-slate-700 bg-slate-900 text-slate-400",
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function ArchivedApplicationsPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const applications = await getArchivedApplications({
    ownerId: userId,
  });

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

          <span className="text-slate-200">Archived</span>
        </nav>

        <section className="mt-8 flex flex-col gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Archive
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Archived applications
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Keep inactive opportunities out of your main pipeline without
              losing their history or details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href="/applications"
            >
              Active applications
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              href="/applications/new"
            >
              + Add application
            </Link>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Stored records
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Archive
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Restore an application at any time to return it to your active
                pipeline.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm font-medium text-slate-400">
              {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xl text-slate-500">
                ↺
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No archived applications
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                When you archive an opportunity, it will stay safely stored
                here until you decide to restore it.
              </p>

              <Link
                className="mt-5 inline-flex rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                href="/applications"
              >
                View active applications
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Position</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Archived</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {applications.map((application) => {
                    const restoreApplicationWithId =
                      restoreApplication.bind(null, application.id);

                    return (
                      <tr
                        className="transition hover:bg-slate-800/30"
                        key={application.id}
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">
                            {application.companyName}
                          </div>
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

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-300">
                            {formatDate(application.archivedAt)}
                          </div>

                          <p className="mt-1 text-xs text-slate-600">
                            Removed from active pipeline
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <RestoreApplicationButton
                              restoreAction={restoreApplicationWithId}
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

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <p className="text-sm font-medium text-slate-300">
            Archiving is reversible.
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Restoring an application returns it to your dashboard and active
            application views with its existing details and activity history
            intact.
          </p>
        </div>
      </div>
    </main>
  );
}