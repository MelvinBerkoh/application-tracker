import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

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
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <p className="mt-4 text-slate-300">
          Track your applications, interviews, and follow-ups in one place.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Applications", "0"],
            ["Active Interviews", "0"],
            ["Follow-Ups Due", "0"],
            ["Offers", "0"],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}