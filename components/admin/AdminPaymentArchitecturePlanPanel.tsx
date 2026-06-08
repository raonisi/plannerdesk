import {
  AA_PAID_ARCHITECTURE_CRITERIA,
  ARCHITECTURE_PLAN_STATUS_LABEL,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  PAYMENT_ARCHITECTURE_CHECKLIST,
  PAYMENT_ARCHITECTURE_NO_GO,
  PAYMENT_ARCHITECTURE_PRINCIPLES,
  PAYMENT_DATA_NON_STORAGE_RULES,
  PAYMENT_FAILURE_REFUND_LINKS,
  PG_REVIEW_CHECKLIST,
  PR170_ARCHITECTURE_VERDICTS,
  PR170_ENTRY_CONDITIONS,
  PR170_FORBIDDEN_DOC_CONTENT,
  PR170_LINKED_HUBS,
  PR170_OPEN_CRITICAL_COUNT,
  PR170_SCOPE_NOTICE,
  PR171_FOLLOW_UP_PRS,
  REVIEW_ITEM_STATUS_LABEL,
  SUBSCRIPTION_RBAC_REVIEW_ITEMS,
  type ArchitectureChecklistStatus,
} from "@/lib/ops/payment-architecture-plan";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<ArchitectureChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminPaymentArchitecturePlanPanel() {
  const verdict = PR170_ARCHITECTURE_VERDICTS.paymentArchitecturePlan;

  return (
    <section className="mb-8" aria-labelledby="admin-payment-architecture-plan">
      <h2
        id="admin-payment-architecture-plan"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Payment Architecture Plan (PR170)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR170_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR170_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Architecture Plan"
          value={ARCHITECTURE_PLAN_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR170_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="결제 구현"
          value={ARCHITECTURE_PLAN_STATUS_LABEL[PR170_ARCHITECTURE_VERDICTS.billingImplementation]}
          tone="warn"
        />
        <StatTile label="Codex" value="필수" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 원칙 · PG · 비저장
      </h3>
      <EntryTable rows={PR170_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={PAYMENT_ARCHITECTURE_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["항목", "기준", "상태"]}
        rows={PG_REVIEW_CHECKLIST.map((r) => [
          r.item,
          r.criteria,
          REVIEW_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["항목", "기준"]}
        rows={PAYMENT_DATA_NON_STORAGE_RULES.map((r) => [r.item, r.rule])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        권한·구독 · AA · 환불 연결 · No-Go
      </h3>
      <SimpleTable
        headers={["항목", "기준", "PR170"]}
        rows={SUBSCRIPTION_RBAC_REVIEW_ITEMS.map((r) => [
          r.item,
          r.criteria,
          REVIEW_ITEM_STATUS_LABEL[r.pr170Judgment],
        ])}
      />
      <SimpleTable
        headers={["항목", "기준"]}
        rows={AA_PAID_ARCHITECTURE_CRITERIA.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["상황", "검토", "후속"]}
        rows={PAYMENT_FAILURE_REFUND_LINKS.map((r) => [
          r.situation,
          r.reviewBasis,
          r.followUpPr,
        ])}
      />
      <SimpleTable
        headers={["상황", "판단"]}
        rows={PAYMENT_ARCHITECTURE_NO_GO.map((r) => [r.situation, r.judgment])}
      />
      <ChecklistTable rows={PAYMENT_ARCHITECTURE_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR171_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR170_LINKED_HUBS.map((doc) => (
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
    status: ArchitectureChecklistStatus;
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
