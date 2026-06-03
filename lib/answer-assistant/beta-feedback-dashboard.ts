// Admin beta feedback safety review dashboard (PR-101).

import type {
  AnswerAssistantFeedbackReviewStatus,
  AnswerAssistantFeedbackSeverity,
  AnswerAssistantFeedbackType,
  AnswerAssistantSafetySignal,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  adminListPageCount,
  ADMIN_LIST_PAGE_SIZE,
  parseAdminListPage,
} from "@/lib/admin/list-pagination";
import { getAllowlistBetaOperationalStatus } from "./allowlist-beta";
import { getVerifiedAnswerAssistantAllowlistCount } from "./allowlist";
import {
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "./feature-gate";
import {
  BETA_FEEDBACK_REVIEW_STATUS_LABEL,
} from "./beta-feedback-labels";
import {
  BETA_FEEDBACK_TYPE_OPTIONS,
  BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS,
} from "./beta-feedback-labels";
import { isBetaFeedbackIncidentCandidateHint } from "./beta-feedback-validation";
import { truncateUsageAuditUserId } from "./usage-audit-dashboard";

export type BetaFeedbackDashboardSearchParams = {
  feedbackType?: string;
  safetySignal?: string;
  severity?: string;
  adminStatus?: string;
  incidentOnly?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: string;
};

export type BetaFeedbackListRow = {
  id: string;
  createdAt: string;
  feedbackType: AnswerAssistantFeedbackType;
  feedbackTypeLabel: string;
  safetySignal: AnswerAssistantSafetySignal | null;
  safetySignalLabel: string | null;
  severity: AnswerAssistantFeedbackSeverity;
  adminStatus: AnswerAssistantFeedbackReviewStatus;
  adminStatusLabel: string;
  incidentHint: boolean;
  usageAuditId: string | null;
  userIdPrefix: string | null;
  shortNote: string | null;
  auditOutcome: string | null;
  auditBlockedReason: string | null;
  auditRateLimitBlocked: boolean | null;
  auditOutputSafetyBlocked: boolean | null;
};

export type BetaFeedbackDashboardData = {
  summary: {
    total: number;
    newCount: number;
    incidentCandidates: number;
    highSeverity: number;
    safetyConcern: number;
  };
  byFeedbackType: { label: string; count: number }[];
  bySafetySignal: { label: string; count: number }[];
  byAdminStatus: { label: string; count: number }[];
  operational: {
    betaGateEnabled: boolean;
    betaEnvEnabled: boolean;
    allowlistPilotCount: number;
    allowlistBetaStatus: string;
    verifiedGenerationEnabled: boolean;
  };
  rows: BetaFeedbackListRow[];
  totalRows: number;
  page: number;
  pageCount: number;
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

export function buildBetaFeedbackDashboardWhere(
  params: BetaFeedbackDashboardSearchParams,
): Prisma.AnswerAssistantBetaFeedbackWhereInput {
  const and: Prisma.AnswerAssistantBetaFeedbackWhereInput[] = [];

  const typeValues = BETA_FEEDBACK_TYPE_OPTIONS.map((o) => o.value);
  if (
    params.feedbackType &&
    params.feedbackType !== "all" &&
    typeValues.includes(params.feedbackType as AnswerAssistantFeedbackType)
  ) {
    and.push({
      feedbackType: params.feedbackType as AnswerAssistantFeedbackType,
    });
  }

  const signalValues = BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS.map((o) => o.value);
  if (
    params.safetySignal &&
    params.safetySignal !== "all" &&
    signalValues.includes(params.safetySignal as AnswerAssistantSafetySignal)
  ) {
    and.push({
      safetySignal: params.safetySignal as AnswerAssistantSafetySignal,
    });
  }

  if (
    params.severity &&
    params.severity !== "all" &&
    ["low", "medium", "high"].includes(params.severity)
  ) {
    and.push({
      severity: params.severity as AnswerAssistantFeedbackSeverity,
    });
  }

  if (
    params.adminStatus &&
    params.adminStatus !== "all" &&
    Object.keys(BETA_FEEDBACK_REVIEW_STATUS_LABEL).includes(params.adminStatus)
  ) {
    and.push({
      adminStatus: params.adminStatus as AnswerAssistantFeedbackReviewStatus,
    });
  }

  if (params.incidentOnly === "true") {
    and.push({ adminStatus: "incident_candidate" });
  }

  const createdFrom = parseDateStart(params.createdFrom);
  const createdTo = parseDateEnd(params.createdTo);
  if (createdFrom || createdTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (createdFrom) createdAt.gte = createdFrom;
    if (createdTo) createdAt.lte = createdTo;
    and.push({ createdAt });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

export function betaFeedbackDashboardFilterQuery(
  params: BetaFeedbackDashboardSearchParams,
  overrides: Partial<BetaFeedbackDashboardSearchParams> = {},
): string {
  const merged = { ...params, ...overrides };
  const parts = new URLSearchParams();
  if (merged.feedbackType && merged.feedbackType !== "all") {
    parts.set("feedbackType", merged.feedbackType);
  }
  if (merged.safetySignal && merged.safetySignal !== "all") {
    parts.set("safetySignal", merged.safetySignal);
  }
  if (merged.severity && merged.severity !== "all") {
    parts.set("severity", merged.severity);
  }
  if (merged.adminStatus && merged.adminStatus !== "all") {
    parts.set("adminStatus", merged.adminStatus);
  }
  if (merged.incidentOnly === "true") parts.set("incidentOnly", "true");
  if (merged.createdFrom) parts.set("createdFrom", merged.createdFrom);
  if (merged.createdTo) parts.set("createdTo", merged.createdTo);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

const FEEDBACK_LIST_SELECT = {
  id: true,
  createdAt: true,
  feedbackType: true,
  safetySignal: true,
  severity: true,
  adminStatus: true,
  usageAuditId: true,
  userId: true,
  shortNote: true,
  usageAudit: {
    select: {
      outcome: true,
      blockedReason: true,
      rateLimitBlocked: true,
      outputSafetyBlocked: true,
    },
  },
} as const satisfies Prisma.AnswerAssistantBetaFeedbackSelect;

export async function loadBetaFeedbackDashboard(
  params: BetaFeedbackDashboardSearchParams,
): Promise<BetaFeedbackDashboardData> {
  const where = buildBetaFeedbackDashboardWhere(params);
  const page = parseAdminListPage(params.page);

  const typeLabel = Object.fromEntries(
    BETA_FEEDBACK_TYPE_OPTIONS.map((o) => [o.value, o.label]),
  );
  const signalLabel = Object.fromEntries(
    BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS.map((o) => [o.value, o.label]),
  );

  const [
    total,
    newCount,
    incidentCandidates,
    highSeverity,
    safetyConcern,
    typeGroups,
    signalGroups,
    statusGroups,
    totalFiltered,
    listRows,
  ] = await Promise.all([
    prisma.answerAssistantBetaFeedback.count({ where }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...where, adminStatus: "new" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...where, adminStatus: "incident_candidate" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...where, severity: "high" },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: { ...where, feedbackType: "safety_concern" },
    }),
    prisma.answerAssistantBetaFeedback.groupBy({
      by: ["feedbackType"],
      where,
      _count: { _all: true },
    }),
    prisma.answerAssistantBetaFeedback.groupBy({
      by: ["safetySignal"],
      where: { ...where, safetySignal: { not: null } },
      _count: { _all: true },
    }),
    prisma.answerAssistantBetaFeedback.groupBy({
      by: ["adminStatus"],
      where,
      _count: { _all: true },
    }),
    prisma.answerAssistantBetaFeedback.count({ where }),
    prisma.answerAssistantBetaFeedback.findMany({
      where,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
      take: ADMIN_LIST_PAGE_SIZE,
      select: FEEDBACK_LIST_SELECT,
    }),
  ]);

  const rows: BetaFeedbackListRow[] = listRows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    feedbackType: row.feedbackType,
    feedbackTypeLabel: typeLabel[row.feedbackType] ?? row.feedbackType,
    safetySignal: row.safetySignal,
    safetySignalLabel: row.safetySignal
      ? (signalLabel[row.safetySignal] ?? row.safetySignal)
      : null,
    severity: row.severity,
    adminStatus: row.adminStatus,
    adminStatusLabel: BETA_FEEDBACK_REVIEW_STATUS_LABEL[row.adminStatus],
    incidentHint: isBetaFeedbackIncidentCandidateHint({
      feedbackType: row.feedbackType,
      safetySignal: row.safetySignal,
      severity: row.severity,
    }),
    usageAuditId: row.usageAuditId,
    userIdPrefix: row.userId ? truncateUsageAuditUserId(row.userId) : null,
    shortNote: row.shortNote,
    auditOutcome: row.usageAudit?.outcome ?? null,
    auditBlockedReason: row.usageAudit?.blockedReason ?? null,
    auditRateLimitBlocked: row.usageAudit?.rateLimitBlocked ?? null,
    auditOutputSafetyBlocked: row.usageAudit?.outputSafetyBlocked ?? null,
  }));

  return {
    summary: {
      total,
      newCount,
      incidentCandidates,
      highSeverity,
      safetyConcern,
    },
    byFeedbackType: typeGroups.map((g) => ({
      label: typeLabel[g.feedbackType] ?? g.feedbackType,
      count: g._count._all,
    })),
    bySafetySignal: signalGroups
      .filter((g) => g.safetySignal)
      .map((g) => ({
        label: signalLabel[g.safetySignal!] ?? g.safetySignal!,
        count: g._count._all,
      })),
    byAdminStatus: statusGroups.map((g) => ({
      label: BETA_FEEDBACK_REVIEW_STATUS_LABEL[g.adminStatus],
      count: g._count._all,
    })),
    operational: {
      betaGateEnabled: isAnswerAssistantVerifiedGateEnvEnabled(),
      betaEnvEnabled: isAnswerAssistantVerifiedBetaEnabled(),
      allowlistPilotCount: getVerifiedAnswerAssistantAllowlistCount(),
      allowlistBetaStatus: getAllowlistBetaOperationalStatus(),
      verifiedGenerationEnabled: isAnswerAssistantVerifiedPreviewEnabled(),
    },
    rows,
    totalRows: totalFiltered,
    page,
    pageCount: adminListPageCount(totalFiltered),
  };
}
