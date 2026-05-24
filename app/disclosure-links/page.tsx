import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ContentSection,
  ContentGrid,
  ExternalSourceLink,
  LastVerified,
  PageFrame,
  PageHero,
  PremiumCard,
  RelatedPageLinks,
  SafetyNotice,
  StatusBadge
} from "@/components/content-page";
import {
  disclosureLinkEntries,
  type DisclosureCategory
} from "@/lib/content";

const categoryLabels: Record<DisclosureCategory, string> = {
  product_disclosure: "상품공시",
  policy_terms: "약관",
  claim_guidance: "청구 안내",
  consumer_notice: "소비자 안내",
  regulatory_reference: "규제 참고"
};

export default function DisclosureLinksPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Disclosure Link Center"
        title="공시 및 정책 링크 센터"
        description="보험사와 공공기관의 공식 공시, 약관, 청구 안내 링크를 검증 가능한 방식으로 정리하기 위한 페이지입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <SafetyNotice />
        <p className="mt-6 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#4f5661]">
          현재 항목은 공개 전 구조 확인용입니다. 공식 링크는 원문 출처 기준으로
          검증한 뒤에만 사용자 안내에 활용해야 합니다.
        </p>
        <div className="mt-8">
          <ContentGrid>
            {disclosureLinkEntries.map((entry) => (
              <PremiumCard key={entry.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#7a612d]">
                      {categoryLabels[entry.category]}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#102235]">
                      {entry.title}
                    </h2>
                  </div>
                  <StatusBadge status={entry.verificationStatus} />
                </div>
                <p className="mt-5 text-base leading-7 text-[#4f5661]">
                  {entry.description}
                </p>
                <div className="mt-5 border border-[#e3d5b8] bg-white px-3 py-3 text-sm">
                  <p className="font-semibold text-[#303845]">출처 링크</p>
                  <p className="mt-1">
                    <ExternalSourceLink href={entry.sourceUrl} />
                  </p>
                </div>
                <div className="mt-6 border-t border-[#d9c9a8] pt-4">
                  <LastVerified value={entry.lastVerifiedAt} />
                </div>
              </PremiumCard>
            ))}
          </ContentGrid>
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
