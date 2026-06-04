import {
  ACCESS_SCOPE_ROWS,
  APPLICANT_REVIEW_ROWS,
  APPROVAL_CRITERIA,
  BETA_ACCESS_READINESS_CHECKLIST,
  BETA_REQUEST_FLOW_STEPS,
  BETA_REQUEST_STATUS_LABEL,
  BETA_USER_NOTICE_FORBIDDEN,
  BETA_USER_NOTICE_GOOD,
  HOLD_REJECT_TRIGGERS,
  PII_ALLOWED_CANDIDATES,
  PII_FORBIDDEN_AT_INTAKE,
  PR146_DEFERRED_IMPLEMENTATION,
  PR146_DEFERRED_PRS,
  PR146_FORBIDDEN_DOC_CONTENT,
  PR146_LINKED_DOCS,
  PR146_SCOPE_NOTICE,
  REVOCATION_ROWS,
  type BetaAccessCheckStatus,
  type BetaRequestStatus,
} from "@/lib/ops/beta-access-request-flow";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECK_TONE: Record<BetaAccessCheckStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECK_LABEL: Record<BetaAccessCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

const ALL_STATUSES = Object.keys(BETA_REQUEST_STATUS_LABEL) as BetaRequestStatus[];

export default function AdminBetaAccessRequestFlowPanel() {
  const gapCount = BETA_ACCESS_READINESS_CHECKLIST.filter((c) => c.status === "gap").length;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-access-flow">
      <h2
        id="admin-beta-access-flow"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        제한 베타 신청 흐름 설계 (PR146)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR146_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR146_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="신청 폼" value="없음" tone="ok" />
        <StatTile label="자동 승인" value="없음" tone="ok" />
        <StatTile label="체크리스트 gap" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        신청 흐름 (9단계)
      </h3>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-xs text-[#4f5661]">
        {BETA_REQUEST_FLOW_STEPS.map((s) => (
          <li key={s.step}>
            <span className="font-semibold text-[#102235]">{s.title}</span>
            {" — "}
            {s.pr146}
          </li>
        ))}
      </ol>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        상태값 (문서만, DB enum 없음)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">라벨</th>
            </tr>
          </thead>
          <tbody>
            {ALL_STATUSES.map((status) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={status}
              >
                <td className="px-3 py-2 font-mono text-[#102235]">{status}</td>
                <td className="px-3 py-2">{BETA_REQUEST_STATUS_LABEL[status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        신청자 수동 검토
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">필수</th>
            </tr>
          </thead>
          <tbody>
            {APPLICANT_REVIEW_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2">{row.criteria}</td>
                <td className="px-3 py-2">{row.required ? "필수" : "권장"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        보류/거절 트리거
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {HOLD_REJECT_TRIGGERS.map((t) => (
          <li key={t.trigger}>
            {t.trigger} → <span className="font-semibold">{t.action}</span>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        접근 권한 분리 (베타 ≠ Answer Assistant)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">범위</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">베타</th>
              <th className="px-3 py-2">AA 별도</th>
            </tr>
          </thead>
          <tbody>
            {ACCESS_SCOPE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.scope}
              >
                <td className="px-3 py-2 font-semibold">{row.scope}</td>
                <td className="px-3 py-2">{row.rule}</td>
                <td className="px-3 py-2">{row.betaOk ? "가능" : "금지"}</td>
                <td className="px-3 py-2">{row.aaSeparate ? "별도" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PII 수집 금지 / 허용 후보(미확정)
      </h3>
      <p className={`mb-2 ${textStyles.small}`}>
        금지: {PII_FORBIDDEN_AT_INTAKE.slice(0, 5).join(" · ")} …
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PII_ALLOWED_CANDIDATES.map((c) => (
          <li key={c.field}>
            {c.field} — {c.note}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        승인 기준 / 접근 해제
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs">
        {APPROVAL_CRITERIA.map((c) => (
          <li key={c.criterion}>
            {c.criterion}: {c.detail}
          </li>
        ))}
      </ul>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">상황</th>
              <th className="px-3 py-2">조치</th>
            </tr>
          </thead>
          <tbody>
            {REVOCATION_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.situation}
              >
                <td className="px-3 py-2">{row.situation}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        베타 사용자 안내 (권장 / 금지)
      </h3>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <ul className="list-disc space-y-1 rounded-lg border border-[#b9d5c9] bg-[#edf7f2] px-4 py-3 pl-8 text-xs">
          {BETA_USER_NOTICE_GOOD.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="list-disc space-y-1 rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 pl-8 text-xs text-[#8b2e2e]">
          {BETA_USER_NOTICE_FORBIDDEN.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Beta Access Readiness Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {BETA_ACCESS_READINESS_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 font-semibold ${CHECK_TONE[row.status]}`}
                  >
                    {CHECK_LABEL[row.status]}
                  </span>
                </td>
                <td className="px-3 py-2">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        별도 PR · 보류 구현
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">PR</th>
              <th className="px-3 py-2">목적</th>
              <th className="px-3 py-2">Codex</th>
            </tr>
          </thead>
          <tbody>
            {PR146_DEFERRED_PRS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.id}</td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">{row.codex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR146_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR146_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md`}
          >
            PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${borders.default} ${
        tone === "ok" ? "bg-[#edf7f2]" : tone === "warn" ? "bg-[#fff7e6]" : "bg-white"
      } ${shadows.card}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
