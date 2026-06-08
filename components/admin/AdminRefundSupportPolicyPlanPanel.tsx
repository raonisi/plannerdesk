import {
  AA_SUPPORT_REFUND_LINKS,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CUSTOMER_SUPPORT_POLICY_ITEMS,
  INCIDENT_COMPENSATION_REVIEW,
  POLICY_ITEM_STATUS_LABEL,
  POLICY_PLAN_STATUS_LABEL,
  PR171_ENTRY_CONDITIONS,
  PR171_FORBIDDEN_DOC_CONTENT,
  PR171_LINKED_HUBS,
  PR171_OPEN_CRITICAL_COUNT,
  PR171_POLICY_VERDICTS,
  PR171_SCOPE_NOTICE,
  PR172_FOLLOW_UP_PRS,
  REFUND_POLICY_REVIEW_ITEMS,
  REFUND_SUPPORT_FORBIDDEN_EXPRESSIONS,
  REFUND_SUPPORT_NO_GO,
  REFUND_SUPPORT_POLICY_CHECKLIST,
  REFUND_SUPPORT_POLICY_PRINCIPLES,
  SUPPORT_RECORD_ALLOW_DENY,
  type PolicyChecklistStatus,
} from "@/lib/ops/refund-support-policy-plan";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<PolicyChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminRefundSupportPolicyPlanPanel() {
  const verdict = PR171_POLICY_VERDICTS.refundSupportPolicyPlan;

  return (
    <section className="mb-8" aria-labelledby="admin-refund-support-policy-plan">
      <h2
        id="admin-refund-support-policy-plan"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Refund & Support Policy Plan (PR171)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR171_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR171_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Policy Plan"
          value={POLICY_PLAN_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR171_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="환불 구현"
          value={POLICY_PLAN_STATUS_LABEL[PR171_POLICY_VERDICTS.refundImplementation]}
          tone="warn"
        />
        <StatTile label="Codex" value="필수" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 원칙 · 환불 · 고객지원
      </h3>
      <EntryTable rows={PR171_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={REFUND_SUPPORT_POLICY_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["항목", "검토 기준", "상태"]}
        rows={REFUND_POLICY_REVIEW_ITEMS.map((r) => [
          r.item,
          r.reviewBasis,
          POLICY_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["항목", "검토 기준", "상태"]}
        rows={CUSTOMER_SUPPORT_POLICY_ITEMS.map((r) => [
          r.item,
          r.reviewBasis,
          POLICY_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["항목", "허용", "금지"]}
        rows={SUPPORT_RECORD_ALLOW_DENY.map((r) => [
          r.field,
          r.allowed,
          r.forbidden,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        장애·보상 · AA · 금지 · No-Go
      </h3>
      <SimpleTable
        headers={["장애", "검토", "환불 연결"]}
        rows={INCIDENT_COMPENSATION_REVIEW.map((r) => [
          r.incidentType,
          r.reviewBasis,
          r.refundLink,
        ])}
      />
      <SimpleTable
        headers={["상황", "조치", "환불 연결"]}
        rows={AA_SUPPORT_REFUND_LINKS.map((r) => [
          r.situation,
          r.action,
          r.refundLink,
        ])}
      />
      <SimpleTable
        headers={["금지 표현", "이유"]}
        rows={REFUND_SUPPORT_FORBIDDEN_EXPRESSIONS.map((r) => [
          r.phrase,
          r.reason,
        ])}
      />
      <SimpleTable
        headers={["상황", "판단"]}
        rows={REFUND_SUPPORT_NO_GO.map((r) => [r.situation, r.judgment])}
      />
      <ChecklistTable rows={REFUND_SUPPORT_POLICY_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR172_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR171_LINKED_HUBS.map((doc) => (
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

function ChecklistTable({
  rows,
}: {
  rows: readonly {
    item: string;
    criterion: string;
    status: PolicyChecklistStatus;
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
