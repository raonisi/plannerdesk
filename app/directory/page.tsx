import {
  ContentSection,
  EmptyState,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicInsurers } from "@/lib/public/insurers";
import { DirectoryExplorer } from "./directory-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "Insurer Work Portal",
  title: "보험사 디렉토리",
  description:
    "전산·청구·고객센터 정보를 한 곳에서 확인하세요.",
  subcopy:
    "공식 확인 후 업데이트되는 정보부터 순차적으로 반영됩니다.",
  footerNote:
    "보험사별 링크와 연락처는 공식 출처 확인 후 업데이트됩니다.",
  verificationNote:
    "“검수 완료” 배지는 공식 출처 검수가 끝난 정보입니다. “검수 필요” 배지가 붙은 보험사는 행동 전 공식 출처를 다시 확인해 주세요.",
  emptyTitle: "공개된 보험사 정보가 아직 없습니다.",
  emptyDescription:
    "관리자 검수 후 순차적으로 업데이트됩니다.",
  errorTitle: "보험사 정보를 불러오지 못했습니다.",
  errorDescription: "잠시 후 다시 확인해 주세요.",
  claim: "청구서류 확인",
  disclosure: "공시·약관 확인",
  moduleDescription:
    "보험사 채널을 확인한 다음에는 청구서류 또는 공시 자료를 이어서 확인하세요.",
  claimDesc:
    "청구서류 구조를 확인하고 고객 안내 전 필수 항목을 정리하세요.",
  disclosureDesc:
    "상품 공시, 약관, 협회 자료, 보험사 공식 자료 경로를 확인하세요.",
};

export default async function DirectoryPage() {
  const [result, claimResult] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
  ]);
  const claimDocuments =
    claimResult.status === "ok" && claimResult.data.length > 0
      ? claimResult.data
      : claimDocumentCandidateFallback;

  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <ContentSection>
        <div className="space-y-8">

          <p className="break-keep text-sm leading-6 text-[#5f6670]">
            {t.subcopy}
          </p>

          {result.status === "error" ? (
            <EmptyState
              title={t.errorTitle}
              description={t.errorDescription}
            />
          ) : result.insurers.length === 0 ? (
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDescription}
            />
          ) : (
            <DirectoryExplorer
              claimDocuments={claimDocuments}
              insurers={result.insurers}
            />
          )}

          <p className="break-keep border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
            {t.footerNote}
          </p>
          <p className="break-keep border-l border-[#c8d2dc] pl-4 text-sm leading-6 text-[#5f6670]">
            {t.verificationNote}
          </p>
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
