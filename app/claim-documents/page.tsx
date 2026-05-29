import { Suspense } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ContentSection,
  EmptyState,
  PageHero,
} from "@/components/content-page";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "청구서류",
  title: "청구서류 찾기",
  description: "보험사별 보험금청구서와 필요서류를 빠르게 확인하세요.",
};

export default async function ClaimDocumentsPage() {
  const result = await getPublicClaimDocuments();
  const documents = result.status === "ok" ? result.data : [];
  const visibleDocuments =
    documents.length > 0 ? documents : claimDocumentCandidateFallback;
  const dbError =
    result.status === "error" && claimDocumentCandidateFallback.length === 0;

  return (
    <AppShell>
      <PageHero
        description={t.description}
        eyebrow={t.eyebrow}
        title={t.title}
      />
      <ContentSection>
        <div className="space-y-6">
          {dbError ? (
            <EmptyState
              description="잠시 후 다시 확인해 주세요."
              title="청구서류 정보를 불러오지 못했습니다."
            />
          ) : visibleDocuments.length === 0 ? (
            <EmptyState
              description="관리자 검수 후 순차적으로 업데이트됩니다."
              title="공개된 청구서류 안내가 아직 없습니다."
            />
          ) : (
            <Suspense fallback={null}>
              <ClaimDocumentExplorer documents={visibleDocuments} />
            </Suspense>
          )}

          <ClaimPracticeNotice />

          <div className="mt-8 rounded-xl border border-[#E3DED4] bg-[#F8F7F3] p-5 sm:p-6">
            <h3 className="text-base font-bold text-[#0F1D2E]">관련 업무 바로가기</h3>
            <p className="mt-1 text-sm text-[#5B6470] break-keep">청구서류 확인 후 다음 단계 실무를 빠르게 진행하세요.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/message-templates"
                className="flex flex-col rounded-lg border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:shadow-sm"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">고객 안내문 작성</span>
                <span className="mt-1 text-xs text-[#5B6470]">청구 안내 문구 복사</span>
              </Link>
              <Link
                href="/directory"
                className="flex flex-col rounded-lg border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:shadow-sm"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">보험사 연락처</span>
                <span className="mt-1 text-xs text-[#5B6470]">콜센터·팩스번호 조회</span>
              </Link>
              <Link
                href="/disclosure-links"
                className="flex flex-col rounded-lg border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:shadow-sm"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">공시·약관 확인</span>
                <span className="mt-1 text-xs text-[#5B6470]">공식 약관 원문 연결</span>
              </Link>
              <Link
                href="/work-tools"
                className="flex flex-col rounded-lg border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:shadow-sm"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">전체 실무 도구</span>
                <span className="mt-1 text-xs text-[#5B6470]">기타 계산기 및 도구</span>
              </Link>
            </div>
          </div>
        </div>
      </ContentSection>
    </AppShell>
  );
}

function ClaimPracticeNotice() {
  return (
    <details className="group rounded-xl border border-[#E3DED4] bg-white p-5 shadow-sm">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-bold text-[#0F1D2E]">실무 참고 기준</p>
          <p className="mt-1 break-keep text-sm leading-6 text-[#5B6470]">
            필요할 때만 펼쳐 확인하는 청구서류 안내 기준입니다.
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
          펼치기
        </span>
        <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
          접기
        </span>
      </summary>
      <ul className="mt-4 space-y-2 border-t border-[#E3DED4] pt-4 text-sm leading-6 text-[#5B6470]">
        <li>보험금 지급 여부는 보험사 심사 결과에 따라 달라집니다.</li>
        <li>지급 금액을 단정하거나 예상 금액을 안내하지 않습니다.</li>
        <li>청구서류와 접수 기준은 보험사 공식 안내를 최종 확인합니다.</li>
        <li>고객의 의료정보와 개인정보는 필요한 범위에서만 안내합니다.</li>
        <li>문구 복사는 안내 보조용이며 최종 판단은 보험사 기준에 따릅니다.</li>
      </ul>
    </details>
  );
}
