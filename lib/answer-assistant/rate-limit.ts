// In-process rate limit for verified answer assistant preview (PR-97-B).
// Replace with Redis/DB counters when shared infra is available.

export const VERIFIED_ANSWER_ASSIST_RATE_LIMIT = {
  perMinute: 5,
  perDay: 20,
} as const;

export type VerifiedAnswerAssistantRateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "minute" | "day";
      retryAfterSeconds: number;
    };

type WindowCounter = {
  count: number;
  windowStartMs: number;
};

type UserRateLimitState = {
  minute: WindowCounter;
  day: WindowCounter;
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const store = new Map<string, UserRateLimitState>();

function getOrCreateState(userId: string): UserRateLimitState {
  const existing = store.get(userId);
  if (existing) return existing;

  const created: UserRateLimitState = {
    minute: { count: 0, windowStartMs: Date.now() },
    day: { count: 0, windowStartMs: Date.now() },
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

export function checkVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): VerifiedAnswerAssistantRateLimitResult {
  const state = getOrCreateState(userId);
  rollWindow(state.minute, MINUTE_MS, now);
  rollWindow(state.day, DAY_MS, now);

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

/** Test helper — resets in-process counters. */
export function resetVerifiedAnswerAssistantRateLimitStore(): void {
  store.clear();
}

export function getVerifiedAnswerAssistantRateLimitSnapshot(userId: string): {
  minuteCount: number;
  dayCount: number;
} {
  const state = store.get(userId);
  if (!state) {
    return { minuteCount: 0, dayCount: 0 };
  }
  return { minuteCount: state.minute.count, dayCount: state.day.count };
}
