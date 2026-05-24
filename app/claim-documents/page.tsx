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
  claimDocumentEntries,
  insurerDirectoryEntries,
  type ClaimDocumentEntry,
  type ClaimType
} from "@/lib/content";

const claimTypeLabels: Record<ClaimType, string> = {
  actual_medical: "실손의료",
  hospitalization: "입원",
  surgery: "수술",
  diagnosis: "진단",
  fracture: "골절",
  medication: "약제",
  common: "공통"
};

const claimTypeOrder: ClaimType[] = [
  "common",
  "actual_medical",
  "hospitalization",
  "surgery",
  "diagnosis",
  "fracture",
  "medication"
];

const insurerNameById = new Map(
  insurerDirectoryEntries.map((insurer) => [insurer.id, insurer.name])
);

export default function ClaimDocumentsPage() {
  const groups = claimTypeOrder
    .map((claimType) => ({
      claimType,
      entries: claimDocumentEntries.filter((entry) => entry.claimType === claimType)
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Claim Document Library"
        title="청구 서류 라이브러리"
        description="보험금 청구 전 필요한 서류명과 공식 출처를 확인하기 위한 정적 페이지입니다. 현재 데이터는 구조 검증용 초안입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <SafetyNotice variant="claim" />
        <div className="mt-8 space-y-8">
          {groups.map((group) => (
            <section key={group.claimType}>
              <h2 className="text-2xl font-semibold text-[#102235]">
                {claimTypeLabels[group.claimType]}
              </h2>
              <div className="mt-4">
                <ContentGrid>
                  {group.entries.map((entry) => (
                    <ClaimDocumentCard entry={entry} key={entry.id} />
                  ))}
                </ContentGrid>
              </div>
            </section>
          ))}
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}

function ClaimDocumentCard({ entry }: { entry: ClaimDocumentEntry }) {
  const insurerName = entry.insurerId
    ? insurerNameById.get(entry.insurerId) ?? "보험사 확인 필요"
    : "공통 기준";

  return (
    <PremiumCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a612d]">{insurerName}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102235]">
            {entry.title}
          </h3>
        </div>
        <StatusBadge status={entry.verificationStatus} />
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="border border-[#e3d5b8] bg-white px-3 py-3">
          <dt className="font-semibold text-[#303845]">서류명</dt>
          <dd className="mt-1 break-keep text-[#4f5661]">{entry.documentName}</dd>
        </div>
        <div className="border border-[#e3d5b8] bg-white px-3 py-3">
          <dt className="font-semibold text-[#303845]">출처</dt>
          <dd className="mt-1">
            <ExternalSourceLink href={entry.sourceUrl} />
          </dd>
        </div>
      </dl>
      <p className="mt-5 text-base leading-7 text-[#4f5661]">{entry.description}</p>
      <p className="mt-4 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
        {entry.cautionNote}
      </p>
      <div className="mt-6 border-t border-[#d9c9a8] pt-4">
        <LastVerified value={entry.lastVerifiedAt} />
      </div>
    </PremiumCard>
  );
}
