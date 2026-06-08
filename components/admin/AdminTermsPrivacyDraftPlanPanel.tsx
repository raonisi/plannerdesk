import {
  AA_NOTICE_DRAFT_PLAN,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DATA_RESPONSIBILITY_DRAFT_PLAN,
  DRAFT_ITEM_STATUS_LABEL,
  DRAFT_PLAN_STATUS_LABEL,
  LEGAL_REVIEW_REQUIRED_ITEMS,
  PRIVACY_POLICY_DRAFT_PLAN,
  PR169_DRAFT_VERDICTS,
  PR169_ENTRY_CONDITIONS,
  PR169_FORBIDDEN_DOC_CONTENT,
  PR169_LINKED_HUBS,
  PR169_OPEN_CRITICAL_COUNT,
  PR169_SCOPE_NOTICE,
  PR170_FOLLOW_UP_PRS,
  REFUND_CANCEL_REVIEW_ITEMS,
  SUPPORT_REPORT_NOTICE_DRAFT_PLAN,
  TERMS_OF_SERVICE_DRAFT_PLAN,
  TERMS_PRIVACY_DRAFT_CHECKLIST,
  TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS,
  TERMS_PRIVACY_NO_GO_CRITERIA,
  type DraftPlanChecklistStatus,
} from "@/lib/ops/terms-privacy-draft-plan";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<DraftPlanChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminTermsPrivacyDraftPlanPanel() {
  const verdict = PR169_DRAFT_VERDICTS.termsPrivacyDraftPlan;

  return (
    <section className="mb-8" aria-labelledby="admin-terms-privacy-draft-plan">
      <h2
        id="admin-terms-privacy-draft-plan"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Terms & Privacy Draft Plan (PR169)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR169_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR169_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Draft Plan"
          value={DRAFT_PLAN_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR169_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="약관 확정"
          value={DRAFT_PLAN_STATUS_LABEL[PR169_DRAFT_VERDICTS.legalFinalization]}
          tone="warn"
        />
        <StatTile label="Codex" value="필수" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 이용약관 · 개인정보
      </h3>
      <EntryTable rows={PR169_ENTRY_CONDITIONS} />
      <DraftTable
        title="이용약관 초안 계획"
        rows={TERMS_OF_SERVICE_DRAFT_PLAN.map((r) => [
          r.item,
          r.purpose,
          DRAFT_ITEM_STATUS_LABEL[r.status],
        ])}
      />
      <DraftTable
        title="개인정보처리방침 초안 계획"
        rows={PRIVACY_POLICY_DRAFT_PLAN.map((r) => [
          r.item,
          r.purpose,
          DRAFT_ITEM_STATUS_LABEL[r.status],
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        고지 · 환불 검토 · 금지 · 법무 · No-Go
      </h3>
      <SimpleTable
        headers={["항목", "기준"]}
        rows={DATA_RESPONSIBILITY_DRAFT_PLAN.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["항목", "기준"]}
        rows={AA_NOTICE_DRAFT_PLAN.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["항목", "기준"]}
        rows={SUPPORT_REPORT_NOTICE_DRAFT_PLAN.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["항목", "검토 기준", "PR169"]}
        rows={REFUND_CANCEL_REVIEW_ITEMS.map((r) => [
          r.item,
          r.reviewBasis,
          DRAFT_ITEM_STATUS_LABEL[r.pr169Judgment],
        ])}
      />
      <SimpleTable
        headers={["금지 표현", "이유"]}
        rows={TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS.map((r) => [
          r.phrase,
          r.reason,
        ])}
      />
      <SimpleTable
        headers={["항목", "사유", "우선순위"]}
        rows={LEGAL_REVIEW_REQUIRED_ITEMS.map((r) => [
          r.item,
          r.reason,
          r.priority,
        ])}
      />
      <SimpleTable
        headers={["상황", "판단"]}
        rows={TERMS_PRIVACY_NO_GO_CRITERIA.map((r) => [
          r.situation,
          r.judgment,
        ])}
      />
      <ChecklistTable rows={TERMS_PRIVACY_DRAFT_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR170_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR169_LINKED_HUBS.map((doc) => (
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

function DraftTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <p className="border-b border-[#d6d8dc] bg-[#f4f5f6] px-3 py-2 text-xs font-semibold">
        {title}
      </p>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">항목</th>
            <th className="px-3 py-2">목적</th>
            <th className="px-3 py-2">상태</th>
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
    status: DraftPlanChecklistStatus;
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
