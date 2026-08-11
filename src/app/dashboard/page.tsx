import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { RecentApplicationsTable } from "@/features/applications/components/recent-applications-table";
import { getDashboardStats } from "@/features/applications/server/get-dashboard-stats";
import { getRecentApplications } from "@/features/applications/server/get-recent-applications";

export default async function DashboardPage() {
  const { isAuthenticated, redirectToSignIn, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const [stats, recentApplications] = await Promise.all([
    getDashboardStats({
      ownerId: userId,
    }),
    getRecentApplications({
      ownerId: userId,
    }),
  ]);

  const dashboardCards = [
    {
      label: "Total Applications",
      value: stats.totalApplications,
    },
    {
      label: "Active Interviews",
      value: stats.activeInterviews,
    },
    {
      label: "Follow-Ups Due",
      value: stats.followUpsDue,
      href: "/applications/follow-ups",
    },
    {
      label: "Offers",
      value: stats.offers,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Application Tracker
          </p>

          <UserButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="mt-4 text-slate-300">
              Track your applications, interviews, and follow-ups in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              href="/applications"
            >
              View all applications
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              href="/applications/archived"
            >
              Archived applications
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              href="/applications/new"
            >
              Add application
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map(({ label, value, href }) =>
            href ? (
              <Link
                className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-800 hover:bg-slate-900/80"
                href={href}
                key={label}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400 transition group-hover:text-slate-300">
                      {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-white">
                      {value}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                  >
                    →
                  </span>
                </div>
              </Link>
            ) : (
              <article
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                key={label}
              >
                <p className="text-sm text-slate-400">{label}</p>

                <p className="mt-2 text-3xl font-bold">{value}</p>
              </article>
            ),
          )}
        </div>

        <RecentApplicationsTable applications={recentApplications} />
      </section>
    </main>
  );
}