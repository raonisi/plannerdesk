import Link from "next/link";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import type { AllowlistExpansionPlanReport } from "@/lib/answer-assistant/allowlist-expansion-plan";
import { betaExpansionDecisionFilterQuery } from "@/lib/answer-assistant/beta-expansion-decision";
import type { BetaExpansionDecisionSearchParams } from "@/lib/answer-assistant/beta-expansion-decision";

const PLAN_DECISION_LABEL: Record<
  AllowlistExpansionPlanReport["decision"],
  string
> = {
  EXPANSION_BLOCKED: "확대 보류 (EXPANSION_BLOCKED)",
  KEEP_CURRENT_ALLOWLIST: "현 allowlist 유지 (KEEP_CURRENT_ALLOWLIST)",
  READY_FOR_WAVE_1_PLAN: "Wave 1 계획 준비 (READY_FOR_WAVE_1_PLAN)",
  READY_FOR_WAVE_2_PLAN: "Wave 2 계획 준비 (READY_FOR_WAVE_2_PLAN)",
  EXPANSION_REQUIRES_IMPROVEMENT: "개선 후 재검토 (EXPANSION_REQUIRES_IMPROVEMENT)",
  PAUSE_AND_FIX_REQUIRED: "중단·수정 필요 (PAUSE_AND_FIX_REQUIRED)",
};

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function StatusBadge({ met }: { met: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        met
          ? "bg-[#edf7f2] text-[#1f6b55] ring-1 ring-[#b9d5c9]"
          : "bg-[#fdf2f2] text-[#8b2e2e] ring-1 ring-[#e8c4c4]"
      }`}
    >
      {met ? "충족" : "미충족"}
    </span>
  );
}

export default function AllowlistExpansionPlanView({
  report,
  filters,
}: {
  report: AllowlistExpansionPlanReport;
  filters: BetaExpansionDecisionSearchParams;
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
                filters.createdFrom ?? formatDate(report.period.start)
              }
              className="mt-1 block rounded border border-[#d6d8dc] px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-[#4f5661]">
            종료일 (UTC)
            <input
              type="date"
              name="createdTo"
              defaultValue={filters.createdTo ?? formatDate(report.period.end)}
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
          PR-103 decision: <strong>{report.pr103Decision}</strong> · 현 allowlist{" "}
          {report.currentAllowlistCount}명 (userId 목록은 노출하지 않음)
        </p>
        <p className="mt-1 text-xs">
          <Link
            href={`/admin/answer-assistant/beta-decision${filterQs}`}
            className="font-semibold text-[#aa8137] hover:underline"
          >
            Beta 확대 판단 (PR-103) →
          </Link>
        </p>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5`}
      >
        <h2 className="text-base font-bold text-[#102235]">Expansion Plan 권고</h2>
        <p className={`mt-2 ${textStyles.body}`}>
          <strong>확대 실행 PR이 아닙니다.</strong> allowlist env 수동 반영은 운영자
          sign-off 후 별도 절차만 해당합니다.
        </p>
        <p className="mt-3 text-lg font-bold text-[#102235]">
          {PLAN_DECISION_LABEL[report.decision]}
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-[#4f5661]">
          {report.decisionRationale.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[#4f5661]">
          전제 조건: {report.preconditionsMet ? "충족" : "보류"} · 활성 Wave{" "}
          {report.activeWave}
        </p>
        <p className="mt-1 text-xs text-[#4f5661]">
          다음 PR 후보: {report.nextPrCandidates.join(" · ")}
        </p>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">확대 가능 전제 조건</h2>
        {!report.preconditionsMet ? (
          <p className="mt-2 text-sm font-semibold text-[#8b2e2e]">
            하나 이상 미충족 — expansion plan 보류
          </p>
        ) : (
          <p className="mt-2 text-sm text-[#1f6b55]">전제 조건 충족 — 계획 검토 가능</p>
        )}
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
              <th className="pb-2 font-semibold">조건</th>
              <th className="pb-2 font-semibold">상태</th>
              <th className="pb-2 font-semibold">상세</th>
            </tr>
          </thead>
          <tbody>
            {report.preconditions.map((row) => (
              <tr key={row.key} className="border-b border-[#f0ebe3]">
                <td className="py-2 pr-2">{row.label}</td>
                <td className="py-2">
                  <StatusBadge met={row.met} />
                </td>
                <td className="py-2 text-xs text-[#4f5661]">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">Wave별 확대 계획</h2>
        <p className="mt-2 text-xs text-[#4f5661]">
          Wave 1 제안 추가 인원: {report.wave1SuggestedAdds}명 (수동 반영)
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {report.waves.map((wave) => (
            <div
              key={wave.wave}
              className={`rounded-lg border p-4 ${
                wave.status === "current"
                  ? "border-[#b9d5c9] bg-[#edf7f2]"
                  : wave.status === "blocked"
                    ? "border-[#e8c4c4] bg-[#fdf2f2]"
                    : "border-[#d9c9a8] bg-[#f7f1e5]"
              }`}
            >
              <p className="text-xs font-semibold uppercase text-[#4f5661]">
                {wave.status}
              </p>
              <h3 className="mt-1 font-bold text-[#102235]">{wave.title}</h3>
              <p className="mt-2 text-xs text-[#4f5661]">{wave.purpose}</p>
              <dl className="mt-2 space-y-1 text-xs">
                {wave.maxAdd !== null ? (
                  <div>
                    <dt className="text-[#4f5661]">추가 상한</dt>
                    <dd className="font-semibold">{wave.maxAdd}명</dd>
                  </div>
                ) : null}
                {wave.cumulativeCap !== null ? (
                  <div>
                    <dt className="text-[#4f5661]">누적 상한</dt>
                    <dd className="font-semibold">{wave.cumulativeCap}명</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[#4f5661]">최소 운영 기간</dt>
                  <dd className="font-semibold">{wave.minOperationDays}일</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">확대 후보 (수동 선정)</h2>
        <p className="mt-2 text-xs text-[#4f5661]">
          PlannerVerification approved · allowlist 미포함 · 운영자 수동 승인 필요.
          동의 체크 UI는 후속 PR.
        </p>
        <p className="mt-1 text-sm font-semibold text-[#102235]">
          자격 후보 {report.eligibleCandidateCount}명 / 미리보기{" "}
          {report.candidates.length}건
        </p>
        {report.candidates.length === 0 ? (
          <p className="mt-3 text-sm text-[#4f5661]">데이터 없음</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
                <th className="pb-2 font-semibold">표시명</th>
                <th className="pb-2 font-semibold">userId</th>
                <th className="pb-2 font-semibold">후보</th>
                <th className="pb-2 font-semibold">제외 사유</th>
              </tr>
            </thead>
            <tbody>
              {report.candidates.map((row) => (
                <tr key={row.verificationId} className="border-b border-[#f0ebe3]">
                  <td className="py-2 pr-2">{row.displayName}</td>
                  <td className="py-2 font-mono text-xs">{row.userIdPrefix}</td>
                  <td className="py-2">
                    <StatusBadge met={row.eligible} />
                  </td>
                  <td className="py-2 text-xs text-[#4f5661]">
                    {row.excludeReason ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">확대 후 모니터링</h2>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {report.monitoring.map((item) => (
            <li key={item.label} className="flex justify-between gap-2">
              <span className="text-[#4f5661]">{item.label}</span>
              <span className="font-semibold tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
        >
          <h2 className="text-sm font-bold text-[#8b2e2e]">Rollback 검토</h2>
          <ul className="mt-2 list-disc pl-5 text-xs text-[#4f5661]">
            {report.rollbackTriggers.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#4f5661]">
            gate OFF·allowlist 보류·축소는 운영자 수동. PR-104-A 분기.
          </p>
        </div>
        <div
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
        >
          <h2 className="text-sm font-bold text-[#8b2e2e]">확대 중단 검토</h2>
          <ul className="mt-2 list-disc pl-5 text-xs text-[#4f5661]">
            {report.pauseTriggers.slice(0, 8).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-sm">
        <h2 className="font-bold text-[#7b5b19]">금지 유지</h2>
        <ul className="mt-2 list-disc pl-5 text-[#4f5661]">
          {report.forbiddenReminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs">{report.expansionScopeNote}</p>
        <p className="mt-2 text-xs">
          allowlist 자동 추가 · 전체 VERIFIED 공개 · feature gate ON · beta 즉시 확대
          버튼 없음
        </p>
      </section>
    </div>
  );
}
