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
              All applications
            </h1>

            <p className="mt-2 text-slate-400">
              Search, filter, and review every active opportunity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              href="/applications/archived"
            >
              Archived applications
            </Link>

            <Link
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              href="/applications/new"
            >
              Add application
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
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
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                type="submit"
              >
                Apply
              </button>

              {filtersAreActive ? (
                <Link
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  href="/applications"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Applications</h2>

              <p className="mt-1 text-sm text-slate-400">
                Active applications matching your current filters.
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {applications.length}{" "}
              {applications.length === 1 ? "result" : "results"}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h3 className="text-lg font-semibold">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {filtersAreActive
                  ? "Try changing or clearing the current filters."
                  : "Add your first application to begin tracking opportunities."}
              </p>

              {filtersAreActive ? (
                <Link
                  className="mt-5 inline-flex rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  href="/applications"
                >
                  Clear filters
                </Link>
              ) : (
                <Link
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  href="/applications/new"
                >
                  Add application
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Position</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">
                      Arrangement
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Date applied
                    </th>
                    <th className="px-5 py-3 font-medium">Follow-up</th>
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