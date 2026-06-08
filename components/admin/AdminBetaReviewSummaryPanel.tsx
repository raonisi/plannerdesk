import {
  BETA_AGGREGATE_RISKS,
  BETA_REVIEW_SUMMARY_CHECKLIST,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DOMAIN_READINESS_ASSESSMENT,
  PR157_TO_PR171_SUMMARY,
  PR172_ENTRY_CONDITIONS,
  PR172_FORBIDDEN_DOC_CONTENT,
  PR172_LINKED_HUBS,
  PR172_OPEN_CRITICAL_COUNT,
  PR172_OPEN_HIGH_COUNT,
  PR172_REVIEW_VERDICTS,
  PR172_SCOPE_NOTICE,
  PR172_SUMMARY_CONCLUSIONS,
  PR173_ENTRY_CONDITIONS,
  PR173_ENTRY_CRITERIA,
  PR173_ENTRY_VERDICT_LABEL,
  PR173_FOLLOW_UP_PRS,
  PUBLIC_BETA_NO_GO,
  REVIEW_SUMMARY_STATUS_LABEL,
  type SummaryChecklistStatus,
} from "@/lib/ops/beta-review-summary";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<SummaryChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminBetaReviewSummaryPanel() {
  const verdict = PR172_REVIEW_VERDICTS.betaReviewSummary;
  const pr173 = PR172_REVIEW_VERDICTS.pr173Entry;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-review-summary">
      <h2
        id="admin-beta-review-summary"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Beta Review Summary (PR172)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR172_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR172_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Beta Review"
          value={REVIEW_SUMMARY_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR172_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="High" value={String(PR172_OPEN_HIGH_COUNT)} tone="warn" />
        <StatTile
          label="PR173 진입"
          value={PR173_ENTRY_VERDICT_LABEL[pr173]}
          tone="warn"
        />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 조건 · PR157~171 종합
      </h3>
      <EntryTable rows={PR172_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["PR", "목적", "상태", "공개 베타 영향", "남은 리스크"]}
        rows={PR157_TO_PR171_SUMMARY.map((r) => [
          r.id,
          r.purpose,
          r.currentStatus,
          r.publicBetaImpact,
          r.remainingRisk,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        영역별 준비 · 종합 리스크
      </h3>
      <SimpleTable
        headers={["영역", "기준", "상태"]}
        rows={DOMAIN_READINESS_ASSESSMENT.map((r) => [
          r.domain,
          r.criteria,
          REVIEW_SUMMARY_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["리스크", "등급", "현재", "PR173 영향"]}
        rows={BETA_AGGREGATE_RISKS.map((r) => [
          r.risk,
          r.grade,
          r.currentState,
          r.pr173Impact,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        No-Go · PR173 진입 · 판단
      </h3>
      <SimpleTable
        headers={["상황", "판단"]}
        rows={PUBLIC_BETA_NO_GO.map((r) => [r.situation, r.judgment])}
      />
      <SimpleTable
        headers={["조건", "필수", "상태"]}
        rows={PR173_ENTRY_CONDITIONS.map((r) => [
          r.condition,
          r.required ? "필수" : "—",
          r.status,
        ])}
      />
      <SimpleTable
        headers={["판단", "기준"]}
        rows={PR173_ENTRY_CRITERIA.map((r) => [
          PR173_ENTRY_VERDICT_LABEL[r.verdict],
          r.criteria,
        ])}
      />
      <SimpleTable
        headers={["결론", "문구"]}
        rows={PR172_SUMMARY_CONCLUSIONS.map((r) => [r.label, r.text])}
      />

      <ChecklistTable rows={BETA_REVIEW_SUMMARY_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        Codex: <strong>조건부</strong> · 제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR173_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title} ({r.codex})
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR172_LINKED_HUBS.map((doc) => (
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
    status: SummaryChecklistStatus;
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
