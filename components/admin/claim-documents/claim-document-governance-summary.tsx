import type { ClaimDocumentGovernanceSummary } from "@/lib/claim-documents/governance-types";

const SUMMARY_CARDS = [
  {
    key: "total" as const,
    title: "전체 PDF",
    description: "현재 등록된 청구서류 PDF",
  },
  {
    key: "verifiedComplete" as const,
    title: "검수 완료",
    description: "공식 URL과 검수일이 확인된 문서",
  },
  {
    key: "needsReview" as const,
    title: "재검수 필요",
    description: "검수 상태 확인이 필요한 문서",
  },
  {
    key: "missingOfficialUrl" as const,
    title: "공식 URL 누락",
    description: "공식 확인 링크가 아직 등록되지 않은 문서",
  },
];

export function ClaimDocumentGovernanceSummary({
  summary,
}: {
  summary: ClaimDocumentGovernanceSummary;
}) {
  return (
    <section
      aria-label="청구서류 governance 요약"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {SUMMARY_CARDS.map((card) => (
        <article
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          key={card.key}
        >
          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {summary[card.key].toLocaleString("ko-KR")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}
