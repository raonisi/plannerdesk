import {
  ADMIN_ROUTE_DRY_RUN,
  ANSWER_ASSISTANT_DRY_RUN,
  BUILD_CI_DRY_RUN,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DATA_RESPONSIBILITY_DRY_RUN,
  DRY_RUN_STATUS_LABEL,
  EXTERNAL_BETA_DRY_RUN_CHECKLIST,
  PLANNER_ROUTE_DRY_RUN,
  PR151_DRY_RUN_VERDICTS,
  PR151_ENTRY_CONDITIONS,
  PR151_FORBIDDEN_DOC_CONTENT,
  PR151_LINKED_HUBS,
  PR151_OPEN_CRITICAL_COUNT,
  PR151_SCOPE_NOTICE,
  PR152_FOLLOW_UP_PRS,
  PUBLIC_ROUTE_DRY_RUN,
  RELEASE_VERDICT_LABEL,
  ROLE_DRY_RUN_SCENARIOS,
  SUPPORT_INCIDENT_DRY_RUN,
  type DryRunCheckStatus,
  type ReleaseVerdict,
} from "@/lib/ops/external-beta-dry-run";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const VERDICT_TONE: Record<ReleaseVerdict, string> = {
  go: "bg-[#edf7f2] text-[#1f6b55]",
  conditional_go: "bg-[#fff7e6] text-[#7a612d]",
  no_go: "bg-[#fdf2f2] text-[#8b2e2e]",
  not_applicable: "bg-[#f4f5f6] text-[#4f5661]",
};

const STATUS_TONE: Record<DryRunCheckStatus, string> = {
  pass: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  fail: "bg-[#fdf2f2] text-[#8b2e2e]",
  pending: "bg-[#f4f5f6] text-[#4f5661]",
  na: "bg-[#f4f5f6] text-[#4f5661]",
};

export default function AdminExternalBetaDryRunPanel() {
  const pendingChecks = EXTERNAL_BETA_DRY_RUN_CHECKLIST.filter(
    (c) => c.status === "pending",
  ).length;
  const partialChecks = EXTERNAL_BETA_DRY_RUN_CHECKLIST.filter(
    (c) => c.status === "partial",
  ).length;
  const failChecks = EXTERNAL_BETA_DRY_RUN_CHECKLIST.filter(
    (c) => c.status === "fail",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-external-beta-dry-run">
      <h2
        id="admin-external-beta-dry-run"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        외부 베타 Dry Run (PR151)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR151_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR151_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile
          label="Dry Run"
          value={RELEASE_VERDICT_LABEL[PR151_DRY_RUN_VERDICTS.externalBetaDryRun]}
          tone="warn"
        />
        <StatTile
          label="Codex 전"
          value={RELEASE_VERDICT_LABEL[PR151_DRY_RUN_VERDICTS.overallUntilCodex]}
          tone="warn"
        />
        <StatTile label="Open Critical" value={String(PR151_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="PR157 실행" value="No-Go" tone="ok" />
        <StatTile
          label="pending/partial"
          value={`${pendingChecks}/${partialChecks}`}
          tone={pendingChecks > 0 || partialChecks > 0 ? "warn" : "ok"}
        />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR151 진입 조건
      </h3>
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
            {PR151_ENTRY_CONDITIONS.map((row) => (
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

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        역할별 dry-run 시나리오
      </h3>
      <DryRunTable
        headers={["시나리오", "상태", "기대", "결과"]}
        rows={ROLE_DRY_RUN_SCENARIOS.map((r) => [
          r.scenario,
          r.status,
          r.expected,
          r.evidence,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Public / Planner / Admin route
      </h3>
      <DryRunTable
        headers={["영역", "항목", "상태", "결과"]}
        rows={[
          ...PUBLIC_ROUTE_DRY_RUN.map((r) => ["public", r.item, r.status, r.result]),
          ...PLANNER_ROUTE_DRY_RUN.map((r) => ["planner", r.item, r.status, r.result]),
          ...ADMIN_ROUTE_DRY_RUN.map((r) => ["admin", r.item, r.status, r.result]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Answer Assistant · 데이터 책임 · 지원
      </h3>
      <DryRunTable
        headers={["구분", "항목", "상태", "결과"]}
        rows={[
          ...ANSWER_ASSISTANT_DRY_RUN.map((r) => ["AA", r.item, r.status, r.result]),
          ...DATA_RESPONSIBILITY_DRY_RUN.map((r) => ["데이터", r.area, r.status, r.result]),
          ...SUPPORT_INCIDENT_DRY_RUN.map((r) => ["지원", r.scenario, r.status, r.result]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Build / CI dry-run
      </h3>
      <DryRunTable
        headers={["항목", "상태", "기대", "결과"]}
        rows={BUILD_CI_DRY_RUN.map((r) => [r.item, r.status, r.expected, r.result])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        External Beta Dry Run Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[28rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {EXTERNAL_BETA_DRY_RUN_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2">{row.criterion}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {failChecks > 0 ? (
        <p className="mb-4 text-xs font-semibold text-[#8b2e2e]">
          실패 항목 {failChecks}건 — 실제 제한 베타 실행 No-Go
        </p>
      ) : null}

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Dry Run 판단
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        <li>
          External Beta Dry Run:{" "}
          <VerdictBadge verdict={PR151_DRY_RUN_VERDICTS.externalBetaDryRun} />
        </li>
        <li>
          PR152 진입: <VerdictBadge verdict={PR151_DRY_RUN_VERDICTS.pr152Entry} />
        </li>
        <li>
          PR157 실행 판단:{" "}
          <VerdictBadge verdict={PR151_DRY_RUN_VERDICTS.pr157LaunchDecision} />
        </li>
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR152+ 후보
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">Codex</th>
            </tr>
          </thead>
          <tbody>
            {PR152_FOLLOW_UP_PRS.map((row) => (
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

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Codex 제한검수 (원칙 권장)
      </h3>
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
        {PR151_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md`}
          >
            PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function DryRunTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | DryRunCheckStatus)[][];
}) {
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
                <td className="px-3 py-2 text-[#4f5661]" key={j}>
                  {isDryRunStatus(cell) ? <StatusBadge status={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isDryRunStatus(v: string | DryRunCheckStatus): v is DryRunCheckStatus {
  return (
    v === "pass" ||
    v === "partial" ||
    v === "fail" ||
    v === "pending" ||
    v === "na"
  );
}

function StatusBadge({ status }: { status: DryRunCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${STATUS_TONE[status]}`}
    >
      {DRY_RUN_STATUS_LABEL[status]}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: ReleaseVerdict }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${VERDICT_TONE[verdict]}`}
    >
      {RELEASE_VERDICT_LABEL[verdict]}
    </span>
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
      <p className="mt-1 text-sm font-bold text-[#102235]">{value}</p>
    </div>
  );
}
