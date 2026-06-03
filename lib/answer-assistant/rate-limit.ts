// Verified answer assistant rate limit facade (PR-97-B / PR-98 / PR-99-A).

import {
  getAnswerAssistantRateLimitBackend,
  VERIFIED_ANSWER_ASSIST_RATE_LIMIT,
} from "./rate-limit-config";
import {
  durableCheckVerifiedAnswerAssistantRateLimit,
  durableConsumeVerifiedAnswerAssistantRateLimit,
  durableRecordVerifiedAnswerAssistantBlockedAttempt,
  durableRecordVerifiedAnswerAssistantProviderError,
} from "./rate-limit-durable";
import {
  getVerifiedAnswerAssistantRateLimitSnapshot,
  memoryCheckVerifiedAnswerAssistantRateLimit,
  memoryConsumeVerifiedAnswerAssistantRateLimit,
  memoryRecordVerifiedAnswerAssistantBlockedAttempt,
  memoryRecordVerifiedAnswerAssistantProviderError,
  resetVerifiedAnswerAssistantRateLimitStore,
} from "./rate-limit-memory";
import type { AnswerAssistantBlockedReason } from "./types";
import type { VerifiedAnswerAssistantRateLimitResult } from "./rate-limit-types";

export { VERIFIED_ANSWER_ASSIST_RATE_LIMIT };
export type { VerifiedAnswerAssistantRateLimitResult };
export {
  getVerifiedAnswerAssistantRateLimitSnapshot,
  resetVerifiedAnswerAssistantRateLimitStore,
};

export async function checkVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): Promise<VerifiedAnswerAssistantRateLimitResult> {
  if (getAnswerAssistantRateLimitBackend() === "memory") {
    return memoryCheckVerifiedAnswerAssistantRateLimit(userId, now);
  }
  return durableCheckVerifiedAnswerAssistantRateLimit(userId, now);
}

export async function consumeVerifiedAnswerAssistantRateLimit(
  userId: string,
  now = Date.now(),
): Promise<void> {
  if (getAnswerAssistantRateLimitBackend() === "memory") {
    memoryConsumeVerifiedAnswerAssistantRateLimit(userId, now);
    return;
  }
  await durableConsumeVerifiedAnswerAssistantRateLimit(userId, now);
}

export async function recordVerifiedAnswerAssistantBlockedAttempt(
  userId: string,
  blockedReason: AnswerAssistantBlockedReason | undefined,
  now = Date.now(),
): Promise<void> {
  if (getAnswerAssistantRateLimitBackend() === "memory") {
    memoryRecordVerifiedAnswerAssistantBlockedAttempt(
      userId,
      blockedReason,
      now,
    );
    return;
  }
  await durableRecordVerifiedAnswerAssistantBlockedAttempt(
    userId,
    blockedReason,
    now,
  );
}

export async function recordVerifiedAnswerAssistantProviderError(
  userId: string,
  now = Date.now(),
): Promise<void> {
  if (getAnswerAssistantRateLimitBackend() === "memory") {
    memoryRecordVerifiedAnswerAssistantProviderError(userId, now);
    return;
  }
  await durableRecordVerifiedAnswerAssistantProviderError(userId, now);
}
