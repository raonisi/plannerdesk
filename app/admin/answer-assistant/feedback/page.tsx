import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { previewAnswerAssistantRetentionCleanup } from "@/lib/answer-assistant/retention-cleanup";
import { loadBetaFeedbackDashboard } from "@/lib/answer-assistant/beta-feedback-dashboard";
import RetentionStatusPanel from "@/components/admin/answer-assistant/RetentionStatusPanel";
import type { BetaFeedbackDashboardSearchParams } from "@/lib/answer-assistant/beta-feedback-dashboard";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import BetaFeedbackReviewView from "@/components/admin/answer-assistant/BetaFeedbackReviewView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 Beta 피드백 검토 | PlannerDesk Admin",
  description:
    "allowlist beta 안전 피드백을 분류·수동 검토합니다. 원문·초안·자동 제재는 제공하지 않습니다.",
  robots: { index: false, follow: false },
};

export default async function AdminAnswerAssistantFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<BetaFeedbackDashboardSearchParams>;
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
  let data = null;
  let retentionPreview = null;
  let loadFailed = false;

  try {
    const [dashboard, retention] = await Promise.all([
      loadBetaFeedbackDashboard(resolved),
      previewAnswerAssistantRetentionCleanup(),
    ]);
    data = dashboard;
    retentionPreview = retention;
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
              답변 보조 · Beta 안전 피드백
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
              href="/admin/answer-assistant/cleanup"
            >
              Retention
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant"
            >
              답변 보조
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
          beta 사용자 structured 피드백과 usage audit 메타데이터를 연결해 안전
          신호를 분류합니다. beta 확대·자동 제재·allowlist 변경은 이 화면에서
          수행하지 않습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="피드백·audit 모두 상담 원문·생성 초안·raw prompt/output을 저장·표시하지 않습니다."
            showNeedsReview={false}
          />
        </div>

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mt-6" />
        ) : data ? (
          <div className="mt-8 space-y-6">
            {retentionPreview ? (
              <RetentionStatusPanel preview={retentionPreview} compact />
            ) : null}
            <BetaFeedbackReviewView data={data} filters={resolved} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
