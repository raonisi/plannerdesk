import {
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CRITICAL_HALT_CRITERIA,
  DURING_LAUNCH_CHECKLIST,
  OPERATION_RECORD_RULES,
  OPERATOR_CHECK_STATUS_LABEL,
  OPERATOR_EXECUTION_CRITERIA,
  OPERATOR_READINESS_LABEL,
  OPERATOR_ROLE_CHECKLIST,
  POST_LAUNCH_CHECKLIST,
  PRE_LAUNCH_CHECKLIST,
  PR152_ENTRY_CONDITIONS,
  PR152_FORBIDDEN_DOC_CONTENT,
  PR152_LINKED_HUBS,
  PR152_OPEN_CRITICAL_COUNT,
  PR152_OPERATOR_VERDICTS,
  PR152_SCOPE_NOTICE,
  PR153_FOLLOW_UP_PRS,
  USER_NOTICE_CRITERIA,
  type OperatorCheckStatus,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const READINESS_TONE: Record<OperatorReadiness, string> = {
  ready: "bg-[#edf7f2] text-[#1f6b55]",
  conditional_ready: "bg-[#fff7e6] text-[#7a612d]",
  not_ready: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const STATUS_TONE: Record<OperatorCheckStatus, string> = {
  ready: "bg-[#edf7f2] text-[#1f6b55]",
  conditional: "bg-[#fff7e6] text-[#7a612d]",
  pending: "bg-[#f4f5f6] text-[#4f5661]",
  blocked: "bg-[#fdf2f2] text-[#8b2e2e]",
};

export default function AdminBetaOperatorChecklistPanel() {
  const pendingPre = PRE_LAUNCH_CHECKLIST.filter((c) => c.status === "pending").length;
  const conditionalPre = PRE_LAUNCH_CHECKLIST.filter(
    (c) => c.status === "conditional",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-operator-checklist">
      <h2
        id="admin-beta-operator-checklist"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        베타 운영자 체크리스트 (PR152)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR152_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR152_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile
          label="체크리스트"
          value={OPERATOR_READINESS_LABEL[PR152_OPERATOR_VERDICTS.checklistPrepared]}
          tone="warn"
        />
        <StatTile
          label="Codex 전"
          value={OPERATOR_READINESS_LABEL[PR152_OPERATOR_VERDICTS.overallUntilCodex]}
          tone="warn"
        />
        <StatTile label="Open Critical" value={String(PR152_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="PR157 실행" value="Not Ready" tone="ok" />
        <StatTile
          label="pending/cond"
          value={`${pendingPre}/${conditionalPre}`}
          tone={pendingPre > 0 ? "warn" : "ok"}
        />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR152 진입 조건
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
            {PR152_ENTRY_CONDITIONS.map((row) => (
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
        실행 전 체크리스트
      </h3>
      <ChecklistTable
        headers={["구분", "항목", "기준", "상태"]}
        rows={PRE_LAUNCH_CHECKLIST.map((r) => [
          r.category,
          r.item,
          r.criterion,
          r.status,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        실행 중 체크리스트
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">구분</th>
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">중단 조건</th>
            </tr>
          </thead>
          <tbody>
            {DURING_LAUNCH_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={`${row.category}-${row.item}`}
              >
                <td className="px-3 py-2">{row.category}</td>
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2">{row.criterion}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.haltCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        실행 후 체크리스트
      </h3>
      <ChecklistTable
        headers={["구분", "항목", "기준", "상태"]}
        rows={POST_LAUNCH_CHECKLIST.map((r) => [
          r.category,
          r.item,
          r.criterion,
          r.status,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        운영자 역할별
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">역할</th>
              <th className="px-3 py-2">담당</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {OPERATOR_ROLE_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.role}
              >
                <td className="px-3 py-2 font-semibold">{row.role}</td>
                <td className="px-3 py-2">{row.responsibilities}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.forbidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Critical 즉시 중단
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CRITICAL_HALT_CRITERIA.map((row) => (
          <li key={row.situation}>
            {row.situation} → <span className="font-semibold text-[#8b2e2e]">{row.action}</span>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        운영 기록 · 사용자 안내
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기록</th>
              <th className="px-3 py-2">허용</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {OPERATION_RECORD_RULES.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.field}
              >
                <td className="px-3 py-2 font-semibold">{row.field}</td>
                <td className="px-3 py-2">{row.allowed}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.forbidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {USER_NOTICE_CRITERIA.map((row) => (
          <li key={row.topic}>
            {row.topic}: {row.criterion}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        운영자 실행 판단
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {OPERATOR_EXECUTION_CRITERIA.map((row) => (
          <li key={row.verdict}>
            {OPERATOR_READINESS_LABEL[row.verdict]}: {row.criteria}
          </li>
        ))}
        <li>
          현재:{" "}
          <ReadinessBadge readiness={PR152_OPERATOR_VERDICTS.overallUntilCodex} />
        </li>
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR153+ 후보
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
            {PR153_FOLLOW_UP_PRS.map((row) => (
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
        Codex 제한검수 (조건부 권장)
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
        {PR152_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-152-BETA-OPERATOR-CHECKLIST-OPS.md`}
          >
            PR-152-BETA-OPERATOR-CHECKLIST-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function ChecklistTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | OperatorCheckStatus)[][];
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
                  {isOperatorStatus(cell) ? <StatusBadge status={cell} /> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isOperatorStatus(v: string | OperatorCheckStatus): v is OperatorCheckStatus {
  return v === "ready" || v === "conditional" || v === "pending" || v === "blocked";
}

function StatusBadge({ status }: { status: OperatorCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${STATUS_TONE[status]}`}
    >
      {OPERATOR_CHECK_STATUS_LABEL[status]}
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
