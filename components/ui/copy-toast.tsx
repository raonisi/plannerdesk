"use client";

import { Check } from "lucide-react";

export function CopyToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-[min(100vw-2rem,24rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-[#E3DED4] bg-[#0F1D2E] px-5 py-3.5 text-sm font-semibold text-white shadow-lg"
      role="status"
    >
      <Check aria-hidden className="h-4 w-4 shrink-0 text-[#B9975B]" />
      <span>{message}</span>
    </div>
  );
}
