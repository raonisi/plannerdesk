// Minimal answer assistant usage metadata (PR-97-B / PR-98 / PR-99-A).
// Does NOT store request text, draft text, or raw provider output.

import { getAnswerAssistantUsageAuditBackend } from "./rate-limit-config";
import { persistAnswerAssistantUsageAudit } from "./usage-audit-durable";
import type { AnswerAssistantBlockedReason, AnswerAssistantPurpose } from "./types";
import type { RetrievalSourceType } from "./retrieval-types";

export type AnswerAssistantUsageAudience = "admin" | "verified_planner";

export type AnswerAssistantUsageOutcome = "success" | "blocked";

export interface AnswerAssistantUsageLogEntry {
  timestamp: string;
  userId: string;
  audience: AnswerAssistantUsageAudience;
  outcome: AnswerAssistantUsageOutcome;
  requestPurpose?: AnswerAssistantPurpose;
  blockedReason?: AnswerAssistantBlockedReason;
  candidateCount?: number;
  evidenceSourceIds?: Array<{ id: string; type: RetrievalSourceType | string }>;
  outputSafetyBlocked?: boolean;
  providerConfigured?: boolean;
  providerErrorCode?: "PROVIDER_NOT_CONFIGURED" | "PROVIDER_ERROR";
  rateLimitBlocked?: boolean;
  isAdminTester?: boolean;
}

const MAX_BUFFER_SIZE = 200;
const buffer: AnswerAssistantUsageLogEntry[] = [];

function pushToMemoryBuffer(entry: AnswerAssistantUsageLogEntry): void {
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.shift();
  }
}

export async function logAnswerAssistantUsage(
  entry: AnswerAssistantUsageLogEntry,
): Promise<string | undefined> {
  pushToMemoryBuffer(entry);

  if (process.env.NODE_ENV !== "production") {
    console.info("[answer-assistant-usage]", JSON.stringify(entry));
  }

  if (getAnswerAssistantUsageAuditBackend() === "durable") {
    try {
      return await persistAnswerAssistantUsageAudit(entry);
    } catch (error) {
      console.error("[answer-assistant-usage-audit] persist failed", error);
    }
  }
  return undefined;
}

/** Test helper — returns recent in-memory entries without PII payloads. */
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

/** Fields that must never appear on audit rows. */
export const FORBIDDEN_USAGE_AUDIT_FIELDS = [
  "query",
  "draft",
  "rawOutput",
  "rawPrompt",
  "prompt",
  "phone",
  "email",
  "contractNumber",
  "medicalInfo",
  "ocrText",
  "fileUrl",
] as const;
