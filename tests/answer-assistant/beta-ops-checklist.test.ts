import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ALLOWLIST_BETA_ROLLBACK_STEPS,
  ALLOWLIST_BETA_OPERATOR_CHECKLIST,
} from "@/lib/answer-assistant/allowlist-beta";
import {
  ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT,
  isAnswerAssistantVerifiedBetaEnabled,
} from "@/lib/answer-assistant/feature-gate";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { ANSWER_ASSISTANT_RATE_LIMIT_CONFIG } from "@/lib/answer-assistant/rate-limit-config";
import { getAnswerAssistantRetentionConfig } from "@/lib/answer-assistant/retention-config";

const ROOT = process.cwd();

describe("PR109 Answer Assistant beta ops checklist", () => {
  it("PR109 ops checklist document exists", () => {
    const doc = readFileSync(
      join(ROOT, "docs/PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST.md"),
      "utf8",
    );
    assert.match(doc, /접근 제한/);
    assert.match(doc, /rollback/);
    assert.match(doc, /allowlist 자동 확대 금지/);
    assert.match(doc, /metadata-only/);
  });

  it("beta code default stays OFF without env", () => {
    const prev = process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
    delete process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
    try {
      assert.equal(ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT, false);
      assert.equal(isAnswerAssistantVerifiedBetaEnabled(), false);
    } finally {
      if (prev === undefined) {
        delete process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
      } else {
        process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED = prev;
      }
    }
  });

  it("expansion and decision modules forbid auto allowlist apply", () => {
    const expansion = readFileSync(
      join(ROOT, "lib/answer-assistant/allowlist-expansion-plan.ts"),
      "utf8",
    );
    const decision = readFileSync(
      join(ROOT, "lib/answer-assistant/beta-expansion-decision.ts"),
      "utf8",
    );
    assert.match(expansion, /no allowlist auto apply/i);
    assert.match(expansion, /allowlist 자동 확대 금지/);
    assert.match(decision, /no auto expansion/i);
  });

  it("planner action checks access before rate limit and generation", () => {
    const source = readFileSync(
      join(ROOT, "app/planner/answer-assistant/actions.ts"),
      "utf8",
    );
    const fnStart = source.indexOf(
      "export async function generateVerifiedAnswerAssistantDraftAction",
    );
    assert.ok(fnStart >= 0);
    const body = source.slice(fnStart);
    const accessIdx = body.indexOf("getVerifiedAnswerAssistantAccess");
    const rateIdx = body.indexOf("checkVerifiedAnswerAssistantRateLimit");
    const genIdx = body.indexOf("generateInternalAnswerDraft(");
    assert.ok(accessIdx >= 0 && rateIdx > accessIdx && genIdx > rateIdx);
    assert.match(source, /not_allowlisted/i);
    assert.match(source, /logAnswerAssistantUsage/);
  });

  it("rollback and operator checklist constants are documented", () => {
    assert.ok(ALLOWLIST_BETA_ROLLBACK_STEPS.length >= 4);
    assert.ok(ALLOWLIST_BETA_OPERATOR_CHECKLIST.some((s) => /allowlist/i.test(s)));
    assert.ok(
      ALLOWLIST_BETA_OPERATOR_CHECKLIST.some((s) => /rollback/i.test(s)),
    );
  });

  it("usage audit forbids sensitive payload fields", () => {
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("query"));
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("draft"));
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.includes("rawOutput"));
  });

  it("rate limit defaults and retention execute default are safe", () => {
    assert.ok(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perMinute > 0);
    assert.ok(ANSWER_ASSISTANT_RATE_LIMIT_CONFIG.perDay > 0);
    const retention = getAnswerAssistantRetentionConfig();
    assert.equal(retention.cleanupExecuteEnabled, false);
  });
});
