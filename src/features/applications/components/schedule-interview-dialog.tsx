"use client";

import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import { ActionFeedbackToast } from "@/features/applications/components/action-feedback-toast";
import type { ScheduleInterviewActionState } from "@/features/applications/types/schedule-interview-action-state";

type ScheduleInterviewDialogProps = {
  scheduleAction: (
    previousState: ScheduleInterviewActionState,
    formData: FormData,
  ) => Promise<ScheduleInterviewActionState>;
};

const initialState: ScheduleInterviewActionState = {
  status: "idle",
};

type Feedback = {
  id: number;
  status: "success" | "error";
  message: string;
} | null;

export function ScheduleInterviewDialog({
  scheduleAction,
}: ScheduleInterviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const feedbackIdRef = useRef(0);

  const [actionState, setActionState] =
    useState<ScheduleInterviewActionState>(initialState);

  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

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

  function openDialog() {
    setActionState(initialState);
    formRef.current?.reset();
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!isPending) {
      dialogRef.current?.close();
    }
  }

  async function handleSubmit(
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
      const result = await scheduleAction(
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
        dialogRef.current?.close();
        form.reset();
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);

      const message =
        "The interview could not be scheduled. Please try again.";

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
      <button
        className="inline-flex items-center justify-center rounded-xl border border-violet-800 bg-violet-950/40 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-700 hover:bg-violet-950/70 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        onClick={openDialog}
        type="button"
      >
        <span aria-hidden="true" className="mr-2">
          ◷
        </span>
        Schedule interview
      </button>

      <dialog
        className="m-auto w-[calc(100%_-_2rem)] max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-0 text-white shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
        ref={dialogRef}
      >
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                Interview
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Schedule interview
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add the interview details and keep the next step visible from
                your dashboard.
              </p>
            </div>

            <button
              aria-label="Close interview dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-lg text-slate-400 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
              disabled={isPending}
              onClick={closeDialog}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="space-y-5 px-6 py-6">
            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="interview-title"
              >
                Interview type
              </label>

              <input
                autoFocus
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                id="interview-title"
                maxLength={160}
                name="title"
                placeholder="Technical interview"
                type="text"
              />

              {actionState.fieldErrors?.title ? (
                <p className="mt-2 text-sm text-red-400">
                  {actionState.fieldErrors.title[0]}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="interview-date-time"
              >
                Date and time
              </label>

              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                id="interview-date-time"
                name="occurredAtLocal"
                required
                type="datetime-local"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Enter the interview time in your local timezone.
              </p>

              {actionState.fieldErrors?.occurredAt ? (
                <p className="mt-2 text-sm text-red-400">
                  {actionState.fieldErrors.occurredAt[0]}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="interview-description"
              >
                Notes
                <span className="ml-1 font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                id="interview-description"
                maxLength={2000}
                name="description"
                placeholder="Zoom link, interviewer, topics to prepare, or anything else useful."
              />

              {actionState.fieldErrors?.description ? (
                <p className="mt-2 text-sm text-red-400">
                  {actionState.fieldErrors.description[0]}
                </p>
              ) : null}
            </div>

            {actionState.status === "error" &&
            actionState.message ? (
              <p className="rounded-xl border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {actionState.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              disabled={isPending}
              onClick={closeDialog}
              type="button"
            >
              Cancel
            </button>

            <button
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? "Scheduling…"
                : "Schedule interview"}
            </button>
          </div>
        </form>
      </dialog>

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