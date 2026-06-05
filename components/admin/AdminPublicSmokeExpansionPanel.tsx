import {
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DEFERRED_RUNTIME_SMOKE,
  PR154_ENTRY_CONDITIONS,
  PR154_FORBIDDEN_DOC_CONTENT,
  PR154_LINKED_HUBS,
  PR154_OPEN_CRITICAL_COUNT,
  PR154_SCOPE_NOTICE,
  PR154_SMOKE_VERDICTS,
  PR154_TEST_FILES,
  PR155_FOLLOW_UP_PRS,
  PUBLIC_ACCESS_BLOCK_SMOKE,
  PUBLIC_FORBIDDEN_EXPRESSIONS,
  PUBLIC_SMOKE_TARGETS,
  PUBLIC_VISIBILITY_SMOKE,
  RESPONSIBILITY_NOTICE_SMOKE,
  SMOKE_STATUS_LABEL,
  type SmokeCheckStatus,
} from "@/lib/ops/public-smoke-expansion";
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

const STATUS_TONE: Record<SmokeCheckStatus, string> = {
  pass: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  pending: "bg-[#f4f5f6] text-[#4f5661]",
  fail: "bg-[#fdf2f2] text-[#8b2e2e]",
  runtime: "bg-[#eef3fb] text-[#2d4a7a]",
};

export default function AdminPublicSmokeExpansionPanel() {
  const runtimeCount = PUBLIC_SMOKE_TARGETS.filter(
    (t) => t.status === "runtime",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-public-smoke-expansion">
      <h2
        id="admin-public-smoke-expansion"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Public Smoke 확장 (PR154)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR154_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR154_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Smoke 확장"
          value={OPERATOR_READINESS_LABEL[PR154_SMOKE_VERDICTS.smokeExpansionReady]}
          tone="warn"
        />
        <StatTile label="정적 smoke" value="Pass" tone="ok" />
        <StatTile label="Open Critical" value={String(PR154_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="런타임 대기" value={String(runtimeCount)} tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR154 진입 조건
      </h3>
      <EntryTable rows={PR154_ENTRY_CONDITIONS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Public Smoke 대상
      </h3>
      <SmokeTable
        headers={["영역", "기대", "정적 검증", "상태"]}
        rows={PUBLIC_SMOKE_TARGETS.map((r) => [
          r.area,
          r.expected,
          r.staticCheck,
          r.status,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Visibility · 접근 차단 · 책임 고지
      </h3>
      <SmokeTable
        headers={["구분", "항목", "기준", "상태"]}
        rows={[
          ...PUBLIC_VISIBILITY_SMOKE.map((r) => [
            "visibility",
            r.item,
            r.criterion,
            r.status,
          ]),
          ...PUBLIC_ACCESS_BLOCK_SMOKE.map((r) => [
            "access",
            r.scenario,
            r.expected,
            r.status,
          ]),
          ...RESPONSIBILITY_NOTICE_SMOKE.map((r) => [
            "notice",
            r.area,
            r.expectedDirection,
            r.status,
          ]),
        ]}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        금지 문구 smoke
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PUBLIC_FORBIDDEN_EXPRESSIONS.map((row) => (
          <li key={row.phrase}>
            {row.phrase} — {row.reason}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        런타임 smoke (보류)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {DEFERRED_RUNTIME_SMOKE.map((row) => (
          <li key={row.test}>
            {row.test}: {row.command} ({row.reason})
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        테스트 파일
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {PR154_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        실행:{" "}
        <code className="rounded bg-[#f4f5f6] px-1">
          npx tsx --test tests/public/*.test.ts
        </code>
        · 런타임:{" "}
        <code className="rounded bg-[#f4f5f6] px-1">npm run smoke:public</code>
        (서버 필요).{" "}
        <code className="rounded bg-[#f4f5f6] px-1">npm run test:e2e</code> — 명령
        부재.
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR155+ · Codex
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        <li>
          판단:{" "}
          <ReadinessBadge readiness={PR154_SMOKE_VERDICTS.overallUntilCodex} />
        </li>
        {PR155_FOLLOW_UP_PRS.slice(0, 4).map((row) => (
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
        {PR154_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md`}
          >
            PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function EntryTable({
  rows,
}: {
  rows: readonly { condition: string; result: string; met: boolean; id: string }[];
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

function SmokeTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | SmokeCheckStatus)[][];
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
                  {isSmokeStatus(cell) ? <StatusBadge status={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isSmokeStatus(v: string | SmokeCheckStatus): v is SmokeCheckStatus {
  return (
    v === "pass" ||
    v === "partial" ||
    v === "pending" ||
    v === "fail" ||
    v === "runtime"
  );
}

function StatusBadge({ status }: { status: SmokeCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${STATUS_TONE[status]}`}
    >
      {SMOKE_STATUS_LABEL[status]}
    </span>
  );
}

function ReadinessBadge({ readiness }: { readiness: OperatorReadiness }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${READINESS_TONE[readiness]}`}
    >
      {OPERATOR_READINESS_LABEL[readiness]}
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
