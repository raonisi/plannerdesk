import { Suspense } from "react";
import {
  ContentSection,
  EmptyState,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "Claim Document Desk",
  title: "청구서류 라이브러리",
  description: "청구 유형별 필요서류와 공식 출처를 한 곳에서 확인해 주세요.",
  subcopy:
    "보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다. 청구 전 보험사 또는 약관 확인이 필요합니다.",
  workflowTitle: "고객 안내 전 공식 기준을 다시 확인하는 흐름",
  directory: "보험사 바로가기",
  message: "고객 문구 확인",
  footerNote:
    "필요서류는 보험사 및 약관에 따라 달라질 수 있습니다. 공개 정보는 공식 확인 후 업데이트 예정 상태를 포함할 수 있으므로 청구 전 다시 확인해 주세요.",
};

const workflowSteps = [
  "청구 유형과 카테고리를 먼저 확인합니다.",
  "보험사 공식 안내와 제출 경로를 함께 검토합니다.",
  "필수 서류와 선택 또는 추가 서류 목록을 구분해 안내합니다.",
  "보험금 지급 여부나 지급 금액을 판단하는 표현은 사용하지 않습니다.",
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
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <ContentSection>
        <div className="space-y-8">
          <p className="break-keep text-sm font-medium leading-relaxed text-slate-500">
            {t.subcopy}
          </p>

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

          <section className="grid gap-6 border-y border-slate-200 py-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                Planner workflow
              </p>
              <h2 className="mt-3 break-keep text-3xl font-bold tracking-tight leading-tight text-slate-900">
                {t.workflowTitle}
              </h2>
              <p className="mt-5 break-keep text-sm font-medium leading-relaxed text-slate-500">
                이 안내 서류 정보는 실무 참고용이며, 실제 보험금 지급 여부나
                지급 금액은 보험사 기준과 최종 심사 결과가 우선합니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" key={step}>
                  <p className="text-[13px] font-bold tracking-widest text-indigo-600">
                    STEP {index + 1}
                  </p>
                  <p className="mt-3 break-keep text-sm font-medium leading-relaxed text-slate-600">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <p className="break-keep border-l-2 border-indigo-500 pl-4 text-sm font-medium leading-relaxed text-slate-600">
            {t.footerNote}
          </p>

          <MvpModuleLinks
            description="청구 필요서류 확인 후에는 보험사 공식 채널과 고객 안내 메시지 템플릿 화면으로 연결해 사용할 수 있습니다."
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
                  "고객에게 서류를 요청하기 전 차분한 상황별 문구 템플릿을 참고합니다.",
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
