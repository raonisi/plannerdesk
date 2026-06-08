import { PUBLIC_UX_EXPLORER_LOADING } from "@/lib/public/public-ux-copy";

export function ExplorerLoadingPanel() {
  return (
    <div
      className="rounded-xl border border-[#E3DED4] bg-white p-6 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-[#0F1D2E]">{PUBLIC_UX_EXPLORER_LOADING}</p>
      <div className="mt-4 space-y-3">
        <div className="h-12 animate-pulse rounded-lg bg-[#F7F4EE]" />
        <div className="h-12 animate-pulse rounded-lg bg-[#F7F4EE]" />
        <div className="h-12 animate-pulse rounded-lg bg-[#F7F4EE]" />
      </div>
    </div>
  );
}
