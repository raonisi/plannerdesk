// Durable Prisma rate limit backend (PR-99-A).

import { prisma } from "@/lib/prisma";
import type { AnswerAssistantRateLimitState } from "@prisma/client";
import type { AnswerAssistantBlockedReason } from "./types";
import { ANSWER_ASSISTANT_RATE_LIMIT_CONFIG } from "./rate-limit-config";
import type { VerifiedAnswerAssistantRateLimitResult } from "./rate-limit-types";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

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

function toMs(date: Date): number {
  return date.getTime();
}

function rollWindows(
  state: AnswerAssistantRateLimitState,
  now: number,
): AnswerAssistantRateLimitState {
  let minuteWindowStart = state.minuteWindowStart;
  let minuteCount = state.minuteCount;
  let dayWindowStart = state.dayWindowStart;
  let dayCount = state.dayCount;
  let abuseWindowStart = state.abuseWindowStart;
  let blockedCountToday = state.blockedCountToday;
  let promptInjectionCountToday = state.promptInjectionCountToday;
  let providerErrorCountToday = state.providerErrorCountToday;
  let cooldownUntil = state.cooldownUntil;

  if (now - toMs(minuteWindowStart) >= MINUTE_MS) {
    minuteWindowStart = new Date(now);
    minuteCount = 0;
  }

  if (now - toMs(dayWindowStart) >= DAY_MS) {
    dayWindowStart = new Date(now);
    dayCount = 0;
  }

  if (now - toMs(abuseWindowStart) >= DAY_MS) {
    abuseWindowStart = new Date(now);
    blockedCountToday = 0;
    promptInjectionCountToday = 0;
    providerErrorCountToday = 0;
  }

  if (cooldownUntil && now >= toMs(cooldownUntil)) {
    cooldownUntil = null;
  }

  return {
    ...state,
    minuteWindowStart,
    minuteCount,
    dayWindowStart,
    dayCount,
    abuseWindowStart,
    blockedCountToday,
    promptInjectionCountToday,
    providerErrorCountToday,
    cooldownUntil,
  };
}

function evaluateLimit(
  state: AnswerAssistantRateLimitState,
  now: number,
): VerifiedAnswerAssistantRateLimitResult {
  const config = ANSWER_ASSISTANT_RATE_LIMIT_CONFIG;

  if (state.cooldownUntil && now < toMs(state.cooldownUntil)) {
    return {
      allowed: false,
      reason: "abuse_cooldown",
      retryAfterSeconds: Math.ceil(
        (toMs(state.cooldownUntil) - now) / 1000,
      ),
    };
  }

  if (state.minuteCount >= config.perMinute) {
    return {
      allowed: false,
      reason: "minute",
      retryAfterSeconds: Math.ceil(
        (toMs(state.minuteWindowStart) + MINUTE_MS - now) / 1000,
      ),
    };
  }

  if (state.dayCount >= config.perDay) {
    return {
      allowed: false,
      reason: "day",
      retryAfterSeconds: Math.ceil(
        (toMs(state.dayWindowStart) + DAY_MS - now) / 1000,
      ),
    };
  }

  return { allowed: true };
}

function applyAbuseCooldownIfNeeded(
  state: AnswerAssistantRateLimitState,
  now: number,
): Date | null {
  const config = ANSWER_ASSISTANT_RATE_LIMIT_CONFIG;
  const hitBlocked = state.blockedCountToday >= config.blockedPerDay;
  const hitInjection =
    state.promptInjectionCountToday >= config.promptInjectionPerDay;
  const hitProviderError =
    state.providerErrorCountToday >= config.providerErrorPerDay;

  if (hitBlocked || hitInjection || hitProviderError) {
    return new Date(now + config.abuseCooldownMs);
  }

  return state.cooldownUntil;
}

async function loadState(
  userId: string,
  now: number,
): Promise<AnswerAssistantRateLimitState> {
  const existing = await prisma.answerAssistantRateLimitState.findUnique({
    where: { userId },
  });

  if (existing) {
    return rollWindows(existing, now);
  }

  const nowDate = new Date(now);
  return {
    userId,
    minuteWindowStart: nowDate,
    minuteCount: 0,
    dayWindowStart: nowDate,
    dayCount: 0,
    abuseWindowStart: nowDate,
    blockedCountToday: 0,
    promptInjectionCountToday: 0,
    providerErrorCountToday: 0,
    cooldownUntil: null,
    createdAt: nowDate,
    updatedAt: nowDate,
  };
}

async function persistState(
  state: AnswerAssistantRateLimitState,
): Promise<void> {
  await prisma.answerAssistantRateLimitState.upsert({
    where: { userId: state.userId },
    create: {
      userId: state.userId,
      minuteWindowStart: state.minuteWindowStart,
      minuteCount: state.minuteCount,
      dayWindowStart: state.dayWindowStart,
      dayCount: state.dayCount,
      abuseWindowStart: state.abuseWindowStart,
      blockedCountToday: state.blockedCountToday,
      promptInjectionCountToday: state.promptInjectionCountToday,
      providerErrorCountToday: state.providerErrorCountToday,
      cooldownUntil: state.cooldownUntil,
    },
    update: {
      minuteWindowStart: state.minuteWindowStart,
      minuteCount: state.minuteCount,
      dayWindowStart: state.dayWindowStart,
      dayCount: state.dayCount,
      abuseWindowStart: state.abuseWindowStart,
      blockedCountToday: state.blockedCountToday,
      promptInjectionCountToday: state.promptInjectionCountToday,
      providerErrorCountToday: state.providerErrorCountToday,
      cooldownUntil: state.cooldownUntil,
    },
  });
}

export async function durableCheckVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): Promise<VerifiedAnswerAssistantRateLimitResult> {
  const state = await loadState(userId, now);
  return evaluateLimit(state, now);
}

export async function durableConsumeVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): Promise<void> {
  const state = await loadState(userId, now);
  const next = {
    ...state,
    minuteCount: state.minuteCount + 1,
    dayCount: state.dayCount + 1,
  };
  await persistState(next);
}

export async function durableRecordVerifiedAnswerAssistantBlockedAttempt(
  userId: string,
  blockedReason: AnswerAssistantBlockedReason | undefined,
  now = Date.now(),
): Promise<void> {
  if (!blockedReason || !SAFETY_GATE_BLOCKED_REASONS.has(blockedReason)) {
    return;
  }

  const state = await loadState(userId, now);
  const next = {
    ...state,
    blockedCountToday: state.blockedCountToday + 1,
    promptInjectionCountToday:
      blockedReason === "PROMPT_INJECTION"
        ? state.promptInjectionCountToday + 1
        : state.promptInjectionCountToday,
  };
  next.cooldownUntil = applyAbuseCooldownIfNeeded(next, now);
  await persistState(next);
}

export async function durableRecordVerifiedAnswerAssistantProviderError(
  userId: string,
  now = Date.now(),
): Promise<void> {
  const state = await loadState(userId, now);
  const next = {
    ...state,
    providerErrorCountToday: state.providerErrorCountToday + 1,
  };
  next.cooldownUntil = applyAbuseCooldownIfNeeded(next, now);
  await persistState(next);
}

/** Test helper — deletes durable rate limit row for a user. */
export async function resetDurableAnswerAssistantRateLimit(userId: string): Promise<void> {
  await prisma.answerAssistantRateLimitState.deleteMany({ where: { userId } });
}
