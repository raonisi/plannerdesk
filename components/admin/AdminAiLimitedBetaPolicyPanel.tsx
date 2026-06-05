import {
  AA_ALLOWED_INPUT_DIRECTIONS,
  AA_DISABLE_CRITERIA,
  AA_FORBIDDEN_INPUT_ROWS,
  AA_FORBIDDEN_OUTPUT_ROWS,
  AA_GOOD_OUTPUT_DIRECTIONS,
  AA_LIMITED_BETA_SCOPE,
  AI_LIMITED_BETA_CHECKLIST,
  BETA_VS_AA_ACCESS_ROWS,
  OPERATOR_REVIEW_ROWS,
  OUTPUT_SAFETY_CHECKLIST,
  PR148_DEFERRED_IMPLEMENTATION,
  PR148_DEFERRED_PRS,
  PR148_FORBIDDEN_DOC_CONTENT,
  PR148_LINKED_DOCS,
  PR148_READINESS_CONDITIONS,
  PR148_READINESS_VERDICT,
  PR148_SCOPE_NOTICE,
  PR148_USER_NOTICE_FORBIDDEN,
  PR148_USER_NOTICE_GOOD,
  PR148_CODE_REFERENCES,
  RATE_LIMIT_POLICY_ROWS,
  RETENTION_POLICY_ROWS,
  USAGE_AUDIT_POLICY_ROWS,
  type AiPolicyCheckStatus,
} from "@/lib/ops/ai-limited-beta-policy";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECK_TONE: Record<AiPolicyCheckStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECK_LABEL: Record<AiPolicyCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

const VERDICT_LABEL: Record<string, string> = {
  conditional_go: "Conditional Go",
  no_go: "No-Go",
};

export default function AdminAiLimitedBetaPolicyPanel() {
  const gapCount = AI_LIMITED_BETA_CHECKLIST.filter((c) => c.status === "gap").length;

  return (
    <section className="mb-8" aria-labelledby="admin-ai-limited-beta">
      <h2
        id="admin-ai-limited-beta"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Answer Assistant 제한 베타 정책 (PR148)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR148_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR148_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="판단"
          value={VERDICT_LABEL[PR148_READINESS_VERDICT] ?? PR148_READINESS_VERDICT}
          tone="warn"
        />
        <StatTile label="접근 확대" value="없음" tone="ok" />
        <StatTile label="allowlist 변경" value="없음" tone="ok" />
        <StatTile label="체크 gap" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        제한 베타 운영 범위
      </h3>
      <ScopeTable rows={AA_LIMITED_BETA_SCOPE} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        베타 접근 ≠ Answer Assistant (PR-146)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">범위</th>
              <th className="px-3 py-2">규칙</th>
              <th className="px-3 py-2">베타 OK</th>
              <th className="px-3 py-2">AA 별도</th>
            </tr>
          </thead>
          <tbody>
            {BETA_VS_AA_ACCESS_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.scope}
              >
                <td className="px-3 py-2 font-semibold">{row.scope}</td>
                <td className="px-3 py-2">{row.rule}</td>
                <td className="px-3 py-2">{row.betaOk ? "예" : "아니오"}</td>
                <td className="px-3 py-2">{row.aaSeparate ? "예" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TwoColTable title="금지 입력" rows={AA_FORBIDDEN_INPUT_ROWS} col1="입력" col2="처리" />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {AA_ALLOWED_INPUT_DIRECTIONS.map((line) => (
          <li key={line}>허용 방향: {line}</li>
        ))}
      </ul>

      <TwoColTable title="금지 출력" rows={AA_FORBIDDEN_OUTPUT_ROWS} col1="출력" col2="처리" />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {AA_GOOD_OUTPUT_DIRECTIONS.map((line) => (
          <li key={line}>권장 방향: {line}</li>
        ))}
      </ul>

      <ChecklistTable title="Output Safety" rows={OUTPUT_SAFETY_CHECKLIST} />
      <PolicyTable title="Usage Audit" rows={USAGE_AUDIT_POLICY_ROWS} />
      <PolicyTable title="Rate Limit" rows={RATE_LIMIT_POLICY_ROWS} />
      <PolicyTable title="Retention" rows={RETENTION_POLICY_ROWS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        중단 / disable (PR-137)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">상황</th>
              <th className="px-3 py-2">조치</th>
            </tr>
          </thead>
          <tbody>
            {AA_DISABLE_CRITERIA.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-mono text-[10px]">{row.id}</td>
                <td className="px-3 py-2 font-semibold">{row.label}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PolicyTable title="운영자 검토" rows={OPERATOR_REVIEW_ROWS} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        사용자 안내 (후보)
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR148_USER_NOTICE_GOOD.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#8b2e2e]">
        {PR148_USER_NOTICE_FORBIDDEN.map((line) => (
          <li key={line}>금지: {line}</li>
        ))}
      </ul>

      <ChecklistTable title="AI Limited Beta Checklist" rows={AI_LIMITED_BETA_CHECKLIST} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Conditional Go 조건
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR148_READINESS_CONDITIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        후속 PR (실행 없음)
      </h3>
      <DeferredPrTable rows={PR148_DEFERRED_PRS} />
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR148_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        코드 참조 (변경 없음)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 font-mono text-[10px] text-[#4f5661]">
        {PR148_CODE_REFERENCES.map((path) => (
          <li key={path}>{path}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR148_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-148-AI-LIMITED-BETA-POLICY-OPS.md`}
          >
            PR-148-AI-LIMITED-BETA-POLICY-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function ScopeTable({
  rows,
}: {
  rows: readonly { item: string; rule: string }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[28rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">항목</th>
            <th className="px-3 py-2">기준</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-b border-[#e8eaed] last:border-b-0"
              key={row.item}
            >
              <td className="px-3 py-2 font-semibold">{row.item}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.rule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TwoColTable({
  title,
  rows,
  col1,
  col2,
}: {
  title: string;
  rows: readonly { inputType?: string; outputType?: string; handling: string }[];
  col1: string;
  col2: string;
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
              <th className="px-3 py-2">{col1}</th>
              <th className="px-3 py-2">{col2}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = row.inputType ?? row.outputType ?? "";
              return (
                <tr
                  className="border-b border-[#e8eaed] last:border-b-0"
                  key={key}
                >
                  <td className="px-3 py-2 font-semibold">{key}</td>
                  <td className="px-3 py-2">{row.handling}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PolicyTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly { item: string; rule: string }[] | readonly { item: string; criterion: string }[];
}) {
  const col2 = "rule" in rows[0]! ? "기준" : "criterion" in rows[0]! ? "검토" : "기준";
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
              <th className="px-3 py-2">{col2}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">
                  {"rule" in row ? row.rule : row.criterion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ChecklistTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly {
    id: string;
    item: string;
    criterion: string;
    status: AiPolicyCheckStatus;
    note: string;
  }[];
}) {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        {title}
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
            {rows.map((row) => (
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
    </>
  );
}

function DeferredPrTable({
  rows,
}: {
  rows: readonly { id: string; title: string; codex: string }[];
}) {
  return (
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
          {rows.map((row) => (
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
