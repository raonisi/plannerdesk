// Beta expansion decision thresholds (PR-103). Advisory only — no auto expansion.

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const BETA_EXPANSION_DECISION_DEFAULTS = {
  minOperationDays: 14,
  minBetaRequests: 20,
  cleanupOverdueDays: 90,
  feedbackBacklogMax: 15,
  improvementEvidenceMissingMin: 3,
  improvementProviderErrorMin: 5,
  improvementInsufficientEvidencePct: 25,
  improvementNotAllowlistedMin: 10,
  improvementRateLimitedMin: 15,
  providerErrorRateMaxPct: 15,
} as const;

export type BetaExpansionDecisionConfig = {
  minOperationDays: number;
  minBetaRequests: number;
  cleanupOverdueDays: number;
  feedbackBacklogMax: number;
  improvementEvidenceMissingMin: number;
  improvementProviderErrorMin: number;
  improvementInsufficientEvidencePct: number;
  improvementNotAllowlistedMin: number;
  improvementRateLimitedMin: number;
  providerErrorRateMaxPct: number;
};

export function getBetaExpansionDecisionConfig(): BetaExpansionDecisionConfig {
  return {
    minOperationDays: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_MIN_OPERATION_DAYS,
      BETA_EXPANSION_DECISION_DEFAULTS.minOperationDays,
      7,
      180,
    ),
    minBetaRequests: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_MIN_REQUESTS,
      BETA_EXPANSION_DECISION_DEFAULTS.minBetaRequests,
      1,
      10000,
    ),
    cleanupOverdueDays: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_CLEANUP_OVERDUE_DAYS,
      BETA_EXPANSION_DECISION_DEFAULTS.cleanupOverdueDays,
      30,
      365,
    ),
    feedbackBacklogMax: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_FEEDBACK_BACKLOG_MAX,
      BETA_EXPANSION_DECISION_DEFAULTS.feedbackBacklogMax,
      1,
      500,
    ),
    improvementEvidenceMissingMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_IMPROVE_EVIDENCE_MIN,
      BETA_EXPANSION_DECISION_DEFAULTS.improvementEvidenceMissingMin,
      1,
      100,
    ),
    improvementProviderErrorMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_IMPROVE_PROVIDER_ERROR_MIN,
      BETA_EXPANSION_DECISION_DEFAULTS.improvementProviderErrorMin,
      1,
      100,
    ),
    improvementInsufficientEvidencePct: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_IMPROVE_INSUFFICIENT_PCT,
      BETA_EXPANSION_DECISION_DEFAULTS.improvementInsufficientEvidencePct,
      5,
      80,
    ),
    improvementNotAllowlistedMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_IMPROVE_NOT_ALLOWLISTED_MIN,
      BETA_EXPANSION_DECISION_DEFAULTS.improvementNotAllowlistedMin,
      1,
      500,
    ),
    improvementRateLimitedMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_IMPROVE_RATE_LIMITED_MIN,
      BETA_EXPANSION_DECISION_DEFAULTS.improvementRateLimitedMin,
      1,
      500,
    ),
    providerErrorRateMaxPct: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_BETA_DECISION_PROVIDER_ERROR_MAX_PCT,
      BETA_EXPANSION_DECISION_DEFAULTS.providerErrorRateMaxPct,
      1,
      50,
    ),
  };
}
