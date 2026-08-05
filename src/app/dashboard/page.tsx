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

          <Link
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            href="/applications/new"
          >
            Add application
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map(({ label, value }) => (
            <article
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              key={label}
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </article>
          ))}
        </div>

        <RecentApplicationsTable applications={recentApplications} />
      </section>
    </main>
  );
}