"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";

type FollowUpActionsProps = {
  currentFollowUpAt: Date | null;
  updateAction: (formData: FormData) => Promise<void>;
};

function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function FollowUpButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        name="intent"
        type="submit"
        value="reschedule"
      >
        {pending ? "Saving..." : "Reschedule"}
      </button>

      <button
        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        name="intent"
        type="submit"
        value="clear"
      >
        Clear
      </button>
    </div>
  );
}

export function FollowUpActions({
  currentFollowUpAt,
  updateAction,
}: FollowUpActionsProps) {
  const inputId = useId();

  return (
    <form action={updateAction} className="space-y-2">
      <label className="sr-only" htmlFor={inputId}>
        Follow-up date
      </label>

      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        defaultValue={formatDateInput(currentFollowUpAt)}
        id={inputId}
        name="followUpAt"
        type="date"
      />

      <FollowUpButtons />
    </form>
  );
}