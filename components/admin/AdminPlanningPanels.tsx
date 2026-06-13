import type { AdminDashboardSnapshot } from "@/lib/admin/dashboard-status";
import { ADMIN_DASHBOARD_SAFETY_LINES } from "@/lib/admin/dashboard-status";
import AdminAccessRegressionPanel from "@/components/admin/AdminAccessRegressionPanel";
import AdminAiLimitedBetaPolicyPanel from "@/components/admin/AdminAiLimitedBetaPolicyPanel";
import AdminAiSafetyHardeningPanel from "@/components/admin/AdminAiSafetyHardeningPanel";
import AdminAnswerAssistantRedTeamPanel from "@/components/admin/AdminAnswerAssistantRedTeamPanel";
import AdminBetaAccessRequestFlowPanel from "@/components/admin/AdminBetaAccessRequestFlowPanel";
import AdminBetaCohortControlPanel from "@/components/admin/AdminBetaCohortControlPanel";
import AdminBetaExpansionDecisionPanel from "@/components/admin/AdminBetaExpansionDecisionPanel";
import AdminBetaFeedbackLoopPanel from "@/components/admin/AdminBetaFeedbackLoopPanel";
import AdminBetaIncidentDrillPanel from "@/components/admin/AdminBetaIncidentDrillPanel";
import AdminBetaLaunchDecisionPanel from "@/components/admin/AdminBetaLaunchDecisionPanel";
import AdminBetaMetricsReviewPanel from "@/components/admin/AdminBetaMetricsReviewPanel";
import AdminBetaOperatorChecklistPanel from "@/components/admin/AdminBetaOperatorChecklistPanel";
import AdminBetaReviewSummaryPanel from "@/components/admin/AdminBetaReviewSummaryPanel";
import AdminBetaUserNoticePackPanel from "@/components/admin/AdminBetaUserNoticePackPanel";
import AdminDataCorrectionWorkflowPanel from "@/components/admin/AdminDataCorrectionWorkflowPanel";
import AdminDataFreshnessReviewPanel from "@/components/admin/AdminDataFreshnessReviewPanel";
import AdminDataResponsibilityNoticePanel from "@/components/admin/AdminDataResponsibilityNoticePanel";
import AdminExternalBetaDryRunPanel from "@/components/admin/AdminExternalBetaDryRunPanel";
import AdminExternalReleaseDecisionPanel from "@/components/admin/AdminExternalReleaseDecisionPanel";
import AdminExternalReleaseReadinessPanel from "@/components/admin/AdminExternalReleaseReadinessPanel";
import AdminFeatureCard, { AdminWorkflowCard } from "@/components/admin/AdminFeatureCard";
import AdminLimitedBetaReadinessPanel from "@/components/admin/AdminLimitedBetaReadinessPanel";
import AdminOperationsReminderPanel from "@/components/admin/AdminOperationsReminderPanel";
import AdminOperationsReportPanel from "@/components/admin/AdminOperationsReportPanel";
import AdminPaymentArchitecturePlanPanel from "@/components/admin/AdminPaymentArchitecturePlanPanel";
import AdminPaymentFeasibilityPanel from "@/components/admin/AdminPaymentFeasibilityPanel";
import AdminPaymentLegalReadinessPanel from "@/components/admin/AdminPaymentLegalReadinessPanel";
import AdminPublicLandingSafetyPanel from "@/components/admin/AdminPublicLandingSafetyPanel";
import AdminPublicSmokeExpansionPanel from "@/components/admin/AdminPublicSmokeExpansionPanel";
import AdminPublicUxPolishPanel from "@/components/admin/AdminPublicUxPolishPanel";
import AdminRefundSupportPolicyPlanPanel from "@/components/admin/AdminRefundSupportPolicyPlanPanel";
import AdminReviewQueuePanel from "@/components/admin/AdminReviewQueuePanel";
import AdminRoleAccessPanel from "@/components/admin/AdminRoleAccessPanel";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminSecurityFinalAuditPanel from "@/components/admin/AdminSecurityFinalAuditPanel";
import AdminSupportIncidentPlaybookPanel from "@/components/admin/AdminSupportIncidentPlaybookPanel";
import AdminTermsLegalReviewPrepPanel from "@/components/admin/AdminTermsLegalReviewPrepPanel";
import AdminTermsPrivacyDraftPlanPanel from "@/components/admin/AdminTermsPrivacyDraftPlanPanel";
import AdminTermsPrivacyPlanPanel from "@/components/admin/AdminTermsPrivacyPlanPanel";
import AdminUserSupportInboxPlanPanel from "@/components/admin/AdminUserSupportInboxPlanPanel";
import { borders, shadows } from "@/lib/design-system";

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

export default function AdminPlanningPanels({
  dashboard,
  role,
}: {
  dashboard: AdminDashboardSnapshot;
  role?: string | null;
}) {
  const { summary } = dashboard;

  return (
    <div className="space-y-8 border-t border-[#d6d8dc] pt-8">
      <section aria-labelledby="admin-legacy-ops-summary">
        <h2
          id="admin-legacy-ops-summary"
          className="mb-3 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
        >
          기능별 운영 상태 (레거시 요약)
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
      <AdminRoleAccessPanel role={role} />
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
      <AdminBetaOperatorChecklistPanel />
      <AdminBetaUserNoticePackPanel />
      <AdminPublicSmokeExpansionPanel />
      <AdminAccessRegressionPanel />
      <AdminAnswerAssistantRedTeamPanel />
      <AdminBetaLaunchDecisionPanel />
      <AdminBetaFeedbackLoopPanel />
      <AdminBetaIncidentDrillPanel />
      <AdminBetaExpansionDecisionPanel />
      <AdminDataFreshnessReviewPanel />
      <AdminUserSupportInboxPlanPanel />
      <AdminPublicUxPolishPanel />
      <AdminAiSafetyHardeningPanel />
      <AdminPaymentLegalReadinessPanel />
      <AdminBetaCohortControlPanel />
      <AdminBetaMetricsReviewPanel />
      <AdminDataCorrectionWorkflowPanel />
      <AdminTermsPrivacyDraftPlanPanel />
      <AdminPaymentArchitecturePlanPanel />
      <AdminRefundSupportPolicyPlanPanel />
      <AdminBetaReviewSummaryPanel />
      <AdminTermsLegalReviewPrepPanel />

      <AdminSafetyNotice
        policySummary="관리자 데스크 공통 정책: 초안·비게시 데이터는 공개 화면에 노출되지 않습니다."
        showNeedsReview
      />

      <section aria-labelledby="admin-feature-areas">
        <h2
          id="admin-feature-areas"
          className="mb-4 text-lg font-semibold text-[#102235]"
        >
          전체 관리 영역
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {dashboard.features.map(({ id, ...feature }) => (
            <AdminFeatureCard key={id} {...feature} />
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-bulk-ops">
        <h2
          id="admin-bulk-ops"
          className="mb-2 text-lg font-semibold text-[#102235]"
        >
          운영 작업
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-[#4f5661]">
          일괄 등록·검수·상태 변경은 각 목록 화면에서 선택 후 실행합니다.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.bulkWorkflows.map(({ id, ...workflow }) => (
            <AdminWorkflowCard key={id} {...workflow} />
          ))}
        </div>
      </section>

      <section
        className={`rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-5 py-5 ${borders.default}`}
        aria-labelledby="admin-safety-boundary-legacy"
      >
        <h2
          id="admin-safety-boundary-legacy"
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
    </div>
  );
}
