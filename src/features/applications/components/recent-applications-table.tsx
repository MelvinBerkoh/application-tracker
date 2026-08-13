import Link from "next/link";

import type { RecentApplication } from "@/features/applications/server/get-recent-applications";

type RecentApplicationsTableProps = {
  applications: RecentApplication[];
};

const statusLabels: Record<RecentApplication["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const statusStyles: Record<RecentApplication["status"], string> = {
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
    return "Not applied";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function RecentApplicationsTable({
  applications,
}: RecentApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-white">
            No applications yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Add your first opportunity to start tracking your job search.
          </p>

          <Link
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            href="/applications/new"
          >
            Add application
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Mobile application cards */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 md:hidden">
        <div className="divide-y divide-slate-800">
          {applications.map((application) => (
            <Link
              className="group flex items-center justify-between gap-4 px-5 py-5 transition active:bg-slate-800/70"
              href={`/applications/${application.id}`}
              key={application.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white transition group-hover:text-blue-300">
                  {application.roleTitle}
                </p>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {application.companyName}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                >
                  {statusLabels[application.status]}
                </span>

                <span
                  aria-hidden="true"
                  className="text-lg text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400"
                >
                  ›
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Desktop / tablet table */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Position</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Date applied</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {applications.map((application) => (
                <tr
                  className="transition hover:bg-slate-800/40"
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
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}