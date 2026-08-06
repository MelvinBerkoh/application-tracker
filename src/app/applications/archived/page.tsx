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

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-white">
            Archived applications
          </h1>

          <p className="mt-2 text-slate-400">
            Review or restore applications removed from your active
            dashboard.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Archive
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Archived records remain safely stored.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-white">
                No archived applications
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Applications you archive will appear here.
              </p>

              <Link
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                href="/dashboard"
              >
                Return to dashboard
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400">
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
                        className="transition hover:bg-slate-800/40"
                        key={application.id}
                      >
                        <td className="px-5 py-4 font-medium text-white">
                          {application.companyName}
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
                          {formatDate(application.archivedAt)}
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
      </div>
    </main>
  );
}