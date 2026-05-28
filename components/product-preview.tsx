import Link from "next/link";

interface ProductPreviewProps {
  insurerCount: number;
  claimDocumentCount: number;
  messageTemplateCount: number;
  disclosureLinkCount: number;
}

export function ProductPreview({
  insurerCount,
  claimDocumentCount,
  messageTemplateCount,
  disclosureLinkCount,
}: ProductPreviewProps) {
  const stats = [
    { label: "보험사 수", count: insurerCount },
    { label: "청구서류", count: claimDocumentCount },
    { label: "안내 문구", count: messageTemplateCount },
    { label: "공시·약관", count: disclosureLinkCount },
  ];

  const actions = [
    { label: "보험사 바로가기", href: "/directory", description: "전산접속 및 청구팩스 확인" },
    { label: "청구서류 확인", href: "/claim-documents", description: "보험사별 필수서류 조회" },
    { label: "공시·약관 찾기", href: "/disclosure-links", description: "상품공시 및 공식약관 연결" },
    { label: "고객 문구 찾기", href: "/message-templates", description: "안내 상황별 멘트 참고" },
  ];

  return (
    <div className="w-full border border-[#efe4cf]/20 bg-[#fbf7ee] p-5 text-[#18202b] shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="border-b border-[#d9c9a8] pb-4">
        <h2 className="text-2xl font-semibold text-[#102235]">
          실무 빠른 실행
        </h2>
        <p className="mt-1 text-sm text-[#5f6670]">
          보험사 기준으로 필요한 업무를 빠르게 확인하세요.
        </p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid gap-3 py-5 grid-cols-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-[#d9c9a8] bg-[#f7f1e5] p-3 text-center">
            <p className="text-2xl font-bold text-[#102235]">{stat.count}</p>
            <p className="mt-1 text-xs font-semibold text-[#4f5661]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links Menu */}
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col justify-center border border-[#d9c9a8] bg-white px-4 py-3 transition hover:border-[#aa8137] hover:bg-[#fdfbf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#aa8137]"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#102235] group-hover:text-[#7a612d]">
                {action.label}
              </span>
              <span className="text-xs text-[#7a612d] transition-transform group-hover:translate-x-1">
                바로가기 →
              </span>
            </div>
            <span className="mt-0.5 text-xs text-[#5f6670]">{action.description}</span>
          </Link>
        ))}
      </div>

      {/* Next Action / Guide */}
      <div className="mt-5 bg-[#102235] p-4 text-[#fbf7ee]">
        <p className="text-xs uppercase tracking-wider text-[#d8c08f]">안내 사항</p>
        <p className="mt-1.5 text-sm leading-relaxed font-semibold break-keep">
          보험사를 먼저 선택하면 전산 링크, 청구안내, 공시 자료를 함께 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

