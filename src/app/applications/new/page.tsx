import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { ApplicationForm } from "@/features/applications/components/application-form";

export default async function NewApplicationPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

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

          <span className="text-slate-200">New</span>
        </nav>

        <header className="mt-8 border-b border-slate-800 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-blue-900 bg-blue-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
                New application
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Add an opportunity
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                Save the important details now so you can track progress,
                follow-ups, contacts, and interview activity in one place.
              </p>
            </div>

            <Link
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
              href="/applications"
            >
              View applications
            </Link>
          </div>
        </header>

        <div className="mt-8">
          <ApplicationForm cancelHref="/applications" />
        </div>
      </div>
    </main>
  );
}