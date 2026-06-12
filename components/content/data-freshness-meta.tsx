import { ExternalTabAnchor } from "@/components/content-page";
import {
  DATA_FRESHNESS_COPY,
  getFreshnessDateLabel,
  getOfficialSourceLabel,
} from "@/lib/public/data-freshness";

export type DataFreshnessMetaProps = {
  lastVerifiedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  officialSourceUrl?: string | null;
  /** When true, shows claim-specific guidance (non-compact only). */
  showClaimNotice?: boolean;
  compact?: boolean;
  className?: string;
};

const metaTextClass =
  "text-[11px] font-medium leading-relaxed text-[#5B6470]";
const badgeClass =
  "inline-flex min-h-6 items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold";

export function DataFreshnessMeta({
  lastVerifiedAt,
  reviewedAt,
  officialSourceUrl,
  showClaimNotice = false,
  compact = false,
  className = "",
}: DataFreshnessMetaProps) {
  const date = getFreshnessDateLabel(lastVerifiedAt, reviewedAt);
  const source = getOfficialSourceLabel(officialSourceUrl);

  if (compact) {
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5f6670] ${className}`}
      >
        <span>{date.label}</span>
        {source.kind === "link" ? (
          <ExternalTabAnchor
            className={`${badgeClass} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55] hover:bg-[#e3f2eb]`}
            href={source.href}
          >
            {source.label}
          </ExternalTabAnchor>
        ) : (
          <span className={`${badgeClass} border-[#e3ded4] bg-[#f8f7f3] text-[#5B6470]`}>
            {source.label}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <p className={metaTextClass}>{date.label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {source.kind === "link" ? (
          <ExternalTabAnchor
            className={`${badgeClass} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55] hover:bg-[#e3f2eb]`}
            href={source.href}
          >
            {source.label}
          </ExternalTabAnchor>
        ) : (
          <span className={`${badgeClass} border-[#e3ded4] bg-[#f8f7f3] text-[#5B6470]`}>
            {source.label}
          </span>
        )}
        {!date.hasDate ? (
          <span className={`${badgeClass} border-[#e8dfd0] bg-[#fbf7ee] text-[#7a612d]`}>
            {DATA_FRESHNESS_COPY.freshnessUncertain}
          </span>
        ) : null}
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
