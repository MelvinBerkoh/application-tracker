"use client";

import { useFormStatus } from "react-dom";

type RestoreApplicationButtonProps = {
  restoreAction: () => Promise<void>;
};

function RestoreSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Restoring..." : "Restore"}
    </button>
  );
}

export function RestoreApplicationButton({
  restoreAction,
}: RestoreApplicationButtonProps) {
  return (
    <form action={restoreAction}>
      <RestoreSubmitButton />
    </form>
  );
}