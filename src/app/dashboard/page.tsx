import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { DashboardAttentionPanel } from "@/features/applications/components/dashboard-attention-panel";
import { RecentApplicationsTable } from "@/features/applications/components/recent-applications-table";
import { getDashboardStats } from "@/features/applications/server/get-dashboard-stats";
import { getNextInterview } from "@/features/applications/server/get-next-interview";
import { getRecentApplications } from "@/features/applications/server/get-recent-applications";

export default async function DashboardPage() {
  const { isAuthenticated, redirectToSignIn, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const [stats, recentApplications, nextInterview] = await Promise.all([
    getDashboardStats({
      ownerId: userId,
    }),
    getRecentApplications({
      ownerId: userId,
    }),
    getNextInterview({
      ownerId: userId,
    }),
  ]);

  const dashboardCards = [
    {
      label: "Total applications",
      description: "Active opportunities",
      value: stats.totalApplications,
      href: "/applications",
      accent: "blue",
    },
    {
      label: "Active interviews",
      description: "In the hiring process",
      value: stats.activeInterviews,
      href: null,
      accent: "violet",
    },
    {
      label: "Upcoming interviews",
      description: "Meetings scheduled",
      value: stats.upcomingInterviews,
      href: null,
      accent: "cyan",
    },
    {
      label: "Follow-ups due",
      description: "Need your attention",
      value: stats.followUpsDue,
      href: "/applications/follow-ups",
      accent: "amber",
    },
    {
      label: "Offers",
      description: "Applications with offers",
      value: stats.offers,
      href: "/applications?status=OFFER",
      accent: "emerald",
    },
  ] as const;

  const serializedNextInterview = nextInterview
    ? {
        applicationId: nextInterview.application.id,
        companyName: nextInterview.application.companyName,
        roleTitle: nextInterview.application.roleTitle,
        title: nextInterview.title,
        occurredAt: nextInterview.occurredAt.toISOString(),
      }
    : null;

  const accentStyles = {
    blue: "text-blue-400",
    violet: "text-violet-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
  } as const;

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

          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-medium text-slate-400 transition hover:text-white"
              href="/settings"
            >
              Settings
            </Link>

            <UserButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <section className="flex flex-col gap-6 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-900 bg-blue-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Overview
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Keep your job search organized, see what needs attention, and
              move opportunities through the hiring process.
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            href="/applications/new"
          >
            + Add application
          </Link>
        </section>

        <nav className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
            href="/applications"
          >
            All applications
          </Link>

          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
            href="/applications/follow-ups"
          >
            Follow-ups
          </Link>

          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
            href="/applications/archived"
          >
            Archived
          </Link>
        </nav>

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {dashboardCards.map(
              ({ label, description, value, href, accent }) => {
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-sm font-semibold ${accentStyles[accent]}`}
                        >
                          {label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {description}
                        </p>
                      </div>

                      {href ? (
                        <span
                          aria-hidden="true"
                          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                        >
                          →
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                      {value}
                    </p>
                  </>
                );

                if (href) {
                  return (
                    <Link
                      className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-blue-900 hover:bg-slate-900"
                      href={href}
                      key={label}
                    >
                      {cardContent}
                    </Link>
                  );
                }

                return (
                  <article
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    key={label}
                  >
                    {cardContent}
                  </article>
                );
              },
            )}
          </div>
        </section>

        <DashboardAttentionPanel
          followUpsDue={stats.followUpsDue}
          nextInterview={serializedNextInterview}
        />

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Pipeline
              </p>

              <h2 className="mt-2 text-2xl font-bold">Recent applications</h2>

              <p className="mt-1 text-sm text-slate-400">
                Your most recently updated opportunities.
              </p>
            </div>

            <Link
              className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              href="/applications"
            >
              View all →
            </Link>
          </div>

          <RecentApplicationsTable applications={recentApplications} />
        </section>
      </div>
    </main>
  );
}