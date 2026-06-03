import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE,
  ANSWER_ASSISTANT_RETENTION_DEFAULTS,
  getAnswerAssistantRetentionConfig,
  subtractRetentionDays,
} from "@/lib/answer-assistant/retention-config";
import {
  retentionCleanupCountsMatch,
  type RetentionCleanupTargetCounts,
} from "@/lib/answer-assistant/retention-cleanup";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";

const ROOT = process.cwd();

describe("Answer Assistant retention cleanup (PR-102)", () => {
  it("uses safe default retention days", () => {
    const previous = process.env.ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED;
    delete process.env.ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED;
    const config = getAnswerAssistantRetentionConfig();
    assert.equal(config.rateLimitStateDays, ANSWER_ASSISTANT_RETENTION_DEFAULTS.rateLimitStateDays);
    assert.equal(config.usageAuditDays, ANSWER_ASSISTANT_RETENTION_DEFAULTS.usageAuditDays);
    assert.equal(config.cleanupExecuteEnabled, false);
    if (previous === undefined) {
      delete process.env.ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED;
    } else {
      process.env.ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED = previous;
    }
  });

  it("cleanup admin route is admin-only", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/answer-assistant/cleanup/page.tsx"),
      "utf8",
    );
    assert.match(page, /getAdminAccess/);
    assert.match(page, /previewAnswerAssistantRetentionCleanup/);
    assert.doesNotMatch(page, /rawPrompt/);
  });

  it("execute requires confirm phrase and count match", () => {
    const actions = readFileSync(
      join(ROOT, "app/admin/answer-assistant/cleanup/actions.ts"),
      "utf8",
    );
    assert.match(actions, /ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE/);
    assert.match(actions, /executeAnswerAssistantRetentionCleanup/);
    assert.match(actions, /requireAdminAccess/);

    const a: RetentionCleanupTargetCounts = {
      rateLimitState: 1,
      usageAudit: 2,
      feedbackStandard: 3,
      feedbackCritical: 0,
      cleanupLog: 1,
    };
    assert.equal(retentionCleanupCountsMatch(a, { ...a }), true);
    assert.equal(
      retentionCleanupCountsMatch(a, { ...a, usageAudit: 99 }),
      false,
    );
  });

  it("schema adds cleanup log without payload fields", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const start = schema.indexOf("model AnswerAssistantCleanupLog");
    assert.ok(start >= 0);
    const end = schema.indexOf("\n}", start);
    const block = schema.slice(start, end);
    for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
      assert.equal(
        block.includes(`${field} `) || block.includes(`${field}\n`),
        false,
        `cleanup log must not store ${field}`,
      );
    }
  });

  it("dashboards link retention cleanup", () => {
    const audit = readFileSync(
      join(ROOT, "app/admin/answer-assistant/audit/page.tsx"),
      "utf8",
    );
    assert.match(audit, /RetentionStatusPanel/);
    assert.match(audit, /\/admin\/answer-assistant\/cleanup/);
  });

  it("subtractRetentionDays produces UTC midnight cutoff", () => {
    const cutoff = subtractRetentionDays(30, new Date("2026-06-03T15:00:00.000Z"));
    assert.equal(cutoff.getUTCHours(), 0);
    assert.ok(cutoff < new Date("2026-06-03T15:00:00.000Z"));
  });

  it("documents PR-102", () => {
    assert.equal(ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE, "DELETE-EXPIRED-DATA");
    const doc = readFileSync(
      join(ROOT, "docs/PR-102-ANSWER-ASSISTANT-DASHBOARD-RETENTION-CLEANUP.md"),
      "utf8",
    );
    assert.match(doc, /dry-run|preview/i);
    assert.match(doc, /CLEANUP_EXECUTE_ENABLED/);
  });
});
