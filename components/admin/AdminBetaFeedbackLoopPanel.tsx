import {
  AA_FEEDBACK_HANDLING,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CRITICAL_FEEDBACK_RESPONSE,
  DATA_ERROR_FEEDBACK_HANDLING,
  FEEDBACK_COLLECTION_PRINCIPLES,
  FEEDBACK_LOOP_CHECKLIST,
  FEEDBACK_LOOP_STATUS_LABEL,
  FEEDBACK_RECORD_ALLOW_DENY,
  FEEDBACK_TYPE_CLASSIFICATION,
  FEEDBACK_WORKFLOW_STEPS,
  FOLLOW_UP_PR_LINKS,
  HIGH_FEEDBACK_RESPONSE,
  MEDIUM_LOW_FEEDBACK_RESPONSE,
  PR158_ENTRY_CONDITIONS,
  PR158_FEEDBACK_VERDICTS,
  PR158_FORBIDDEN_DOC_CONTENT,
  PR158_LINKED_HUBS,
  PR158_OPEN_CRITICAL_COUNT,
  PR158_SCOPE_NOTICE,
  PR158_TEST_FILES,
  PR159_FOLLOW_UP_PRS,
  type ChecklistItemStatus,
} from "@/lib/ops/beta-feedback-loop";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<ChecklistItemStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminBetaFeedbackLoopPanel() {
  const verdict = PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared;
  const pending = FEEDBACK_LOOP_CHECKLIST.filter((c) => c.status !== "met").length;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-feedback-loop">
      <h2
        id="admin-beta-feedback-loop"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        베타 피드백 운영 (PR158)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR158_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR158_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="피드백 루프"
          value={FEEDBACK_LOOP_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR158_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="체크리스트 pending"
          value={String(pending)}
          tone={pending > 0 ? "warn" : "ok"}
        />
        <StatTile label="수집 채널" value="Not Ready" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR158 진입 조건
      </h3>
      <EntryTable rows={PR158_ENTRY_CONDITIONS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        수집 원칙 · 허용/금지
      </h3>
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={FEEDBACK_COLLECTION_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["구분", "허용", "금지"]}
        rows={FEEDBACK_RECORD_ALLOW_DENY.map((r) => [
          r.field,
          r.allowed,
          r.forbidden,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        유형 분류 · Critical/High 대응
      </h3>
      <SimpleTable
        headers={["유형", "예시", "등급"]}
        rows={FEEDBACK_TYPE_CLASSIFICATION.map((r) => [
          r.type,
          r.example,
          r.defaultGrade,
        ])}
      />
      <SimpleTable
        headers={["상황", "즉시 조치", "후속"]}
        rows={CRITICAL_FEEDBACK_RESPONSE.map((r) => [
          r.situation,
          r.immediate,
          r.followUp,
        ])}
      />
      <SimpleTable
        headers={["상황", "조치", "후속"]}
        rows={HIGH_FEEDBACK_RESPONSE.map((r) => [
          r.situation,
          r.action,
          r.followUp,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        AA · 데이터 오류 · 처리 흐름
      </h3>
      <SimpleTable
        headers={["피드백", "기록", "등급"]}
        rows={AA_FEEDBACK_HANDLING.map((r) => [
          r.feedback,
          r.record,
          r.grade,
        ])}
      />
      <SimpleTable
        headers={["데이터", "확인", "조치"]}
        rows={DATA_ERROR_FEEDBACK_HANDLING.map((r) => [
          r.data,
          r.verify,
          r.action,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {FEEDBACK_WORKFLOW_STEPS.map((r) => (
          <li key={r.phase}>
            {r.phase}: {r.detail}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Checklist · 후속 PR · PR159+
      </h3>
      <ChecklistTable rows={FEEDBACK_LOOP_CHECKLIST} />
      <SimpleTable
        headers={["유형", "후속 PR", "위험", "Codex"]}
        rows={FOLLOW_UP_PR_LINKS.map((r) => [
          r.feedbackType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {MEDIUM_LOW_FEEDBACK_RESPONSE.map((r, i) => (
          <li key={i}>
            {r.grade}: {r.handling} → {r.followUp}
          </li>
        ))}
        {PR159_FOLLOW_UP_PRS.slice(0, 4).map((r) => (
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
        {PR158_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR158_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-158-BETA-FEEDBACK-LOOP-OPS.md`}
          >
            PR-158-BETA-FEEDBACK-LOOP-OPS.md
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
    status: ChecklistItemStatus;
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
