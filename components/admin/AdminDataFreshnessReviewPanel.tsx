import {
  CLAIM_DOCUMENT_CHECK,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DATA_ERROR_GRADES,
  FRESHNESS_CODE_REFERENCES,
  FRESHNESS_FOLLOW_UP_PRS,
  FRESHNESS_REVIEW_CHECKLIST,
  FRESHNESS_REVIEW_STATUS_LABEL,
  INSURER_DIRECTORY_CHECK,
  KNOWLEDGE_ARCHIVE_CHECK,
  OFFICIAL_SOURCE_PRIORITY,
  PR161_ENTRY_CONDITIONS,
  PR161_FORBIDDEN_DOC_CONTENT,
  PR161_FRESHNESS_VERDICTS,
  PR161_LINKED_HUBS,
  PR161_OPEN_CRITICAL_COUNT,
  PR161_SCOPE_NOTICE,
  PR161_TEST_FILES,
  PR162_FOLLOW_UP_PRS,
  PUBLIC_HOLD_CRITERIA,
  PUBLIC_SEARCH_FRESHNESS_CHECK,
  WORK_LINK_CHECK,
  type FreshnessChecklistStatus,
} from "@/lib/ops/data-freshness-review";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<FreshnessChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminDataFreshnessReviewPanel() {
  const verdict = PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared;
  const pending = FRESHNESS_REVIEW_CHECKLIST.filter((c) => c.status !== "met").length;

  return (
    <section className="mb-8" aria-labelledby="admin-data-freshness-review">
      <h2
        id="admin-data-freshness-review"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        데이터 최신성 점검 (PR161)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR161_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR161_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Freshness Review"
          value={FRESHNESS_REVIEW_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR161_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="Checklist pending"
          value={String(pending)}
          tone={pending > 0 ? "warn" : "ok"}
        />
        <StatTile label="Live audit" value="Not Ready" tone="warn" />
      </div>

      <p className="mb-4 max-w-3xl text-xs text-[#4f5661]">
        코드 참조: {FRESHNESS_CODE_REFERENCES.publicVisibility} · 검수 필드:{" "}
        {FRESHNESS_CODE_REFERENCES.verificationField}
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR161 진입 · 공식 출처
      </h3>
      <EntryTable rows={PR161_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["우선", "출처", "기준"]}
        rows={OFFICIAL_SOURCE_PRIORITY.map((r) => [
          String(r.priority),
          r.sourceType,
          r.usageRule,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        디렉터리 · 청구 · 링크 · 지식 · 검색
      </h3>
      <DomainTable title="보험사" rows={INSURER_DIRECTORY_CHECK} />
      <DomainTable title="청구서류" rows={CLAIM_DOCUMENT_CHECK} />
      <DomainTable title="업무 링크" rows={WORK_LINK_CHECK} />
      <DomainTable title="지식" rows={KNOWLEDGE_ARCHIVE_CHECK} />
      <DomainTable title="public 검색" rows={PUBLIC_SEARCH_FRESHNESS_CHECK} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        오류 등급 · public 보류 · Checklist · 후속 PR
      </h3>
      <SimpleTable
        headers={["등급", "기준", "예시", "조치"]}
        rows={DATA_ERROR_GRADES.map((r) => [
          r.grade,
          r.criteria,
          r.example,
          r.action,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PUBLIC_HOLD_CRITERIA.map((r) => (
          <li key={r.situation}>
            {r.situation} → {r.action}
          </li>
        ))}
      </ul>
      <ChecklistTable rows={FRESHNESS_REVIEW_CHECKLIST} />
      <SimpleTable
        headers={["유형", "후속 PR", "위험", "Codex"]}
        rows={FRESHNESS_FOLLOW_UP_PRS.map((r) => [
          r.issueType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR162_FOLLOW_UP_PRS.slice(0, 4).map((r) => (
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
        {PR161_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR161_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-161-DATA-FRESHNESS-REVIEW-OPS.md`}
          >
            PR-161-DATA-FRESHNESS-REVIEW-OPS.md
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

function DomainTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly { item: string; criterion: string; errorGrade: string }[];
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-xs font-semibold text-[#2d3439]">{title}</p>
      <SimpleTable
        headers={["항목", "기준", "등급"]}
        rows={rows.map((r) => [r.item, r.criterion, r.errorGrade])}
      />
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

function ChecklistTable({
  rows,
}: {
  rows: readonly {
    item: string;
    criterion: string;
    status: FreshnessChecklistStatus;
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
