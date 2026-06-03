// In-process rate limit for verified answer assistant (PR-97-B / PR-98).
// Durable store required for production full release — see release-readiness.ts.

import type { AnswerAssistantBlockedReason } from "./types";

export const VERIFIED_ANSWER_ASSIST_RATE_LIMIT = {
  perMinute: 3,
  perDay: 20,
  blockedAttemptsBeforeCooldown: 5,
  promptInjectionBeforeCooldown: 3,
  abuseCooldownMs: 86_400_000,
} as const;

export type VerifiedAnswerAssistantRateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "minute" | "day" | "abuse_cooldown";
      retryAfterSeconds: number;
    };

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
    state.abuse.windowStartMs = now;
  }
}

export function checkVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): VerifiedAnswerAssistantRateLimitResult {
  const state = getOrCreateState(userId);
  rollWindow(state.minute, MINUTE_MS, now);
  rollWindow(state.day, DAY_MS, now);
  rollAbuseWindow(state, now);

  if (state.abuse.cooldownUntilMs && now < state.abuse.cooldownUntilMs) {
    const retryAfterSeconds = Math.ceil(
      (state.abuse.cooldownUntilMs - now) / 1000,
    );
    return { allowed: false, reason: "abuse_cooldown", retryAfterSeconds };
  }

  if (state.minute.count >= VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perMinute) {
    const retryAfterSeconds = Math.ceil(
      (state.minute.windowStartMs + MINUTE_MS - now) / 1000,
    );
    return { allowed: false, reason: "minute", retryAfterSeconds };
  }

  if (state.day.count >= VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perDay) {
    const retryAfterSeconds = Math.ceil(
      (state.day.windowStartMs + DAY_MS - now) / 1000,
    );
    return { allowed: false, reason: "day", retryAfterSeconds };
  }

  return { allowed: true };
}

export function consumeVerifiedAnswerAssistantRateLimit(
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

export function recordVerifiedAnswerAssistantBlockedAttempt(
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

  const hitBlockedThreshold =
    state.abuse.blockedCount >=
    VERIFIED_ANSWER_ASSIST_RATE_LIMIT.blockedAttemptsBeforeCooldown;
  const hitInjectionThreshold =
    state.abuse.promptInjectionCount >=
    VERIFIED_ANSWER_ASSIST_RATE_LIMIT.promptInjectionBeforeCooldown;

  if (hitBlockedThreshold || hitInjectionThreshold) {
    state.abuse.cooldownUntilMs =
      now + VERIFIED_ANSWER_ASSIST_RATE_LIMIT.abuseCooldownMs;
  }
}

/** Test helper — resets in-process counters. */
export function resetVerifiedAnswerAssistantRateLimitStore(): void {
  store.clear();
}

export function getVerifiedAnswerAssistantRateLimitSnapshot(userId: string): {
  minuteCount: number;
  dayCount: number;
  blockedCount: number;
  promptInjectionCount: number;
} {
  const state = store.get(userId);
  if (!state) {
    return {
      minuteCount: 0,
      dayCount: 0,
      blockedCount: 0,
      promptInjectionCount: 0,
    };
  }
  return {
    minuteCount: state.minute.count,
    dayCount: state.day.count,
    blockedCount: state.abuse.blockedCount,
    promptInjectionCount: state.abuse.promptInjectionCount,
  };
}
