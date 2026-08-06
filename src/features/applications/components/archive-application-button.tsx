"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type ArchiveApplicationButtonProps = {
  archiveAction: () => Promise<void>;
};

function ArchiveSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Archiving..." : "Yes, archive"}
    </button>
  );
}

export function ArchiveApplicationButton({
  archiveAction,
}: ArchiveApplicationButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg border border-red-900 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Archive application
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
      <p className="text-sm font-medium text-red-200">
        Archive this application?
      </p>

      <p className="mt-1 text-sm text-red-300/80">
        It will disappear from your active dashboard, but can be restored
        later.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <form action={archiveAction}>
          <ArchiveSubmitButton />
        </form>

        <button
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}