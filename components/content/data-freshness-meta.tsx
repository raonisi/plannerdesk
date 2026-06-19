import { ExternalTabAnchor } from "@/components/content-page";
import { FreshnessBadge } from "@/components/content/freshness-badge";
import {
  DATA_FRESHNESS_COPY,
  getOfficialSourceLabel,
} from "@/lib/public/data-freshness";

export type DataFreshnessMetaProps = {
  lastVerifiedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  officialSourceUrl?: string | null;
  verificationStatus?: string | null;
  /** When true, shows claim-specific guidance (non-compact only). */
  showClaimNotice?: boolean;
  compact?: boolean;
  className?: string;
};

const metaTextClass =
  "text-[11px] font-medium leading-relaxed text-[#4A5565]";
const badgeClass =
  "inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold";

export function DataFreshnessMeta({
  lastVerifiedAt,
  reviewedAt,
  officialSourceUrl,
  verificationStatus,
  showClaimNotice = false,
  compact = false,
  className = "",
}: DataFreshnessMetaProps) {
  const source = getOfficialSourceLabel(officialSourceUrl);
  const freshness = (
    <FreshnessBadge
      hasOfficialSource={source.kind === "link"}
      lastVerifiedAt={lastVerifiedAt}
      reviewedAt={reviewedAt}
      verificationStatus={verificationStatus}
    />
  );

  if (compact) {
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5f6670] ${className}`}
      >
        {freshness}
        {source.kind === "link" ? (
          <ExternalTabAnchor
            className={`${badgeClass} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55] hover:bg-[#e3f2eb]`}
            href={source.href}
          >
            {source.label}
          </ExternalTabAnchor>
        ) : null}
      </span>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">{freshness}</div>
      <div className="flex flex-wrap items-center gap-2">
        {source.kind === "link" ? (
          <ExternalTabAnchor
            className={`${badgeClass} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55] hover:bg-[#e3f2eb]`}
            href={source.href}
          >
            {source.label}
          </ExternalTabAnchor>
        ) : (
          <span className={`${badgeClass} border-[#E3DED4] bg-[#F8F7F3] text-[#4A5565]`}>
            {DATA_FRESHNESS_COPY.missingSource}
          </span>
        )}
      </div>
      {showClaimNotice ? (
        <p className={`${metaTextClass} break-keep`}>
          {DATA_FRESHNESS_COPY.claimPolicyNotice}{" "}
          {DATA_FRESHNESS_COPY.customerCheckNotice}
        </p>
      ) : null}
    </div>
  );
}
