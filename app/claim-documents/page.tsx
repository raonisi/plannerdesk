import { Suspense } from "react";
import {
  ContentSection,
  EmptyState,
  PageFrame,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "청구서류",
  title: "청구서류 라이브러리",
  description: "보험사별·청구 유형별 필요서류와 공식 PDF 양식을 한 곳에서 빠르게 확인하세요.",
  subcopy:
    "※ 보험금 지급 여부나 지급 금액을 최종 판단하는 기준이 아닙니다. 실제 청구 접수 전 해당 보험사 약관을 다시 확인해 주세요.",
  workflowTitle: "고객 안내 전 공식 기준 필요서류 확인 흐름",
  directory: "보험사 바로가기",
  message: "고객 문구 확인",
};

const workflowSteps = [
  "고객의 청구 유형과 사고 원인 카테고리를 먼저 분류합니다.",
  "보험사 공식 제출 경로와 팩스/우편 번호를 재확인합니다.",
  "필수 제출 서류와 상황별 선택/추가 서류 목록을 구분해 정리합니다.",
  "보험금 지급 판단 또는 임의의 추정 금액을 안내하지 않도록 유의합니다."
];

export default async function ClaimDocumentsPage() {
  const result = await getPublicClaimDocuments();
  const documents = result.status === "ok" ? result.data : [];
  const visibleDocuments =
    documents.length > 0 ? documents : claimDocumentCandidateFallback;
  const dbError = result.status === "error" && claimDocumentCandidateFallback.length === 0;

  return (
    <PageFrame>
      <Header />
      
      {/* 히어로 영역 */}
      <section className="bg-[#0F1D2E] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
            {t.eyebrow}
          </span>
          <h1 className="mt-3 break-keep text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-3 max-w-3xl break-keep text-xs leading-relaxed text-slate-400">
            {t.subcopy}
          </p>
        </div>
      </section>

      <ContentSection>
        <div className="space-y-8">
          {dbError ? (
            <EmptyState
              title="청구서류 정보를 불러오지 못했습니다."
              description="잠시 후 다시 확인해 주세요."
            />
          ) : visibleDocuments.length === 0 ? (
            <EmptyState
              title="공개된 청구서류 안내가 아직 없습니다."
              description="관리자 검수 후 순차적으로 업데이트됩니다."
            />
          ) : (
            <Suspense fallback={null}>
              <ClaimDocumentExplorer documents={visibleDocuments} />
            </Suspense>
          )}

          {/* 실무자 확인 프로세스 */}
          <section className="rounded-xl border border-[#E3DED4] bg-white p-6 shadow-sm">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
              설계사 실무 흐름
            </span>
            <h2 className="mt-2 break-keep text-base font-bold text-[#0F1D2E]">
              {t.workflowTitle}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <div className="rounded-lg border border-slate-100 bg-[#F8F7F3] p-4 shadow-sm" key={step}>
                  <p className="text-[11px] font-bold tracking-widest text-[#B9975B]">
                    {index + 1}단계
                  </p>
                  <p className="mt-2 break-keep text-xs font-semibold leading-relaxed text-slate-600">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <MvpModuleLinks
            description="청구 필요서류 확인 후에는 공식 팩스/우편 접수처 주소 및 고객 상황별 안내 메시지 발송 기능으로 바로 연결할 수 있습니다."
            items={[
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 공식 콜센터 번호와 팩스/우편접수처 정보를 확인합니다.",
              },
              {
                href: "/message-templates",
                label: t.message,
                description:
                  "고객 상황(서류 보완, 신규 접수 등)에 맞춰 준비된 알림 톡 멘트 템플릿으로 연결합니다.",
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
