import {
  DEFERRED_RELEASE_PRS,
  EXTERNAL_READINESS_CHECKLIST,
  FEATURE_RELEASE_ROWS,
  MONETIZATION_READINESS_CHECKLIST,
  OVERALL_VERDICTS,
  PR140_FORBIDDEN_DOC_CONTENT,
  PR140_SCOPE_NOTICE,
  RELEASE_RISK_ROWS,
  RELEASE_STAGES,
  RELEASE_VERDICT_LABEL,
  type ChecklistStatus,
  type ReleaseVerdict,
} from "@/lib/ops/external-release-readiness";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const VERDICT_TONE: Record<ReleaseVerdict, string> = {
  go: "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  conditional_go: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  no_go: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
  not_applicable: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
};

const STATUS_LABEL: Record<ChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
  na: "해당 없음",
};

const STATUS_TONE: Record<ChecklistStatus, string> = {
  met: "text-[#1f6b55]",
  partial: "text-[#7a612d]",
  gap: "text-[#8b2e2e]",
  na: "text-[#4f5661]",
};

export default function AdminExternalReleaseReadinessPanel() {
  const externalGaps = EXTERNAL_READINESS_CHECKLIST.filter((c) => c.status === "gap");
  const monetizationGaps = MONETIZATION_READINESS_CHECKLIST.filter(
    (c) => c.status === "gap",
  );

  return (
    <section className="mb-8" aria-labelledby="admin-external-release">
      <h2
        id="admin-external-release"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        외부 공개 · 유료화 준비 판단 (PR140)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR140_SCOPE_NOTICE}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VerdictTile
          label="제한 베타"
          verdict={OVERALL_VERDICTS.limitedBeta}
        />
        <VerdictTile
          label="공개 베타"
          verdict={OVERALL_VERDICTS.publicBeta}
        />
        <VerdictTile label="유료 베타" verdict={OVERALL_VERDICTS.paidBeta} />
        <VerdictTile
          label="정식 유료화"
          verdict={OVERALL_VERDICTS.formalMonetization}
        />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        공개 단계
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">단계</th>
              <th className="px-3 py-2">판단</th>
              <th className="px-3 py-2">조건</th>
            </tr>
          </thead>
          <tbody>
            {RELEASE_STAGES.map((stage) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={stage.id}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">
                  {stage.label}
                </td>
                <td className="px-3 py-2">
                  <VerdictBadge verdict={stage.verdict} />
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{stage.conditions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        기능 공개 판단 (요약)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기능</th>
              <th className="px-3 py-2">외부 공개</th>
              <th className="px-3 py-2">유료화</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_RELEASE_ROWS.slice(0, 8).map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 text-[#102235]">{row.label}</td>
                <td className="px-3 py-2">
                  <VerdictBadge verdict={row.external} />
                </td>
                <td className="px-3 py-2">
                  <VerdictBadge verdict={row.monetization} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-3 py-2 text-[10px] text-[#5f6670]">
          전체 표: {DOC_BASE}PR-140-FEATURE-RELEASE-MATRIX.md
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChecklistBlock
          title="외부 공개 준비"
          items={EXTERNAL_READINESS_CHECKLIST}
          gapCount={externalGaps.length}
        />
        <ChecklistBlock
          title="유료화 준비"
          items={MONETIZATION_READINESS_CHECKLIST}
          gapCount={monetizationGaps.length}
        />
      </div>

      <details className={`rounded-lg border ${borders.default} bg-[#f7f4ee] px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          리스크 · 후속 PR (PR141~150)
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {RELEASE_RISK_ROWS.filter((r) => r.state !== "mitigated").map((r) => (
            <li key={r.id}>
              [{r.severity}] {r.label}: {r.response}
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-xs text-[#4f5661]">
          {DEFERRED_RELEASE_PRS.slice(0, 5).map((pr) => (
            <li key={pr.id}>
              <span className="font-mono text-[#102235]">{pr.id}</span> {pr.title}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-[#5f6670]">
          {DOC_BASE}PR-140-DEFERRED-PR-ROADMAP.md
        </p>
      </details>

      <div
        className={`mt-4 space-y-2 rounded-lg px-4 py-3 ${shadows.card} border ${borders.default} bg-white`}
      >
        <p className="text-xs text-[#4f5661]">
          허브: {DOC_BASE}PR-140-EXTERNAL-RELEASE-READINESS-OPS.md · Go/No-Go:{" "}
          {DOC_BASE}PR-140-GO-NOGO-CRITERIA.md
        </p>
        <p className="text-xs text-[#4f5661]">{PR140_FORBIDDEN_DOC_CONTENT}</p>
      </div>
    </section>
  );
}

function VerdictBadge({ verdict }: { verdict: ReleaseVerdict }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${VERDICT_TONE[verdict]}`}
    >
      {RELEASE_VERDICT_LABEL[verdict]}
    </span>
  );
}

function VerdictTile({
  label,
  verdict,
}: {
  label: string;
  verdict: ReleaseVerdict;
}) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${VERDICT_TONE[verdict]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{RELEASE_VERDICT_LABEL[verdict]}</p>
    </div>
  );
}

function ChecklistBlock({
  title,
  items,
  gapCount,
}: {
  title: string;
  items: readonly { id: string; label: string; status: ChecklistStatus; note: string }[];
  gapCount: number;
}) {
  return (
    <div className={`rounded-lg border ${borders.default} bg-white px-3 py-3`}>
      <p className="text-xs font-semibold text-[#102235]">
        {title}
        {gapCount > 0 ? (
          <span className="ml-2 text-[#8b2e2e]">미충족 {gapCount}</span>
        ) : null}
      </p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
        {items.map((item) => (
          <li className="flex justify-between gap-2" key={item.id}>
            <span className="text-[#102235]">{item.label}</span>
            <span className={`shrink-0 font-semibold ${STATUS_TONE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
