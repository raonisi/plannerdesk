import {
  ContentSection,
  EmptyState,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "Claim Document Desk",
  title: "청구서류 라이브러리",
  description: "청구 유형별 필요서류와 공식 출처를 한 곳에서 확인하세요.",
  subcopy:
    "보험금 지급 여부나 지급 금액을 판단하는 내용이 아니며, 보험사와 약관 기준 확인이 필요합니다.",
  workflowTitle: "고객 안내 전 공식 기준을 다시 확인하는 흐름",
  directory: "보험사 바로가기",
  message: "고객 문구 확인",
  footerNote:
    "청구서류와 필요 기준은 보험사 및 약관에 따라 달라질 수 있습니다. 공개 정보는 공식 출처 확인 후 순차적으로 업데이트됩니다.",
};

const workflowSteps = [
  "청구 유형 및 카테고리를 먼저 확인합니다.",
  "보험사별 공식 안내 및 제출 경로를 대조합니다.",
  "상품별 필수 서류와 선택/추가 서류 목록을 검토합니다.",
  "보험금 지급을 보장하거나 예단하는 확정적 표현을 지양합니다.",
];

export default async function ClaimDocumentsPage() {
  const result = await getPublicClaimDocuments();

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
              title="청구서류 정보를 불러오지 못했습니다."
              description="잠시 후 다시 확인해 주세요."
            />
          ) : result.data.length === 0 ? (
            <EmptyState
              title="공개된 청구서류 안내가 아직 없습니다."
              description="관리자 검수 후 순차적으로 업데이트됩니다."
            />
          ) : (
            <ClaimDocumentExplorer documents={result.data} />
          )}

          <section className="grid gap-4 border-y border-[#d9c9a8] py-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
                Planner workflow
              </p>
              <h2 className="mt-3 break-keep text-3xl font-semibold leading-tight text-[#102235]">
                {t.workflowTitle}
              </h2>
              <p className="mt-4 break-keep text-sm leading-6 text-[#4f5661]">
                이 안내서류 정보는 참고용이며, 실제 보험금 지급 여부나 세부 금액은
                보험사의 약관 및 최종 심사 결과가 우선합니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <div className="border border-[#e3d5b8] bg-white p-4" key={step}>
                  <p className="text-sm font-semibold text-[#7a612d]">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <p className="break-keep border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
            {t.footerNote}
          </p>

          <MvpModuleLinks
            description="청구 필요서류 확인 완료 후 보험사 공식 채널 및 고객용 안내 메시지 템플릿 화면으로 연결하여 사용 가능합니다."
            items={[
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 공식 웹사이트, 콜센터, 팩스 및 청구 접수 페이지 정보를 확인합니다.",
              },
              {
                href: "/message-templates",
                label: t.message,
                description:
                  "고객에게 서류를 요청하기 전 안전성이 검증된 상황별 문구 템플릿을 참고합니다.",
              },
            ]}
          />

          <MvpSafetyNotice />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
