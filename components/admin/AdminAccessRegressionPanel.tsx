import {
  AA_ADMIN_SEPARATION_REGRESSION,
  ADMIN_DATA_NON_EXPOSURE,
  ADMIN_REGRESSION_TARGETS,
  ADMIN_ROLE_BOUNDARY_REGRESSION,
  ADMIN_ROUTE_BLOCK_REGRESSION,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DEFERRED_RUNTIME_REGRESSION,
  PR155_ENTRY_CONDITIONS,
  PR155_FORBIDDEN_DOC_CONTENT,
  PR155_LINKED_HUBS,
  PR155_OPEN_CRITICAL_COUNT,
  PR155_REGRESSION_VERDICTS,
  PR155_SCOPE_NOTICE,
  PR155_TEST_FILES,
  PR156_FOLLOW_UP_PRS,
  REGRESSION_STATUS_LABEL,
  ROLE_ACCESS_EXPECTATIONS,
  type RegressionCheckStatus,
} from "@/lib/ops/admin-access-regression";
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

const STATUS_TONE: Record<RegressionCheckStatus, string> = {
  pass: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  pending: "bg-[#f4f5f6] text-[#4f5661]",
  fail: "bg-[#fdf2f2] text-[#8b2e2e]",
  runtime: "bg-[#eef3fb] text-[#2d4a7a]",
};

export default function AdminAccessRegressionPanel() {
  const runtimeCount = ADMIN_REGRESSION_TARGETS.filter(
    (t) => t.status === "runtime",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-access-regression">
      <h2
        id="admin-access-regression"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Admin 접근 회귀 (PR155)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR155_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR155_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="회귀 테스트"
          value={
            OPERATOR_READINESS_LABEL[PR155_REGRESSION_VERDICTS.regressionReady]
          }
          tone="warn"
        />
        <StatTile label="정적 회귀" value="Pass" tone="ok" />
        <StatTile
          label="Open Critical"
          value={String(PR155_OPEN_CRITICAL_COUNT)}
          tone="ok"
        />
        <StatTile label="런타임 대기" value={String(runtimeCount)} tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR155 진입 조건
      </h3>
      <EntryTable rows={PR155_ENTRY_CONDITIONS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        회귀 테스트 대상
      </h3>
      <RegressionTable
        headers={["영역", "기대", "정적 검증", "상태"]}
        rows={ADMIN_REGRESSION_TARGETS.map((r) => [
          r.area,
          r.expected,
          r.staticCheck,
          r.status,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        역할별 접근 기대값
      </h3>
      <RegressionTable
        headers={["역할", "admin", "bulk", "AA", "상태"]}
        rows={ROLE_ACCESS_EXPECTATIONS.map((r) => [
          r.label,
          r.admin,
          r.adminBulk,
          r.answerAssistant,
          r.status,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Route 차단 · 데이터 미노출 · 경계 · AA 분리
      </h3>
      <RegressionTable
        headers={["구분", "항목", "기대", "상태"]}
        rows={[
          ...ADMIN_ROUTE_BLOCK_REGRESSION.map((r) => [
            "route",
            r.scenario,
            r.expected,
            r.status,
          ]),
          ...ADMIN_DATA_NON_EXPOSURE.map((r) => [
            "data",
            r.data,
            r.publicExposure,
            r.status,
          ]),
          ...ADMIN_ROLE_BOUNDARY_REGRESSION.map((r) => [
            "boundary",
            r.test,
            r.expected,
            r.status,
          ]),
          ...AA_ADMIN_SEPARATION_REGRESSION.map((r) => [
            "aa",
            r.test,
            r.expected,
            r.status,
          ]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        런타임 회귀 (보류)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {DEFERRED_RUNTIME_REGRESSION.map((row) => (
          <li key={row.test}>
            {row.test}: {row.command} ({row.reason})
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        테스트 파일
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {PR155_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        실행:{" "}
        <code className="rounded bg-[#f4f5f6] px-1">
          npx tsx --test tests/admin/admin-access-regression.test.ts
        </code>
        ·{" "}
        <code className="rounded bg-[#f4f5f6] px-1">
          npx tsx --test tests/ops/pr155-*.test.ts
        </code>
        .{" "}
        <code className="rounded bg-[#f4f5f6] px-1">npm run test:e2e</code> — 명령
        부재.
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR156+ · Codex
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        <li>
          판단:{" "}
          <ReadinessBadge
            readiness={PR155_REGRESSION_VERDICTS.overallUntilCodex}
          />
        </li>
        {PR156_FOLLOW_UP_PRS.slice(0, 4).map((row) => (
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
        {PR155_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-155-ADMIN-ACCESS-REGRESSION-OPS.md`}
          >
            PR-155-ADMIN-ACCESS-REGRESSION-OPS.md
          </a>
        </li>
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

function RegressionTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | RegressionCheckStatus)[][];
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

function StatusBadge({ status }: { status: RegressionCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TONE[status]}`}
    >
      {REGRESSION_STATUS_LABEL[status]}
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
