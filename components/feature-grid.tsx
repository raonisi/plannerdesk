const features = [
  {
    title: "보험사 디렉터리",
    eyebrow: "Directory",
    description:
      "보험사별 업무 채널, 청구 안내, 담당자가 빠르게 확인해야 하는 공개 정보를 정리합니다.",
    status: "MVP placeholder"
  },
  {
    title: "청구 서류 라이브러리",
    eyebrow: "Claims",
    description:
      "민감 문서 업로드 없이, 고객 안내 전 확인할 수 있는 서류 체크리스트와 안내 기준을 제공합니다.",
    status: "MVP placeholder"
  },
  {
    title: "고객 메시지 템플릿",
    eyebrow: "Messaging",
    description:
      "반복되는 설명과 리마인드를 전문적이고 차분한 톤의 업무 템플릿으로 관리합니다.",
    status: "MVP placeholder"
  },
  {
    title: "검증 커뮤니티",
    eyebrow: "Community",
    description:
      "설계사 검증, 운영 정책, 신고 체계가 확정된 뒤 단계적으로 제공할 예정입니다.",
    status: "Future"
  },
  {
    title: "AI 실무 도구",
    eyebrow: "AI Tools",
    description:
      "고객 민감 정보를 입력하지 않는 범위에서 문장 정리와 업무 리서치 보조부터 검토합니다.",
    status: "Future"
  },
  {
    title: "성장 리소스",
    eyebrow: "Growth",
    description:
      "영업 습관, 보장 점검, 고객 관리 루틴을 장기적으로 축적하는 지식 허브를 지향합니다.",
    status: "Future"
  }
];

export function FeatureGrid() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.06)]"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
              {feature.eyebrow}
            </p>
            <p className="border border-[#d9c9a8] px-2 py-1 text-xs font-medium text-[#4f5661]">
              {feature.status}
            </p>
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[#102235]">
            {feature.title}
          </h3>
          <p className="mt-4 text-base leading-7 text-[#4f5661]">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}
