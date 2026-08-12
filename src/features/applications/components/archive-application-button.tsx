"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type ArchiveApplicationButtonProps = {
  archiveAction: () => Promise<void>;
};

function ArchiveSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
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
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isConfirming) {
      confirmationRef.current?.focus();
    }
  }, [isConfirming]);

  if (!isConfirming) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-lg border border-red-900 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Archive application
      </button>
    );
  }

  return (
    <div
      aria-labelledby="archive-confirmation-title"
      className="rounded-lg border border-red-900 bg-red-950/40 p-4"
      role="group"
    >
      <p
        className="text-sm font-medium text-red-200 outline-none"
        id="archive-confirmation-title"
        ref={confirmationRef}
        tabIndex={-1}
      >
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
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}