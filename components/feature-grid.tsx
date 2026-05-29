const features = [
  {
    title: "보험사 디렉터리",
    eyebrow: "보험사 바로가기",
    description:
      "보험사별 업무 채널, 청구 안내, 담당자가 빠르게 확인해야 하는 공개 정보를 정리합니다.",
    status: "서비스 중",
  },
  {
    title: "청구 서류 라이브러리",
    eyebrow: "청구서류",
    description:
      "민감 문서 업로드 없이, 고객 안내 전 확인할 수 있는 서류 체크리스트와 안내 기준을 제공합니다.",
    status: "서비스 중",
  },
  {
    title: "고객 메시지 템플릿",
    eyebrow: "고객 문구",
    description:
      "반복되는 설명과 리마인드를 전문적이고 차분한 톤의 업무 템플릿으로 관리합니다.",
    status: "서비스 중",
  },
  {
    title: "검증 커뮤니티",
    eyebrow: "커뮤니티",
    description:
      "설계사 검증, 운영 정책, 신고 체계가 확정된 뒤 단계적으로 제공할 예정입니다.",
    status: "준비 중",
  },
  {
    title: "AI 실무 도구",
    eyebrow: "AI 보조",
    description:
      "고객 민감 정보를 입력하지 않는 범위에서 문장 정리와 업무 리서치 보조부터 검토합니다.",
    status: "준비 중",
  },
  {
    title: "성장 리소스",
    eyebrow: "지식 아카이브",
    description:
      "영업 습관, 보장 점검, 고객 관리 루틴을 장기적으로 축적하는 지식 허브를 지향합니다.",
    status: "준비 중",
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature) => (
        <article
          className="rounded-xl border border-[#E3DED4] bg-white p-6 shadow-sm"
          key={feature.title}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#B9975B]">
              {feature.eyebrow}
            </p>
            <p className="rounded-md border border-[#E3DED4] px-2 py-1 text-xs font-medium text-[#5B6470]">
              {feature.status}
            </p>
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[#0F1D2E]">{feature.title}</h3>
          <p className="mt-4 text-base leading-7 text-[#5B6470]">{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
