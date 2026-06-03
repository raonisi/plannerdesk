import Link from "next/link";
import {
  BETA_SAFETY_REVIEW_DECISION_CRITERIA,
  BETA_SAFETY_REVIEW_OPERATOR_RULES,
} from "@/lib/answer-assistant/beta-feedback-review-criteria";
import {
  BETA_FEEDBACK_REVIEW_STATUS_LABEL,
  BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS,
  BETA_FEEDBACK_TYPE_OPTIONS,
} from "@/lib/answer-assistant/beta-feedback-labels";
import {
  betaFeedbackDashboardFilterQuery,
  type BetaFeedbackDashboardData,
  type BetaFeedbackDashboardSearchParams,
} from "@/lib/answer-assistant/beta-feedback-dashboard";
import { borders, shadows, surfaces } from "@/lib/design-system";
import { updateBetaFeedbackReviewStatusAction } from "@/app/admin/answer-assistant/feedback/actions";

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-[#102235]">
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default function BetaFeedbackReviewView({
  data,
  filters,
}: {
  data: BetaFeedbackDashboardData;
  filters: BetaFeedbackDashboardSearchParams;
}) {
  const filterQs = (overrides: Partial<BetaFeedbackDashboardSearchParams> = {}) =>
    betaFeedbackDashboardFilterQuery(filters, overrides);

  return (
    <>
      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">Beta 운영 상태</h2>
        <p className="mt-2 text-xs text-[#4f5661]">
          gate {data.operational.betaGateEnabled ? "ON" : "OFF"} · allowlist{" "}
          {data.operational.allowlistPilotCount} · status{" "}
          {data.operational.allowlistBetaStatus}
        </p>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricTile label="전체 피드백" value={data.summary.total} />
        <MetricTile label="신규" value={data.summary.newCount} />
        <MetricTile label="인시던트 후보" value={data.summary.incidentCandidates} />
        <MetricTile label="HIGH 심각도" value={data.summary.highSeverity} />
        <MetricTile label="안전 우려 유형" value={data.summary.safetyConcern} />
      </section>

      <form
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 grid gap-3 rounded-lg p-4 md:grid-cols-2 lg:grid-cols-4`}
        method="get"
      >
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="feedbackType"
          defaultValue={filters.feedbackType ?? "all"}
        >
          <option value="all">유형 전체</option>
          {BETA_FEEDBACK_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="safetySignal"
          defaultValue={filters.safetySignal ?? "all"}
        >
          <option value="all">안전 신호 전체</option>
          {BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="severity"
          defaultValue={filters.severity ?? "all"}
        >
          <option value="all">심각도 전체</option>
          <option value="low">낮음</option>
          <option value="medium">중간</option>
          <option value="high">높음</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="adminStatus"
          defaultValue={filters.adminStatus ?? "all"}
        >
          <option value="all">검토 상태 전체</option>
          {Object.entries(BETA_FEEDBACK_REVIEW_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="createdFrom"
          type="date"
          defaultValue={filters.createdFrom ?? ""}
        />
        <input
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="createdTo"
          type="date"
          defaultValue={filters.createdTo ?? ""}
        />
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-[#d9c9a8] bg-white px-3 text-xs">
          <input
            defaultChecked={filters.incidentOnly === "true"}
            name="incidentOnly"
            type="checkbox"
            value="true"
          />
          인시던트 후보만
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
        >
          필터
        </button>
      </form>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">수동 검토 판단 기준</h2>
        <p className="mt-2 text-xs text-[#4f5661]">
          자동 제재·allowlist 제거·gate OFF 없음. 운영자가 아래 기준으로 수동 판단합니다.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {BETA_SAFETY_REVIEW_OPERATOR_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <details className="mt-4 text-xs text-[#4f5661]">
          <summary className="cursor-pointer font-semibold text-[#102235]">
            유지 / 중단 / 개선 / 확대 보류 기준
          </summary>
          <div className="mt-2 space-y-3">
            {(
              Object.entries(BETA_SAFETY_REVIEW_DECISION_CRITERIA) as [
                string,
                readonly string[],
              ][]
            ).map(([key, items]) => (
              <div key={key}>
                <p className="font-semibold text-[#102235]">{key}</p>
                <ul className="mt-1 list-disc pl-5">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">피드백 목록</h2>
        <p className="mt-1 text-xs text-[#4f5661]">
          usage audit 메타데이터만 연결 · 원문·초안 미표시
        </p>
        {data.rows.length === 0 ? (
          <p className="mt-4 text-sm text-[#4f5661]">피드백이 없습니다.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {data.rows.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-[#e8e0d0] bg-[#fbf7ee] p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#102235]">
                    {row.feedbackTypeLabel}
                  </span>
                  {row.incidentHint ? (
                    <span className="rounded-full bg-[#fdf2f2] px-2 py-0.5 text-xs font-semibold text-[#8b2e2e] ring-1 ring-[#e8c4c4]">
                      인시던트 힌트
                    </span>
                  ) : null}
                  <span className="text-xs text-[#4f5661]">
                    {row.createdAt.slice(0, 19).replace("T", " ")} UTC
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#4f5661]">
                  신호: {row.safetySignalLabel ?? "—"} · 심각도: {row.severity} ·
                  검토: {row.adminStatusLabel}
                  {row.userIdPrefix ? ` · user ${row.userIdPrefix}` : ""}
                </p>
                {row.usageAuditId ? (
                  <p className="mt-1 text-xs text-[#4f5661]">
                    audit: {row.usageAuditId.slice(0, 12)}… · outcome{" "}
                    {row.auditOutcome ?? "—"}
                    {row.auditBlockedReason
                      ? ` · ${row.auditBlockedReason}`
                      : ""}
                    {row.auditRateLimitBlocked ? " · RL" : ""}
                    {row.auditOutputSafetyBlocked ? " · OS" : ""}
                  </p>
                ) : null}
                {row.shortNote ? (
                  <p className="mt-2 rounded-md bg-white px-2 py-1 text-xs text-[#303845]">
                    메모: {row.shortNote}
                  </p>
                ) : null}

                <form
                  action={updateBetaFeedbackReviewStatusAction}
                  className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#e8e0d0] pt-3"
                >
                  <input name="feedbackId" type="hidden" value={row.id} />
                  <label className="text-xs">
                    검토 상태
                    <select
                      className="ml-1 min-h-9 rounded border border-[#d9c9a8] bg-white px-2 text-xs"
                      name="adminStatus"
                      defaultValue={row.adminStatus}
                    >
                      {Object.entries(BETA_FEEDBACK_REVIEW_STATUS_LABEL).map(
                        ([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="flex-1 text-xs">
                    관리자 메모
                    <input
                      className="mt-1 min-h-9 w-full min-w-[12rem] rounded border border-[#d9c9a8] bg-white px-2 text-xs"
                      name="adminMemo"
                      placeholder="수동 검토 메모 (500자 이하)"
                      maxLength={500}
                    />
                  </label>
                  <button
                    type="submit"
                    className="min-h-9 rounded bg-[#102235] px-3 text-xs font-semibold text-white"
                  >
                    저장
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#4f5661]">
          <span>
            총 {data.totalRows}건 · {data.page}/{data.pageCount}
          </span>
          {data.page > 1 ? (
            <Link
              href={`/admin/answer-assistant/feedback${filterQs({
                page: String(data.page - 1),
              })}`}
              className="rounded border border-[#d9c9a8] px-2 py-1 text-xs font-semibold"
            >
              이전
            </Link>
          ) : null}
          {data.page < data.pageCount ? (
            <Link
              href={`/admin/answer-assistant/feedback${filterQs({
                page: String(data.page + 1),
              })}`}
              className="rounded border border-[#d9c9a8] px-2 py-1 text-xs font-semibold"
            >
              다음
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}
