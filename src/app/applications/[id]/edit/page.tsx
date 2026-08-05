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
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            className="text-sm font-semibold uppercase tracking-widest text-blue-400 transition hover:text-blue-300"
            href="/dashboard"
          >
            Application Tracker
          </Link>

          <UserButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          href={`/applications/${application.id}`}
        >
          ← Back to application
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-white">
            Edit application
          </h1>

          <p className="mt-2 text-slate-400">
            Update the details for {application.roleTitle} at{" "}
            {application.companyName}.
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 md:p-8">
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
        </section>
      </div>
    </main>
  );
}