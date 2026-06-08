import {
  AA_PAID_SAFETY_REQUIREMENTS,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  INSURANCE_TOOL_DISCLAIMER_ROWS,
  LEGAL_READINESS_STATUS_LABEL,
  LEGAL_REVIEW_CHECKLIST,
  MONETIZATION_FORBIDDEN_EXPRESSIONS,
  MONETIZATION_NO_GO_CRITERIA,
  MONETIZATION_PREREQUISITES,
  MONETIZATION_STAGE_DECISIONS,
  PAYMENT_LEGAL_READINESS_CHECKLIST,
  PAYMENT_PG_CHECKLIST,
  PR166_FOLLOW_UP_PRS,
  PR165_ENTRY_CONDITIONS,
  PR165_FORBIDDEN_DOC_CONTENT,
  PR165_LINKED_HUBS,
  PR165_OPEN_CRITICAL_COUNT,
  PR165_READINESS_VERDICTS,
  PR165_SCOPE_NOTICE,
  PRICING_POLICY_REVIEW,
  REVIEW_ITEM_STATUS_LABEL,
  type ReadinessChecklistStatus,
} from "@/lib/ops/payment-legal-readiness";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<ReadinessChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminPaymentLegalReadinessPanel() {
  const verdict = PR165_READINESS_VERDICTS.paymentLegalReadiness;

  return (
    <section className="mb-8" aria-labelledby="admin-payment-legal-readiness">
      <h2
        id="admin-payment-legal-readiness"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Payment Legal Readiness (PR165)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR165_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR165_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Legal Readiness"
          value={LEGAL_READINESS_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR165_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="유료화 Go"
          value={LEGAL_READINESS_STATUS_LABEL[PR165_READINESS_VERDICTS.actualMonetizationGo]}
          tone="warn"
        />
        <StatTile label="Codex" value="필수" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 단계 분리 · 법무 · 결제/PG
      </h3>
      <EntryTable rows={PR165_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["단계", "의미", "PR165 판단"]}
        rows={MONETIZATION_STAGE_DECISIONS.map((r) => [
          r.stage,
          r.meaning,
          r.pr165Judgment,
        ])}
      />
      <ReviewTable
        headers={["항목", "기준", "상태"]}
        rows={LEGAL_REVIEW_CHECKLIST.map((r) => [
          r.item,
          r.criteria,
          REVIEW_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <ReviewTable
        headers={["항목", "기준", "상태"]}
        rows={PAYMENT_PG_CHECKLIST.map((r) => [
          r.item,
          r.criteria,
          REVIEW_ITEM_STATUS_LABEL[r.status],
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        가격 · 금지 표현 · 필수 조건 · No-Go
      </h3>
      <SimpleTable
        headers={["항목", "기준", "PR165"]}
        rows={PRICING_POLICY_REVIEW.map((r) => [r.item, r.criteria, r.pr165Judgment])}
      />
      <SimpleTable
        headers={["금지 표현", "이유"]}
        rows={MONETIZATION_FORBIDDEN_EXPRESSIONS.map((r) => [r.phrase, r.reason])}
      />
      <ReviewTable
        headers={["조건", "필수", "상태"]}
        rows={MONETIZATION_PREREQUISITES.map((r) => [
          r.condition,
          r.required ? "필수" : "—",
          REVIEW_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["상황", "판단"]}
        rows={MONETIZATION_NO_GO_CRITERIA.map((r) => [r.situation, r.judgment])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        AA 유료 · 보험 고지 · Checklist · Codex
      </h3>
      <SimpleTable
        headers={["요건", "기준"]}
        rows={AA_PAID_SAFETY_REQUIREMENTS.map((r) => [r.requirement, r.basis])}
      />
      <ReviewTable
        headers={["주제", "필수 고지", "상태"]}
        rows={INSURANCE_TOOL_DISCLAIMER_ROWS.map((r) => [
          r.topic,
          r.requiredNotice,
          REVIEW_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <ChecklistTable rows={PAYMENT_LEGAL_READINESS_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR166_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title} ({r.codex})
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR165_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EntryTable({
  rows,
}: {
  rows: readonly {
    condition: string;
    result: string;
    met: boolean;
    id: string;
  }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">조건</th>
            <th className="px-3 py-2">결과</th>
            <th className="px-3 py-2">충족</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={row.id}>
              <td className="px-3 py-2">{row.condition}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.result}</td>
              <td className="px-3 py-2">{row.met ? "✓" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            {headers.map((h) => (
              <th className="px-3 py-2" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={i}>
              {row.map((cell, j) => (
                <td className="px-3 py-2" key={j}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return SimpleTable({ headers, rows });
}

function ChecklistTable({
  rows,
}: {
  rows: readonly {
    item: string;
    criterion: string;
    status: ReadinessChecklistStatus;
    id: string;
  }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">항목</th>
            <th className="px-3 py-2">기준</th>
            <th className="px-3 py-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={row.id}>
              <td className="px-3 py-2">{row.item}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
              <td className="px-3 py-2">{CHECKLIST_LABEL[row.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${borders.default} ${shadows.card} ${
        tone === "ok" ? "bg-[#edf7f2]" : "bg-[#fff7e6]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="text-sm font-semibold text-[#2d3439]">{value}</p>
    </div>
  );
}
