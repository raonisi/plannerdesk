import Link from "next/link";
import type { RetentionCleanupPreview } from "@/lib/answer-assistant/retention-cleanup";
import { borders, shadows, surfaces } from "@/lib/design-system";

export default function RetentionStatusPanel({
  preview,
  compact = false,
}: {
  preview: RetentionCleanupPreview;
  compact?: boolean;
}) {
  const { config, eligible, totals } = preview;

  return (
    <section
      className={`${surfaces.card} ${borders.default} ${shadows.card} ${compact ? "p-3" : "p-4"} rounded-lg`}
      aria-labelledby="retention-status-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2
          id="retention-status-heading"
          className="text-sm font-bold text-[#102235]"
        >
          보관기간 · cleanup 상태
        </h2>
        <Link
          href="/admin/answer-assistant/cleanup"
          className="text-xs font-semibold text-[#aa8137] hover:underline"
        >
          cleanup preview →
        </Link>
      </div>
      <p className="mt-2 text-xs text-[#4f5661]">
        Rate limit {config.rateLimitStateDays}일 · Audit {config.usageAuditDays}
        일 · Feedback {config.feedbackDays}일 (인시던트/HIGH{" "}
        {config.feedbackCriticalDays}일)
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-[#4f5661]">Audit (DB)</dt>
          <dd className="font-semibold tabular-nums text-[#102235]">
            {totals.usageAudit}
            {eligible.usageAudit > 0 ? (
              <span className="text-[#8b2e2e]">
                {" "}
                · 삭제 후보 {eligible.usageAudit}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[#4f5661]">Feedback</dt>
          <dd className="font-semibold tabular-nums text-[#102235]">
            {totals.feedback}
            {eligible.feedbackStandard + eligible.feedbackCritical > 0 ? (
              <span className="text-[#8b2e2e]">
                {" "}
                · 후보{" "}
                {eligible.feedbackStandard + eligible.feedbackCritical}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[#4f5661]">Rate limit state</dt>
          <dd className="font-semibold tabular-nums text-[#102235]">
            {totals.rateLimitState}
            {eligible.rateLimitState > 0 ? (
              <span className="text-[#8b2e2e]">
                {" "}
                · 후보 {eligible.rateLimitState}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-[#4f5661]">Execute</dt>
          <dd className="font-semibold text-[#102235]">
            {config.cleanupExecuteEnabled ? "허용(env)" : "비활성"}
          </dd>
        </div>
      </dl>
      {preview.warnings.length > 0 && !compact ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#5c4520]">
          {preview.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
