import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { loadAllowlistExpansionPlanReport } from "@/lib/answer-assistant/allowlist-expansion-plan";
import type { BetaExpansionDecisionSearchParams } from "@/lib/answer-assistant/beta-expansion-decision";
import AllowlistExpansionPlanView from "@/components/admin/answer-assistant/AllowlistExpansionPlanView";
import { borders, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 Allowlist 확대 계획 | PlannerDesk Admin",
  description:
    "allowlist beta 소폭 확대 운영 계획입니다. 자동 확대·env 자동 반영은 수행하지 않습니다.",
  robots: { index: false, follow: false },
};

export default async function AdminAnswerAssistantExpansionPlanPage({
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
    report = await loadAllowlistExpansionPlanReport(resolved);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={`min-h-screen ${surfaces.page}`}>
      <header
        className={`${surfaces.hero} border-b ${borders.divider} px-6 py-4 sm:px-8`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#d8c08f]">
              PlannerDesk Admin
            </p>
            <h1 className="text-xl font-bold text-white">
              답변 보조 · Allowlist 확대 계획
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/beta-decision"
            >
              Beta 판단
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/audit"
            >
              Usage Audit
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
          PR-103에서 <code>LIMITED_EXPANSION_CANDIDATE</code>일 때만 검토하는{" "}
          <strong>제한 allowlist 확대 계획</strong>입니다. Wave 단위 소폭 확대
          기준·후보·모니터링·rollback을 문서화하며, allowlist env 자동 반영은 하지
          않습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="확대 후보는 집계·선정 기준만 표시합니다. raw prompt/output, 고객·의료·계약 정보, allowlist 전체 목록은 노출하지 않습니다."
            showNeedsReview={false}
          />
        </div>

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mt-6" />
        ) : report ? (
          <div className="mt-8">
            <AllowlistExpansionPlanView report={report} filters={resolved} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
