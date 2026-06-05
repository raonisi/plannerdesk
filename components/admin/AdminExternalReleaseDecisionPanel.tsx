import {
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  FEATURE_RELEASE_FINAL,
  FINAL_RISK_REGISTER,
  LIMITED_BETA_OPS_CONDITIONS,
  PR140_TO_149_ENTRY,
  PR150_FINAL_VERDICTS,
  PR150_FORBIDDEN_DOC_CONTENT,
  PR150_LINKED_HUBS,
  PR150_OPEN_CRITICAL_COUNT,
  PR150_SCOPE_NOTICE,
  PR151_FOLLOW_UP_PRS,
  PRE_RELEASE_REQUIRED,
  RELEASE_STAGE_FINAL,
  RELEASE_VERDICT_LABEL,
  type ReleaseVerdict,
} from "@/lib/ops/external-release-decision";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const VERDICT_TONE: Record<ReleaseVerdict, string> = {
  go: "bg-[#edf7f2] text-[#1f6b55]",
  conditional_go: "bg-[#fff7e6] text-[#7a612d]",
  no_go: "bg-[#fdf2f2] text-[#8b2e2e]",
  not_applicable: "bg-[#f4f5f6] text-[#4f5661]",
};

export default function AdminExternalReleaseDecisionPanel() {
  const pendingPre = PRE_RELEASE_REQUIRED.filter((c) => c.status === "pending").length;

  return (
    <section className="mb-8" aria-labelledby="admin-external-release-decision">
      <h2
        id="admin-external-release-decision"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        최종 외부 공개 판단 (PR150)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR150_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR150_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile
          label="제한 베타"
          value={RELEASE_VERDICT_LABEL[PR150_FINAL_VERDICTS.limitedExternalBeta]}
          tone="warn"
        />
        <StatTile
          label="Codex 전"
          value={RELEASE_VERDICT_LABEL[PR150_FINAL_VERDICTS.overallUntilCodex]}
          tone="warn"
        />
        <StatTile label="Open Critical" value={String(PR150_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="공개 베타" value="No-Go" tone="ok" />
        <StatTile label="필수 pending" value={String(pendingPre)} tone={pendingPre > 0 ? "warn" : "ok"} />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR140~PR149 종합
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">PR</th>
              <th className="px-3 py-2">주제</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">판단</th>
            </tr>
          </thead>
          <tbody>
            {PR140_TO_149_ENTRY.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.pr}
              >
                <td className="px-3 py-2 font-semibold">{row.pr}</td>
                <td className="px-3 py-2">{row.topic}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.verdict}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        공개 단계별 최종 판단
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">단계</th>
              <th className="px-3 py-2">판단</th>
              <th className="px-3 py-2">근거</th>
            </tr>
          </thead>
          <tbody>
            {RELEASE_STAGE_FINAL.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.stage}
              >
                <td className="px-3 py-2 font-semibold">{row.stage}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-semibold ${VERDICT_TONE[row.verdict]}`}
                  >
                    {RELEASE_VERDICT_LABEL[row.verdict]}
                  </span>
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        기능별 제한 베타
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기능</th>
              <th className="px-3 py-2">제한 베타</th>
              <th className="px-3 py-2">공개 조건</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_RELEASE_FINAL.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.feature}
              >
                <td className="px-3 py-2 font-semibold">{row.feature}</td>
                <td className="px-3 py-2">{row.limitedBeta}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.openCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        리스크 등급 (요약)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">리스크</th>
              <th className="px-3 py-2">등급</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {FINAL_RISK_REGISTER.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.risk}
              >
                <td className="px-3 py-2">{row.risk}</td>
                <td className="px-3 py-2 font-semibold">{row.grade}</td>
                <td className="px-3 py-2">{row.judgment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        공개 전 필수 조건
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PRE_RELEASE_REQUIRED.map((row) => (
          <li key={row.id}>
            {row.condition} — {row.status}
            {row.required ? " (필수)" : ""}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        제한 베타 운영 조건
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {LIMITED_BETA_OPS_CONDITIONS.map((row) => (
          <li key={row.item}>
            {row.item}: {row.rule}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR151+ 후보
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
            {PR151_FOLLOW_UP_PRS.map((row) => (
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
        Codex 제한검수 (원칙 권장)
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
        {PR150_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-150-EXTERNAL-RELEASE-DECISION-OPS.md`}
          >
            PR-150-EXTERNAL-RELEASE-DECISION-OPS.md
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
