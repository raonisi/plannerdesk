// Minimal answer assistant usage metadata (PR-97-B).
// Does NOT store request text, draft text, or raw provider output.

import type { AnswerAssistantBlockedReason } from "./types";
import type { RetrievalSourceType } from "./retrieval-types";

export type AnswerAssistantUsageAudience = "admin" | "verified_planner";

export type AnswerAssistantUsageOutcome = "success" | "blocked";

export interface AnswerAssistantUsageLogEntry {
  timestamp: string;
  userId: string;
  audience: AnswerAssistantUsageAudience;
  outcome: AnswerAssistantUsageOutcome;
  blockedReason?: AnswerAssistantBlockedReason | "FEATURE_DISABLED" | "RATE_LIMIT_EXCEEDED" | "UNAUTHORIZED";
  candidateCount?: number;
  evidenceSourceIds?: Array<{ id: string; type: RetrievalSourceType | string }>;
  providerErrorCode?: "PROVIDER_NOT_CONFIGURED" | "PROVIDER_ERROR";
  rateLimitHit?: boolean;
  isAdminTester?: boolean;
}

const MAX_BUFFER_SIZE = 200;
const buffer: AnswerAssistantUsageLogEntry[] = [];

export function logAnswerAssistantUsage(entry: AnswerAssistantUsageLogEntry): void {
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.shift();
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[answer-assistant-usage]", JSON.stringify(entry));
  }
}

/** Test helper — returns recent entries without PII payloads. */
export function getAnswerAssistantUsageLogBuffer(): readonly AnswerAssistantUsageLogEntry[] {
  return buffer;
}

export function clearAnswerAssistantUsageLogBuffer(): void {
  buffer.length = 0;
}

export function buildEvidenceSourceIds(
  evidence: Array<{ id: string; type: RetrievalSourceType | string }>,
): Array<{ id: string; type: RetrievalSourceType | string }> {
  return evidence.map((item) => ({ id: item.id, type: item.type }));
}
