import { Show, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

const features = [
  {
    title: "Application pipeline",
    description:
      "Track every opportunity from saved to applied, interviews, offers, and everything in between.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 7h14M5 12h9M5 17h6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    title: "Follow-up planning",
    description:
      "Schedule outreach, surface overdue actions, and keep your search moving without relying on memory.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    title: "Complete history",
    description:
      "Keep status changes, recruiter details, notes, follow-ups, and application activity attached to the opportunity.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 6h8M8 10h8M8 14h5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

function HeaderAuthAction() {
  return (
    <Show
      fallback={
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-700 hover:text-white sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            type="button"
          >
            Sign in
          </button>
        </SignInButton>
      }
      when="signed-in"
    >
      <Link
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-700 hover:text-white sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
        href="/dashboard"
      >
        <span className="sm:hidden">Dashboard</span>
        <span className="hidden sm:inline">Open dashboard</span>
        <span aria-hidden="true" className="ml-1.5 text-blue-400 sm:ml-2">
          →
        </span>
      </Link>
    </Show>
  );
}

function PrimaryAuthAction() {
  return (
    <Show
      fallback={
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <button
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
            type="button"
          >
            Start tracking applications
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </button>
        </SignInButton>
      }
      when="signed-in"
    >
      <Link
        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
        href="/dashboard"
      >
        Open your dashboard
        <span aria-hidden="true" className="ml-2">
          →
        </span>
      </Link>
    </Show>
  );
}

function FinalAuthAction() {
  return (
    <Show
      fallback={
        <SignInButton forceRedirectUrl="/dashboard" mode="modal">
          <button
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            type="button"
          >
            Start tracking →
          </button>
        </SignInButton>
      }
      when="signed-in"
    >
      <Link
        className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        href="/dashboard"
      >
        Open dashboard →
      </Link>
    </Show>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/95 sm:bg-slate-950/80 sm:backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
          <Link className="flex min-w-0 items-center gap-2.5 sm:gap-3" href="/">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-800/80 bg-blue-950 text-blue-400 shadow-sm shadow-blue-950 sm:h-10 sm:w-10 sm:rounded-xl">
              <svg
                aria-hidden="true"
                className="h-4.5 w-4.5 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 7.5h10M7 12h6M7 16.5h4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M5.5 3.75h13A1.75 1.75 0 0 1 20.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-13a1.75 1.75 0 0 1-1.75-1.75v-13A1.75 1.75 0 0 1 5.5 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-blue-400 sm:text-sm sm:tracking-[0.18em]">
                Application Tracker
              </p>
              <p className="hidden text-[11px] text-slate-600 sm:block">
                Job search workspace
              </p>
            </div>
          </Link>

          <div className="ml-3 shrink-0">
            <HeaderAuthAction />
          </div>
        </div>
      </header>

      <section className="relative">
        <div
          aria-hidden="true"
          className="absolute left-[10%] top-10 hidden h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px] sm:block"
        />
        <div
          aria-hidden="true"
          className="absolute right-[5%] top-0 hidden h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px] sm:block"
        />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-14 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-24 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-800/80 bg-blue-950/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
              Built for an organized job search
            </div>

            <h1 className="mt-7 max-w-2xl text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.5rem] lg:leading-[1.02]">
              Stop tracking jobs
              <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
                in your head.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              One workspace for applications, interviews, recruiter contacts,
              follow-ups, notes, and every next step in your job search.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryAuthAction />

              <a
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
                href="#features"
              >
                See how it works
              </a>
            </div>

            <div className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-slate-800 border-y border-slate-800 py-4">
              <div className="pr-4">
                <p className="text-lg font-bold text-white">8 stages</p>
                <p className="mt-1 text-xs text-slate-600">
                  Pipeline tracking
                </p>
              </div>

              <div className="px-4">
                <p className="text-lg font-bold text-white">1 view</p>
                <p className="mt-1 text-xs text-slate-600">
                  Everything together
                </p>
              </div>

              <div className="pl-4">
                <p className="text-lg font-bold text-white">0 chaos</p>
                <p className="mt-1 text-xs text-slate-600">
                  That&apos;s the goal
                </p>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-8">
            <div
              aria-hidden="true"
              className="absolute -inset-8 hidden rounded-[40px] bg-blue-600/5 blur-3xl sm:block"
            />

            <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/70 p-2 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />

                <div className="ml-3 rounded-md border border-slate-800 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-600">
                  application-tracker / dashboard
                </div>
              </div>

              <div className="bg-slate-950 p-5 sm:p-6">
                <div className="flex flex-col gap-5 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                      Overview
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Your pipeline
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      What needs your attention right now.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-900 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Up to date
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Applications", "14"],
                    ["Interviews", "3"],
                    ["Follow-ups", "2"],
                    ["Offers", "1"],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                      key={label}
                    >
                      <p className="text-[11px] text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Recent applications
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Updated recently
                      </p>
                    </div>

                    <span className="text-xs font-medium text-blue-400">
                      View all →
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800">
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Frontend Engineer
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Acme Technologies
                        </p>
                      </div>

                      <span className="rounded-full border border-violet-900 bg-violet-950 px-2.5 py-1 text-[11px] text-violet-300">
                        Interview
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Software Engineer
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Northstar Labs
                        </p>
                      </div>

                      <span className="rounded-full border border-blue-900 bg-blue-950 px-2.5 py-1 text-[11px] text-blue-300">
                        Applied
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Web Developer
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Meridian Digital
                        </p>
                      </div>

                      <span className="rounded-full border border-amber-900 bg-amber-950 px-2.5 py-1 text-[11px] text-amber-300">
                        Follow-up due
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-red-950 bg-red-950/10 p-4">
                    <p className="text-xs font-medium text-red-300">
                      Needs attention
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      1 overdue follow-up
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Next interview
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Tomorrow · 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl shadow-black/30 xl:block">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
                  ✓
                </span>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Follow-up scheduled
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Keep the next step visible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-slate-800 bg-slate-900/20"
        id="features"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Built around the next step
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your job search deserves better than a spreadsheet.
              </h2>

              <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
                The tracker keeps the information that matters attached to each
                opportunity, so you always know where things stand and what
                comes next.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-6 transition hover:border-blue-900 hover:bg-slate-900/80"
                  key={feature.title}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-900 bg-blue-950/50 text-blue-400">
                    {feature.icon}
                  </span>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="overflow-hidden rounded-3xl border border-blue-900/60 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 p-8 sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Your next opportunity
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              Spend less time managing the search.
            </h2>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Keep your pipeline organized so your energy can go toward
              applications, interviews, and landing the role.
            </p>
          </div>

          <div className="mt-7 lg:mt-0">
            <FinalAuthAction />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">
              Application Tracker
            </span>
            <span className="text-slate-700">•</span>
            <span>Stay organized. Keep moving.</span>
          </div>

          <p className="text-slate-600">
            Next.js · TypeScript · PostgreSQL · Prisma · Clerk
          </p>
        </div>
      </footer>
    </main>
  );
}