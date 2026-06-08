import {
  BETA_EXPANSION_VERDICT_LABEL,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  EXPANSION_COHORT_CRITERIA,
  EXPANSION_DECISION_CRITERIA,
  EXPANSION_VERDICT_COPY,
  FEATURE_EXPANSION_FINAL,
  FINAL_EXPANSION_RISKS,
  IN_FLIGHT_REDUCE_HALT_CRITERIA,
  PRE_EXPANSION_REQUIRED,
  PR157_TO_159_SYNTHESIS,
  PR160_ENTRY_CONDITIONS,
  PR160_EXPANSION_VERDICTS,
  PR160_FORBIDDEN_DOC_CONTENT,
  PR160_LINKED_HUBS,
  PR160_OPEN_CRITICAL_COUNT,
  PR160_OPEN_HIGH_COUNT,
  PR160_SCOPE_NOTICE,
  PR160_TEST_FILES,
  PR161_FOLLOW_UP_PRS,
  type ExpansionCheckStatus,
} from "@/lib/ops/beta-expansion-decision";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const STATUS_LABEL: Record<ExpansionCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "정보 gap",
};

export default function AdminBetaExpansionDecisionPanel() {
  const verdict = PR160_EXPANSION_VERDICTS.limitedBetaExpansion;
  const copy = EXPANSION_VERDICT_COPY[verdict];

  return (
    <section className="mb-8" aria-labelledby="admin-beta-expansion-decision">
      <h2
        id="admin-beta-expansion-decision"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        베타 확대 판단 (PR160)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR160_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR160_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile
          label="베타 확대"
          value={BETA_EXPANSION_VERDICT_LABEL[verdict]}
          tone="warn"
        />
        <StatTile
          label="즉시 확대"
          value={BETA_EXPANSION_VERDICT_LABEL[PR160_EXPANSION_VERDICTS.immediateExpansion]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR160_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="High 잔존" value={String(PR160_OPEN_HIGH_COUNT)} tone="warn" />
        <StatTile label="Codex" value="필수·대기" tone="warn" />
      </div>

      <p className="mb-4 max-w-3xl text-sm text-[#2d3439]">
        {copy.summary} {copy.conditions}
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR160 진입 조건 · PR157~159 종합
      </h3>
      <EntryTable rows={PR160_ENTRY_CONDITIONS} />
      <SynthTable rows={PR157_TO_159_SYNTHESIS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        확대 기준 · 기능 · 리스크 · 확대 전 필수
      </h3>
      <SimpleTable
        headers={["판단", "기준"]}
        rows={EXPANSION_DECISION_CRITERIA.map((r) => [r.verdict, r.criteria])}
      />
      <SimpleTable
        headers={["기능", "확대", "조건", "보류"]}
        rows={FEATURE_EXPANSION_FINAL.map((r) => [
          r.feature,
          r.expansion,
          r.condition,
          r.holdReason,
        ])}
      />
      <SimpleTable
        headers={["리스크", "등급", "상태", "판단"]}
        rows={FINAL_EXPANSION_RISKS.map((r) => [
          r.risk,
          r.grade,
          r.state,
          r.judgment,
        ])}
      />
      <SimpleTable
        headers={["조건", "필수", "상태"]}
        rows={PRE_EXPANSION_REQUIRED.map((r) => [
          r.condition,
          r.required ? "Y" : "N",
          STATUS_LABEL[r.status],
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        축소·중단 · 확대 대상 · PR161+
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {IN_FLIGHT_REDUCE_HALT_CRITERIA.map((r) => (
          <li key={r.situation}>
            {r.situation} → {r.action}
          </li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {EXPANSION_COHORT_CRITERIA.map((r) => (
          <li key={r.item}>
            {r.item}: {r.rule}
          </li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR161_FOLLOW_UP_PRS.slice(0, 5).map((r) => (
          <li key={r.id}>
            {r.id}: {r.title} ({r.codex})
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Codex · 테스트 · 연계
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-2 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {PR160_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR160_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-160-BETA-EXPANSION-DECISION-OPS.md`}
          >
            PR-160-BETA-EXPANSION-DECISION-OPS.md
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

function SynthTable({
  rows,
}: {
  rows: readonly {
    pr: string;
    purpose: string;
    verdict: string;
    remainingRisk: string;
    status: ExpansionCheckStatus;
  }[];
}) {
  return (
    <div
      className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}
    >
      <table className="min-w-[48rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">PR</th>
            <th className="px-3 py-2">목적</th>
            <th className="px-3 py-2">판단</th>
            <th className="px-3 py-2">잔여 리스크</th>
            <th className="px-3 py-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-b border-[#e8eaed] last:border-b-0"
              key={row.pr}
            >
              <td className="px-3 py-2 font-mono">{row.pr}</td>
              <td className="px-3 py-2">{row.purpose}</td>
              <td className="px-3 py-2">{row.verdict}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.remainingRisk}</td>
              <td className="px-3 py-2">{STATUS_LABEL[row.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
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
