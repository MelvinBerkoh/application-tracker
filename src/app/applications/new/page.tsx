import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { ApplicationForm } from "@/features/applications/components/application-form";

export default async function NewApplicationPage() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
          href="/dashboard"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Application Tracker
          </p>

          <h1 className="mt-3 text-4xl font-bold">Add an application</h1>

          <p className="mt-3 text-slate-400">
            Save a job opportunity and track it throughout the hiring process.
          </p>
        </header>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
          <ApplicationForm />
        </div>
      </div>
    </main>
  );
}