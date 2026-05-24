import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ContentSection,
  ContentGrid,
  PageFrame,
  PageHero,
  PremiumCard,
  RelatedPageLinks,
  SafetyNotice
} from "@/components/content-page";
import {
  customerMessageTemplates,
  type MessageTone
} from "@/lib/content";

const toneLabels: Record<MessageTone, string> = {
  professional: "전문적",
  warm: "따뜻한",
  concise: "간결한",
  careful: "신중한",
  formal: "격식 있는"
};

export default function MessageTemplatesPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Customer Message Templates"
        title="고객 메시지 템플릿"
        description="반복되는 고객 안내 문장을 차분한 업무 톤으로 준비하는 정적 템플릿 라이브러리입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <SafetyNotice variant="message" />
        <div className="mt-8">
          <ContentGrid>
            {customerMessageTemplates.map((template) => (
              <PremiumCard key={template.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#7a612d]">
                      {toneLabels[template.tone]}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#102235]">
                      {template.title}
                    </h2>
                  </div>
                  <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
                    초안
                  </span>
                </div>
                <p className="mt-5 text-sm font-semibold text-[#303845]">상황</p>
                <p className="mt-1 text-base leading-7 text-[#4f5661]">
                  {template.situation}
                </p>
                <div className="mt-5 border border-[#e3d5b8] bg-white p-4">
                  <p className="whitespace-pre-wrap break-keep text-base leading-8 text-[#303845]">
                    {template.body}
                  </p>
                </div>
                <p className="mt-4 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
                  {template.safetyNote}
                </p>
                <p className="mt-5 whitespace-nowrap text-sm text-[#5f6670]">
                  최종 수정: {template.lastUpdatedAt}
                </p>
              </PremiumCard>
            ))}
          </ContentGrid>
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
