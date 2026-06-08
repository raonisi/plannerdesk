import {
  AA_COHORT_MANAGEMENT,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  COHORT_CLASSIFICATION,
  COHORT_CONTROL_CHECKLIST,
  COHORT_EXCLUSION_CRITERIA,
  COHORT_EXPANSION_CRITERIA,
  COHORT_FOLLOW_UP_PRS,
  COHORT_RECORD_RULES,
  COHORT_REDUCTION_CRITERIA,
  COHORT_SELECTION_CRITERIA,
  COHORT_CONTROL_STATUS_LABEL,
  MANUAL_APPROVAL_RULES,
  PR166_ENTRY_CONDITIONS,
  PR166_FORBIDDEN_DOC_CONTENT,
  PR166_LINKED_HUBS,
  PR166_OPEN_CRITICAL_COUNT,
  PR166_OPEN_HIGH_COUNT,
  PR166_COHORT_VERDICTS,
  PR166_SCOPE_NOTICE,
  PR167_FOLLOW_UP_PRS,
  type CohortChecklistStatus,
} from "@/lib/ops/beta-cohort-control";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<CohortChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminBetaCohortControlPanel() {
  const verdict = PR166_COHORT_VERDICTS.cohortControlPrepared;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-cohort-control">
      <h2
        id="admin-beta-cohort-control"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Beta Cohort Control (PR166)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR166_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR166_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Cohort Control"
          value={COHORT_CONTROL_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR166_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="High" value={String(PR166_OPEN_HIGH_COUNT)} tone="warn" />
        <StatTile label="Codex" value="조건부" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 분류 · 선정 · 제외
      </h3>
      <EntryTable rows={PR166_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["대상군", "설명", "허용", "제한"]}
        rows={COHORT_CLASSIFICATION.map((r) => [
          r.cohort,
          r.description,
          r.allowedScope,
          r.restrictions,
        ])}
      />
      <SimpleTable
        headers={["기준", "설명", "판단"]}
        rows={COHORT_SELECTION_CRITERIA.map((r) => [
          r.criterion,
          r.description,
          r.judgment === "required" ? "필수" : "조건부",
        ])}
      />
      <SimpleTable
        headers={["제외", "이유", "조치"]}
        rows={COHORT_EXCLUSION_CRITERIA.map((r) => [
          r.exclusion,
          r.reason,
          r.action,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        확대 · 축소 · AA · 기록 · 수동 승인
      </h3>
      <SimpleTable
        headers={["조건", "필수"]}
        rows={COHORT_EXPANSION_CRITERIA.map((r) => [
          r.condition,
          r.required ? "필수" : "조건부",
        ])}
      />
      <SimpleTable
        headers={["상황", "조치"]}
        rows={COHORT_REDUCTION_CRITERIA.map((r) => [r.situation, r.action])}
      />
      <SimpleTable
        headers={["항목", "기준"]}
        rows={AA_COHORT_MANAGEMENT.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["기록", "허용", "금지"]}
        rows={COHORT_RECORD_RULES.map((r) => [r.field, r.allowed, r.forbidden])}
      />
      <SimpleTable
        headers={["규칙", "내용"]}
        rows={MANUAL_APPROVAL_RULES.map((r) => [r.rule, r.detail])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        후속 PR · Checklist · Codex
      </h3>
      <SimpleTable
        headers={["이슈", "후속 PR", "위험", "Codex"]}
        rows={COHORT_FOLLOW_UP_PRS.map((r) => [
          r.issueType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ChecklistTable rows={COHORT_CONTROL_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR167_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR166_LINKED_HUBS.map((doc) => (
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
    status: CohortChecklistStatus;
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
