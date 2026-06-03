import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { previewAnswerAssistantRetentionCleanup } from "@/lib/answer-assistant/retention-cleanup";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import RetentionCleanupView from "@/components/admin/answer-assistant/RetentionCleanupView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "답변 보조 Retention Cleanup | PlannerDesk Admin",
  description:
    "Answer Assistant 운영 데이터 보관기간 preview 및 ADMIN 수동 cleanup입니다.",
  robots: { index: false, follow: false },
};

export default async function AdminAnswerAssistantCleanupPage() {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return (
      <AdminAccessDeniedState email={access.session.user?.email ?? null} />
    );
  }

  let preview = null;
  let recentLogs: Array<{
    id: string;
    mode: string;
    createdAt: string;
    rateLimitDeleted: number;
    usageAuditDeleted: number;
    feedbackDeleted: number;
    cleanupLogDeleted: number;
  }> = [];
  let loadFailed = false;

  try {
    preview = await previewAnswerAssistantRetentionCleanup();
    const logs = await prisma.answerAssistantCleanupLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        mode: true,
        createdAt: true,
        rateLimitDeleted: true,
        usageAuditDeleted: true,
        feedbackDeleted: true,
        cleanupLogDeleted: true,
      },
    });
    recentLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }));
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
              답변 보조 · Retention Cleanup
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
              href="/admin"
            >
              관리자 홈
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <p className={`${textStyles.body} max-w-3xl`}>
          usage audit, rate limit state, beta feedback의 만료 데이터를 preview한 뒤
          ADMIN만 삭제할 수 있습니다. 삭제 대상 건수만 표시하며 원문·초안은 조회하지
          않습니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="무조건 삭제·자동 스케줄·beta 확대 없음. execute는 env 허용 + 확인 문구 + preview 건수 일치 시에만 동작합니다."
            showNeedsReview={false}
          />
        </div>

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mt-6" />
        ) : preview ? (
          <div className="mt-8">
            <RetentionCleanupView preview={preview} recentLogs={recentLogs} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
