import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { ResumeVersionSettings } from "@/features/settings/components/resume-version-settings";
import { getResumeVersions } from "@/features/settings/server/get-resume-versions";

export default async function SettingsPage() {
  const {
    isAuthenticated,
    redirectToSignIn,
    userId,
  } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn();
  }

  const resumeVersions =
    await getResumeVersions({
      ownerId: userId,
    });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            className="text-sm font-semibold uppercase tracking-widest text-blue-400 transition hover:text-blue-300"
            href="/dashboard"
          >
            Application Tracker
          </Link>

          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-medium text-slate-400 transition hover:text-white"
              href="/dashboard"
            >
              Dashboard
            </Link>

            <UserButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
            Preferences
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Personalize how your application
            tracker works for your job search.
          </p>
        </div>

        <div className="space-y-6">
          <ResumeVersionSettings
            resumeVersions={resumeVersions}
          />

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sm font-bold text-blue-400">
                A
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Account & security
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Your account, email addresses,
                  password, connected sign-in
                  methods, and active sessions are
                  managed securely through Clerk.
                  Use your profile button in the
                  top-right corner to manage those
                  account settings.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sm font-bold text-emerald-400">
                P
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Data & privacy
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Applications, activity history,
                  interview details, notes, and
                  résumé labels are scoped to your
                  authenticated account. Other
                  tracker users cannot access your
                  saved job-search data.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}