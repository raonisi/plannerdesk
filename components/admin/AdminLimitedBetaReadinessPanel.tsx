import {
  BETA_DEFERRED_FEATURES,
  BETA_HALT_ROWS,
  BETA_ISSUE_ROWS,
  BETA_MANUAL_APPROVAL_FLOW,
  BETA_READINESS_VERDICT_LABEL,
  BETA_SCOPE_ROWS,
  BETA_USER_CRITERIA,
  BETA_USER_FORBIDDEN_PHRASES,
  BETA_USER_GUIDANCE,
  LIMITED_BETA_CHECKLIST,
  PR141_FORBIDDEN_DOC_CONTENT,
  PR141_OVERALL_CONDITIONS,
  PR141_OVERALL_VERDICT,
  PR141_SCOPE_NOTICE,
  SCOPE_CELL_LABEL,
  type BetaReadinessVerdict,
  type BetaScopeCell,
  type ChecklistStatus,
} from "@/lib/ops/limited-beta-readiness";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const VERDICT_TONE: Record<BetaReadinessVerdict, string> = {
  ready: "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  conditional: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  hold: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
  no_go: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
};

const SCOPE_TONE: Record<BetaScopeCell, string> = {
  allowed: "bg-[#edf7f2] text-[#1f6b55]",
  conditional: "bg-[#fff7e6] text-[#7a612d]",
  restricted: "bg-[#eef3f7] text-[#102235]",
  forbidden: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECK_STATUS: Record<ChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

const CHECK_TONE: Record<ChecklistStatus, string> = {
  met: "text-[#1f6b55]",
  partial: "text-[#7a612d]",
  gap: "text-[#8b2e2e]",
};

export default function AdminLimitedBetaReadinessPanel() {
  const gaps = LIMITED_BETA_CHECKLIST.filter((c) => c.status === "gap");

  return (
    <section className="mb-8" aria-labelledby="admin-limited-beta">
      <h2
        id="admin-limited-beta"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        제한 베타 공개 준비 (PR141)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR141_SCOPE_NOTICE}</p>

      <div
        className={`mb-4 rounded-lg border px-4 py-3 ${VERDICT_TONE[PR141_OVERALL_VERDICT]}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          준비 판단 (PR140 연계)
        </p>
        <p className="mt-1 text-lg font-bold">
          {BETA_READINESS_VERDICT_LABEL[PR141_OVERALL_VERDICT]}
        </p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
          {PR141_OVERALL_CONDITIONS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        공개 범위
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">영역</th>
              <th className="px-3 py-2">범위</th>
            </tr>
          </thead>
          <tbody>
            {BETA_SCOPE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">
                  {row.label}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${SCOPE_TONE[row.scope]}`}
                  >
                    {SCOPE_CELL_LABEL[row.scope]}
                  </span>
                  <p className="mt-0.5 text-[#4f5661]">{row.criterion}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={`rounded-lg border ${borders.default} bg-white px-3 py-3`}>
          <p className="text-xs font-semibold text-[#102235]">베타 사용자 기준</p>
          <ul className="mt-2 space-y-1 text-xs text-[#4f5661]">
            {BETA_USER_CRITERIA.map((row) => (
              <li key={row.label}>
                <strong className="text-[#102235]">{row.label}:</strong> {row.rule}
              </li>
            ))}
          </ul>
        </div>
        <div className={`rounded-lg border ${borders.default} bg-white px-3 py-3`}>
          <p className="text-xs font-semibold text-[#102235]">
            준비 체크리스트
            {gaps.length > 0 ? (
              <span className="ml-2 text-[#8b2e2e]">미충족 {gaps.length}</span>
            ) : null}
          </p>
          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs">
            {LIMITED_BETA_CHECKLIST.map((item) => (
              <li className="flex justify-between gap-2" key={item.id}>
                <span>{item.label}</span>
                <span className={`shrink-0 font-semibold ${CHECK_TONE[item.status]}`}>
                  {CHECK_STATUS[item.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className={`mb-4 rounded-lg border ${borders.default} bg-[#f7f4ee] px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          수동 승인 흐름 · 안내 문구 · 중단 기준
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-[#4f5661]">
          {BETA_MANUAL_APPROVAL_FLOW.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-3 text-xs font-semibold text-[#102235]">안내 문구 (예시)</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
          {BETA_USER_GUIDANCE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold text-[#8b2e2e]">금지 문구</p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {BETA_USER_FORBIDDEN_PHRASES.slice(0, 5).map((p) => (
            <li
              className="rounded bg-[#fdf2f2] px-2 py-0.5 text-[10px] text-[#8b2e2e]"
              key={p}
            >
              {p}
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-xs text-[#4f5661]">
          {BETA_HALT_ROWS.slice(0, 6).map((row) => (
            <li key={row.situation}>
              <strong>{row.situation}</strong> → {row.action}
            </li>
          ))}
        </ul>
      </details>

      <details className={`rounded-lg border ${borders.default} bg-white px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          보류 기능 · 베타 이슈 · 운영 상태값
        </summary>
        <ul className="mt-2 space-y-1 text-xs text-[#4f5661]">
          {BETA_DEFERRED_FEATURES.map((f) => (
            <li key={f.feature}>
              {f.feature} → {f.followUp}
            </li>
          ))}
        </ul>
        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
          {BETA_ISSUE_ROWS.filter((i) => i.severity === "critical").map((i) => (
            <li key={i.issue}>
              [Critical] {i.issue}: {i.action}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-[#5f6670]">
          {DOC_BASE}PR-141-LIMITED-BETA-OPS.md
        </p>
      </details>

      <div
        className={`mt-4 space-y-2 rounded-lg px-4 py-3 ${shadows.card} border ${borders.default} bg-white`}
      >
        <p className="text-xs text-[#4f5661]">{PR141_FORBIDDEN_DOC_CONTENT}</p>
      </div>
    </section>
  );
}
