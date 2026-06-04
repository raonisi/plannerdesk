import {
  FEATURE_MONETIZATION_ROWS,
  LEGAL_REVIEW_ITEMS,
  MONETIZATION_STAGE_ROWS,
  PAYMENT_PII_RISK_ROWS,
  PAYMENT_READINESS_CHECKLIST,
  PAYMENT_VERDICT_LABEL,
  PG_REVIEW_ROWS,
  PR145_DEFERRED_IMPLEMENTATION,
  PR145_DEFERRED_PRS,
  PR145_FORBIDDEN_DOC_CONTENT,
  PR145_LINKED_DOCS,
  PR145_OVERALL_CONDITIONS,
  PR145_OVERALL_VERDICTS,
  PR145_SCOPE_NOTICE,
  REFUND_SUBSCRIPTION_ROWS,
  type PaymentCheckStatus,
  type PaymentVerdict,
} from "@/lib/ops/payment-feasibility";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const VERDICT_TONE: Record<PaymentVerdict, string> = {
  go: "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  conditional_go: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  no_go: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
  review_only: "border-[#d6d8dc] bg-[#eef3f7] text-[#102235]",
};

const CHECK_TONE: Record<PaymentCheckStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECK_LABEL: Record<PaymentCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

const RISK_TONE: Record<string, string> = {
  low: "text-[#1f6b55]",
  medium: "text-[#7a612d]",
  high: "text-[#8b2e2e]",
  critical: "text-[#8b2e2e] font-bold",
};

export default function AdminPaymentFeasibilityPanel() {
  const gapCount = PAYMENT_READINESS_CHECKLIST.filter((c) => c.status === "gap").length;

  return (
    <section className="mb-8" aria-labelledby="admin-payment-feasibility">
      <h2
        id="admin-payment-feasibility"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        결제·유료화 가능성 검토 (PR145)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR145_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR145_FORBIDDEN_DOC_CONTENT}
      </p>

      <div
        className={`mb-4 rounded-lg border px-4 py-3 ${VERDICT_TONE[PR145_OVERALL_VERDICTS.formalMonetization]}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          유료화 판단 (PR140 연계)
        </p>
        <p className="mt-1 text-sm font-bold">
          유료화 검토: {PAYMENT_VERDICT_LABEL[PR145_OVERALL_VERDICTS.feasibilityReview]}
        </p>
        <p className="text-sm font-bold">
          제한 유료 베타: {PAYMENT_VERDICT_LABEL[PR145_OVERALL_VERDICTS.limitedPaidBeta]}
        </p>
        <p className="text-sm font-bold">
          정식 유료화: {PAYMENT_VERDICT_LABEL[PR145_OVERALL_VERDICTS.formalMonetization]}
        </p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
          {PR145_OVERALL_CONDITIONS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="체크리스트 미충족" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
        <StatTile label="결제 구현" value="없음" tone="ok" />
        <StatTile label="가격 확정" value="없음" tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        유료화 단계
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">단계</th>
              <th className="px-3 py-2">의미</th>
              <th className="px-3 py-2">허용</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {MONETIZATION_STAGE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.stage}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.meaning}</td>
                <td className="px-3 py-2">{row.allowed}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.forbidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        기능별 유료화 검토 (가격 미확정)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기능</th>
              <th className="px-3 py-2">무료 베타</th>
              <th className="px-3 py-2">유료 후보</th>
              <th className="px-3 py-2">전제</th>
              <th className="px-3 py-2">리스크</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_MONETIZATION_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.feature}</td>
                <td className="px-3 py-2">{row.freeBeta}</td>
                <td className="px-3 py-2">{row.paidCandidate}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.precondition}</td>
                <td className={`px-3 py-2 ${RISK_TONE[row.risk]}`}>{row.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        결제/PG 검토 항목
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">검토</th>
              <th className="px-3 py-2">PR145</th>
            </tr>
          </thead>
          <tbody>
            {PG_REVIEW_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2">{row.review}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.pr145}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        환불·해지·구독 (확정 금지)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">검토</th>
            </tr>
          </thead>
          <tbody>
            {REFUND_SUBSCRIPTION_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criteria}</td>
                <td className="px-3 py-2">{row.review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        결제·개인정보·세금 리스크
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">정보</th>
              <th className="px-3 py-2">리스크</th>
              <th className="px-3 py-2">PR145</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENT_PII_RISK_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.field}
              >
                <td className="px-3 py-2 font-semibold">{row.field}</td>
                <td className="px-3 py-2">{row.risk}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.pr145Rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        법무 검토 항목 (확정 없음)
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {LEGAL_REVIEW_ITEMS.map((item) => (
          <li key={item.id}>
            {item.topic} — {item.note} ({item.status})
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Payment Readiness Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {PAYMENT_READINESS_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 font-semibold ${CHECK_TONE[row.status]}`}
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
        별도 PR (PR145-A 이후)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">PR</th>
              <th className="px-3 py-2">목적</th>
              <th className="px-3 py-2">위험</th>
              <th className="px-3 py-2">Codex</th>
            </tr>
          </thead>
          <tbody>
            {PR145_DEFERRED_PRS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.id}</td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">{row.risk}</td>
                <td className="px-3 py-2">{row.codex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        보류 구현
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR145_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR145_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-145-PAYMENT-FEASIBILITY-OPS.md`}
          >
            PR-145-PAYMENT-FEASIBILITY-OPS.md
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
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
