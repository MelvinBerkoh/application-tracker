"use client";

import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import { ActionFeedbackToast } from "@/features/applications/components/action-feedback-toast";
import type { ManageInterviewActionState } from "@/features/applications/types/manage-interview-action-state";

type UpcomingInterviewCardProps = {
  interview: {
    id: string;
    title: string | null;
    description: string | null;
    occurredAt: string;
  } | null;
  upcomingCount: number;
  manageAction: (
    previousState: ManageInterviewActionState,
    formData: FormData,
  ) => Promise<ManageInterviewActionState>;
};

const initialState: ManageInterviewActionState = {
  status: "idle",
};

type Feedback = {
  id: number;
  status: "success" | "error";
  message: string;
} | null;

export function UpcomingInterviewCard({
  interview,
  upcomingCount,
  manageAction,
}: UpcomingInterviewCardProps) {
  const rescheduleDialogRef = useRef<HTMLDialogElement>(null);
  const cancelDialogRef = useRef<HTMLDialogElement>(null);
  const rescheduleFormRef = useRef<HTMLFormElement>(null);
  const feedbackIdRef = useRef(0);

  const [actionState, setActionState] =
    useState<ManageInterviewActionState>(initialState);

  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const formattedDateTime = interview
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(interview.occurredAt))
    : null;

  function showFeedback(
    status: "success" | "error",
    message: string,
  ) {
    feedbackIdRef.current += 1;

    setFeedback({
      id: feedbackIdRef.current,
      status,
      message,
    });
  }

  function openRescheduleDialog() {
    setActionState(initialState);
    rescheduleFormRef.current?.reset();
    rescheduleDialogRef.current?.showModal();
  }

  function closeRescheduleDialog() {
    if (!isPending) {
      rescheduleDialogRef.current?.close();
    }
  }

  function openCancelDialog() {
    setActionState(initialState);
    cancelDialogRef.current?.showModal();
  }

  function closeCancelDialog() {
    if (!isPending) {
      cancelDialogRef.current?.close();
    }
  }

  async function handleReschedule(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const localDateTime = formData.get("occurredAtLocal");

    if (
      typeof localDateTime === "string" &&
      localDateTime.trim() !== ""
    ) {
      const parsedDate = new Date(localDateTime);

      formData.set(
        "occurredAt",
        Number.isNaN(parsedDate.getTime())
          ? ""
          : parsedDate.toISOString(),
      );
    } else {
      formData.set("occurredAt", "");
    }

    formData.delete("occurredAtLocal");

    setIsPending(true);
    setActionState(initialState);

    try {
      const result = await manageAction(
        initialState,
        formData,
      );

      setActionState(result);

      if (result.message) {
        showFeedback(
          result.status === "success" ? "success" : "error",
          result.message,
        );
      }

      if (result.status === "success") {
        rescheduleDialogRef.current?.close();
        form.reset();
      }
    } catch (error) {
      console.error("Failed to reschedule interview:", error);

      const message =
        "The interview could not be rescheduled. Please try again.";

      setActionState({
        status: "error",
        message,
      });

      showFeedback("error", message);
    } finally {
      setIsPending(false);
    }
  }

  async function handleCancel(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsPending(true);
    setActionState(initialState);

    try {
      const result = await manageAction(
        initialState,
        formData,
      );

      setActionState(result);

      if (result.message) {
        showFeedback(
          result.status === "success" ? "success" : "error",
          result.message,
        );
      }

      if (result.status === "success") {
        cancelDialogRef.current?.close();
      }
    } catch (error) {
      console.error("Failed to cancel interview:", error);

      const message =
        "The interview could not be cancelled. Please try again.";

      setActionState({
        status: "error",
        message,
      });

      showFeedback("error", message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              Upcoming
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Interview
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-violet-900 bg-violet-950/50 px-2.5 py-1 text-xs font-semibold text-violet-300">
              {upcomingCount} scheduled
            </span>

            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-900 bg-violet-950/60 text-violet-300"
            >
              ◷
            </span>
          </div>
        </div>

        {interview ? (
          <>
            <div className="mt-6">
              <p className="font-semibold text-slate-100">
                {interview.title ?? "Interview"}
              </p>

              <time
                className="mt-2 block text-sm leading-6 text-violet-300"
                dateTime={interview.occurredAt}
                suppressHydrationWarning
              >
                {formattedDateTime}
              </time>

              {interview.description ? (
                <div className="mt-5 border-t border-slate-800 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {interview.description}
                  </p>
                </div>
              ) : null}

              {upcomingCount > 1 ? (
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Showing your next interview. You have{" "}
                  {upcomingCount - 1} more scheduled after this one.
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex gap-3 border-t border-slate-800 pt-5">
              <button
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-violet-900 bg-violet-950/30 px-3 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-950/60"
                onClick={openRescheduleDialog}
                type="button"
              >
                Reschedule
              </button>

              <button
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-red-900 hover:bg-red-950/20 hover:text-red-300"
                onClick={openCancelDialog}
                type="button"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4">
            <p className="text-sm font-medium text-slate-300">
              Nothing scheduled
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Schedule an interview and your next upcoming meeting will appear
              here.
            </p>
          </div>
        )}
      </section>

      {interview ? (
        <>
          <dialog
            className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-0 text-white shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
            ref={rescheduleDialogRef}
          >
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                    Interview
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Reschedule interview
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Choose a new date and time for{" "}
                    {interview.title ?? "this interview"}.
                  </p>
                </div>

                <button
                  aria-label="Close reschedule dialog"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-lg text-slate-400 transition hover:text-white disabled:opacity-50"
                  disabled={isPending}
                  onClick={closeRescheduleDialog}
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={handleReschedule}
              ref={rescheduleFormRef}
            >
              <input
                name="intent"
                type="hidden"
                value="reschedule"
              />

              <div className="px-6 py-6">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="reschedule-interview-date-time"
                >
                  New date and time
                </label>

                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  id="reschedule-interview-date-time"
                  name="occurredAtLocal"
                  required
                  type="datetime-local"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Enter the new interview time in your local timezone.
                </p>

                {actionState.fieldErrors?.occurredAt ? (
                  <p className="mt-2 text-sm text-red-400">
                    {actionState.fieldErrors.occurredAt[0]}
                  </p>
                ) : null}

                {actionState.status === "error" &&
                actionState.message ? (
                  <p className="mt-4 rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                    {actionState.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  disabled={isPending}
                  onClick={closeRescheduleDialog}
                  type="button"
                >
                  Keep current time
                </button>

                <button
                  className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Saving…" : "Save new time"}
                </button>
              </div>
            </form>
          </dialog>

          <dialog
            className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-red-900 bg-slate-900 p-0 text-white shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
            ref={cancelDialogRef}
          >
            <div className="px-6 py-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-900 bg-red-950/40 text-lg font-bold text-red-300">
                !
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                Cancel this interview?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {interview.title ?? "This interview"} will be removed from
                upcoming interviews. The cancellation will remain in the
                application history.
              </p>
            </div>

            <form onSubmit={handleCancel}>
              <input
                name="intent"
                type="hidden"
                value="cancel"
              />

              {actionState.status === "error" &&
              actionState.message ? (
                <div className="px-6 pb-5">
                  <p className="rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                    {actionState.message}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  disabled={isPending}
                  onClick={closeCancelDialog}
                  type="button"
                >
                  Keep interview
                </button>

                <button
                  className="inline-flex items-center justify-center rounded-xl border border-red-800 bg-red-950/50 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950 disabled:opacity-60"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Cancelling…" : "Cancel interview"}
                </button>
              </div>
            </form>
          </dialog>
        </>
      ) : null}

      {feedback ? (
        <ActionFeedbackToast
          key={feedback.id}
          message={feedback.message}
          status={feedback.status}
        />
      ) : null}
    </>
  );
}