import {
  getFreshnessPresentation,
  type FreshnessAudience,
  type FreshnessInput,
  type FreshnessPresentation,
  type FreshnessTone,
} from "@/lib/public/freshness";

const TONE_CLASS: Record<FreshnessTone, string> = {
  positive:
    "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  caution:
    "border-[#d9c9a8] bg-[#f7f1e5] text-[#7a612d]",
  muted:
    "border-[#d6d8dc] bg-[#f4f5f6] text-[#5B6470]",
  neutral:
    "border-[#E3DED4] bg-[#F8F7F3] text-[#5B6470]",
};

export type FreshnessBadgeProps = {
  lastVerifiedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  verificationStatus?: string | null;
  hasOfficialSource?: boolean;
  audience?: FreshnessAudience;
  presentation?: FreshnessPresentation;
  className?: string;
};

export function FreshnessBadge({
  lastVerifiedAt,
  reviewedAt,
  verificationStatus,
  hasOfficialSource,
  audience = "public",
  presentation,
  className = "",
}: FreshnessBadgeProps) {
  const resolved =
    presentation ??
    getFreshnessPresentation(
      {
        lastVerifiedAt,
        reviewedAt,
        verificationStatus,
        hasOfficialSource,
      },
      { audience },
    );

  return (
    <span
      className={`inline-flex min-h-6 max-w-full items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight ${TONE_CLASS[resolved.tone]} ${className}`}
      title={resolved.label}
    >
      {resolved.label}
    </span>
  );
}

export function VerifiedAtLabel({
  lastVerifiedAt,
  reviewedAt,
  verificationStatus,
  hasOfficialSource,
  audience = "public",
  className = "",
}: FreshnessBadgeProps) {
  const input: FreshnessInput = {
    lastVerifiedAt,
    reviewedAt,
    verificationStatus,
    hasOfficialSource,
  };
  const presentation = getFreshnessPresentation(input, { audience });

  return (
    <p className={`text-[10px] font-medium leading-relaxed text-[#5B6470] ${className}`}>
      {presentation.label}
    </p>
  );
}
