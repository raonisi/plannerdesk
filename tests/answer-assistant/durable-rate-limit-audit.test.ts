import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ANSWER_ASSISTANT_RATE_LIMIT_CONFIG,
  getAnswerAssistantRateLimitBackend,
  getAnswerAssistantUsageAuditBackend,
} from "@/lib/answer-assistant/rate-limit-config";
import {
  isVerifiedAnswerAssistantRateLimitDurable,
  isVerifiedAnswerAssistantUsageAuditPersistent,
} from "@/lib/answer-assistant/release-readiness";
import {
  FORBIDDEN_USAGE_AUDIT_FIELDS,
  getAnswerAssistantUsageLogBuffer,
  logAnswerAssistantUsage,
  clearAnswerAssistantUsageLogBuffer,
} from "@/lib/answer-assistant/usage-log";

const SCHEMA = readFileSync(
  join(process.cwd(), "prisma/schema.prisma"),
  "utf8",
);
const MIGRATION = readFileSync(
  join(
    process.cwd(),
    "prisma/migrations/20260603120000_add_answer_assistant_rate_limit_audit/migration.sql",
  ),
  "utf8",
);
const DURABLE_RATE = readFileSync(
  join(process.cwd(), "lib/answer-assistant/rate-limit-durable.ts"),
  "utf8",
);
const USAGE_AUDIT = readFileSync(
  join(process.cwd(), "lib/answer-assistant/usage-audit-durable.ts"),
  "utf8",
);
const ACTIONS = readFileSync(
  join(process.cwd(), "app/planner/answer-assistant/actions.ts"),
  "utf8",
);

describe("Answer Assistant durable rate limit / audit (PR-99-A)", () => {
  it("adds Prisma models without prompt or draft fields", () => {
    assert.match(SCHEMA, /model AnswerAssistantRateLimitState/);
    assert.match(SCHEMA, /model AnswerAssistantUsageAudit/);
    assert.doesNotMatch(SCHEMA, /rawPrompt|rawOutput|queryText|draftText/);
    assert.match(MIGRATION, /AnswerAssistantRateLimitState/);
    assert.match(MIGRATION, /AnswerAssistantUsageAudit/);
    assert.doesNotMatch(MIGRATION, /DROP TABLE/i);
  });

  it("uses config defaults for rate limits", () => {
    assert.equal(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perMinute, 3);
    assert.equal(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perDay, 20);
    assert.equal(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.blockedPerDay, 5);
    assert.equal(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.promptInjectionPerDay, 3);
    assert.equal(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.providerErrorPerDay, 5);
  });

  it("defaults to memory backend outside production", () => {
    assert.equal(getAnswerAssistantRateLimitBackend(), "memory");
    assert.equal(getAnswerAssistantUsageAuditBackend(), "memory");
    assert.equal(isVerifiedAnswerAssistantRateLimitDurable(), false);
    assert.equal(isVerifiedAnswerAssistantUsageAuditPersistent(), false);
  });

  it("durable modules persist counters and audit metadata only", () => {
    assert.match(DURABLE_RATE, /answerAssistantRateLimitState/);
    assert.match(DURABLE_RATE, /providerErrorCountToday/);
    assert.doesNotMatch(DURABLE_RATE, /query|draft|rawOutput|rawPrompt/);
    assert.match(USAGE_AUDIT, /answerAssistantUsageAudit\.create/);
    assert.doesNotMatch(USAGE_AUDIT, /query|draft|rawOutput|rawPrompt/);
  });

  it("server action awaits durable rate limit before provider path", () => {
    assert.match(ACTIONS, /await checkVerifiedAnswerAssistantRateLimit/);
    assert.match(ACTIONS, /await consumeVerifiedAnswerAssistantRateLimit/);
    assert.match(ACTIONS, /recordVerifiedAnswerAssistantProviderError/);
    assert.match(ACTIONS, /await logAnswerAssistantUsage/);
  });

  it("usage audit forbids sensitive payload fields", async () => {
    clearAnswerAssistantUsageLogBuffer();
    await logAnswerAssistantUsage({
      timestamp: new Date().toISOString(),
      userId: "audit-user",
      audience: "verified_planner",
      outcome: "blocked",
      blockedReason: "FEATURE_DISABLED",
      candidateCount: 0,
    });
    const entry = getAnswerAssistantUsageLogBuffer().at(-1);
    assert.ok(entry);
    for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
      assert.equal(field in (entry ?? {}), false);
    }
  });
});
