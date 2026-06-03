// Limited allowlist expansion plan (PR-104-C). Plan/report only — no allowlist auto apply.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAnswerAssistantVerifiedAllowlistUserIds,
  getVerifiedAnswerAssistantAllowlistCount,
} from "./allowlist";
import {
  assertAnswerAssistantAuditSchemaSafe,
  buildBetaExpansionAuditWhere,
  loadBetaExpansionDecisionReport,
  resolveBetaExpansionDecisionPeriod,
  type BetaExpansionDecisionReport,
  type BetaExpansionDecisionSearchParams,
} from "./beta-expansion-decision";
import {
  computeWave1AddSlots,
  getAllowlistExpansionPlanConfig,
  type AllowlistExpansionPlanConfig,
} from "./allowlist-expansion-plan-config";

export { computeWave1AddSlots } from "./allowlist-expansion-plan-config";
import { truncateUsageAuditUserId } from "./usage-audit-dashboard";

export type AnswerAssistantExpansionPlanDecision =
  | "EXPANSION_BLOCKED"
  | "KEEP_CURRENT_ALLOWLIST"
  | "READY_FOR_WAVE_1_PLAN"
  | "READY_FOR_WAVE_2_PLAN"
  | "EXPANSION_REQUIRES_IMPROVEMENT"
  | "PAUSE_AND_FIX_REQUIRED";

export type ExpansionPreconditionRow = {
  key: string;
  label: string;
  met: boolean;
  detail: string;
};

export type ExpansionWavePlanRow = {
  wave: 0 | 1 | 2 | 3;
  title: string;
  purpose: string;
  maxAdd: number | null;
  cumulativeCap: number | null;
  minOperationDays: number;
  status: "current" | "planned" | "blocked" | "review";
};

export type ExpansionCandidateRow = {
  verificationId: string;
  userIdPrefix: string;
  displayName: string;
  eligible: boolean;
  excludeReason: string | null;
};

export type ExpansionMonitoringChecklist = {
  label: string;
  value: number | string;
  source: "usage" | "feedback" | "retention";
}[];

export type AllowlistExpansionPlanReport = {
  period: { start: string; end: string };
  pr103Decision: BetaExpansionDecisionReport["decision"];
  pr103NextPr: string;
  currentAllowlistCount: number;
  preconditions: ExpansionPreconditionRow[];
  preconditionsMet: boolean;
  waves: ExpansionWavePlanRow[];
  activeWave: 0 | 1 | 2 | 3;
  wave1SuggestedAdds: number;
  eligibleCandidateCount: number;
  candidates: ExpansionCandidateRow[];
  monitoring: ExpansionMonitoringChecklist;
  rollbackTriggers: string[];
  pauseTriggers: string[];
  decision: AnswerAssistantExpansionPlanDecision;
  decisionRationale: string[];
  expansionScopeNote: string;
  forbiddenReminders: string[];
  nextPrCandidates: string[];
  config: AllowlistExpansionPlanConfig;
};

export function buildExpansionPreconditions(
  decisionReport: BetaExpansionDecisionReport,
): ExpansionPreconditionRow[] {
  const { feedback, usage, retention, operational, decision } = decisionReport;

  return [
    {
      key: "pr103_limited_candidate",
      label: "PR-103 decision = LIMITED_EXPANSION_CANDIDATE",
      met: decision === "LIMITED_EXPANSION_CANDIDATE",
      detail: `현재: ${decision}`,
    },
    {
      key: "critical_stop",
      label: "CRITICAL_STOP 0건",
      met: feedback.criticalFeedback === 0,
      detail: `${feedback.criticalFeedback}건`,
    },
    {
      key: "field_exposure",
      label: "FIELD_EXPOSURE_RISK 0건",
      met: feedback.fieldExposureRisk === 0,
      detail: `${feedback.fieldExposureRisk}건`,
    },
    {
      key: "output_safety_miss",
      label: "OUTPUT_SAFETY_MISS 0건",
      met: feedback.outputSafetyMiss === 0,
      detail: `${feedback.outputSafetyMiss}건`,
    },
    {
      key: "claim_judgment",
      label: "CLAIM_JUDGMENT_RISK 0건",
      met: feedback.claimJudgmentRisk === 0,
      detail: `${feedback.claimJudgmentRisk}건`,
    },
    {
      key: "medical_interpretation",
      label: "MEDICAL_INTERPRETATION_RISK 0건",
      met: feedback.medicalInterpretationRisk === 0,
      detail: `${feedback.medicalInterpretationRisk}건`,
    },
    {
      key: "loss_adjustment",
      label: "LOSS_ADJUSTMENT_RISK 0건",
      met: feedback.lossAdjustmentRisk === 0,
      detail: `${feedback.lossAdjustmentRisk}건`,
    },
    {
      key: "product_solicitation",
      label: "PRODUCT_SOLICITATION_RISK 0건",
      met: feedback.productSolicitationRisk === 0,
      detail: `${feedback.productSolicitationRisk}건`,
    },
    {
      key: "schema_safe",
      label: "raw prompt/output 저장 흔적 없음 (schema)",
      met: assertAnswerAssistantAuditSchemaSafe(),
      detail: assertAnswerAssistantAuditSchemaSafe() ? "통과" : "점검 필요",
    },
    {
      key: "permission_denied",
      label: "GENERAL_USER 접근 시도 없음",
      met: usage.permissionDenied === 0,
      detail: `${usage.permissionDenied}건`,
    },
    {
      key: "rate_limit",
      label: "durable rate limit 정상",
      met: operational.rateLimitHealthy,
      detail: operational.rateLimitHealthy ? "정상" : "점검 필요",
    },
    {
      key: "usage_audit",
      label: "usage audit 정상",
      met: operational.usageAuditHealthy,
      detail: operational.usageAuditHealthy ? "정상" : "점검 필요",
    },
    {
      key: "retention",
      label: "retention cleanup 정상",
      met: !retention.cleanupOverdue,
      detail: retention.cleanupOverdue ? "지연" : "정상",
    },
    {
      key: "feedback_backlog",
      label: "feedback review backlog 낮음",
      met: !decisionReport.improvementTriggers.includes("FEEDBACK_REVIEW_BACKLOG"),
      detail: `${feedback.reviewBacklog}건`,
    },
    {
      key: "rollback_documented",
      label: "rollback 절차 확인됨 (운영자 수동)",
      met: true,
      detail: "문서·화면 기준 제공",
    },
    {
      key: "no_auto_send",
      label: "자동 발송·자동 게시 없음",
      met: true,
      detail: "제품 범위 유지",
    },
  ];
}

export function resolveActiveExpansionWave(
  currentCount: number,
  preconditionsMet: boolean,
  config: AllowlistExpansionPlanConfig,
): 0 | 1 | 2 | 3 {
  if (!preconditionsMet) return 0;
  if (currentCount >= config.wave2CumulativeCap) return 3;
  if (currentCount <= config.wave1MaxAdd) return 1;
  return 2;
}

export function buildExpansionWavePlan(
  currentCount: number,
  preconditionsMet: boolean,
  activeWave: 0 | 1 | 2 | 3,
  config: AllowlistExpansionPlanConfig,
): ExpansionWavePlanRow[] {
  const wave1Adds = computeWave1AddSlots(currentCount, config);
  const wave1Cap = Math.min(
    currentCount + wave1Adds,
    config.wave2CumulativeCap,
  );

  return [
    {
      wave: 0,
      title: "Wave 0 — 현재 allowlist 유지",
      purpose: "PR-103 decision 검토 · PR-104-C 계획 수립",
      maxAdd: 0,
      cumulativeCap: currentCount,
      minOperationDays: 0,
      status: activeWave === 0 ? "current" : preconditionsMet ? "planned" : "blocked",
    },
    {
      wave: 1,
      title: "Wave 1 — 극소수 추가",
      purpose: `최대 ${wave1Adds}명 또는 현 인원의 ${config.wave1PctCap}% 이하 중 작은 값`,
      maxAdd: wave1Adds,
      cumulativeCap: wave1Cap,
      minOperationDays: config.wave1MinDays,
      status:
        activeWave === 1
          ? "current"
          : preconditionsMet && currentCount < config.wave2CumulativeCap
            ? "planned"
            : "blocked",
    },
    {
      wave: 2,
      title: "Wave 2 — 제한적 추가",
      purpose: `추가 최대 ${config.wave2MaxAdd}명 · 누적 ${config.wave2CumulativeCap}명 이하`,
      maxAdd: config.wave2MaxAdd,
      cumulativeCap: config.wave2CumulativeCap,
      minOperationDays: config.wave2MinDays,
      status: activeWave === 2 ? "current" : preconditionsMet ? "planned" : "blocked",
    },
    {
      wave: 3,
      title: "Wave 3 — 확대 재검토",
      purpose: "전체 VERIFIED 공개 아님 — 장기 별도 검토",
      maxAdd: null,
      cumulativeCap: null,
      minOperationDays: config.wave3MinDays,
      status: activeWave === 3 ? "review" : "blocked",
    },
  ];
}

export type ExpansionPlanEvaluationInput = {
  pr103Decision: BetaExpansionDecisionReport["decision"];
  preconditionsMet: boolean;
  noGoTriggers: string[];
  improvementTriggers: string[];
  currentAllowlistCount: number;
  wave2CumulativeCap: number;
  wave1SuggestedAdds: number;
};

export function evaluateAllowlistExpansionPlan(
  input: ExpansionPlanEvaluationInput,
): Pick<
  AllowlistExpansionPlanReport,
  "decision" | "decisionRationale" | "nextPrCandidates"
> {
  const {
    pr103Decision,
    preconditionsMet,
    noGoTriggers,
    improvementTriggers,
    currentAllowlistCount,
    wave2CumulativeCap,
    wave1SuggestedAdds,
  } = input;

  const rationale: string[] = [];
  const nextPrCandidates: string[] = [];

  if (
    pr103Decision === "PAUSE_BETA" ||
    noGoTriggers.some((t) =>
      [
        "CRITICAL_STOP",
        "FIELD_EXPOSURE_RISK",
        "OUTPUT_SAFETY_MISS",
        "CLAIM_JUDGMENT_RISK",
        "MEDICAL_INTERPRETATION_RISK",
        "LOSS_ADJUSTMENT_RISK",
      ].includes(t),
    )
  ) {
    rationale.push("치명적 No-Go 신호 — 확대 계획 보류, safety fix 우선.");
    nextPrCandidates.push("PR-104-A", "PR-103-QA");
    return {
      decision: "PAUSE_AND_FIX_REQUIRED",
      decisionRationale: rationale,
      nextPrCandidates,
    };
  }

  if (!preconditionsMet || pr103Decision !== "LIMITED_EXPANSION_CANDIDATE") {
    if (improvementTriggers.length > 0) {
      rationale.push("PR-103 개선 항목 또는 전제 조건 미충족 — 계획만 검토.");
      nextPrCandidates.push("PR-104-B", "PR-104-D", "PR-103");
      return {
        decision: "EXPANSION_REQUIRES_IMPROVEMENT",
        decisionRationale: rationale,
        nextPrCandidates,
      };
    }
    rationale.push("제한 확대 전제 미충족 — 현 allowlist 유지 또는 차단.");
    nextPrCandidates.push("PR-104-D", "PR-103");
    return {
      decision:
        pr103Decision === "CONTINUE_CURRENT_BETA"
          ? "KEEP_CURRENT_ALLOWLIST"
          : "EXPANSION_BLOCKED",
      decisionRationale: rationale,
      nextPrCandidates,
    };
  }

  if (currentAllowlistCount >= wave2CumulativeCap) {
    rationale.push(
      "누적 allowlist가 Wave 2 상한에 도달 — Wave 3 재검토만 해당.",
    );
    nextPrCandidates.push("PR-103", "PR-104-D");
    return {
      decision: "READY_FOR_WAVE_2_PLAN",
      decisionRationale: rationale,
      nextPrCandidates,
    };
  }

  if (wave1SuggestedAdds > 0) {
    rationale.push(
      `Wave 1 계획: 수동으로 최대 ${wave1SuggestedAdds}명 추가 검토 (env 반영은 별도 PR).`,
    );
    nextPrCandidates.push("PR-104-C-EXECUTE", "PR-103-QA");
    return {
      decision: "READY_FOR_WAVE_1_PLAN",
      decisionRationale: rationale,
      nextPrCandidates,
    };
  }

  rationale.push("확대 슬롯 0 — 현 allowlist 유지.");
  nextPrCandidates.push("PR-104-D");
  return {
    decision: "KEEP_CURRENT_ALLOWLIST",
    decisionRationale: rationale,
    nextPrCandidates,
  };
}

export const EXPANSION_ROLLBACK_TRIGGERS = [
  "CRITICAL_STOP 발생",
  "FIELD_EXPOSURE_RISK 발생",
  "OUTPUT_SAFETY_MISS 발생",
  "CLAIM_JUDGMENT_RISK 발생",
  "MEDICAL_INTERPRETATION_RISK 발생",
  "LOSS_ADJUSTMENT_RISK 발생",
  "raw prompt/output 저장 흔적",
  "rate limit / usage audit 미작동",
  "자동 발송 연결 발견",
] as const;

export const EXPANSION_PAUSE_TRIGGERS = [
  ...EXPANSION_ROLLBACK_TRIGGERS,
  "provider secret 노출 위험",
  "GENERAL_USER / SUSPENDED 접근 가능성",
] as const;

async function loadAbuseExcludedUserIds(
  auditWhere: Prisma.AnswerAssistantUsageAuditWhereInput,
  config: AllowlistExpansionPlanConfig,
): Promise<Set<string>> {
  const excluded = new Set<string>();

  const [injectionGroups, rateLimitGroups, blockedGroups] = await Promise.all([
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["userId"],
      where: { ...auditWhere, blockedReason: "PROMPT_INJECTION" },
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["userId"],
      where: { ...auditWhere, rateLimitBlocked: true },
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["userId"],
      where: { ...auditWhere, outcome: "blocked" },
      _count: { _all: true },
    }),
  ]);

  for (const row of injectionGroups) {
    if (row._count._all >= config.promptInjectionRepeatMin) {
      excluded.add(row.userId);
    }
  }
  for (const row of rateLimitGroups) {
    if (row._count._all >= config.rateLimitRepeatMin) {
      excluded.add(row.userId);
    }
  }
  for (const row of blockedGroups) {
    if (row._count._all >= config.highBlockRepeatMin) {
      excluded.add(row.userId);
    }
  }

  return excluded;
}

export async function loadAllowlistExpansionPlanReport(
  params: BetaExpansionDecisionSearchParams = {},
): Promise<AllowlistExpansionPlanReport> {
  const config = getAllowlistExpansionPlanConfig();
  const decisionReport = await loadBetaExpansionDecisionReport(params);
  const period = resolveBetaExpansionDecisionPeriod(params);
  const auditWhere = buildBetaExpansionAuditWhere(period);
  const allowlistIds = getAnswerAssistantVerifiedAllowlistUserIds();
  const currentAllowlistCount = getVerifiedAnswerAssistantAllowlistCount();

  const preconditions = buildExpansionPreconditions(decisionReport);
  const preconditionsMet = preconditions.every((row) => row.met);

  const wave1SuggestedAdds = computeWave1AddSlots(
    currentAllowlistCount,
    config,
  );
  const activeWave = resolveActiveExpansionWave(
    currentAllowlistCount,
    preconditionsMet,
    config,
  );
  const waves = buildExpansionWavePlan(
    currentAllowlistCount,
    preconditionsMet,
    activeWave,
    config,
  );

  const abuseExcluded = await loadAbuseExcludedUserIds(auditWhere, config);

  const approvedVerifications = await prisma.plannerVerification.findMany({
    where: {
      status: "approved",
      deletedAt: null,
      userId: { notIn: [...allowlistIds] },
      user: {
        status: "active",
        role: "verified_planner",
      },
    },
    orderBy: { reviewedAt: "desc" },
    take: config.candidatePreviewLimit,
    select: {
      id: true,
      userId: true,
      displayName: true,
      status: true,
    },
  });

  const candidates: ExpansionCandidateRow[] = approvedVerifications.map(
    (row) => {
      let excludeReason: string | null = null;
      if (abuseExcluded.has(row.userId)) {
        excludeReason = "prompt injection / rate limit / 차단 반복";
      }
      return {
        verificationId: row.id,
        userIdPrefix: truncateUsageAuditUserId(row.userId),
        displayName: row.displayName,
        eligible: excludeReason === null,
        excludeReason,
      };
    },
  );

  const eligibleCandidateCount = candidates.filter((c) => c.eligible).length;

  const evaluated = evaluateAllowlistExpansionPlan({
    pr103Decision: decisionReport.decision,
    preconditionsMet,
    noGoTriggers: decisionReport.noGoTriggers,
    improvementTriggers: decisionReport.improvementTriggers,
    currentAllowlistCount,
    wave2CumulativeCap: config.wave2CumulativeCap,
    wave1SuggestedAdds,
  });

  const monitoring: ExpansionMonitoringChecklist = [
    { label: "total requests", value: decisionReport.usage.totalBetaRequests, source: "usage" },
    { label: "blocked", value: decisionReport.usage.blocked, source: "usage" },
    { label: "rate limited", value: decisionReport.usage.rateLimited, source: "usage" },
    { label: "prompt injection", value: decisionReport.usage.promptInjectionBlocked, source: "usage" },
    { label: "output safety blocked", value: decisionReport.usage.outputSafetyBlocked, source: "usage" },
    { label: "provider error", value: decisionReport.usage.providerError, source: "usage" },
    { label: "insufficient evidence", value: decisionReport.usage.insufficientEvidence, source: "usage" },
    { label: "not allowlisted", value: decisionReport.usage.notAllowlisted, source: "usage" },
    { label: "permission denied", value: decisionReport.usage.permissionDenied, source: "usage" },
    { label: "feedback total", value: decisionReport.feedback.totalFeedback, source: "feedback" },
    { label: "CRITICAL_STOP", value: decisionReport.feedback.criticalFeedback, source: "feedback" },
    { label: "FIELD_EXPOSURE_RISK", value: decisionReport.feedback.fieldExposureRisk, source: "feedback" },
    { label: "OUTPUT_SAFETY_MISS", value: decisionReport.feedback.outputSafetyMiss, source: "feedback" },
    { label: "CLAIM_JUDGMENT_RISK", value: decisionReport.feedback.claimJudgmentRisk, source: "feedback" },
    { label: "EVIDENCE_MISSING", value: decisionReport.feedback.evidenceMissing, source: "feedback" },
    { label: "UI_CONFUSING", value: decisionReport.feedback.uiConfusing, source: "feedback" },
    {
      label: "cleanup overdue",
      value: decisionReport.retention.cleanupOverdue ? "예" : "아니오",
      source: "retention",
    },
  ];

  return {
    period: decisionReport.period,
    pr103Decision: decisionReport.decision,
    pr103NextPr: decisionReport.nextPr,
    currentAllowlistCount,
    preconditions,
    preconditionsMet,
    waves,
    activeWave: activeWave as 0 | 1 | 2 | 3,
    wave1SuggestedAdds,
    eligibleCandidateCount,
    candidates,
    monitoring,
    rollbackTriggers: [...EXPANSION_ROLLBACK_TRIGGERS],
    pauseTriggers: [...EXPANSION_PAUSE_TRIGGERS],
    config,
    expansionScopeNote:
      "allowlist 변경은 ANSWER_ASSISTANT_VERIFIED_ALLOWLIST env 수동 반영만 해당합니다. 자동 저장·gate ON·전체 VERIFIED 공개 없음.",
    forbiddenReminders: [
      "allowlist 자동 확대 금지",
      "allowlist 자동 env 저장 금지",
      "feature gate 자동 ON 금지",
      "전체 VERIFIED_PLANNER / GENERAL_USER / public chatbot 금지",
      "고객·커뮤니티 자동 발송·게시 금지",
    ],
    ...evaluated,
  };
}
