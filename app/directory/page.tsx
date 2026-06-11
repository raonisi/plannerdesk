import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PublicErrorReportNotice } from "@/components/content/public-error-report-notice";
import { WorkToolsPlannerNoticeCard } from "@/components/content/work-tools-planner-notice";
import { DataResponsibilityInlineNotice } from "@/components/content/data-responsibility-inline-notice";
import {
  ContentSection,
  EmptyState,
  PageHero,
} from "@/components/content-page";
import { getWorkToolsAccess } from "@/lib/auth/access";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPublicClaimDocuments } from "@/lib/public/claim-documents";
import { getPublicInsurers } from "@/lib/public/insurers";
import { DirectoryExplorer } from "./directory-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "보험사 디렉토리",
  title: "보험사 디렉토리",
  description:
    "전산 바로가기, 청구안내, 공식 홈페이지, 공시·헬프데스크를 목적별로 확인하세요.",
  subcopy:
    "링크는 공식 출처 확인 후 반영됩니다. 확인 전 항목은 정상 링크로 표시하지 않습니다.",
  footerNote:
    "보험사별 링크와 연락처는 공식 출처 확인 후 업데이트됩니다.",

  emptyTitle: "공개된 보험사 정보가 아직 없습니다.",
  emptyDescription:
    "공개 검수가 완료된 보험사 링크가 준비되면 순차적으로 표시됩니다.",
  errorTitle: "보험사 정보를 불러오지 못했습니다.",
  errorDescription:
    "잠시 후 다시 확인해 주세요. 문제가 계속되면 통합 검색 또는 청구서류 메뉴를 이용해 주세요.",
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
  const [result, claimResult, workToolsAccess] = await Promise.all([
    getPublicInsurers(),
    getPublicClaimDocuments(),
    getWorkToolsAccess(),
  ]);
  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);
  const claimDocuments =
    claimResult.status === "ok" && claimResult.data.length > 0
      ? claimResult.data
      : claimDocumentCandidateFallback;

  return (
    <AppShell>
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

          <DataResponsibilityInlineNotice variant="directory" />

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
              plannerFavoritesEnabled={plannerFavoritesEnabled}
            />
          )}

          <p className="break-keep border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
            {t.footerNote}
          </p>

          <aside
            className="rounded-xl border border-[#E3DED4] bg-[#F8F7F3] p-5 sm:p-6"
            role="note"
          >
            <h3 className="text-base font-bold text-[#0F1D2E]">관련 업무 바로가기</h3>
            <p className="mt-1 break-keep text-sm text-[#5B6470]">
              {t.moduleDescription}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                className="flex min-h-[5.5rem] flex-col rounded-lg border border-[#E3DED4] bg-white p-4 transition hover:border-[#B9975B] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
                href="/claim-documents"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">{t.claim}</span>
                <span className="mt-1 text-xs text-[#5B6470] break-keep">{t.claimDesc}</span>
              </Link>
              <Link
                className="flex min-h-[5.5rem] flex-col rounded-lg border border-[#E3DED4] bg-white p-4 transition hover:border-[#B9975B] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
                href="/disclosure-links"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">{t.disclosure}</span>
                <span className="mt-1 text-xs text-[#5B6470] break-keep">{t.disclosureDesc}</span>
              </Link>
              <Link
                className="flex min-h-[5.5rem] flex-col rounded-lg border border-[#E3DED4] bg-white p-4 transition hover:border-[#B9975B] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
                href="/message-templates"
              >
                <span className="text-sm font-bold text-[#0F1D2E]">고객 안내문 확인</span>
                <span className="mt-1 text-xs text-[#5B6470] break-keep">
                  상황별 안내 문구 복사
                </span>
              </Link>
              <WorkToolsPlannerNoticeCard />
            </div>
            <p className="mt-4 break-keep text-xs leading-relaxed text-[#5B6470]">
              보험사별 링크와 연락처는 공식 출처 기준으로 확인 후 사용하세요.
              PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다.
              고객 개인정보와 의료자료는 PlannerDesk에 입력하지 마세요.
            </p>
          </aside>

          <PublicErrorReportNotice />
        </div>
      </ContentSection>
    </AppShell>
  );
}
