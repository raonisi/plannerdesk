import {
  AA_NOTICE_DRAFT_CANDIDATES,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  DATA_RESPONSIBILITY_DRAFT_CANDIDATES,
  DRAFT_CANDIDATE_STATUS_LABEL,
  INSURANCE_DOMAIN_FORBIDDEN_EXPRESSIONS,
  LEGAL_BETA_NO_GO_CRITERIA,
  LEGAL_REVIEW_INFO_GAPS,
  LEGAL_REVIEW_PREP_CHECKLIST,
  LEGAL_REVIEWER_QUESTIONS,
  LEGAL_PREP_STATUS_LABEL,
  PAYMENT_PG_LEGAL_QUESTIONS,
  PR174_ENTRY_CONDITIONS,
  PR174_FORBIDDEN_DOC_CONTENT,
  PR174_LINKED_HUBS,
  PR174_OPEN_CRITICAL_COUNT,
  PR174_REVIEW_VERDICTS,
  PR174_SCOPE_NOTICE,
  PR174_SOURCE_PR_SUMMARY,
  PR175_FOLLOW_UP_PRS,
  PRIVACY_POLICY_DRAFT_CANDIDATES,
  REFUND_CANCEL_LEGAL_QUESTIONS,
  SUPPORT_REPORT_DRAFT_CANDIDATES,
  TERMS_OF_SERVICE_DRAFT_CANDIDATES,
  type LegalPrepChecklistStatus,
} from "@/lib/ops/terms-legal-review-prep";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<LegalPrepChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
  gap: "미충족",
};

export default function AdminTermsLegalReviewPrepPanel() {
  const verdict = PR174_REVIEW_VERDICTS.legalReviewPrep;

  return (
    <section className="mb-8" aria-labelledby="admin-terms-legal-review-prep">
      <h2
        id="admin-terms-legal-review-prep"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Terms Legal Review Prep (PR174)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR174_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR174_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Legal Prep"
          value={LEGAL_PREP_STATUS_LABEL[verdict]}
          tone="warn"
        />
        <StatTile label="Critical" value={String(PR174_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile
          label="약관 확정"
          value={LEGAL_PREP_STATUS_LABEL[PR174_REVIEW_VERDICTS.termsFinalization]}
          tone="warn"
        />
        <StatTile label="Codex" value="필수" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 연계 PR
      </h3>
      <EntryTable rows={PR174_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["PR", "제목", "역할"]}
        rows={PR174_SOURCE_PR_SUMMARY.map((r) => [r.id, r.title, r.role])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        이용약관 · 개인정보 초안 후보
      </h3>
      <SimpleTable
        headers={["항목", "초안 후보 방향", "법무 검토"]}
        rows={TERMS_OF_SERVICE_DRAFT_CANDIDATES.map((r) => [
          r.item,
          r.draftDirection,
          r.legalReview === "critical" ? "필수" : "필요",
        ])}
      />
      <SimpleTable
        headers={["항목", "초안 후보 방향", "상태"]}
        rows={PRIVACY_POLICY_DRAFT_CANDIDATES.map((r) => [
          r.item,
          r.draftDirection,
          DRAFT_CANDIDATE_STATUS_LABEL[r.status],
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        데이터 책임 · AA · 오류 제보
      </h3>
      <SimpleTable
        headers={["항목", "초안 후보 방향"]}
        rows={DATA_RESPONSIBILITY_DRAFT_CANDIDATES.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["항목", "초안 후보 방향"]}
        rows={AA_NOTICE_DRAFT_CANDIDATES.map((r) => [r.item, r.rule])}
      />
      <SimpleTable
        headers={["항목", "초안 후보 방향"]}
        rows={SUPPORT_REPORT_DRAFT_CANDIDATES.map((r) => [r.item, r.rule])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        환불 · 결제/PG 검토 질문
      </h3>
      <SimpleTable
        headers={["질문", "상태"]}
        rows={REFUND_CANCEL_LEGAL_QUESTIONS.map((r) => [
          r.question,
          DRAFT_CANDIDATE_STATUS_LABEL[r.status],
        ])}
      />
      <SimpleTable
        headers={["질문", "상태"]}
        rows={PAYMENT_PG_LEGAL_QUESTIONS.map((r) => [
          r.question,
          DRAFT_CANDIDATE_STATUS_LABEL[r.status],
        ])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        금지 표현 · No-Go · 법무 질문
      </h3>
      <SimpleTable
        headers={["금지 표현", "이유"]}
        rows={INSURANCE_DOMAIN_FORBIDDEN_EXPRESSIONS.map((r) => [r.phrase, r.reason])}
      />
      <SimpleTable
        headers={["상황", "판단"]}
        rows={LEGAL_BETA_NO_GO_CRITERIA.map((r) => [r.situation, r.judgment])}
      />
      <SimpleTable
        headers={["#", "질문"]}
        rows={LEGAL_REVIEWER_QUESTIONS.map((r) => [r.id, r.question])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        정보 부족 · 후속 PR · 체크리스트
      </h3>
      <SimpleTable
        headers={["항목", "비고"]}
        rows={LEGAL_REVIEW_INFO_GAPS.map((r) => [r.item, r.note])}
      />
      <SimpleTable
        headers={["PR", "목적", "위험도", "Codex"]}
        rows={PR175_FOLLOW_UP_PRS.map((r) => [r.id, r.purpose, r.risk, r.codex])}
      />
      <ChecklistTable rows={LEGAL_REVIEW_PREP_CHECKLIST} />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Codex · 연계 허브
      </h3>
      <ul className={`mb-4 list-inside list-disc text-xs text-[#4f5661] ${textStyles.small}`}>
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-2 text-xs text-[#4f5661]">제외: {CODEX_EXCLUDED_SCOPE.join(" · ")}</p>
      <ul className="mb-4 list-inside list-disc text-xs text-[#4f5661]">
        {PR174_LINKED_HUBS.map((hub) => (
          <li key={hub}>
            <a
              className="text-[#1a5fb4] underline hover:text-[#0d3d7a]"
              href={`/${DOC_BASE}${hub}`}
            >
              {hub}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#4f5661]">
        허브:{" "}
        <a
          className="text-[#1a5fb4] underline"
          href={`/${DOC_BASE}PR-174-TERMS-LEGAL-REVIEW-PREP.md`}
        >
          PR-174-TERMS-LEGAL-REVIEW-PREP.md
        </a>
      </p>
    </section>
  );
}

function EntryTable({
  rows,
}: {
  rows: readonly {
    id: string;
    condition: string;
    result: string;
    met: boolean;
  }[];
}) {
  return (
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
          {rows.map((row) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={row.id}>
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

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
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
    status: LegalPrepChecklistStatus;
    id: string;
  }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
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
