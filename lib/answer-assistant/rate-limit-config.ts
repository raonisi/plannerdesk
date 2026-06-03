// Answer assistant rate limit policy (PR-99-A). Configurable via public env vars.

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const ANSWER_ASSISTANT_RATE_LIMIT_CONFIG = {
  perMinute: parsePositiveInt(
    process.env.ANSWER_ASSISTANT_RATE_LIMIT_PER_MINUTE,
    3,
  ),
  perDay: parsePositiveInt(process.env.ANSWER_ASSISTANT_RATE_LIMIT_PER_DAY, 20),
  blockedPerDay: parsePositiveInt(
    process.env.ANSWER_ASSISTANT_BLOCKED_REQUEST_LIMIT_PER_DAY,
    5,
  ),
  promptInjectionPerDay: parsePositiveInt(
    process.env.ANSWER_ASSISTANT_PROMPT_INJECTION_LIMIT_PER_DAY,
    3,
  ),
  providerErrorPerDay: parsePositiveInt(
    process.env.ANSWER_ASSISTANT_PROVIDER_ERROR_LIMIT_PER_DAY,
    5,
  ),
  abuseCooldownMs: 86_400_000,
} as const;

/** @deprecated Use ANSWER_ASSISTANT_RATE_LIMIT_CONFIG — kept for existing imports. */
export const VERIFIED_ANSWER_ASSIST_RATE_LIMIT = {
  perMinute: ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perMinute,
  perDay: ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perDay,
  blockedAttemptsBeforeCooldown:
    ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.blockedPerDay,
  promptInjectionBeforeCooldown:
    ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.promptInjectionPerDay,
  providerErrorBeforeCooldown:
    ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.providerErrorPerDay,
  abuseCooldownMs: ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.abuseCooldownMs,
} as const;

export type AnswerAssistantRateLimitBackend = "memory" | "durable";

export function getAnswerAssistantRateLimitBackend(): AnswerAssistantRateLimitBackend {
  const explicit = process.env.ANSWER_ASSISTANT_RATE_LIMIT_BACKEND
    ?.trim()
    .toLowerCase();
  if (explicit === "memory") return "memory";
  if (explicit === "durable" || explicit === "prisma") return "durable";
  if (process.env.NODE_ENV === "production") return "durable";
  return "memory";
}

export type AnswerAssistantUsageAuditBackend = "memory" | "durable";

export function getAnswerAssistantUsageAuditBackend(): AnswerAssistantUsageAuditBackend {
  const explicit = process.env.ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND
    ?.trim()
    .toLowerCase();
  if (explicit === "memory") return "memory";
  if (explicit === "durable" || explicit === "prisma") return "durable";
  if (process.env.NODE_ENV === "production") return "durable";
  return "memory";
}
