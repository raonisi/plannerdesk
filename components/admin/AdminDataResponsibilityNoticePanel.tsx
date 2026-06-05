import {
  AA_RESPONSIBILITY_ROWS,
  CLAIM_RESPONSIBILITY_ROWS,
  COMMON_NOTICE_GOOD,
  DATA_RESPONSIBILITY_CHECKLIST,
  DATA_RESPONSIBILITY_TARGETS,
  DIRECTORY_RESPONSIBILITY_ROWS,
  ERROR_REPORT_ESCALATION,
  KNOWLEDGE_RESPONSIBILITY_ROWS,
  NOTICE_FORBIDDEN_PHRASES,
  PR147_DEFERRED_IMPLEMENTATION,
  PR147_DEFERRED_PRS,
  PR147_FORBIDDEN_DOC_CONTENT,
  PR147_LINKED_DOCS,
  PR147_READINESS_CONDITIONS,
  PR147_READINESS_VERDICT,
  PR147_SCOPE_NOTICE,
  PUBLIC_NOTICE_PLACEMENTS,
  WORK_LINK_RESPONSIBILITY_ROWS,
  type ResponsibilityCheckStatus,
} from "@/lib/ops/data-responsibility-notice";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECK_TONE: Record<ResponsibilityCheckStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECK_LABEL: Record<ResponsibilityCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

const VERDICT_LABEL: Record<string, string> = {
  go: "Go",
  conditional_go: "Conditional Go",
  no_go: "No-Go",
};

export default function AdminDataResponsibilityNoticePanel() {
  const partialCount = DATA_RESPONSIBILITY_CHECKLIST.filter(
    (c) => c.status === "partial",
  ).length;
  const gapCount = DATA_RESPONSIBILITY_CHECKLIST.filter(
    (c) => c.status === "gap",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-data-responsibility">
      <h2
        id="admin-data-responsibility"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        데이터 책임 고지 (PR147)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR147_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR147_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="판단" value={VERDICT_LABEL[PR147_READINESS_VERDICT] ?? PR147_READINESS_VERDICT} tone="warn" />
        <StatTile label="체크 partial" value={String(partialCount)} tone={partialCount > 0 ? "warn" : "ok"} />
        <StatTile label="체크 gap" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
        <StatTile label="출처 자동검증" value="없음" tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        고지 대상 영역
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">영역</th>
              <th className="px-3 py-2">목적</th>
              <th className="px-3 py-2">위험도</th>
            </tr>
          </thead>
          <tbody>
            {DATA_RESPONSIBILITY_TARGETS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.domain}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.purpose}</td>
                <td className="px-3 py-2">{row.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Public notice 배치
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">위치</th>
              <th className="px-3 py-2">목적</th>
              <th className="px-3 py-2">우선순위</th>
            </tr>
          </thead>
          <tbody>
            {PUBLIC_NOTICE_PLACEMENTS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.placement}
              >
                <td className="px-3 py-2 font-semibold">{row.placement}</td>
                <td className="px-3 py-2">{row.purpose}</td>
                <td className="px-3 py-2">{row.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResponsibilityTable title="보험사 디렉터리" rows={DIRECTORY_RESPONSIBILITY_ROWS} />
      <ResponsibilityTable title="청구서류" rows={CLAIM_RESPONSIBILITY_ROWS} />
      <ResponsibilityTable title="업무 링크" rows={WORK_LINK_RESPONSIBILITY_ROWS} />
      <ResponsibilityTable title="지식 아카이브" rows={KNOWLEDGE_RESPONSIBILITY_ROWS} />
      <ResponsibilityTable title="Answer Assistant" rows={AA_RESPONSIBILITY_ROWS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        권장 문구 (후보)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {COMMON_NOTICE_GOOD.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        금지 문구
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#8b2e2e]">
        {NOTICE_FORBIDDEN_PHRASES.slice(0, 12).map((phrase) => (
          <li key={phrase}>{phrase}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        오류 제보 → PR-143
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">유형</th>
              <th className="px-3 py-2">심각도</th>
              <th className="px-3 py-2">연계</th>
            </tr>
          </thead>
          <tbody>
            {ERROR_REPORT_ESCALATION.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.errorType}
              >
                <td className="px-3 py-2 font-semibold">{row.errorType}</td>
                <td className="px-3 py-2">{row.severity}</td>
                <td className="px-3 py-2">{row.link}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Data Responsibility Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {DATA_RESPONSIBILITY_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-semibold ${CHECK_TONE[row.status]}`}
                  >
                    {CHECK_LABEL[row.status]}
                  </span>
                </td>
                <td className="px-3 py-2">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Conditional Go 조건
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR147_READINESS_CONDITIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        후속 PR (실행 없음)
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
            {PR147_DEFERRED_PRS.map((row) => (
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
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR147_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR147_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md`}
          >
            PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function ResponsibilityTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly { item: string; notice: string }[];
}) {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        {title}
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[28rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">고지</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.notice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
