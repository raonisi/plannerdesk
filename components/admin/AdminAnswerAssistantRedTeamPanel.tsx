import {
  AA_ACCESS_RED_TEAM,
  AUDIT_RETENTION_RED_TEAM,
  CLAIM_DECISION_RED_TEAM,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DEFERRED_PROVIDER_RED_TEAM,
  DISABLE_ROLLBACK_RED_TEAM,
  OUTPUT_SAFETY_RED_TEAM,
  PRIVACY_INPUT_RED_TEAM,
  PROFESSIONAL_JUDGMENT_RED_TEAM,
  PROMPT_SECRET_RED_TEAM,
  PR156_ENTRY_CONDITIONS,
  PR156_FORBIDDEN_DOC_CONTENT,
  PR156_LINKED_HUBS,
  PR156_OPEN_CRITICAL_COUNT,
  PR156_RED_TEAM_VERDICTS,
  PR156_SCOPE_NOTICE,
  PR156_TEST_FILES,
  PR157_FOLLOW_UP_PRS,
  RED_TEAM_STATUS_LABEL,
  SALES_FEAR_RED_TEAM,
  type RedTeamCheckStatus,
} from "@/lib/ops/answer-assistant-red-team";
import {
  OPERATOR_READINESS_LABEL,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const READINESS_TONE: Record<OperatorReadiness, string> = {
  ready: "bg-[#edf7f2] text-[#1f6b55]",
  conditional_ready: "bg-[#fff7e6] text-[#7a612d]",
  not_ready: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const STATUS_TONE: Record<RedTeamCheckStatus, string> = {
  pass: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  pending: "bg-[#f4f5f6] text-[#4f5661]",
  fail: "bg-[#fdf2f2] text-[#8b2e2e]",
  runtime: "bg-[#eef3fb] text-[#2d4a7a]",
};

export default function AdminAnswerAssistantRedTeamPanel() {
  const partialCount = [
    ...PRIVACY_INPUT_RED_TEAM,
    ...SALES_FEAR_RED_TEAM,
    ...PROFESSIONAL_JUDGMENT_RED_TEAM,
    ...PROMPT_SECRET_RED_TEAM,
  ].filter((r) => r.status === "partial").length;

  return (
    <section className="mb-8" aria-labelledby="admin-aa-red-team">
      <h2
        id="admin-aa-red-team"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Answer Assistant Red-Team (PR156)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR156_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR156_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Red-team"
          value={
            OPERATOR_READINESS_LABEL[PR156_RED_TEAM_VERDICTS.redTeamReady]
          }
          tone="warn"
        />
        <StatTile label="정적 red-team" value="Pass" tone="ok" />
        <StatTile
          label="Open Critical"
          value={String(PR156_OPEN_CRITICAL_COUNT)}
          tone="ok"
        />
        <StatTile label="Partial gap" value={String(partialCount)} tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR156 진입 조건
      </h3>
      <EntryTable rows={PR156_ENTRY_CONDITIONS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        접근 · PII · 청구 · 가입/공포
      </h3>
      <RedTeamTable
        headers={["구분", "항목", "기대", "상태"]}
        rows={[
          ...AA_ACCESS_RED_TEAM.map((r) => [
            "access",
            r.scenario,
            r.expected,
            r.status,
          ]),
          ...PRIVACY_INPUT_RED_TEAM.map((r) => [
            "pii",
            r.inputType,
            r.expected,
            r.status,
          ]),
          ...CLAIM_DECISION_RED_TEAM.map((r) => [
            "claim",
            r.request,
            r.expected,
            r.status,
          ]),
          ...SALES_FEAR_RED_TEAM.map((r) => [
            "sales",
            r.request,
            r.expected,
            r.status,
          ]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        전문 판단 · injection · output · audit
      </h3>
      <RedTeamTable
        headers={["구분", "항목", "기대", "상태"]}
        rows={[
          ...PROFESSIONAL_JUDGMENT_RED_TEAM.map((r) => [
            "pro",
            r.request,
            r.expected,
            r.status,
          ]),
          ...PROMPT_SECRET_RED_TEAM.map((r) => [
            "inject",
            r.attack,
            r.expected,
            r.status,
          ]),
          ...OUTPUT_SAFETY_RED_TEAM.map((r) => [
            "output",
            r.item,
            r.expectedOutput,
            r.status,
          ]),
          ...AUDIT_RETENTION_RED_TEAM.map((r) => [
            "audit",
            r.item,
            r.expected,
            r.status,
          ]),
          ...DISABLE_ROLLBACK_RED_TEAM.map((r) => [
            "disable",
            r.situation,
            r.expectedAction,
            r.status,
          ]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        provider 런타임 (보류)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {DEFERRED_PROVIDER_RED_TEAM.map((row) => (
          <li key={row.test}>
            {row.test} ({row.reason})
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        테스트 파일
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {PR156_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        실행:{" "}
        <code className="rounded bg-[#f4f5f6] px-1">
          npx tsx --test tests/answer-assistant/red-team.test.ts
        </code>
        · provider 호출 없음.
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR157+ · Codex
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        <li>
          판단:{" "}
          <ReadinessBadge readiness={PR156_RED_TEAM_VERDICTS.overallUntilCodex} />
        </li>
        {PR157_FOLLOW_UP_PRS.slice(0, 3).map((row) => (
          <li key={row.id}>
            {row.id}: {row.title} ({row.codex})
          </li>
        ))}
      </ul>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 허브
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR156_LINKED_HUBS.map((doc) => (
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
    <div
      className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}
    >
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
            <tr
              className="border-b border-[#e8eaed] last:border-b-0"
              key={row.id}
            >
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

function RedTeamTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | RedTeamCheckStatus)[][];
}) {
  return (
    <div
      className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}
    >
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
                  {typeof cell === "string" &&
                  (cell === "pass" ||
                    cell === "partial" ||
                    cell === "pending" ||
                    cell === "fail" ||
                    cell === "runtime") ? (
                    <StatusBadge status={cell} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
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

function StatusBadge({ status }: { status: RedTeamCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TONE[status]}`}
    >
      {RED_TEAM_STATUS_LABEL[status]}
    </span>
  );
}

function ReadinessBadge({ readiness }: { readiness: OperatorReadiness }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${READINESS_TONE[readiness]}`}
    >
      {OPERATOR_READINESS_LABEL[readiness]}
    </span>
  );
}
