import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ContentSection,
  EmptyValue,
  ExternalSourceLink,
  LastVerified,
  PageFrame,
  PageHero,
  RelatedPageLinks,
  SafetyNotice,
  StatusBadge
} from "@/components/content-page";
import { insurerDirectoryEntries } from "@/lib/content";

const categoryLabels = {
  life: "생명보험",
  non_life: "손해보험"
};

export default function DirectoryPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Insurer Directory"
        title="보험사 실무 디렉터리"
        description="보험설계사가 자주 확인하는 보험사 공식 채널과 연락처를 검증 가능한 구조로 정리하는 공개 페이지입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <SafetyNotice />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {insurerDirectoryEntries.map((insurer) => (
            <article
              className="border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.05)]"
              key={insurer.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7a612d]">
                    {categoryLabels[insurer.category]}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#102235]">
                    {insurer.name}
                  </h2>
                </div>
                <StatusBadge status={insurer.verificationStatus} />
              </div>

              <p className="mt-4 text-base leading-7 text-[#4f5661]">
                {insurer.notes}
              </p>

              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <InfoRow label="공식 홈페이지">
                  <ExternalSourceLink href={insurer.officialWebsiteUrl} />
                </InfoRow>
                <InfoRow label="설계사 포털">
                  <ExternalSourceLink href={insurer.plannerPortalUrl} />
                </InfoRow>
                <InfoRow label="청구 안내">
                  <ExternalSourceLink href={insurer.claimPageUrl} />
                </InfoRow>
                <InfoRow label="고객센터">
                  {insurer.customerCenterPhone ? (
                    <span className="whitespace-nowrap">{insurer.customerCenterPhone}</span>
                  ) : (
                    <EmptyValue />
                  )}
                </InfoRow>
                <InfoRow label="팩스">
                  {insurer.faxNumber ? (
                    <span className="whitespace-nowrap">{insurer.faxNumber}</span>
                  ) : (
                    <EmptyValue />
                  )}
                </InfoRow>
                <InfoRow label="주소">
                  {insurer.mailingAddress ?? <EmptyValue />}
                </InfoRow>
              </dl>

              <div className="mt-6 border-t border-[#d9c9a8] pt-4">
                <LastVerified value={insurer.lastVerifiedAt} />
              </div>
            </article>
          ))}
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="mt-1 break-keep text-[#4f5661]">{children}</dd>
    </div>
  );
}
