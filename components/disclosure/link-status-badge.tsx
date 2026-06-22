import type { DisclosureLinkRegistrationStatus } from "@/lib/public/disclosure-link-status";

const STATUS_TONE_CLASS: Record<DisclosureLinkRegistrationStatus, string> = {
  complete:
    "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  registered:
    "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  partial:
    "border-[#d9c9a8] bg-[#f7f1e5] text-[#7a612d]",
  missing:
    "border-[#d6d8dc] bg-[#f4f5f6] text-[#475569]",
};

export function LinkStatusBadge({
  label,
  status,
  className = "",
}: {
  label: string;
  status: DisclosureLinkRegistrationStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-6 max-w-full items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight ${STATUS_TONE_CLASS[status]} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
