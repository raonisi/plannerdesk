"use client";

import { AlertCircle, Check } from "lucide-react";

import type { CopyFeedbackVariant } from "@/hooks/useCopyFeedback";

export function CopyToast({
  message,
  variant = "success",
}: {
  message: string | null;
  variant?: CopyFeedbackVariant;
}) {
  if (!message) return null;

  const isFailure = variant === "failure";

  return (
    <div
      aria-live={isFailure ? "assertive" : "polite"}
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex max-w-[min(calc(100vw-1.5rem),26rem)] -translate-x-1/2 items-start gap-2.5 rounded-xl border border-[#E3DED4] bg-[#0F1D2E] px-5 py-4 text-sm font-semibold leading-snug text-white shadow-lg sm:bottom-8 sm:text-base"
      role={isFailure ? "alert" : "status"}
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {isFailure ? (
        <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#f0c4c4]" />
      ) : (
        <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#B9975B]" />
      )}
      <span className="break-keep">{message}</span>
    </div>
  );
}
