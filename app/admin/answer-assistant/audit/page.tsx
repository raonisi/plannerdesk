import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { previewAnswerAssistantRetentionCleanup } from "@/lib/answer-assistant/retention-cleanup";
import { loadUsageAuditDashboard } from "@/lib/answer-assistant/usage-audit-dashboard";
import RetentionStatusPanel from "@/components/admin/answer-assistant/RetentionStatusPanel";
import type { UsageAuditDashboardSearchParams } from "@/lib/answer-assistant/usage-audit-dashboard";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import UsageAuditDashboardView from "@/components/admin/answer-assistant/UsageAuditDashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 Usage Audit | PlannerDesk Admin",
  description:
    "Answer Assistant 사용·차단 집계 대시보드입니다. 원문·초안·고객정보는 표시하지 않습니다.",
  robots: { index: false, follow: false },
};

export default async function AdminAnswerAssistantAuditPage({
  searchParams,
}: {
  searchParams: Promise<UsageAuditDashboardSearchParams>;
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
      loadUsageAuditDashboard(resolved),
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
              답변 보조 · Usage Audit
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/feedback"
            >
              Beta 피드백
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/cleanup"
            >
              Retention
            </Link>
            <Link
              className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
              href="/admin/answer-assistant/beta-decision"
            >
              Beta 판단
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
          allowlist beta 운영 중 Answer Assistant 호출·차단 현황을 집계합니다. 관리자만
          접근할 수 있으며, 요청 원문·생성 초안·고객·의료·계약 정보는 조회할 수 없습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="이 화면은 outcome·blockedReason·rate limit 등 메타데이터 집계만 표시합니다. CSV보내기와 raw prompt/output 조회는 제공하지 않습니다."
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
            <UsageAuditDashboardView data={data} filters={resolved} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
