import {
  AA_REPORT_HANDLING,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DATA_ERROR_REPORT_HANDLING,
  INBOX_CODE_REFERENCES,
  INBOX_FOLLOW_UP_PRS,
  INBOX_OPERATING_PRINCIPLES,
  INBOX_PLAN_CHECKLIST,
  INBOX_PLAN_STATUS_LABEL,
  INBOX_WORKFLOW_STEPS,
  PR162_ENTRY_CONDITIONS,
  PR162_FORBIDDEN_DOC_CONTENT,
  PR162_INBOX_VERDICTS,
  PR162_LINKED_HUBS,
  PR162_OPEN_CRITICAL_COUNT,
  PR162_SCOPE_NOTICE,
  PR162_TEST_FILES,
  PR163_FOLLOW_UP_PRS,
  REPORT_GRADE_RESPONSE,
  REPORT_RECORD_ALLOW_DENY,
  REPORT_TYPE_CLASSIFICATION,
  USER_REPORT_NOTICE,
  type InboxChecklistStatus,
} from "@/lib/ops/user-support-inbox-plan";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<InboxChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminUserSupportInboxPlanPanel() {
  const verdict = PR162_INBOX_VERDICTS.inboxPlanPrepared;
  const pending = INBOX_PLAN_CHECKLIST.filter((c) => c.status !== "met").length;

  return (
    <section className="mb-8" aria-labelledby="admin-user-support-inbox-plan">
      <h2
        id="admin-user-support-inbox-plan"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        User Support Inbox Plan (PR162)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR162_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR162_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Inbox Plan"
          value={INBOX_PLAN_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR162_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="Checklist pending"
          value={String(pending)}
          tone={pending > 0 ? "warn" : "ok"}
        />
        <StatTile label="Inbox UI" value="Not Ready" tone="warn" />
      </div>

      <p className="mb-4 max-w-3xl text-xs text-[#4f5661]">
        코드 참조: {INBOX_CODE_REFERENCES.publicVisibility} · AA:{" "}
        {INBOX_CODE_REFERENCES.aaUsageLog}
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR162 진입 · 운영 원칙 · 허용/금지
      </h3>
      <EntryTable rows={PR162_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={INBOX_OPERATING_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["구분", "허용", "금지"]}
        rows={REPORT_RECORD_ALLOW_DENY.map((r) => [r.field, r.allowed, r.forbidden])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        유형 · 등급 · AA · 데이터 · 흐름
      </h3>
      <SimpleTable
        headers={["유형", "예시", "등급"]}
        rows={REPORT_TYPE_CLASSIFICATION.map((r) => [
          r.type,
          r.example,
          r.defaultGrade,
        ])}
      />
      <SimpleTable
        headers={["등급", "기준", "처리"]}
        rows={REPORT_GRADE_RESPONSE.map((r) => [r.grade, r.criteria, r.handling])}
      />
      <SimpleTable
        headers={["AA 제보", "기록", "등급"]}
        rows={AA_REPORT_HANDLING.map((r) => [
          r.reportType,
          r.recordMethod,
          r.grade,
        ])}
      />
      <SimpleTable
        headers={["데이터", "확인", "조치"]}
        rows={DATA_ERROR_REPORT_HANDLING.map((r) => [r.data, r.verify, r.action])}
      />
      <ol className="mb-4 list-decimal space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {INBOX_WORKFLOW_STEPS.map((r) => (
          <li key={r.phase}>
            {r.phase}: {r.detail}
          </li>
        ))}
      </ol>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        사용자 안내문 · Checklist · 후속 PR
      </h3>
      <div className={`mb-4 rounded-lg border ${borders.default} bg-white px-3 py-2 text-xs`}>
        <p className="font-semibold text-[#2d3439]">{USER_REPORT_NOTICE.title}</p>
        <p className="mt-1 text-[#4f5661]">{USER_REPORT_NOTICE.intro}</p>
        <p className="mt-2 font-medium">{USER_REPORT_NOTICE.includeHeading}</p>
        <ul className="list-disc pl-5">
          {USER_REPORT_NOTICE.includeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-2 font-medium">{USER_REPORT_NOTICE.excludeHeading}</p>
        <ul className="list-disc pl-5">
          {USER_REPORT_NOTICE.excludeItems.slice(0, 6).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-1 text-[#4f5661]">… 외 {USER_REPORT_NOTICE.excludeItems.length - 6}건</p>
        {USER_REPORT_NOTICE.footer.map((line) => (
          <p className="mt-1 text-[#4f5661]" key={line}>
            {line}
          </p>
        ))}
      </div>
      <ChecklistTable rows={INBOX_PLAN_CHECKLIST} />
      <SimpleTable
        headers={["유형", "후속 PR", "위험", "Codex"]}
        rows={INBOX_FOLLOW_UP_PRS.map((r) => [
          r.reportType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR163_FOLLOW_UP_PRS.slice(0, 4).map((r) => (
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
        {PR162_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR162_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md`}
          >
            PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md
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
    status: InboxChecklistStatus;
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
