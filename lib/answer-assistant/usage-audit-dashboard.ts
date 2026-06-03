// Admin usage audit dashboard queries (PR-100). Aggregates only — no prompt/draft/PII.

import type {
  AnswerAssistantUsageAudience,
  AnswerAssistantUsageOutcome,
  Prisma,
} from "@prisma/client";
import { getAllowlistBetaOperationalStatus } from "./allowlist-beta";
import { getVerifiedAnswerAssistantAllowlistCount } from "./allowlist";
import {
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "./feature-gate";
import { BLOCKED_REASON_LABEL } from "./labels";
import { prisma } from "@/lib/prisma";
import {
  adminListPageCount,
  ADMIN_LIST_PAGE_SIZE,
  parseAdminListPage,
} from "@/lib/admin/list-pagination";
import {
  getAnswerAssistantRateLimitBackend,
  getAnswerAssistantUsageAuditBackend,
} from "./rate-limit-config";
import type { AnswerAssistantBlockedReason } from "./types";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "./usage-log";

/** Blocked events at or above this count per userId in the filter window are flagged. */
export const USAGE_AUDIT_HIGH_BLOCK_THRESHOLD = 10;

export type UsageAuditDashboardSearchParams = {
  audience?: string;
  outcome?: string;
  blockedReason?: string;
  rateLimitBlocked?: string;
  outputSafetyBlocked?: string;
  providerError?: string;
  isAdminTester?: string;
  createdFrom?: string;
  createdTo?: string;
  userIdPrefix?: string;
  page?: string;
};

export type UsageAuditOperationalSnapshot = {
  auditBackend: "memory" | "durable";
  rateLimitBackend: "memory" | "durable";
  betaGateEnabled: boolean;
  betaEnvEnabled: boolean;
  allowlistPilotCount: number;
  allowlistBetaStatus: "disabled" | "not_configured" | "operational";
  verifiedGenerationEnabled: boolean;
};

export type UsageAuditSummaryMetrics = {
  total: number;
  success: number;
  blocked: number;
  rateLimitBlocked: number;
  outputSafetyBlocked: number;
  providerErrors: number;
  promptInjectionBlocks: number;
  adminTesterEvents: number;
};

export type UsageAuditCountRow = {
  key: string;
  label: string;
  count: number;
};

export type UsageAuditHighBlockUserRow = {
  userIdPrefix: string;
  blockedCount: number;
};

export type UsageAuditEventRow = {
  id: string;
  createdAt: string;
  audience: AnswerAssistantUsageAudience;
  outcome: AnswerAssistantUsageOutcome;
  blockedReasonLabel: string | null;
  requestPurposeLabel: string | null;
  rateLimitBlocked: boolean;
  outputSafetyBlocked: boolean;
  providerErrorCode: string | null;
  isAdminTester: boolean;
  userIdPrefix: string;
  candidateCount: number | null;
};

export type UsageAuditDashboardData = {
  operational: UsageAuditOperationalSnapshot;
  summary: UsageAuditSummaryMetrics;
  byOutcome: UsageAuditCountRow[];
  byBlockedReason: UsageAuditCountRow[];
  byAudience: UsageAuditCountRow[];
  highBlockUsers: UsageAuditHighBlockUserRow[];
  recentEvents: UsageAuditEventRow[];
  totalEvents: number;
  page: number;
  pageCount: number;
  durableAuditEnabled: boolean;
};

export function truncateUsageAuditUserId(userId: string): string {
  const trimmed = userId.trim();
  if (trimmed.length <= 10) {
    return trimmed;
  }
  return `${trimmed.slice(0, 8)}…`;
}

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

function blockedReasonLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  const known = BLOCKED_REASON_LABEL[reason as AnswerAssistantBlockedReason];
  return known ?? reason;
}

export function buildUsageAuditDashboardWhere(
  params: UsageAuditDashboardSearchParams,
): Prisma.AnswerAssistantUsageAuditWhereInput {
  const and: Prisma.AnswerAssistantUsageAuditWhereInput[] = [];

  if (
    params.audience &&
    params.audience !== "all" &&
    (params.audience === "admin" || params.audience === "verified_planner")
  ) {
    and.push({ audience: params.audience });
  }

  if (
    params.outcome &&
    params.outcome !== "all" &&
    (params.outcome === "success" || params.outcome === "blocked")
  ) {
    and.push({ outcome: params.outcome });
  }

  if (params.blockedReason && params.blockedReason !== "all") {
    and.push({ blockedReason: params.blockedReason });
  }

  if (params.rateLimitBlocked === "true") {
    and.push({ rateLimitBlocked: true });
  }
  if (params.rateLimitBlocked === "false") {
    and.push({ rateLimitBlocked: false });
  }

  if (params.outputSafetyBlocked === "true") {
    and.push({ outputSafetyBlocked: true });
  }
  if (params.outputSafetyBlocked === "false") {
    and.push({ outputSafetyBlocked: false });
  }

  if (params.providerError === "true") {
    and.push({ providerErrorCode: { not: null } });
  }
  if (params.providerError === "false") {
    and.push({ providerErrorCode: null });
  }

  if (params.isAdminTester === "true") {
    and.push({ isAdminTester: true });
  }
  if (params.isAdminTester === "false") {
    and.push({ isAdminTester: false });
  }

  const prefix = params.userIdPrefix?.trim();
  if (prefix) {
    and.push({ userId: { startsWith: prefix } });
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

export function getUsageAuditOperationalSnapshot(): UsageAuditOperationalSnapshot {
  return {
    auditBackend: getAnswerAssistantUsageAuditBackend(),
    rateLimitBackend: getAnswerAssistantRateLimitBackend(),
    betaGateEnabled: isAnswerAssistantVerifiedGateEnvEnabled(),
    betaEnvEnabled: isAnswerAssistantVerifiedBetaEnabled(),
    allowlistPilotCount: getVerifiedAnswerAssistantAllowlistCount(),
    allowlistBetaStatus: getAllowlistBetaOperationalStatus(),
    verifiedGenerationEnabled: isAnswerAssistantVerifiedPreviewEnabled(),
  };
}

export function usageAuditDashboardFilterQuery(
  params: UsageAuditDashboardSearchParams,
  overrides: Partial<UsageAuditDashboardSearchParams> = {},
): string {
  const merged = { ...params, ...overrides };
  const parts = new URLSearchParams();
  if (merged.audience && merged.audience !== "all") {
    parts.set("audience", merged.audience);
  }
  if (merged.outcome && merged.outcome !== "all") {
    parts.set("outcome", merged.outcome);
  }
  if (merged.blockedReason && merged.blockedReason !== "all") {
    parts.set("blockedReason", merged.blockedReason);
  }
  if (merged.rateLimitBlocked && merged.rateLimitBlocked !== "all") {
    parts.set("rateLimitBlocked", merged.rateLimitBlocked);
  }
  if (merged.outputSafetyBlocked && merged.outputSafetyBlocked !== "all") {
    parts.set("outputSafetyBlocked", merged.outputSafetyBlocked);
  }
  if (merged.providerError && merged.providerError !== "all") {
    parts.set("providerError", merged.providerError);
  }
  if (merged.isAdminTester && merged.isAdminTester !== "all") {
    parts.set("isAdminTester", merged.isAdminTester);
  }
  if (merged.createdFrom) parts.set("createdFrom", merged.createdFrom);
  if (merged.createdTo) parts.set("createdTo", merged.createdTo);
  if (merged.userIdPrefix) parts.set("userIdPrefix", merged.userIdPrefix);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

export const AUDIT_EVENT_SELECT = {
  id: true,
  createdAt: true,
  audience: true,
  outcome: true,
  blockedReason: true,
  requestPurpose: true,
  rateLimitBlocked: true,
  outputSafetyBlocked: true,
  providerErrorCode: true,
  isAdminTester: true,
  userId: true,
  candidateCount: true,
} as const satisfies Prisma.AnswerAssistantUsageAuditSelect;

/** Ensures dashboard queries never request forbidden payload fields. */
export function assertUsageAuditDashboardSelectSafe(
  select: Record<string, unknown>,
): void {
  for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
    if (field in select) {
      throw new Error(`FORBIDDEN_USAGE_AUDIT_FIELD:${field}`);
    }
  }
}

assertUsageAuditDashboardSelectSafe(AUDIT_EVENT_SELECT);

export async function loadUsageAuditDashboard(
  params: UsageAuditDashboardSearchParams,
): Promise<UsageAuditDashboardData> {
  const where = buildUsageAuditDashboardWhere(params);
  const page = parseAdminListPage(params.page);
  const operational = getUsageAuditOperationalSnapshot();
  const durableAuditEnabled = operational.auditBackend === "durable";

  const [
    total,
    success,
    blocked,
    rateLimitBlocked,
    outputSafetyBlocked,
    providerErrors,
    promptInjectionBlocks,
    adminTesterEvents,
    outcomeGroups,
    blockedReasonGroups,
    audienceGroups,
    highBlockGroups,
    totalFiltered,
    recentRows,
  ] = await Promise.all([
    prisma.answerAssistantUsageAudit.count({ where }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, outcome: "success" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, outcome: "blocked" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, rateLimitBlocked: true },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, outputSafetyBlocked: true },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, providerErrorCode: { not: null } },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, blockedReason: "PROMPT_INJECTION" },
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { ...where, isAdminTester: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["outcome"],
      where,
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["blockedReason"],
      where: { ...where, blockedReason: { not: null } },
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["audience"],
      where,
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.groupBy({
      by: ["userId"],
      where: { ...where, outcome: "blocked" },
      _count: { _all: true },
    }),
    prisma.answerAssistantUsageAudit.count({ where }),
    prisma.answerAssistantUsageAudit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
      take: ADMIN_LIST_PAGE_SIZE,
      select: AUDIT_EVENT_SELECT,
    }),
  ]);

  const byOutcome: UsageAuditCountRow[] = outcomeGroups.map((row) => ({
    key: row.outcome,
    label: row.outcome === "success" ? "성공" : "차단",
    count: row._count._all,
  }));

  const byBlockedReason: UsageAuditCountRow[] = blockedReasonGroups
    .filter((row) => row.blockedReason)
    .map((row) => ({
      key: row.blockedReason!,
      label: blockedReasonLabel(row.blockedReason) ?? row.blockedReason!,
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const byAudience: UsageAuditCountRow[] = audienceGroups.map((row) => ({
    key: row.audience,
    label: row.audience === "admin" ? "관리자" : "검증 설계사",
    count: row._count._all,
  }));

  const highBlockUsers: UsageAuditHighBlockUserRow[] = highBlockGroups
    .filter((row) => row._count._all >= USAGE_AUDIT_HIGH_BLOCK_THRESHOLD)
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10)
    .map((row) => ({
      userIdPrefix: truncateUsageAuditUserId(row.userId),
      blockedCount: row._count._all,
    }));

  const recentEvents: UsageAuditEventRow[] = recentRows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    audience: row.audience,
    outcome: row.outcome,
    blockedReasonLabel: blockedReasonLabel(row.blockedReason),
    requestPurposeLabel: row.requestPurpose ?? null,
    rateLimitBlocked: row.rateLimitBlocked,
    outputSafetyBlocked: row.outputSafetyBlocked,
    providerErrorCode: row.providerErrorCode,
    isAdminTester: row.isAdminTester,
    userIdPrefix: truncateUsageAuditUserId(row.userId),
    candidateCount: row.candidateCount,
  }));

  return {
    operational,
    summary: {
      total,
      success,
      blocked,
      rateLimitBlocked,
      outputSafetyBlocked,
      providerErrors,
      promptInjectionBlocks,
      adminTesterEvents,
    },
    byOutcome,
    byBlockedReason,
    byAudience,
    highBlockUsers,
    recentEvents,
    totalEvents: totalFiltered,
    page,
    pageCount: adminListPageCount(totalFiltered),
    durableAuditEnabled,
  };
}

export const USAGE_AUDIT_BLOCKED_REASON_FILTER_OPTIONS = Object.keys(
  BLOCKED_REASON_LABEL,
) as AnswerAssistantBlockedReason[];
