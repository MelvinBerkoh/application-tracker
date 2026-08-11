import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/features/applications/components/application-form";
import { getApplicationById } from "@/features/applications/server/get-application-by-id";
import { updateApplication } from "@/features/applications/server/update-application";

type EditApplicationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const { id } = await params;

  const application = await getApplicationById({
    applicationId: id,
    ownerId: userId,
  });

  if (!application) {
    notFound();
  }

  const updateApplicationWithId = updateApplication.bind(
    null,
    application.id,
  );

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

      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
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

          <Link
            className="max-w-48 truncate text-slate-400 transition hover:text-white"
            href={`/applications/${application.id}`}
          >
            {application.companyName}
          </Link>

          <span className="text-slate-700">/</span>

          <span className="text-slate-200">Edit</span>
        </nav>

        <header className="mt-8 border-b border-slate-800 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-violet-900 bg-violet-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                Editing
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Edit application
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                Update{" "}
                <span className="font-medium text-slate-200">
                  {application.roleTitle}
                </span>{" "}
                at{" "}
                <span className="font-medium text-slate-200">
                  {application.companyName}
                </span>
                .
              </p>
            </div>

            <Link
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href={`/applications/${application.id}`}
            >
              View application
            </Link>
          </div>
        </header>

        <div className="mt-8">
          <ApplicationForm
            action={updateApplicationWithId}
            cancelHref={`/applications/${application.id}`}
            initialValues={{
              companyName: application.companyName,
              roleTitle: application.roleTitle,
              jobUrl: application.jobUrl,
              jobDescription: application.jobDescription,
              status: application.status,
              workArrangement: application.workArrangement,
              location: application.location,
              source: application.source,
              appliedAt: formatDateInput(application.appliedAt),
              followUpAt: formatDateInput(application.followUpAt),
              salaryMin: application.salaryMin,
              salaryMax: application.salaryMax,
              salaryCurrency: application.salaryCurrency,
              resumeVersion: application.resumeVersion,
              contactName: application.contactName,
              contactEmail: application.contactEmail,
              contactLinkedInUrl: application.contactLinkedInUrl,
              notes: application.notes,
            }}
            pendingLabel="Updating..."
            submitLabel="Update application"
          />
        </div>
      </div>
    </main>
  );
}