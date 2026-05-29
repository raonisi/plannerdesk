"use client";

import { Check } from "lucide-react";

export function CopyToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex max-w-[min(calc(100vw-1.5rem),26rem)] -translate-x-1/2 items-start gap-2.5 rounded-xl border border-[#E3DED4] bg-[#0F1D2E] px-5 py-4 text-sm font-semibold leading-snug text-white shadow-lg sm:bottom-8 sm:text-base"
      role="status"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#B9975B]" />
      <span className="break-keep">{message}</span>
    </div>
  );
}
