import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import {
  getBetaExpansionOperationalBanner,
  loadBetaExpansionDecisionReport,
} from "@/lib/answer-assistant/beta-expansion-decision";
import type { BetaExpansionDecisionSearchParams } from "@/lib/answer-assistant/beta-expansion-decision";
import BetaExpansionDecisionView from "@/components/admin/answer-assistant/BetaExpansionDecisionView";
import { borders, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 Beta 확대 판단 | PlannerDesk Admin",
  description:
    "allowlist beta 운영 집계를 바탕으로 확대 여부 판단 자료를 제공합니다. 자동 확대·gate ON은 수행하지 않습니다.",
  robots: { index: false, follow: false },
};

export default async function AdminAnswerAssistantBetaDecisionPage({
  searchParams,
}: {
  searchParams: Promise<BetaExpansionDecisionSearchParams>;
}) {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return (
      <AdminAccessDeniedState email={access.session.user?.email ?? null} />
    );
  }

  const resolved = await searchParams;
  let report = null;
  let loadFailed = false;

  try {
    report = await loadBetaExpansionDecisionReport(resolved);
  } catch {
    loadFailed = true;
  }

  const banner = getBetaExpansionOperationalBanner();

  return (
    <div className={`min-h-[100dvh] ${surfaces.page}`}>
      <header
        className={`${surfaces.hero} border-b ${borders.divider} px-6 py-4 sm:px-8`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#d8c08f]">
              PlannerDesk Admin
            </p>
            <h1 className="text-xl font-bold text-white">
              답변 보조 · Beta 확대 판단
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/audit"
            >
              Usage Audit
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/feedback"
            >
              Beta 피드백
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/expansion-plan"
            >
              확대 계획
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/cleanup"
            >
              Retention
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant"
            >
              답변 보조 도구
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin"
            >
              관리자 홈
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <p className={`${textStyles.body} max-w-3xl`}>
          PR-99-B allowlist beta, usage audit, feedback safety review, retention
          cleanup 집계를 종합해 <strong>다음 운영 방향 판단 자료</strong>만 제공합니다.
          beta 확대 실행·allowlist 자동 변경·feature gate 자동 ON은 이 화면에서
          수행하지 않습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="집계·권고만 표시합니다. raw prompt/output, 생성 초안, 고객·의료·계약 정보는 조회·저장하지 않습니다."
            showNeedsReview={false}
          />
        </div>

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mt-6" />
        ) : report ? (
          <div className="mt-8">
            <BetaExpansionDecisionView
              report={report}
              filters={resolved}
              banner={banner}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
