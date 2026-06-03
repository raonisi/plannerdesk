export type VerifiedAnswerAssistantRateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "minute" | "day" | "abuse_cooldown";
      retryAfterSeconds: number;
    };
