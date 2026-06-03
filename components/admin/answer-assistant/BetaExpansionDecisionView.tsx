import Link from "next/link";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import type { BetaExpansionDecisionReport } from "@/lib/answer-assistant/beta-expansion-decision";
import { betaExpansionDecisionFilterQuery } from "@/lib/answer-assistant/beta-expansion-decision";
import type { BetaExpansionDecisionSearchParams } from "@/lib/answer-assistant/beta-expansion-decision";
import { BETA_SAFETY_REVIEW_OPERATOR_RULES } from "@/lib/answer-assistant/beta-feedback-review-criteria";

const DECISION_LABEL: Record<BetaExpansionDecisionReport["decision"], string> = {
  CONTINUE_CURRENT_BETA: "현 beta 유지 (CONTINUE_CURRENT_BETA)",
  PAUSE_BETA: "beta 일시 중단 검토 (PAUSE_BETA)",
  IMPROVE_BEFORE_EXPANSION: "확대 전 개선 (IMPROVE_BEFORE_EXPANSION)",
  EXPANSION_NOT_READY: "확대 미준비 (EXPANSION_NOT_READY)",
  LIMITED_EXPANSION_CANDIDATE: "제한 확대 후보 (LIMITED_EXPANSION_CANDIDATE)",
};

function MetricTile({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: number | string;
  tone?: "navy" | "green" | "gold" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]"
      : tone === "gold"
        ? "border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]"
        : tone === "red"
          ? "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]"
          : "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function formatPeriodDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function BetaExpansionDecisionView({
  report,
  filters,
  banner,
}: {
  report: BetaExpansionDecisionReport;
  filters: BetaExpansionDecisionSearchParams;
  banner: {
    betaGateEnabled: boolean;
    betaEnvEnabled: boolean;
    allowlistPilotCount: number;
    allowlistBetaStatus: string;
    verifiedGenerationEnabled: boolean;
  };
}) {
  const filterQs = betaExpansionDecisionFilterQuery(filters);

  return (
    <div className="space-y-8">
      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">기간 필터</h2>
        <form className="mt-3 flex flex-wrap items-end gap-3" method="get">
          <label className="text-xs text-[#4f5661]">
            시작일 (UTC)
            <input
              type="date"
              name="createdFrom"
              defaultValue={
                filters.createdFrom ?? formatPeriodDate(report.period.start)
              }
              className="mt-1 block rounded border border-[#d6d8dc] px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-[#4f5661]">
            종료일 (UTC)
            <input
              type="date"
              name="createdTo"
              defaultValue={
                filters.createdTo ?? formatPeriodDate(report.period.end)
              }
              className="mt-1 block rounded border border-[#d6d8dc] px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="min-h-9 rounded-lg bg-[#102235] px-4 text-sm font-semibold text-white"
          >
            기간 적용
          </button>
        </form>
        <p className="mt-2 text-xs text-[#4f5661]">
          판단 기간: {formatPeriodDate(report.period.start)} ~{" "}
          {formatPeriodDate(report.period.end)} · allowlist beta 상태:{" "}
          {banner.allowlistBetaStatus} · 파일럿 {banner.allowlistPilotCount}명
        </p>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5`}
        aria-labelledby="final-decision-heading"
      >
        <h2
          id="final-decision-heading"
          className="text-base font-bold text-[#102235]"
        >
          최종 판단 (권고)
        </h2>
        <p className={`mt-2 ${textStyles.body}`}>
          이 화면은 <strong>판단 자료</strong>만 제공합니다. allowlist 확대·gate
          ON·beta 중단은 운영자 수동 sign-off 후 별도 PR에서만 진행합니다.
        </p>
        <dl className="mt-4 grid gap-2 text-sm">
          <div>
            <dt className="font-semibold text-[#4f5661]">Decision</dt>
            <dd className="text-lg font-bold text-[#102235]">
              {DECISION_LABEL[report.decision]}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#4f5661]">판단 기간</dt>
            <dd>
              {formatPeriodDate(report.period.start)} ~{" "}
              {formatPeriodDate(report.period.end)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#4f5661]">핵심 근거</dt>
            <dd>
              <ul className="list-disc pl-5">
                {report.rationale.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </dd>
          </div>
          {report.noGoReasons.length > 0 ? (
            <div>
              <dt className="font-semibold text-[#8b2e2e]">No-Go 사유</dt>
              <dd className="text-[#8b2e2e]">{report.noGoReasons.join(", ")}</dd>
            </div>
          ) : null}
          {report.improvementItems.length > 0 ? (
            <div>
              <dt className="font-semibold text-[#7b5b19]">개선 필요 항목</dt>
              <dd>{report.improvementItems.join(", ")}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-[#4f5661]">확대 가능 범위</dt>
            <dd>{report.expansionScopeNote}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#4f5661]">다음 PR</dt>
            <dd>
              <span className="font-bold">{report.nextPr}</span> —{" "}
              {report.nextPrSummary}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[#4f5661]">
          후보: {report.decisionCandidates.join(" · ")}
        </p>
        {report.decision === "LIMITED_EXPANSION_CANDIDATE" ? (
          <p className="mt-3">
            <Link
              href={`/admin/answer-assistant/expansion-plan${filterQs}`}
              className="text-sm font-semibold text-[#aa8137] hover:underline"
            >
              PR-104-C Allowlist 확대 계획 →
            </Link>
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-sm font-bold text-[#102235]">Usage Audit 지표</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            label="Total beta requests"
            value={report.usage.totalBetaRequests}
          />
          <MetricTile label="Success" value={report.usage.success} tone="green" />
          <MetricTile label="Blocked" value={report.usage.blocked} tone="gold" />
          <MetricTile
            label="Rate limited"
            value={report.usage.rateLimited}
            tone="gold"
          />
          <MetricTile
            label="Prompt injection"
            value={report.usage.promptInjectionBlocked}
            tone="red"
          />
          <MetricTile
            label="Output safety blocked"
            value={report.usage.outputSafetyBlocked}
            tone="red"
          />
          <MetricTile
            label="Provider error"
            value={report.usage.providerError}
            tone="gold"
          />
          <MetricTile
            label="Insufficient evidence"
            value={report.usage.insufficientEvidence}
          />
          <MetricTile
            label="Permission denied"
            value={report.usage.permissionDenied}
            tone="red"
          />
          <MetricTile
            label="Not allowlisted"
            value={report.usage.notAllowlisted}
          />
        </div>
        <p className="mt-2 text-xs text-[#4f5661]">
          <Link
            href={`/admin/answer-assistant/audit${filterQs}`}
            className="font-semibold text-[#aa8137] hover:underline"
          >
            Usage Audit 상세 →
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold text-[#102235]">Feedback Safety 지표</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Total feedback" value={report.feedback.totalFeedback} />
          <MetricTile
            label="Critical"
            value={report.feedback.criticalFeedback}
            tone="red"
          />
          <MetricTile label="Needs fix" value={report.feedback.needsFix} tone="gold" />
          <MetricTile
            label="Unsafe output"
            value={report.feedback.unsafeOutput}
            tone="red"
          />
          <MetricTile
            label="Field exposure risk"
            value={report.feedback.fieldExposureRisk}
            tone="red"
          />
          <MetricTile
            label="Output safety miss"
            value={report.feedback.outputSafetyMiss}
            tone="red"
          />
          <MetricTile
            label="Claim judgment risk"
            value={report.feedback.claimJudgmentRisk}
            tone="red"
          />
          <MetricTile
            label="Medical interpretation risk"
            value={report.feedback.medicalInterpretationRisk}
            tone="red"
          />
          <MetricTile
            label="Loss adjustment risk"
            value={report.feedback.lossAdjustmentRisk}
            tone="red"
          />
          <MetricTile
            label="Product solicitation risk"
            value={report.feedback.productSolicitationRisk}
          />
          <MetricTile
            label="Evidence missing"
            value={report.feedback.evidenceMissing}
          />
          <MetricTile label="UI confusing" value={report.feedback.uiConfusing} />
        </div>
        <p className="mt-2 text-xs text-[#4f5661]">
          <Link
            href={`/admin/answer-assistant/feedback${filterQs}`}
            className="font-semibold text-[#aa8137] hover:underline"
          >
            Beta 피드백 검토 →
          </Link>
          {" · "}
          shortNote·adminMemo 원문 대량 표시 없음
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold text-[#102235]">Retention / Cleanup</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricTile
            label="Last cleanup"
            value={
              report.retention.lastCleanupDate
                ? formatPeriodDate(report.retention.lastCleanupDate)
                : "데이터 없음"
            }
          />
          <MetricTile
            label="Cleanup overdue"
            value={report.retention.cleanupOverdue ? "예" : "아니오"}
            tone={report.retention.cleanupOverdue ? "red" : "green"}
          />
          <MetricTile
            label="Old audit candidates"
            value={report.retention.oldAuditCandidateCount}
          />
          <MetricTile
            label="Old feedback candidates"
            value={report.retention.oldFeedbackCandidateCount}
          />
          <MetricTile
            label="Critical protected"
            value={report.retention.criticalFeedbackProtectedCount}
          />
          <MetricTile
            label="Linked audit protected"
            value={report.retention.linkedUsageAuditProtectedCount}
          />
        </div>
        <p className="mt-2 text-xs text-[#4f5661]">
          <Link
            href="/admin/answer-assistant/cleanup"
            className="font-semibold text-[#aa8137] hover:underline"
          >
            Retention cleanup →
          </Link>
        </p>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">Safety No-Go</h2>
        {report.safetyNoGoRows.every((r) => r.count === 0) ? (
          <p className="mt-2 text-sm text-[#4f5661]">데이터 없음 (0건)</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
                <th className="pb-2 font-semibold">신호</th>
                <th className="pb-2 text-right font-semibold">건수</th>
                <th className="pb-2 font-semibold">최근</th>
                <th className="pb-2 font-semibold">영향</th>
                <th className="pb-2 font-semibold">권장 조치</th>
              </tr>
            </thead>
            <tbody>
              {report.safetyNoGoRows
                .filter((r) => r.count > 0)
                .map((row) => (
                  <tr key={row.signalKey} className="border-b border-[#f0ebe3]">
                    <td className="py-2 pr-2">{row.label}</td>
                    <td className="py-2 text-right tabular-nums font-semibold">
                      {row.count}
                    </td>
                    <td className="py-2 text-xs text-[#4f5661]">
                      {row.latestAt ? formatPeriodDate(row.latestAt) : "—"}
                    </td>
                    <td className="py-2 text-xs">{row.expansionImpact}</td>
                    <td className="py-2 text-xs">{row.recommendedAction}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">Operational Readiness</h2>
        <ul className="mt-3 space-y-1 text-sm text-[#102235]">
          <li>
            Rate limit: {report.operational.rateLimitHealthy ? "정상" : "점검 필요"}
          </li>
          <li>
            Usage audit:{" "}
            {report.operational.usageAuditHealthy ? "정상" : "점검 필요"}
          </li>
          <li>
            Retention cleanup:{" "}
            {report.operational.retentionHealthy ? "정상" : "지연/후보 누적"}
          </li>
          <li>
            Allowlist beta: {report.operational.allowlistBetaStatus}
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-sm text-[#4f5661]">
        <h2 className="font-bold text-[#7b5b19]">금지 유지</h2>
        <ul className="mt-2 list-disc pl-5">
          {report.forbiddenReminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {BETA_SAFETY_REVIEW_OPERATOR_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs">
          allowlist 자동 확대 · feature gate ON · beta 자동 중단 · 사용자 자동 제재 ·
          고객 발송 버튼 없음
        </p>
      </section>
    </div>
  );
}
