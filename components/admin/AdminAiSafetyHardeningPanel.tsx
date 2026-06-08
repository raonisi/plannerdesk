import {
  BLOCKED_PHRASE_CRITERIA,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  INPUT_BLOCK_CRITERIA,
  OUTPUT_BLOCK_CRITERIA,
  PR164_CODE_REFERENCES,
  PR164_DISABLE_CRITERIA,
  PR164_ENTRY_CONDITIONS,
  PR164_FORBIDDEN_DOC_CONTENT,
  PR164_LINKED_HUBS,
  PR164_OPEN_CRITICAL_COUNT,
  PR164_SAFE_WORDING,
  PR164_SCOPE_NOTICE,
  PR164_SAFETY_VERDICTS,
  PR164_TEST_FILES,
  PR165_FOLLOW_UP_PRS,
  SAFETY_HARDENING_CHECKLIST,
  SAFETY_HARDENING_STATUS_LABEL,
  SAFETY_HARDENING_TARGETS,
  USAGE_AUDIT_SAFETY_CRITERIA,
  type SafetyChecklistStatus,
} from "@/lib/ops/ai-safety-hardening";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<SafetyChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminAiSafetyHardeningPanel() {
  const verdict = PR164_SAFETY_VERDICTS.safetyHardeningPrepared;

  return (
    <section className="mb-8" aria-labelledby="admin-ai-safety-hardening">
      <h2
        id="admin-ai-safety-hardening"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        AI Safety Hardening (PR164)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR164_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR164_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Safety Hardening"
          value={SAFETY_HARDENING_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR164_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="Access guard"
          value={SAFETY_HARDENING_STATUS_LABEL[PR164_SAFETY_VERDICTS.accessGuardIntegrity]}
          tone="ok"
        />
        <StatTile label="Codex" value="필수(조건부)" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 보강 대상 · 입출력 차단
      </h3>
      <EntryTable rows={PR164_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["영역", "보강", "실패 기준"]}
        rows={SAFETY_HARDENING_TARGETS.map((r) => [
          r.area,
          r.direction,
          r.failCriteria,
        ])}
      />
      <SimpleTable
        headers={["입력 유형", "기대", "실패"]}
        rows={INPUT_BLOCK_CRITERIA.map((r) => [
          r.inputType,
          r.expected,
          r.failCriteria,
        ])}
      />
      <SimpleTable
        headers={["출력 유형", "기대", "실패"]}
        rows={OUTPUT_BLOCK_CRITERIA.map((r) => [
          r.outputType,
          r.expected,
          r.failOutput,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        차단 문구 · Audit · Disable · Codex
      </h3>
      <SimpleTable
        headers={["카테고리", "예시"]}
        rows={BLOCKED_PHRASE_CRITERIA.map((r) => [r.category, r.examples])}
      />
      <SimpleTable
        headers={["항목", "기대", "실패"]}
        rows={USAGE_AUDIT_SAFETY_CRITERIA.map((r) => [
          r.item,
          r.expected,
          r.failCriteria,
        ])}
      />
      <SimpleTable
        headers={["상황", "조치"]}
        rows={PR164_DISABLE_CRITERIA.map((r) => [r.label, r.action])}
      />
      <ChecklistTable rows={SAFETY_HARDENING_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR164_SAFE_WORDING.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {Object.values(PR164_CODE_REFERENCES).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR165_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR164_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs font-mono text-[#4f5661]">
        Tests: {PR164_TEST_FILES.join(", ")}
      </p>
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
    status: SafetyChecklistStatus;
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
