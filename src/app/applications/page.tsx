import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import {
  applicationStatuses,
  type ApplicationInput,
} from "@/features/applications/schemas/application";
import {
  applicationSortOptions,
  getApplications,
  type ApplicationListItem,
  type ApplicationSort,
} from "@/features/applications/server/get-applications";

type ApplicationsPageProps = {
  searchParams: Promise<{
    query?: string | string[];
    status?: string | string[];
    sort?: string | string[];
  }>;
};

type ApplicationStatus = ApplicationInput["status"];

const statusLabels: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const statusStyles: Record<ApplicationStatus, string> = {
  SAVED: "border-slate-700 bg-slate-800 text-slate-300",
  APPLIED: "border-blue-900 bg-blue-950 text-blue-300",
  RECRUITER_SCREEN: "border-cyan-900 bg-cyan-950 text-cyan-300",
  INTERVIEW: "border-violet-900 bg-violet-950 text-violet-300",
  ASSESSMENT: "border-amber-900 bg-amber-950 text-amber-300",
  OFFER: "border-emerald-900 bg-emerald-950 text-emerald-300",
  REJECTED: "border-red-900 bg-red-950 text-red-300",
  WITHDRAWN: "border-slate-700 bg-slate-900 text-slate-400",
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isApplicationStatus(
  value: string | undefined,
): value is ApplicationStatus {
  return applicationStatuses.some((status) => status === value);
}

function isApplicationSort(
  value: string | undefined,
): value is ApplicationSort {
  return applicationSortOptions.some((sort) => sort === value);
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatWorkArrangement(
  value: ApplicationListItem["workArrangement"],
) {
  if (!value) {
    return "Not specified";
  }

  if (value === "ONSITE") {
    return "On-site";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const resolvedSearchParams = await searchParams;

  const query = getSingleValue(resolvedSearchParams.query)?.trim() ?? "";
  const requestedStatus = getSingleValue(resolvedSearchParams.status);
  const requestedSort = getSingleValue(resolvedSearchParams.sort);

  const status = isApplicationStatus(requestedStatus)
    ? requestedStatus
    : undefined;

  const sort = isApplicationSort(requestedSort)
    ? requestedSort
    : "updated-desc";

  const applications = await getApplications({
    ownerId: userId,
    query,
    status,
    sort,
  });

  const filtersAreActive =
    query.length > 0 || status !== undefined || sort !== "updated-desc";

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

          <span className="text-slate-200">Applications</span>
        </nav>

        <section className="mt-8 flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-blue-900 bg-blue-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Pipeline
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              All applications
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Search your pipeline, focus on a hiring stage, and quickly open
              any opportunity that needs attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href="/applications/archived"
            >
              Archived
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href="/applications/follow-ups"
            >
              Follow-ups
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              href="/applications/new"
            >
              + Add application
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Filters
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Find an application
            </h2>
          </div>

          <form
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
            method="get"
          >
            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="query"
              >
                Search
              </label>

              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                defaultValue={query}
                id="query"
                name="query"
                placeholder="Company or position title"
                type="search"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="status"
              >
                Status
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                defaultValue={status ?? ""}
                id="status"
                name="status"
              >
                <option value="">All statuses</option>

                {applicationStatuses.map((applicationStatus) => (
                  <option
                    key={applicationStatus}
                    value={applicationStatus}
                  >
                    {statusLabels[applicationStatus]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="sort"
              >
                Sort by
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                defaultValue={sort}
                id="sort"
                name="sort"
              >
                <option value="updated-desc">Recently updated</option>
                <option value="applied-desc">Date applied</option>
                <option value="company-asc">Company A–Z</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                type="submit"
              >
                Apply
              </button>

              {filtersAreActive ? (
                <Link
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  href="/applications"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Results
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Applications
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Active opportunities matching your current view.
              </p>
            </div>

            <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm font-medium text-slate-400">
              {applications.length}{" "}
              {applications.length === 1 ? "result" : "results"}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-xl text-slate-500">
                ⌕
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No applications found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {filtersAreActive
                  ? "Nothing matches the current filters. Try widening the search or clearing them."
                  : "Your active applications will appear here once you add an opportunity."}
              </p>

              {filtersAreActive ? (
                <Link
                  className="mt-5 inline-flex rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  href="/applications"
                >
                  Clear filters
                </Link>
              ) : (
                <Link
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  href="/applications/new"
                >
                  Add application
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Position</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Arrangement</th>
                    <th className="px-5 py-3 font-medium">Date applied</th>
                    <th className="px-5 py-3 font-medium">Follow-up</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {applications.map((application) => (
                    <tr
                      className="group transition hover:bg-slate-800/30"
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
                        {formatWorkArrangement(
                          application.workArrangement,
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(application.appliedAt)}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(application.followUpAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}