// Beta expansion decision framework (PR-103). Aggregates only — no auto expansion/sanctions.

import type { Prisma } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { getAllowlistBetaOperationalStatus } from "./allowlist-beta";
import { getVerifiedAnswerAssistantAllowlistCount } from "./allowlist";
import {
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "./feature-gate";
import { previewAnswerAssistantRetentionCleanup } from "./retention-cleanup";
import { getUsageAuditOperationalSnapshot } from "./usage-audit-dashboard";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "./usage-log";
import {
  getBetaExpansionDecisionConfig,
  type BetaExpansionDecisionConfig,
} from "./beta-expansion-decision-config";

export type AnswerAssistantBetaDecision =
  | "CONTINUE_CURRENT_BETA"
  | "PAUSE_BETA"
  | "IMPROVE_BEFORE_EXPANSION"
  | "EXPANSION_NOT_READY"
  | "LIMITED_EXPANSION_CANDIDATE";

export type BetaExpansionNextPr =
  | "PR-104-A"
  | "PR-104-B"
  | "PR-104-C"
  | "PR-104-D"
  | "PR-103-QA";

export type BetaExpansionDecisionSearchParams = {
  createdFrom?: string;
  createdTo?: string;
};

export type BetaExpansionUsageMetrics = {
  totalBetaRequests: number;
  success: number;
  blocked: number;
  rateLimited: number;
  promptInjectionBlocked: number;
  outputSafetyBlocked: number;
  providerError: number;
  insufficientEvidence: number;
  permissionDenied: number;
  notAllowlisted: number;
  providerNotConfigured: number;
};

export type BetaExpansionFeedbackMetrics = {
  totalFeedback: number;
  criticalFeedback: number;
  needsFix: number;
  unsafeOutput: number;
  fieldExposureRisk: number;
  outputSafetyMiss: number;
  claimJudgmentRisk: number;
  medicalInterpretationRisk: number;
  lossAdjustmentRisk: number;
  productSolicitationRisk: number;
  evidenceMissing: number;
  wrongSource: number;
  uiConfusing: number;
  tooRestrictive: number;
  blockedIncorrectly: number;
  reviewBacklog: number;
};

export type BetaExpansionRetentionMetrics = {
  lastCleanupDate: string | null;
  cleanupOverdue: boolean;
  oldAuditCandidateCount: number;
  oldFeedbackCandidateCount: number;
  criticalFeedbackProtectedCount: number;
  linkedUsageAuditProtectedCount: number;
};

export type BetaExpansionSafetySignalRow = {
  signalKey: string;
  label: string;
  count: number;
  latestAt: string | null;
  reviewStatusSummary: string;
  expansionImpact: string;
  recommendedAction: string;
};

export type BetaExpansionOperationalReadiness = {
  rateLimitHealthy: boolean;
  usageAuditHealthy: boolean;
  retentionHealthy: boolean;
  cleanupOverdue: boolean;
  betaOperational: boolean;
  allowlistBetaStatus: string;
  providerErrorElevated: boolean;
  permissionDeniedElevated: boolean;
  notAllowlistedElevated: boolean;
};

export type BetaExpansionDecisionReport = {
  period: { start: string; end: string };
  usage: BetaExpansionUsageMetrics;
  feedback: BetaExpansionFeedbackMetrics;
  retention: BetaExpansionRetentionMetrics;
  operational: BetaExpansionOperationalReadiness;
  safetyNoGoRows: BetaExpansionSafetySignalRow[];
  noGoTriggers: string[];
  improvementTriggers: string[];
  maintainConditionsMet: string[];
  maintainConditionsMissing: string[];
  expansionConditionsMet: string[];
  expansionConditionsMissing: string[];
  decision: AnswerAssistantBetaDecision;
  decisionCandidates: AnswerAssistantBetaDecision[];
  rationale: string[];
  noGoReasons: string[];
  improvementItems: string[];
  expansionScopeNote: string;
  forbiddenReminders: string[];
  nextPr: BetaExpansionNextPr;
  nextPrSummary: string;
  config: BetaExpansionDecisionConfig;
};

function parseDateStart(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(`${value.trim()}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(`${value.trim()}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function resolveBetaExpansionDecisionPeriod(
  params: BetaExpansionDecisionSearchParams,
): { start: Date; end: Date } {
  const end = parseDateEnd(params.createdTo) ?? new Date();
  const start =
    parseDateStart(params.createdFrom) ??
    new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function buildBetaExpansionAuditWhere(
  period: { start: Date; end: Date },
): Prisma.AnswerAssistantUsageAuditWhereInput {
  return {
    audience: "verified_planner",
    createdAt: { gte: period.start, lte: period.end },
  };
}

export function buildBetaExpansionFeedbackWhere(
  period: { start: Date; end: Date },
): Prisma.AnswerAssistantBetaFeedbackWhereInput {
  return {
    createdAt: { gte: period.start, lte: period.end },
  };
}

/** Ensures usage audit schema block has no forbidden payload fields. */
export function assertAnswerAssistantAuditSchemaSafe(): boolean {
  const schemaPath = join(process.cwd(), "prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");
  const start = schema.indexOf("model AnswerAssistantUsageAudit");
  if (start < 0) return false;
  const end = schema.indexOf("\n}", start);
  const block = schema.slice(start, end);
  for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
    if (block.includes(`${field} `) || block.includes(`${field}\n`)) {
      return false;
    }
  }
  return true;
}

export type BetaExpansionDecisionEvaluationInput = {
  usage: BetaExpansionUsageMetrics;
  feedback: BetaExpansionFeedbackMetrics;
  retention: BetaExpansionRetentionMetrics;
  operational: BetaExpansionOperationalReadiness;
  structuralNoGo: string[];
  periodDays: number;
  config: BetaExpansionDecisionConfig;
};

export function evaluateBetaExpansionDecision(
  input: BetaExpansionDecisionEvaluationInput,
): Pick<
  BetaExpansionDecisionReport,
  | "noGoTriggers"
  | "improvementTriggers"
  | "maintainConditionsMet"
  | "maintainConditionsMissing"
  | "expansionConditionsMet"
  | "expansionConditionsMissing"
  | "decision"
  | "decisionCandidates"
  | "rationale"
  | "noGoReasons"
  | "improvementItems"
  | "nextPr"
  | "nextPrSummary"
> {
  const { usage, feedback, retention, operational, structuralNoGo, periodDays, config } =
    input;

  const noGoTriggers: string[] = [...structuralNoGo];
  const improvementTriggers: string[] = [];

  const criticalStop =
    feedback.criticalFeedback > 0 ||
    feedback.fieldExposureRisk > 0 ||
    feedback.outputSafetyMiss > 0 ||
    feedback.claimJudgmentRisk > 0 ||
    feedback.medicalInterpretationRisk > 0 ||
    feedback.lossAdjustmentRisk > 0;

  if (feedback.criticalFeedback > 0) {
    noGoTriggers.push("CRITICAL_STOP");
  }
  if (feedback.fieldExposureRisk > 0) {
    noGoTriggers.push("FIELD_EXPOSURE_RISK");
  }
  if (feedback.outputSafetyMiss > 0) {
    noGoTriggers.push("OUTPUT_SAFETY_MISS");
  }
  if (feedback.claimJudgmentRisk > 0) {
    noGoTriggers.push("CLAIM_JUDGMENT_RISK");
  }
  if (feedback.medicalInterpretationRisk > 0) {
    noGoTriggers.push("MEDICAL_INTERPRETATION_RISK");
  }
  if (feedback.lossAdjustmentRisk > 0) {
    noGoTriggers.push("LOSS_ADJUSTMENT_RISK");
  }

  if (!operational.rateLimitHealthy) {
    noGoTriggers.push("RATE_LIMIT_NOT_OPERATIONAL");
  }
  if (!operational.usageAuditHealthy) {
    noGoTriggers.push("USAGE_AUDIT_NOT_DURABLE");
  }
  if (retention.cleanupOverdue) {
    noGoTriggers.push("RETENTION_CLEANUP_OVERDUE");
  }
  if (usage.permissionDenied > 0) {
    noGoTriggers.push("PERMISSION_DENIED_ATTEMPTS");
  }

  const insufficientPct =
    usage.totalBetaRequests > 0
      ? Math.round((usage.insufficientEvidence / usage.totalBetaRequests) * 100)
      : 0;
  const providerErrorPct =
    usage.totalBetaRequests > 0
      ? Math.round((usage.providerError / usage.totalBetaRequests) * 100)
      : 0;

  if (feedback.evidenceMissing >= config.improvementEvidenceMissingMin) {
    improvementTriggers.push("EVIDENCE_MISSING");
  }
  if (feedback.wrongSource >= config.improvementEvidenceMissingMin) {
    improvementTriggers.push("WRONG_SOURCE");
  }
  if (feedback.uiConfusing >= config.improvementEvidenceMissingMin) {
    improvementTriggers.push("UI_CONFUSING");
  }
  if (feedback.tooRestrictive >= config.improvementEvidenceMissingMin) {
    improvementTriggers.push("TOO_RESTRICTIVE");
  }
  if (feedback.blockedIncorrectly >= config.improvementEvidenceMissingMin) {
    improvementTriggers.push("BLOCKED_INCORRECTLY");
  }
  if (usage.providerError >= config.improvementProviderErrorMin) {
    improvementTriggers.push("PROVIDER_ERROR");
  }
  if (usage.providerNotConfigured >= config.improvementProviderErrorMin) {
    improvementTriggers.push("PROVIDER_NOT_CONFIGURED");
  }
  if (insufficientPct >= config.improvementInsufficientEvidencePct) {
    improvementTriggers.push("INSUFFICIENT_EVIDENCE_RATE");
  }
  if (usage.notAllowlisted >= config.improvementNotAllowlistedMin) {
    improvementTriggers.push("NOT_ALLOWLISTED");
  }
  if (usage.rateLimited >= config.improvementRateLimitedMin) {
    improvementTriggers.push("RATE_LIMITED");
  }
  if (feedback.reviewBacklog > config.feedbackBacklogMax) {
    improvementTriggers.push("FEEDBACK_REVIEW_BACKLOG");
  }
  if (retention.cleanupOverdue) {
    improvementTriggers.push("CLEANUP_OVERDUE");
  }

  const maintainConditionsMet: string[] = [];
  const maintainConditionsMissing: string[] = [];
  const expansionConditionsMet: string[] = [];
  const expansionConditionsMissing: string[] = [];

  if (!criticalStop) {
    maintainConditionsMet.push("critical_safety_signals_clear");
  } else {
    maintainConditionsMissing.push("critical_safety_signals");
  }

  if (operational.rateLimitHealthy) {
    maintainConditionsMet.push("rate_limit_ok");
    expansionConditionsMet.push("rate_limit_ok");
  } else {
    maintainConditionsMissing.push("rate_limit");
    expansionConditionsMissing.push("rate_limit");
  }

  if (operational.usageAuditHealthy) {
    maintainConditionsMet.push("usage_audit_ok");
    expansionConditionsMet.push("usage_audit_ok");
  } else {
    maintainConditionsMissing.push("usage_audit");
    expansionConditionsMissing.push("usage_audit");
  }

  if (!retention.cleanupOverdue) {
    maintainConditionsMet.push("retention_ok");
    expansionConditionsMet.push("retention_ok");
  } else {
    maintainConditionsMissing.push("retention_cleanup");
    expansionConditionsMissing.push("retention_cleanup");
  }

  if (feedback.reviewBacklog <= config.feedbackBacklogMax) {
    maintainConditionsMet.push("feedback_backlog_ok");
    expansionConditionsMet.push("feedback_backlog_ok");
  } else {
    maintainConditionsMissing.push("feedback_backlog");
    expansionConditionsMissing.push("feedback_backlog");
  }

  if (providerErrorPct <= config.providerErrorRateMaxPct) {
    maintainConditionsMet.push("provider_error_low");
    expansionConditionsMet.push("provider_error_low");
  } else {
    maintainConditionsMissing.push("provider_error_rate");
    expansionConditionsMissing.push("provider_error_rate");
  }

  if (usage.permissionDenied === 0) {
    maintainConditionsMet.push("no_permission_denied");
    expansionConditionsMet.push("no_permission_denied");
  } else {
    maintainConditionsMissing.push("permission_denied");
    expansionConditionsMissing.push("permission_denied");
  }

  if (periodDays >= config.minOperationDays) {
    expansionConditionsMet.push("min_operation_days");
  } else {
    expansionConditionsMissing.push("min_operation_days");
  }

  if (usage.totalBetaRequests >= config.minBetaRequests) {
    expansionConditionsMet.push("min_beta_requests");
  } else {
    expansionConditionsMissing.push("min_beta_requests");
  }

  if (feedback.productSolicitationRisk === 0) {
    expansionConditionsMet.push("no_product_solicitation_risk");
  } else {
    expansionConditionsMissing.push("product_solicitation_risk");
  }

  if (operational.betaOperational) {
    expansionConditionsMet.push("allowlist_beta_operational");
  } else {
    expansionConditionsMissing.push("allowlist_beta_operational");
  }

  const rationale: string[] = [];
  const noGoReasons = [...noGoTriggers];
  const improvementItems = [...improvementTriggers];

  let decision: AnswerAssistantBetaDecision;
  const decisionCandidates: AnswerAssistantBetaDecision[] = [];

  if (noGoTriggers.length > 0) {
    if (
      noGoTriggers.includes("CRITICAL_STOP") ||
      noGoTriggers.includes("OUTPUT_SAFETY_MISS") ||
      noGoTriggers.includes("FIELD_EXPOSURE_RISK")
    ) {
      decision = "PAUSE_BETA";
      decisionCandidates.push("PAUSE_BETA", "EXPANSION_NOT_READY");
      rationale.push(
        "즉시 No-Go 안전 신호가 있어 beta 일시 중단 검토가 우선입니다.",
      );
    } else if (
      noGoTriggers.includes("CLAIM_JUDGMENT_RISK") ||
      noGoTriggers.includes("MEDICAL_INTERPRETATION_RISK") ||
      noGoTriggers.includes("LOSS_ADJUSTMENT_RISK")
    ) {
      decision = "IMPROVE_BEFORE_EXPANSION";
      decisionCandidates.push(
        "IMPROVE_BEFORE_EXPANSION",
        "EXPANSION_NOT_READY",
        "PAUSE_BETA",
      );
      rationale.push("판단·의료·손해사정성 위험 신호로 확대 불가입니다.");
    } else {
      decision = "EXPANSION_NOT_READY";
      decisionCandidates.push("EXPANSION_NOT_READY", "IMPROVE_BEFORE_EXPANSION");
      rationale.push("운영·보관·접근 No-Go 조건이 해소될 때까지 확대 불가입니다.");
    }
  } else if (improvementTriggers.length > 0) {
    decision = "IMPROVE_BEFORE_EXPANSION";
    decisionCandidates.push(
      "IMPROVE_BEFORE_EXPANSION",
      "EXPANSION_NOT_READY",
      "CONTINUE_CURRENT_BETA",
    );
    rationale.push(
      "치명적 신호는 없으나 개선 항목이 누적되어 확대 전 개선이 필요합니다.",
    );
  } else if (
    expansionConditionsMissing.length === 0 &&
    maintainConditionsMissing.length === 0
  ) {
    decision = "LIMITED_EXPANSION_CANDIDATE";
    decisionCandidates.push(
      "LIMITED_EXPANSION_CANDIDATE",
      "CONTINUE_CURRENT_BETA",
    );
    rationale.push(
      "집계 지표가 안정적입니다. allowlist 소폭 확대는 별도 PR·수동 sign-off 후에만 검토하세요.",
    );
  } else if (maintainConditionsMissing.length === 0) {
    decision = "CONTINUE_CURRENT_BETA";
    decisionCandidates.push("CONTINUE_CURRENT_BETA", "EXPANSION_NOT_READY");
    rationale.push(
      "현 allowlist beta는 유지 가능합니다. 확대 데이터·기간이 아직 부족할 수 있습니다.",
    );
  } else {
    decision = "EXPANSION_NOT_READY";
    decisionCandidates.push("EXPANSION_NOT_READY", "CONTINUE_CURRENT_BETA");
    rationale.push("유지·확대 조건 일부 미충족 — 추가 운영 데이터가 필요합니다.");
  }

  if (
    noGoTriggers.length > 0 &&
    decisionCandidates.includes("LIMITED_EXPANSION_CANDIDATE")
  ) {
    throw new Error("LIMITED_EXPANSION_CANDIDATE must not appear with No-Go");
  }

  let nextPr: BetaExpansionNextPr = "PR-103-QA";
  let nextPrSummary =
    "decision dashboard 검수(PR-103-QA) 후 운영자 수동 판단을 기록하세요.";

  if (
    decision === "PAUSE_BETA" ||
    noGoTriggers.some((t) =>
      [
        "CRITICAL_STOP",
        "OUTPUT_SAFETY_MISS",
        "FIELD_EXPOSURE_RISK",
        "CLAIM_JUDGMENT_RISK",
        "MEDICAL_INTERPRETATION_RISK",
        "LOSS_ADJUSTMENT_RISK",
      ].includes(t),
    )
  ) {
    nextPr = "PR-104-A";
    nextPrSummary =
      "PR-104-A: beta pause / safety fix — gate OFF·allowlist 중단은 운영자 수동만.";
  } else if (decision === "IMPROVE_BEFORE_EXPANSION") {
    nextPr = "PR-104-B";
    nextPrSummary =
      "PR-104-B: retrieval·차단·source·UI copy·feedback validation 개선.";
  } else if (decision === "LIMITED_EXPANSION_CANDIDATE") {
    nextPr = "PR-104-C";
    nextPrSummary =
      "PR-104-C: allowlist 소폭 확대 계획(자동 확대 없음)·monitoring·rollback 기준.";
  } else if (decision === "CONTINUE_CURRENT_BETA") {
    nextPr = "PR-104-D";
    nextPrSummary =
      "PR-104-D: 현 beta 유지·추가 데이터 수집·다음 리뷰 일정 문서화.";
  } else {
    nextPr = "PR-104-B";
    nextPrSummary =
      "PR-104-B 또는 PR-104-D: 개선 항목 정리 후 재검토 일정을 잡으세요.";
  }

  return {
    noGoTriggers,
    improvementTriggers,
    maintainConditionsMet,
    maintainConditionsMissing,
    expansionConditionsMet,
    expansionConditionsMissing,
    decision,
    decisionCandidates,
    rationale,
    noGoReasons,
    improvementItems,
    nextPr,
    nextPrSummary,
  };
}

export function betaExpansionDecisionFilterQuery(
  params: BetaExpansionDecisionSearchParams,
): string {
  const parts = new URLSearchParams();
  if (params.createdFrom) parts.set("createdFrom", params.createdFrom);
  if (params.createdTo) parts.set("createdTo", params.createdTo);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

const FEEDBACK_SIGNAL_ROWS: {
  key: string;
  label: string;
  where: (
    period: { start: Date; end: Date },
  ) => Prisma.AnswerAssistantBetaFeedbackWhereInput;
  impact: string;
  action: string;
}[] = [
  {
    key: "FIELD_EXPOSURE_RISK",
    label: "개인정보·노출 위험",
    where: () => ({ safetySignal: "privacy_risk" }),
    impact: "즉시 No-Go",
    action: "PR-104-A safety fix 검토",
  },
  {
    key: "OUTPUT_SAFETY_MISS",
    label: "출력 안전 미스",
    where: () => ({
      OR: [
        { safetySignal: "output_too_assertive" },
        { noteCategory: "output_safety", feedbackType: "safety_concern" },
      ],
    }),
    impact: "즉시 No-Go",
    action: "output safety·고지 점검",
  },
  {
    key: "CLAIM_JUDGMENT_RISK",
    label: "보험금 판단 위험",
    where: () => ({
      usageAudit: { blockedReason: "CLAIM_JUDGMENT" },
    }),
    impact: "즉시 No-Go",
    action: "차단 정책·피드백 재검토",
  },
  {
    key: "MEDICAL_INTERPRETATION_RISK",
    label: "의료 해석 위험",
    where: () => ({
      usageAudit: { blockedReason: "MEDICAL_INFO" },
    }),
    impact: "즉시 No-Go",
    action: "의료 차단·안내 강화",
  },
  {
    key: "LOSS_ADJUSTMENT_RISK",
    label: "손해사정성 위험",
    where: () => ({
      usageAudit: { blockedReason: "LOSS_ADJUSTMENT" },
    }),
    impact: "즉시 No-Go",
    action: "손해사정 차단 재검수",
  },
];

export async function loadBetaExpansionDecisionReport(
  params: BetaExpansionDecisionSearchParams,
): Promise<BetaExpansionDecisionReport> {
  const config = getBetaExpansionDecisionConfig();
  const period = resolveBetaExpansionDecisionPeriod(params);
  const periodDays = Math.max(
    1,
    Math.ceil(
      (period.end.getTime() - period.start.getTime()) / (24 * 60 * 60 * 1000),
    ),
  );
  const auditWhere = buildBetaExpansionAuditWhere(period);
  const feedbackWhere = buildBetaExpansionFeedbackWhere(period);

  const retentionPreview = await previewAnswerAssistantRetentionCleanup();
  const operationalSnapshot = getUsageAuditOperationalSnapshot();

  const [
    totalBetaRequests,
    success,
    blocked,
    rateLimited,
    promptInjectionBlocked,
    outputSafetyBlocked,
    providerError,
    insufficientEvidence,
    permissionDenied,
    notAllowlisted,
    providerNotConfigured,
    totalFeedback,
    criticalFeedback,
    needsFix,
    unsafeOutput,
    fieldExposureRisk,
    outputSafetyMiss,
    claimJudgmentRisk,
    medicalInterpretationRisk,
    lossAdjustmentRisk,
    productSolicitationRisk,
    evidenceMissing,
    wrongSource,
    uiConfusing,
    tooRestrictive,
    blockedIncorrectly,
    reviewBacklog,
    criticalProtected,
    linkedAuditProtected,
    lastExecuteCleanup,
    ...signalLatest
  ] = await Promise.all([
    prisma.answerAssistantUsageAudit.count({ where: auditWhere }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, outcome: "success" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, outcome: "blocked" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, rateLimitBlocked: true },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, blockedReason: "PROMPT_INJECTION" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, outputSafetyBlocked: true },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, providerErrorCode: { not: null } },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, blockedReason: "INSUFFICIENT_EVIDENCE" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, blockedReason: "UNAUTHORIZED" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, blockedReason: "NOT_ALLOWLISTED" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...auditWhere, blockedReason: "PROVIDER_NOT_CONFIGURED" },
    }),
    prisma.answerAssistantBetaFeedback.count({ where: feedbackWhere }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        OR: [{ severity: "high" }, { adminStatus: "incident_candidate" }],
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        adminStatus: { in: ["new", "triaged"] },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        OR: [
          { feedbackType: "safety_concern" },
          { safetySignal: "output_too_assertive" },
        ],
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...feedbackWhere, safetySignal: "privacy_risk" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        OR: [
          { safetySignal: "output_too_assertive" },
          { noteCategory: "output_safety", feedbackType: "safety_concern" },
        ],
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        usageAudit: { blockedReason: "CLAIM_JUDGMENT" },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        usageAudit: { blockedReason: "MEDICAL_INFO" },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        usageAudit: { blockedReason: "LOSS_ADJUSTMENT" },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        usageAudit: { blockedReason: "PRODUCT_SOLICITATION" },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        OR: [
          { safetySignal: "evidence_too_weak" },
          { noteCategory: "evidence" },
        ],
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        safetySignal: "evidence_too_weak",
        feedbackType: "blocked_experience",
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...feedbackWhere, feedbackType: "ui_understanding" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...feedbackWhere, safetySignal: "blocking_felt_wrong" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        safetySignal: "blocking_felt_wrong",
        feedbackType: "blocked_experience",
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        ...feedbackWhere,
        adminStatus: { in: ["new", "triaged", "incident_candidate"] },
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: {
        OR: [{ severity: "high" }, { adminStatus: "incident_candidate" }],
      },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { usageAuditId: { not: null } },
    }),
    prisma.answerAssistantCleanupLog.findFirst({
      where: { mode: "execute" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    ...FEEDBACK_SIGNAL_ROWS.map((row) =>
      prisma.answerAssistantBetaFeedback.findFirst({
        where: { AND: [feedbackWhere, row.where(period)] },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, adminStatus: true },
      }),
    ),
  ]);

  const oldFeedbackCandidates =
    retentionPreview.eligible.feedbackStandard +
    retentionPreview.eligible.feedbackCritical;

  const daysSinceCleanup = lastExecuteCleanup
    ? Math.floor(
        (Date.now() - lastExecuteCleanup.createdAt.getTime()) /
          (24 * 60 * 60 * 1000),
      )
    : null;

  const cleanupOverdue =
    retentionPreview.eligible.usageAudit > 0 &&
    (daysSinceCleanup === null || daysSinceCleanup > config.cleanupOverdueDays);

  const rateLimitHealthy =
    operationalSnapshot.rateLimitBackend === "durable" ||
    process.env.NODE_ENV !== "production";
  const usageAuditHealthy =
    operationalSnapshot.auditBackend === "durable" ||
    process.env.NODE_ENV !== "production";

  const providerErrorPct =
    totalBetaRequests > 0
      ? Math.round((providerError / totalBetaRequests) * 100)
      : 0;

  const structuralNoGo: string[] = [];
  if (!assertAnswerAssistantAuditSchemaSafe()) {
    structuralNoGo.push("RAW_PROMPT_OUTPUT_SCHEMA_RISK");
  }
  if (process.env.NODE_ENV === "production") {
    if (operationalSnapshot.rateLimitBackend !== "durable") {
      structuralNoGo.push("RATE_LIMIT_NOT_DURABLE_PRODUCTION");
    }
    if (operationalSnapshot.auditBackend !== "durable") {
      structuralNoGo.push("USAGE_AUDIT_NOT_DURABLE_PRODUCTION");
    }
  }

  const usage: BetaExpansionUsageMetrics = {
    totalBetaRequests,
    success,
    blocked,
    rateLimited,
    promptInjectionBlocked,
    outputSafetyBlocked,
    providerError,
    insufficientEvidence,
    permissionDenied,
    notAllowlisted,
    providerNotConfigured,
  };

  const feedback: BetaExpansionFeedbackMetrics = {
    totalFeedback,
    criticalFeedback,
    needsFix,
    unsafeOutput,
    fieldExposureRisk,
    outputSafetyMiss,
    claimJudgmentRisk,
    medicalInterpretationRisk,
    lossAdjustmentRisk,
    productSolicitationRisk,
    evidenceMissing,
    wrongSource,
    uiConfusing,
    tooRestrictive,
    blockedIncorrectly,
    reviewBacklog,
  };

  const retention: BetaExpansionRetentionMetrics = {
    lastCleanupDate: lastExecuteCleanup?.createdAt.toISOString() ?? null,
    cleanupOverdue,
    oldAuditCandidateCount: retentionPreview.eligible.usageAudit,
    oldFeedbackCandidateCount: oldFeedbackCandidates,
    criticalFeedbackProtectedCount: criticalProtected,
    linkedUsageAuditProtectedCount: linkedAuditProtected,
  };

  const operational: BetaExpansionOperationalReadiness = {
    rateLimitHealthy,
    usageAuditHealthy,
    retentionHealthy: !cleanupOverdue,
    cleanupOverdue,
    betaOperational: operationalSnapshot.allowlistBetaStatus === "operational",
    allowlistBetaStatus: operationalSnapshot.allowlistBetaStatus,
    providerErrorElevated: providerErrorPct > config.providerErrorRateMaxPct,
    permissionDeniedElevated: permissionDenied > 0,
    notAllowlistedElevated:
      notAllowlisted >= config.improvementNotAllowlistedMin,
  };

  const safetyNoGoRows: BetaExpansionSafetySignalRow[] =
    FEEDBACK_SIGNAL_ROWS.map((row, index) => {
      const latest = signalLatest[index];
      const countPromise = [
        fieldExposureRisk,
        outputSafetyMiss,
        claimJudgmentRisk,
        medicalInterpretationRisk,
        lossAdjustmentRisk,
      ][index];
      return {
        signalKey: row.key,
        label: row.label,
        count: countPromise ?? 0,
        latestAt: latest?.createdAt.toISOString() ?? null,
        reviewStatusSummary: latest?.adminStatus ?? "데이터 없음",
        expansionImpact: row.impact,
        recommendedAction: row.action,
      };
    });

  const evaluated = evaluateBetaExpansionDecision({
    usage,
    feedback,
    retention,
    operational,
    structuralNoGo,
    periodDays,
    config,
  });

  return {
    period: {
      start: period.start.toISOString(),
      end: period.end.toISOString(),
    },
    usage,
    feedback,
    retention,
    operational,
    safetyNoGoRows,
    config,
    expansionScopeNote:
      "확대는 전체 VERIFIED_PLANNER 공개가 아니라 allowlist 소폭 확대 계획(PR-104-C)만 해당합니다. 자동 확대·gate ON·제재 없음.",
    forbiddenReminders: [
      "allowlist 자동 확대 금지",
      "feature gate 자동 ON 금지",
      "beta 자동 중단·사용자 자동 제재 금지",
      "GENERAL_USER·public chatbot·고객 자동 발송 금지",
      "raw prompt/output·생성 초안 DB 저장 금지",
    ],
    ...evaluated,
  };
}

export function getBetaExpansionOperationalBanner(): {
  betaGateEnabled: boolean;
  betaEnvEnabled: boolean;
  allowlistPilotCount: number;
  allowlistBetaStatus: string;
  verifiedGenerationEnabled: boolean;
} {
  return {
    betaGateEnabled: isAnswerAssistantVerifiedGateEnvEnabled(),
    betaEnvEnabled: isAnswerAssistantVerifiedBetaEnabled(),
    allowlistPilotCount: getVerifiedAnswerAssistantAllowlistCount(),
    allowlistBetaStatus: getAllowlistBetaOperationalStatus(),
    verifiedGenerationEnabled: isAnswerAssistantVerifiedPreviewEnabled(),
  };
}
