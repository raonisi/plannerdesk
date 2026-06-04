import {
  DATA_LIABILITY_ROWS,
  LEGAL_REVIEW_ITEMS,
  PR142_LEGAL_REVIEW_LABEL,
  LIMITED_BETA_NOTICE_ROWS,
  NOTICE_FORBIDDEN_PHRASES,
  PRIVACY_PREP_ROWS,
  PR142_B_IMPLEMENTATION_DEFERRED,
  PR142_DEFERRED_PRS,
  PR142_FORBIDDEN_DOC_CONTENT,
  PR142_INFO_GAP_LABEL,
  PR142_SCOPE_NOTICE,
  PREP_TREATMENT_LABEL,
  TERMS_PREP_ROWS,
  type PrepTreatment,
} from "@/lib/ops/terms-privacy-plan";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const TREATMENT_TONE: Record<PrepTreatment, string> = {
  draft_item: "bg-[#eef3f7] text-[#102235]",
  notice_item: "bg-[#fff7e6] text-[#7a612d]",
  legal_review: "bg-[#fdf2f2] text-[#8b2e2e]",
  info_gap: "bg-[#f4f5f6] text-[#4f5661]",
  deferred_pr: "bg-[#edf7f2] text-[#1f6b55]",
};

export default function AdminTermsPrivacyPlanPanel() {
  const legalCount = LEGAL_REVIEW_ITEMS.length;
  const infoGapCount = PRIVACY_PREP_ROWS.filter(
    (r) => r.treatment === "info_gap",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-terms-privacy-plan">
      <h2
        id="admin-terms-privacy-plan"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        약관·개인정보 준비 계획 (PR142)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR142_SCOPE_NOTICE}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="법무 검토 항목" value={String(legalCount)} />
        <StatTile label="개인정보 정보 부족" value={String(infoGapCount)} />
        <StatTile label="동의 플로우" value="없음" tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        약관 준비 항목 (확정 아님)
      </h3>
      <PrepTable rows={TERMS_PREP_ROWS} />

      <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        개인정보처리방침 준비 항목
      </h3>
      <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">처리</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {PRIVACY_PREP_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">
                  {row.label}
                </td>
                <td className="px-3 py-2">
                  <TreatmentBadge treatment={row.treatment} />
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className={`mt-4 rounded-lg border ${borders.default} bg-[#f7f4ee] px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          제한 베타 고지 · 데이터 책임 · 금지 문구
        </summary>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
          {LIMITED_BETA_NOTICE_ROWS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-xs text-[#4f5661]">
          {DATA_LIABILITY_ROWS.map((row) => (
            <li key={row.area}>
              <strong>{row.area}:</strong> {row.notice}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold text-[#8b2e2e]">문서·UI 금지 표현</p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {NOTICE_FORBIDDEN_PHRASES.slice(0, 6).map((p) => (
            <li
              className="rounded bg-[#fdf2f2] px-2 py-0.5 text-[10px] text-[#8b2e2e]"
              key={p}
            >
              {p}
            </li>
          ))}
        </ul>
      </details>

      <details className={`mt-4 rounded-lg border ${borders.default} bg-white px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          {PR142_LEGAL_REVIEW_LABEL} ({legalCount}) · 후속 PR · PR142-B
        </summary>
        <ul className="mt-2 space-y-1 text-xs text-[#4f5661]">
          {LEGAL_REVIEW_ITEMS.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> — {item.reason} → {item.followUp}
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-0.5 text-xs text-[#4f5661]">
          {PR142_DEFERRED_PRS.map((pr) => (
            <li key={pr.id}>
              {pr.id} {pr.title} ({pr.risk})
            </li>
          ))}
        </ul>
        <ul className="mt-2 list-disc pl-5 text-xs text-[#8b2e2e]">
          {PR142_B_IMPLEMENTATION_DEFERRED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-[#5f6670]">
          {DOC_BASE}PR-142-TERMS-PRIVACY-PLAN-OPS.md
        </p>
      </details>

      <div
        className={`mt-4 space-y-1 rounded-lg px-4 py-3 ${shadows.card} border ${borders.default} bg-white`}
      >
        <p className="text-xs text-[#4f5661]">
          {PR142_INFO_GAP_LABEL}: 수집 항목·제3자·쿠키·인프라 위탁 상세 — 법무·운영 확인 전
          확정하지 않습니다.
        </p>
        <p className="text-xs text-[#4f5661]">{PR142_FORBIDDEN_DOC_CONTENT}</p>
      </div>
    </section>
  );
}

function PrepTable({
  rows,
}: {
  rows: readonly { id: string; label: string; purpose: string; treatment: PrepTreatment }[];
}) {
  return (
    <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">항목</th>
            <th className="px-3 py-2">처리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-b border-[#e8eaed] last:border-b-0"
              key={row.id}
            >
              <td className="px-3 py-2">
                <span className="font-semibold text-[#102235]">{row.label}</span>
                <span className="text-[#4f5661]"> — {row.purpose}</span>
              </td>
              <td className="px-3 py-2">
                <TreatmentBadge treatment={row.treatment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TreatmentBadge({ treatment }: { treatment: PrepTreatment }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TREATMENT_TONE[treatment]}`}
    >
      {PREP_TREATMENT_LABEL[treatment]}
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
  tone?: "ok";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        tone === "ok"
          ? "border-[#b9d5c9] bg-[#edf7f2]"
          : "border-[#d9c9a8] bg-[#fff7e6]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#102235]">{value}</p>
    </div>
  );
}
