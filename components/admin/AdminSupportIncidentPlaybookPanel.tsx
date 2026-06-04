import {
  CRITICAL_RESPONSE_ROWS,
  INCIDENT_RESPONSE_STEPS,
  OPS_RECORD_RULES,
  PR143_DEFERRED_IMPLEMENTATION,
  PR143_FORBIDDEN_RECORD_CONTENT,
  PR143_LINKED_DOCS,
  PR143_SCOPE_NOTICE,
  REPORT_FORM_FORBIDDEN_INPUTS,
  ROLLBACK_DISABLE_ROWS,
  SEVERITY_LABEL,
  SEVERITY_ROWS,
  SUPPORT_SCOPE_ROWS,
  USER_NOTICE_FORBIDDEN,
  USER_NOTICE_GOOD,
} from "@/lib/ops/support-incident-playbook";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

export default function AdminSupportIncidentPlaybookPanel() {
  const criticalCount = CRITICAL_RESPONSE_ROWS.length;

  return (
    <section className="mb-8" aria-labelledby="admin-support-incident">
      <h2
        id="admin-support-incident"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        고객지원·장애 대응 기준 (PR143)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR143_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR143_FORBIDDEN_RECORD_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Critical 상황" value={String(criticalCount)} />
        <StatTile label="문의 폼" value="없음" tone="ok" />
        <StatTile label="티켓 DB" value="없음" tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        지원 범위
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">PR143</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {SUPPORT_SCOPE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">
                  {row.item}
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.pr143}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.forbidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        심각도 (PR-129 정본 연계)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">등급</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">대응</th>
              <th className="px-3 py-2">처리</th>
            </tr>
          </thead>
          <tbody>
            {SEVERITY_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.severity}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">
                  {SEVERITY_LABEL[row.severity]}
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criteria}</td>
                <td className="px-3 py-2">{row.response}</td>
                <td className="px-3 py-2">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        장애 대응 단계
      </h3>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-xs text-[#4f5661]">
        {INCIDENT_RESPONSE_STEPS.map((s) => (
          <li key={s.step}>
            <span className="font-semibold text-[#102235]">{s.title}</span>
            {" — "}
            {s.detail}
          </li>
        ))}
      </ol>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Critical 즉시 조치
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">상황</th>
              <th className="px-3 py-2">조치</th>
            </tr>
          </thead>
          <tbody>
            {CRITICAL_RESPONSE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.situation}
              >
                <td className="px-3 py-2 text-[#102235]">{row.situation}</td>
                <td className="px-3 py-2 font-medium text-[#8b2e2e]">
                  {row.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Rollback / Disable
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">상황</th>
              <th className="px-3 py-2">조치</th>
            </tr>
          </thead>
          <tbody>
            {ROLLBACK_DISABLE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.situation}
              >
                <td className="px-3 py-2">{row.situation}</td>
                <td className="px-3 py-2">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        사용자 공지 (권장 / 금지)
      </h3>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <ul className="list-disc space-y-1 rounded-lg border border-[#b9d5c9] bg-[#edf7f2] px-4 py-3 pl-8 text-xs text-[#102235]">
          {USER_NOTICE_GOOD.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="list-disc space-y-1 rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 pl-8 text-xs text-[#8b2e2e]">
          {USER_NOTICE_FORBIDDEN.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        오류 제보 양식 후보 (폼 미구현)
      </h3>
      <p className={`mb-2 ${textStyles.small}`}>
        실제 수집 UI 없음. 금지 입력: {REPORT_FORM_FORBIDDEN_INPUTS.slice(0, 4).join(" · ")} …
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        운영 기록
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">허용</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {OPS_RECORD_RULES.map((row) => (
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

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        보류 구현
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR143_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR143_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a
              className="text-[#1f6b55] underline"
              href={`/${DOC_BASE}${doc}`}
            >
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md`}
          >
            PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${borders.default} ${
        tone === "ok" ? "bg-[#edf7f2]" : "bg-white"
      } ${shadows.card}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
