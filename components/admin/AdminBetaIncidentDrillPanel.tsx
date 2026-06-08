import {
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  CRITICAL_INCIDENT_SCENARIOS,
  HIGH_INCIDENT_SCENARIOS,
  INCIDENT_DRILL_CHECKLIST,
  INCIDENT_DRILL_PRINCIPLES,
  INCIDENT_DRILL_STATUS_LABEL,
  INCIDENT_FOLLOW_UP_PRS,
  INCIDENT_RECORD_ALLOW_DENY,
  INCIDENT_RESPONSE_FLOW,
  INCIDENT_SEVERITY_GRADES,
  INCIDENT_USER_NOTICE_DRAFT,
  INCIDENT_USER_NOTICE_GUIDANCE,
  PR159_ENTRY_CONDITIONS,
  PR159_FORBIDDEN_DOC_CONTENT,
  PR159_INCIDENT_VERDICTS,
  PR159_LINKED_HUBS,
  PR159_OPEN_CRITICAL_COUNT,
  PR159_SCOPE_NOTICE,
  PR159_TEST_FILES,
  PR160_FOLLOW_UP_PRS,
  type DrillChecklistStatus,
} from "@/lib/ops/beta-incident-drill";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<DrillChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminBetaIncidentDrillPanel() {
  const verdict = PR159_INCIDENT_VERDICTS.incidentDrillPrepared;
  const pending = INCIDENT_DRILL_CHECKLIST.filter((c) => c.status !== "met").length;

  return (
    <section className="mb-8" aria-labelledby="admin-beta-incident-drill">
      <h2
        id="admin-beta-incident-drill"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        장애 대응 리허설 (PR159)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR159_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR159_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Incident Drill"
          value={INCIDENT_DRILL_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR159_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="Checklist pending"
          value={String(pending)}
          tone={pending > 0 ? "warn" : "ok"}
        />
        <StatTile label="Live drill" value="Not Ready" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR159 진입 조건
      </h3>
      <EntryTable rows={PR159_ENTRY_CONDITIONS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        원칙 · 등급 · Critical/High 시나리오
      </h3>
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={INCIDENT_DRILL_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["등급", "기준", "예시", "조치"]}
        rows={INCIDENT_SEVERITY_GRADES.map((r) => [
          r.grade,
          r.criteria,
          r.example,
          r.defaultAction,
        ])}
      />
      <SimpleTable
        headers={["Critical", "감지", "즉시", "후속"]}
        rows={CRITICAL_INCIDENT_SCENARIOS.map((r) => [
          r.scenario,
          r.detection,
          r.immediate,
          r.followUp,
        ])}
      />
      <SimpleTable
        headers={["High", "감지", "조치", "후속"]}
        rows={HIGH_INCIDENT_SCENARIOS.map((r) => [
          r.scenario,
          r.detection,
          r.action,
          r.followUp,
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        대응 흐름 · 기록 · 사용자 안내
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {INCIDENT_RESPONSE_FLOW.map((r) => (
          <li key={r.phase}>
            {r.phase}: {r.detail}
          </li>
        ))}
      </ul>
      <SimpleTable
        headers={["구분", "허용", "금지"]}
        rows={INCIDENT_RECORD_ALLOW_DENY.map((r) => [
          r.field,
          r.allowed,
          r.forbidden,
        ])}
      />
      <SimpleTable
        headers={["상황", "안내", "금지"]}
        rows={INCIDENT_USER_NOTICE_GUIDANCE.map((r) => [
          r.situation,
          r.direction,
          r.forbidden,
        ])}
      />
      <div className={`mb-4 rounded-lg border ${borders.default} bg-[#f9fafb] p-3 text-xs text-[#4f5661]`}>
        <p className="font-semibold text-[#2d3439]">{INCIDENT_USER_NOTICE_DRAFT.title}</p>
        <p className="mt-2 whitespace-pre-line">{INCIDENT_USER_NOTICE_DRAFT.body}</p>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Checklist · 후속 PR · PR160+
      </h3>
      <ChecklistTable rows={INCIDENT_DRILL_CHECKLIST} />
      <SimpleTable
        headers={["유형", "후속 PR", "위험", "Codex"]}
        rows={INCIDENT_FOLLOW_UP_PRS.map((r) => [
          r.incidentType,
          r.prCandidate,
          r.risk,
          r.codex,
        ])}
      />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR160_FOLLOW_UP_PRS.slice(0, 4).map((r) => (
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
        {PR159_TEST_FILES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR159_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-159-BETA-INCIDENT-DRILL-OPS.md`}
          >
            PR-159-BETA-INCIDENT-DRILL-OPS.md
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
    status: DrillChecklistStatus;
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
