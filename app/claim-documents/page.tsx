import { ContentSection, PageFrame, PageHero, RelatedPageLinks } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { claimDocumentEntries, insurerDirectoryEntries } from "@/lib/content";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

const workflowSteps = [
  "먼저 청구 유형을 확인합니다.",
  "보험사별 공식 출처가 있는지 확인합니다.",
  "공식 보험사 서류 기준을 다시 검증합니다.",
  "고객에게는 단정하지 않는 안전한 문구로 안내합니다."
];

export default function ClaimDocumentsPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Claim Document Desk"
        title="청구서류 창고"
        description="보험설계사가 청구 유형과 보험사 맥락에 맞춰 필요한 서류 참고 정보를 빠르게 확인하기 위한 실무형 문서 라이브러리입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <div className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
          <p className="text-sm font-semibold text-[#102235]">검수 안내</p>
          <p className="mt-2 text-sm leading-6 text-[#4f5661]">
            현재 일부 정보는 검수 전 샘플 데이터입니다. 실제 고객 안내 또는 제출
            전 공식 보험사 기준 확인이 필요합니다.
          </p>
        </div>

        <ClaimDocumentExplorer
          documents={claimDocumentEntries}
          insurers={insurerDirectoryEntries}
        />

        <section className="mt-10 grid gap-4 border-y border-[#d9c9a8] py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
              Planner Workflow
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#102235]">
              고객 안내 전, 공식 기준을 다시 확인하는 흐름
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#4f5661]">
              이 페이지는 청구 성공을 보장하지 않습니다. 보험사 심사 결과에 따라
              달라질 수 있으며 전문가 검토가 필요한 사례가 있을 수 있습니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <div className="border border-[#e3d5b8] bg-white p-4" key={step}>
                <p className="text-sm font-semibold text-[#7a612d]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#4f5661]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border border-[#d9c9a8] bg-[#fbf7ee] p-5">
          <p className="text-sm font-semibold text-[#102235]">안전 및 업무 경계</p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#4f5661] sm:grid-cols-2">
            <li>PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.</li>
            <li>PlannerDesk는 보험금 액수를 추정하지 않습니다.</li>
            <li>PlannerDesk는 손해사정 업무를 수행하지 않습니다.</li>
            <li>PlannerDesk는 이 MVP에서 고객 의료 문서를 처리하지 않습니다.</li>
            <li>청구 관련 정보는 실무 참고용입니다.</li>
            <li>최종 청구 심사는 보험사가 수행합니다.</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-[#7a612d]">
            공식 보험사 요구사항은 상품, 약관, 청구 유형, 심사 절차에 따라
            달라질 수 있습니다.
          </p>
        </section>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
