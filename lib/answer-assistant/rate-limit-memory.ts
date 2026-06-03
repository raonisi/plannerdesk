// In-memory rate limit backend (PR-97-B). Used in tests and explicit memory mode.

import type { AnswerAssistantBlockedReason } from "./types";
import { ANSWER_ASSISTANT_RATE_LIMIT_CONFIG } from "./rate-limit-config";
import type { VerifiedAnswerAssistantRateLimitResult } from "./rate-limit-types";

type WindowCounter = {
  count: number;
  windowStartMs: number;
};

type UserRateLimitState = {
  minute: WindowCounter;
  day: WindowCounter;
  abuse: {
    blockedCount: number;
    promptInjectionCount: number;
    providerErrorCount: number;
    windowStartMs: number;
    cooldownUntilMs: number | null;
  };
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const store = new Map<string, UserRateLimitState>();

function getOrCreateState(userId: string): UserRateLimitState {
  const existing = store.get(userId);
  if (existing) return existing;

  const now = Date.now();
  const created: UserRateLimitState = {
    minute: { count: 0, windowStartMs: now },
    day: { count: 0, windowStartMs: now },
    abuse: {
      blockedCount: 0,
      promptInjectionCount: 0,
      providerErrorCount: 0,
      windowStartMs: now,
      cooldownUntilMs: null,
    },
  };
  store.set(userId, created);
  return created;
}

function rollWindow(counter: WindowCounter, windowMs: number, now: number): void {
  if (now - counter.windowStartMs >= windowMs) {
    counter.count = 0;
    counter.windowStartMs = now;
  }
}

function rollAbuseWindow(state: UserRateLimitState, now: number): void {
  if (now - state.abuse.windowStartMs >= DAY_MS) {
    state.abuse.blockedCount = 0;
    state.abuse.promptInjectionCount = 0;
    state.abuse.providerErrorCount = 0;
    state.abuse.windowStartMs = now;
  }
}

function applyAbuseCooldownIfNeeded(
  state: UserRateLimitState,
  now: number,
): void {
  const config = ANSWER_ASSISTANT_RATE_LIMIT_CONFIG;
  const hitBlockedThreshold =
    state.abuse.blockedCount >= config.blockedPerDay;
  const hitInjectionThreshold =
    state.abuse.promptInjectionCount >= config.promptInjectionPerDay;
  const hitProviderErrorThreshold =
    state.abuse.providerErrorCount >= config.providerErrorPerDay;

  if (
    hitBlockedThreshold ||
    hitInjectionThreshold ||
    hitProviderErrorThreshold
  ) {
    state.abuse.cooldownUntilMs = now + config.abuseCooldownMs;
  }
}

export function memoryCheckVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): VerifiedAnswerAssistantRateLimitResult {
  const state = getOrCreateState(userId);
  rollWindow(state.minute, MINUTE_MS, now);
  rollWindow(state.day, DAY_MS, now);
  rollAbuseWindow(state, now);

  if (state.abuse.cooldownUntilMs && now < state.abuse.cooldownUntilMs) {
    return {
      allowed: false,
      reason: "abuse_cooldown",
      retryAfterSeconds: Math.ceil(
        (state.abuse.cooldownUntilMs - now) / 1000,
      ),
    };
  }

  const config = ANSWER_ASSISTANT_RATE_LIMIT_CONFIG;
  if (state.minute.count >= config.perMinute) {
    return {
      allowed: false,
      reason: "minute",
      retryAfterSeconds: Math.ceil(
        (state.minute.windowStartMs + MINUTE_MS - now) / 1000,
      ),
    };
  }

  if (state.day.count >= config.perDay) {
    return {
      allowed: false,
      reason: "day",
      retryAfterSeconds: Math.ceil(
        (state.day.windowStartMs + DAY_MS - now) / 1000,
      ),
    };
  }

  return { allowed: true };
}

export function memoryConsumeVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): void {
  const state = getOrCreateState(userId);
  rollWindow(state.minute, MINUTE_MS, now);
  rollWindow(state.day, DAY_MS, now);
  state.minute.count += 1;
  state.day.count += 1;
}

const SAFETY_GATE_BLOCKED_REASONS: ReadonlySet<AnswerAssistantBlockedReason> =
  new Set([
    "PERSONAL_INFO",
    "CONTRACT_INFO",
    "MEDICAL_INFO",
    "CLAIM_DOCUMENT",
    "CLAIM_JUDGMENT",
    "LOSS_ADJUSTMENT",
    "PRODUCT_SOLICITATION",
    "FEAR_MARKETING",
    "PROMPT_INJECTION",
  ]);

export function memoryRecordVerifiedAnswerAssistantBlockedAttempt(
  userId: string,
  blockedReason: AnswerAssistantBlockedReason | undefined,
  now = Date.now(),
): void {
  if (!blockedReason || !SAFETY_GATE_BLOCKED_REASONS.has(blockedReason)) {
    return;
  }

  const state = getOrCreateState(userId);
  rollAbuseWindow(state, now);
  state.abuse.blockedCount += 1;
  if (blockedReason === "PROMPT_INJECTION") {
    state.abuse.promptInjectionCount += 1;
  }
  applyAbuseCooldownIfNeeded(state, now);
}

export function memoryRecordVerifiedAnswerAssistantProviderError(
  userId: string,
  now = Date.now(),
): void {
  const state = getOrCreateState(userId);
  rollAbuseWindow(state, now);
  state.abuse.providerErrorCount += 1;
  applyAbuseCooldownIfNeeded(state, now);
}

export function resetVerifiedAnswerAssistantRateLimitStore(): void {
  store.clear();
}

export function getVerifiedAnswerAssistantRateLimitSnapshot(userId: string): {
  minuteCount: number;
  dayCount: number;
  blockedCount: number;
  promptInjectionCount: number;
  providerErrorCount: number;
} {
  const state = store.get(userId);
  if (!state) {
    return {
      minuteCount: 0,
      dayCount: 0,
      blockedCount: 0,
      promptInjectionCount: 0,
      providerErrorCount: 0,
    };
  }
  return {
    minuteCount: state.minute.count,
    dayCount: state.day.count,
    blockedCount: state.abuse.blockedCount,
    promptInjectionCount: state.abuse.promptInjectionCount,
    providerErrorCount: state.abuse.providerErrorCount,
  };
}
