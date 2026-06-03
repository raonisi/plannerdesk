// Answer Assistant data retention policy (PR-102). Counts/metadata only — no raw payloads.

function parseRetentionDays(
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

export const ANSWER_ASSISTANT_RETENTION_DEFAULTS = {
  rateLimitStateDays: 30,
  usageAuditDays: 180,
  feedbackDays: 365,
  feedbackCriticalDays: 730,
  cleanupLogDays: 365,
} as const;

export type AnswerAssistantRetentionConfig = {
  rateLimitStateDays: number;
  usageAuditDays: number;
  feedbackDays: number;
  feedbackCriticalDays: number;
  cleanupLogDays: number;
  cleanupExecuteEnabled: boolean;
};

export function getAnswerAssistantRetentionConfig(): AnswerAssistantRetentionConfig {
  return {
    rateLimitStateDays: parseRetentionDays(
      process.env.ANSWER_ASSISTANT_RATE_LIMIT_BUCKET_RETENTION_DAYS ??
        process.env.ANSWER_ASSISTANT_RATE_LIMIT_STATE_RETENTION_DAYS,
      ANSWER_ASSISTANT_RETENTION_DEFAULTS.rateLimitStateDays,
      7,
      90,
    ),
    usageAuditDays: parseRetentionDays(
      process.env.ANSWER_ASSISTANT_USAGE_AUDIT_RETENTION_DAYS,
      ANSWER_ASSISTANT_RETENTION_DEFAULTS.usageAuditDays,
      30,
      730,
    ),
    feedbackDays: parseRetentionDays(
      process.env.ANSWER_ASSISTANT_FEEDBACK_RETENTION_DAYS,
      ANSWER_ASSISTANT_RETENTION_DEFAULTS.feedbackDays,
      90,
      1095,
    ),
    feedbackCriticalDays: parseRetentionDays(
      process.env.ANSWER_ASSISTANT_FEEDBACK_CRITICAL_RETENTION_DAYS,
      ANSWER_ASSISTANT_RETENTION_DEFAULTS.feedbackCriticalDays,
      180,
      1825,
    ),
    cleanupLogDays: parseRetentionDays(
      process.env.ANSWER_ASSISTANT_CLEANUP_LOG_RETENTION_DAYS,
      ANSWER_ASSISTANT_RETENTION_DEFAULTS.cleanupLogDays,
      90,
      1095,
    ),
    cleanupExecuteEnabled: parseBooleanEnv(
      process.env.ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED,
      false,
    ),
  };
}

function parseBooleanEnv(raw: string | undefined, defaultValue: boolean): boolean {
  if (!raw) return defaultValue;
  const v = raw.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return defaultValue;
}

export function subtractRetentionDays(days: number, from = new Date()): Date {
  const cutoff = new Date(from);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  cutoff.setUTCHours(0, 0, 0, 0);
  return cutoff;
}

export const ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE = "DELETE-EXPIRED-DATA";
