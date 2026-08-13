"use client";

import { useEffect, useState } from "react";

type ActionFeedbackToastProps = {
  status: "success" | "error";
  message: string;
};

export function ActionFeedbackToast({
  status,
  message,
}: ActionFeedbackToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <div
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed bottom-6 right-6 z-[100] w-[calc(100%_-_3rem)] max-w-sm rounded-2xl border p-4 shadow-2xl ${
        isSuccess
          ? "border-emerald-800 bg-emerald-950 text-emerald-100"
          : "border-red-800 bg-red-950 text-red-100"
      }`}
      role={isSuccess ? "status" : "alert"}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
            isSuccess
              ? "border-emerald-700 bg-emerald-900 text-emerald-300"
              : "border-red-700 bg-red-900 text-red-300"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {isSuccess ? "Success" : "Something went wrong"}
          </p>

          <p
            className={`mt-1 text-sm leading-5 ${
              isSuccess ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {message}
          </p>
        </div>

        <button
          aria-label="Dismiss notification"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg transition ${
            isSuccess
              ? "text-emerald-400 hover:bg-emerald-900 hover:text-white"
              : "text-red-400 hover:bg-red-900 hover:text-white"
          }`}
          onClick={() => setVisible(false)}
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}