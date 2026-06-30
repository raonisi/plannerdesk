import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  ContentSection,
  PageHero,
} from "@/components/content-page";
import { getWorkToolsAccess } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPlannerSignInHref, isPlannerSignInAvailable } from "@/lib/auth/planner-sign-in";

export const dynamic = "force-dynamic";

export default async function FavoritesHubPage() {
  const workToolsAccess = await getWorkToolsAccess();
  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);

  return (
    <AppShell>
      <PageHero
        eyebrow="내 즐겨찾기"
        title="내 즐겨찾기"
        description="자주 쓰는 업무 링크를 한곳에서 다시 확인하세요."
      />
      <ContentSection>
        <div className="space-y-8">
          {!plannerFavoritesEnabled ? (
            <div className="rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-6 sm:p-8">
              <h2 className="text-base font-bold text-[#0F1D2E] sm:text-lg">
                즐겨찾기는 로그인 후 사용할 수 있습니다
              </h2>
              <p className="mt-2 break-keep text-[#4A5565] sm:text-base text-sm">
                설계사 계정으로 로그인하면 자주 쓰는 보험사 전산, 청구서류, 업무 도구를 한곳에서 다시 확인할 수 있습니다.
              </p>
              {isPlannerSignInAvailable() && (
                <div className="mt-6">
                  <Link
                    href={getPlannerSignInHref("/favorites") ?? "/"}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0F1D2E] px-6 text-sm font-semibold text-white transition hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
                  >
                    설계사 로그인
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-6 sm:p-8">
              <h2 className="text-base font-bold text-[#0F1D2E] sm:text-lg">
                아직 저장한 즐겨찾기가 없습니다
              </h2>
              <p className="mt-2 break-keep text-[#4A5565] sm:text-base text-sm">
                보험사 전산, 청구서류, 업무 도구에서 자주 쓰는 항목을 저장하면 이곳에서 빠르게 다시 찾을 수 있습니다.
              </p>
              <p className="mt-4 break-keep text-xs text-[#828D9F] sm:text-sm">
                현재 환경에서는 저장된 즐겨찾기 목록을 불러오는 연결을 확인할 수 없습니다.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/directory"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-6 text-sm font-semibold text-[#0F1D2E] transition hover:bg-[#F8F7F3] hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
                >
                  보험사 전산 보러가기
                </Link>
                <Link
                  href="/claim-documents"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-6 text-sm font-semibold text-[#0F1D2E] transition hover:bg-[#F8F7F3] hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
                >
                  청구서류 보러가기
                </Link>
                <Link
                  href="/work-tools"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-6 text-sm font-semibold text-[#0F1D2E] transition hover:bg-[#F8F7F3] hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
                >
                  업무 도구 보러가기
                </Link>
              </div>
            </div>
          )}
        </div>
      </ContentSection>
    </AppShell>
  );
}
