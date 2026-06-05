import { signOut } from "@/auth";
import { surfaces, borders, shadows, textStyles } from "@/lib/design-system";
import { roleDisplayLabel } from "@/lib/auth/rbac";
import type { AdminDashboardSnapshot } from "@/lib/admin/dashboard-status";
import { ADMIN_DASHBOARD_SAFETY_LINES } from "@/lib/admin/dashboard-status";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminOperationsReminderPanel from "@/components/admin/AdminOperationsReminderPanel";
import AdminOperationsReportPanel from "@/components/admin/AdminOperationsReportPanel";
import AdminExternalReleaseReadinessPanel from "@/components/admin/AdminExternalReleaseReadinessPanel";
import AdminLimitedBetaReadinessPanel from "@/components/admin/AdminLimitedBetaReadinessPanel";
import AdminTermsPrivacyPlanPanel from "@/components/admin/AdminTermsPrivacyPlanPanel";
import AdminSupportIncidentPlaybookPanel from "@/components/admin/AdminSupportIncidentPlaybookPanel";
import AdminPublicLandingSafetyPanel from "@/components/admin/AdminPublicLandingSafetyPanel";
import AdminPaymentFeasibilityPanel from "@/components/admin/AdminPaymentFeasibilityPanel";
import AdminBetaAccessRequestFlowPanel from "@/components/admin/AdminBetaAccessRequestFlowPanel";
import AdminDataResponsibilityNoticePanel from "@/components/admin/AdminDataResponsibilityNoticePanel";
import AdminAiLimitedBetaPolicyPanel from "@/components/admin/AdminAiLimitedBetaPolicyPanel";
import AdminSecurityFinalAuditPanel from "@/components/admin/AdminSecurityFinalAuditPanel";
import AdminExternalReleaseDecisionPanel from "@/components/admin/AdminExternalReleaseDecisionPanel";
import AdminExternalBetaDryRunPanel from "@/components/admin/AdminExternalBetaDryRunPanel";
import AdminRoleAccessPanel from "@/components/admin/AdminRoleAccessPanel";
import AdminReviewQueuePanel from "@/components/admin/AdminReviewQueuePanel";
import AdminFeatureCard, { AdminWorkflowCard } from "@/components/admin/AdminFeatureCard";

interface AdminShellProps {
  session: {
    user?: {
      email?: string | null;
      role?: string | null;
    } | null;
  } | null;
  dashboard: AdminDashboardSnapshot;
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "gold" | "navy" | "red" | "gray";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]"
      : tone === "gold"
        ? "border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]"
        : tone === "red"
          ? "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]"
          : tone === "navy"
            ? "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]"
            : "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export default function AdminShell({ session, dashboard }: AdminShellProps) {
  const userEmail = session?.user?.email || "알 수 없는 운영자";
  const roleLabel = roleDisplayLabel(session?.user?.role);
  const { summary } = dashboard;

  return (
    <div className={`min-h-screen ${surfaces.page}`}>
      <header className={`${surfaces.hero} border-b ${borders.divider} py-4 px-6 sm:px-8`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white">
              PlannerDesk Admin
            </span>
            <span className="rounded-full bg-[#aa8137] px-2 py-0.5 text-xs font-semibold text-white">
              MVP
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#d8c08f] sm:inline-block">
              접속: <span className="font-semibold text-white">{userEmail}</span>
              <span className="mx-2 opacity-50">|</span>
              역할: <span className="font-semibold text-white">{roleLabel}</span>
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin" });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer rounded bg-red-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-900"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <section
          className={`relative mb-8 overflow-hidden rounded-lg p-6 sm:p-8 ${surfaces.card} ${borders.default} ${shadows.card}`}
        >
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#aa8137]/5" />
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            관리자 데스크
          </h1>
          <p className={`${textStyles.body} mt-3 max-w-2xl`}>
            보험사 정보, 청구서류, 지식 문서, 공시 링크, 고객 안내 문구를 검수 기준에 따라 관리합니다.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#4f5661]">
            공개 전에는 공식 출처, 검수 상태, 공개 여부를 반드시 확인하세요.<br />
            PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않으며, 고객 개인정보와 의료자료를 저장하지 않습니다.
          </p>
        </section>

        <section className="mb-8" aria-labelledby="admin-ops-summary">
          <h2
            id="admin-ops-summary"
            className="mb-3 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
          >
            운영 상태 요약
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryTile label="운영 중" value={summary.active} tone="green" />
            <SummaryTile
              label="확인 필요"
              value={summary.activeWithWarning}
              tone="gold"
            />
            <SummaryTile
              label="설정 필요"
              value={summary.setupRequired}
              tone="navy"
            />
            <SummaryTile label="점검 필요" value={summary.blocked} tone="red" />
            <SummaryTile label="준비 중" value={summary.comingSoon} tone="gray" />
          </div>
        </section>

        <AdminReviewQueuePanel reviewQueue={dashboard.reviewQueue} />

        <AdminOperationsReportPanel dashboard={dashboard} />

        <AdminOperationsReminderPanel dashboard={dashboard} />

        <AdminRoleAccessPanel role={session?.user?.role} />

        <AdminExternalReleaseReadinessPanel />

        <AdminLimitedBetaReadinessPanel />

        <AdminTermsPrivacyPlanPanel />

        <AdminSupportIncidentPlaybookPanel />

        <AdminPublicLandingSafetyPanel />

        <AdminPaymentFeasibilityPanel />

        <AdminBetaAccessRequestFlowPanel />

        <AdminDataResponsibilityNoticePanel />

        <AdminAiLimitedBetaPolicyPanel />

        <AdminSecurityFinalAuditPanel />

        <AdminExternalReleaseDecisionPanel />

        <AdminExternalBetaDryRunPanel />

        <div className="mb-8">
          <AdminSafetyNotice
            policySummary="관리자 데스크 공통 정책: 초안·비게시 데이터는 공개 화면에 노출되지 않습니다."
            showNeedsReview
          />
        </div>

        <section className="mb-10" aria-labelledby="admin-feature-areas">
          <h2
            id="admin-feature-areas"
            className="mb-4 text-lg font-semibold text-[#102235]"
          >
            주요 관리 영역
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {dashboard.features.map(({ id, ...feature }) => (
              <AdminFeatureCard key={id} {...feature} />
            ))}
          </div>
        </section>

        <section className="mb-10" aria-labelledby="admin-bulk-ops">
          <h2
            id="admin-bulk-ops"
            className="mb-2 text-lg font-semibold text-[#102235]"
          >
            운영 작업
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-[#4f5661]">
            일괄 등록·검수·상태 변경은 각 목록 화면에서 선택 후 실행합니다.
            구현되지 않은 영역은 준비 중으로 표시됩니다.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.bulkWorkflows.map(({ id, ...workflow }) => (
              <AdminWorkflowCard key={id} {...workflow} />
            ))}
          </div>
        </section>

        <section
          className={`rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-5 py-5 ${borders.default}`}
          aria-labelledby="admin-safety-boundary"
        >
          <h2
            id="admin-safety-boundary"
            className="text-sm font-bold text-[#102235]"
          >
            안전 경계
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-relaxed text-[#4f5661]">
            {ADMIN_DASHBOARD_SAFETY_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>파일 업로드 기반 일괄 import는 제공하지 않습니다.</li>
            <li>AI 참조(aiUsable) 일괄 활성화는 별도 검수 PR 이후 제공합니다.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
