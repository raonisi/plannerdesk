import {
  AA_METRICS_RULES,
  ANALYTICS_FORBIDDEN,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CORE_METRICS,
  METRIC_SEVERITY_ROWS,
  METRICS_CLASSIFICATION,
  METRICS_FOLLOW_UP_PRS,
  METRICS_OPERATION_DECISIONS,
  METRICS_RECORD_RULES,
  METRICS_REVIEW_CHECKLIST,
  METRICS_REVIEW_STATUS_LABEL,
  PR167_ENTRY_CONDITIONS,
  PR167_FORBIDDEN_DOC_CONTENT,
  PR167_LINKED_HUBS,
  PR167_METRICS_VERDICTS,
  PR167_OPEN_CRITICAL_COUNT,
  PR167_OPEN_HIGH_COUNT,
  PR167_SCOPE_NOTICE,
  PR168_FOLLOW_UP_PRS,
  SUPPORT_METRICS_RULES,
  type MetricsChecklistStatus,
} from "@/lib/ops/beta-metrics-review";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<MetricsChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminBetaMetricsReviewPanel() {
  const verdict = PR167_METRICS_VERDICTS.metricsReviewPrepared;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-metrics-review">
      <h2
        id="admin-beta-metrics-review"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Beta Metrics Review (PR167)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR167_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR167_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Metrics Review"
          value={METRICS_REVIEW_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR167_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="High" value={String(PR167_OPEN_HIGH_COUNT)} tone="warn" />
        <StatTile label="Codex" value="조건부" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 분류 · 핵심 · 등급
      </h3>
      <EntryTable rows={PR167_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["지표군", "목적", "허용", "금지"]}
        rows={METRICS_CLASSIFICATION.map((r) => [
          r.group,
          r.purpose,
          r.allowed,
          r.forbidden,
        ])}
      />
      <SimpleTable
        headers={["지표", "설명", "판단"]}
        rows={CORE_METRICS.map((r) => [r.metric, r.description, r.judgmentRule])}
      />
      <SimpleTable
        headers={["등급", "기준", "예시", "조치"]}
        rows={METRIC_SEVERITY_ROWS.map((r) => [
          r.grade,
          r.criteria,
          r.examples,
          r.action,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        운영 판단 · AA · 지원 · 기록
      </h3>
      <SimpleTable
        headers={["판단", "기준"]}
        rows={METRICS_OPERATION_DECISIONS.map((r) => [r.decision, r.criteria])}
      />
      <SimpleTable
        headers={["지표", "허용", "금지", "판단"]}
        rows={AA_METRICS_RULES.map((r) => [
          r.metric,
          r.allowed,
          r.forbidden,
          r.judgment,
        ])}
      />
      <SimpleTable
        headers={["지표", "설명", "판단"]}
        rows={SUPPORT_METRICS_RULES.map((r) => [
          r.metric,
          r.description,
          r.judgment,
        ])}
      />
      <SimpleTable
        headers={["항목", "허용", "금지"]}
        rows={METRICS_RECORD_RULES.map((r) => [r.field, r.allowed, r.forbidden])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        후속 PR · Analytics 금지 · Checklist
      </h3>
      <SimpleTable
        headers={["이슈", "후속 PR", "위험", "Codex"]}
        rows={METRICS_FOLLOW_UP_PRS.map((r) => [
          r.issue,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <p className="mb-4 text-xs text-[#4f5661]">
        Analytics 금지 SDK: {ANALYTICS_FORBIDDEN.join(", ")}
      </p>
      <ChecklistTable rows={METRICS_REVIEW_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR168_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR167_LINKED_HUBS.map((doc) => (
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
    status: MetricsChecklistStatus;
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
