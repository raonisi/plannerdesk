import {
  CLAIM_DOCUMENT_WORKFLOW,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CORRECTION_ERROR_GRADES,
  CORRECTION_FOLLOW_UP_PRS,
  CORRECTION_INTAKE_RULES,
  CORRECTION_OFFICIAL_SOURCES,
  CORRECTION_REQUEST_TEMPLATE,
  CORRECTION_TRIAGE_DECISIONS,
  CORRECTION_WORKFLOW_CHECKLIST,
  CORRECTION_WORKFLOW_PRINCIPLES,
  CORRECTION_WORKFLOW_STATUS_LABEL,
  INSURER_DIRECTORY_WORKFLOW,
  KNOWLEDGE_ARCHIVE_WORKFLOW,
  PR168_CORRECTION_VERDICTS,
  PR168_ENTRY_CONDITIONS,
  PR168_FORBIDDEN_DOC_CONTENT,
  PR168_LINKED_HUBS,
  PR168_OPEN_CRITICAL_COUNT,
  PR168_OPEN_HIGH_COUNT,
  PR168_SCOPE_NOTICE,
  PR169_FOLLOW_UP_PRS,
  PUBLIC_SEARCH_WORKFLOW,
  WORK_LINK_WORKFLOW,
  type CorrectionChecklistStatus,
} from "@/lib/ops/data-correction-workflow";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<CorrectionChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminDataCorrectionWorkflowPanel() {
  const verdict = PR168_CORRECTION_VERDICTS.correctionWorkflowPrepared;

  return (
    <section className="mb-8" aria-labelledby="admin-data-correction-workflow">
      <h2
        id="admin-data-correction-workflow"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Data Correction Workflow (PR168)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR168_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR168_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Correction Workflow"
          value={CORRECTION_WORKFLOW_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR168_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="High" value={String(PR168_OPEN_HIGH_COUNT)} tone="warn" />
        <StatTile label="Codex" value="조건부" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 원칙 · 접수 · 출처 · 등급
      </h3>
      <EntryTable rows={PR168_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={CORRECTION_WORKFLOW_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["항목", "허용", "금지"]}
        rows={CORRECTION_INTAKE_RULES.map((r) => [r.field, r.allowed, r.forbidden])}
      />
      <SimpleTable
        headers={["순위", "출처", "기준"]}
        rows={CORRECTION_OFFICIAL_SOURCES.map((r) => [
          String(r.priority),
          r.sourceType,
          r.usageRule,
        ])}
      />
      <SimpleTable
        headers={["등급", "기준", "예시", "조치"]}
        rows={CORRECTION_ERROR_GRADES.map((r) => [
          r.grade,
          r.criteria,
          r.example,
          r.action,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Domain workflows
      </h3>
      <WorkflowTable title="보험사 디렉터리" steps={INSURER_DIRECTORY_WORKFLOW} />
      <WorkflowTable title="청구서류" steps={CLAIM_DOCUMENT_WORKFLOW} />
      <WorkflowTable title="업무 링크" steps={WORK_LINK_WORKFLOW} />
      <WorkflowTable title="지식 아카이브" steps={KNOWLEDGE_ARCHIVE_WORKFLOW} />
      <WorkflowTable title="Public Search" steps={PUBLIC_SEARCH_WORKFLOW} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        템플릿 · 검수 · 후속 PR · Codex
      </h3>
      <SimpleTable
        headers={["항목", "작성 기준"]}
        rows={CORRECTION_REQUEST_TEMPLATE.map((r) => [r.field, r.guidance])}
      />
      <SimpleTable
        headers={["판단", "기준", "조치"]}
        rows={CORRECTION_TRIAGE_DECISIONS.map((r) => [
          r.decision,
          r.criteria,
          r.action,
        ])}
      />
      <SimpleTable
        headers={["이슈", "후속 PR", "위험", "Codex"]}
        rows={CORRECTION_FOLLOW_UP_PRS.map((r) => [
          r.issueType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ChecklistTable rows={CORRECTION_WORKFLOW_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR169_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR168_LINKED_HUBS.map((doc) => (
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

function WorkflowTable({
  title,
  steps,
}: {
  title: string;
  steps: readonly { phase: string; detail: string }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <p className="border-b border-[#d6d8dc] bg-[#f4f5f6] px-3 py-2 text-xs font-semibold">
        {title}
      </p>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <tbody>
          {steps.map((step) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={step.phase}>
              <td className="w-36 px-3 py-2 font-medium">{step.phase}</td>
              <td className="px-3 py-2 text-[#4f5661]">{step.detail}</td>
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
    status: CorrectionChecklistStatus;
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
