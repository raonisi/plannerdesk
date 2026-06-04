import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ALLOWLIST_BETA_ROLLBACK_STEPS,
  evaluateAllowlistBetaLaunchReadiness,
} from "@/lib/answer-assistant/allowlist-beta";
import {
  ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT,
  isAnswerAssistantVerifiedBetaEnabled,
} from "@/lib/answer-assistant/feature-gate";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { getAnswerAssistantRetentionConfig } from "@/lib/answer-assistant/retention-config";

const ROOT = process.cwd();

describe("PR126 Answer Assistant beta observation (static, no database)", () => {
  it("hub links structure, checklist, standards, and report template", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-126-ANSWER-ASSISTANT-BETA-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-126-BETA-OBSERVATION-CHECKLIST/);
    assert.match(hub, /PR-109-ANSWER-ASSISTANT-BETA-OPS-CHECKLIST/);
    assert.match(hub, /미실행/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("observation checklist records static pass for critical controls", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/PR-126-BETA-OBSERVATION-CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /verified planner/);
    assert.match(checklist, /allowlist/);
    assert.match(checklist, /metadata-only/);
    assert.match(checklist, /\*\*pass\*\*/);
  });

  it("verified access enforces planner role and allowlist states", () => {
    const source = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(source, /verified_planner/);
    assert.match(source, /not_allowlisted/);
    assert.match(source, /PlannerVerification/);
  });

  it("planner actions order access before rate limit and generation", () => {
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
  });

  it("expansion modules forbid automatic allowlist apply", () => {
    const expansion = readFileSync(
      join(ROOT, "lib/answer-assistant/allowlist-expansion-plan.ts"),
      "utf8",
    );
    assert.match(expansion, /no allowlist auto apply/i);
    const decision = readFileSync(
      join(ROOT, "lib/answer-assistant/beta-expansion-decision.ts"),
      "utf8",
    );
    assert.match(decision, /no auto expansion/i);
  });

  it("usage audit forbids query draft and PII payload fields", () => {
    for (const field of ["query", "draft", "rawOutput", "phone", "email"]) {
      assert.ok(
        FORBIDDEN_USAGE_AUDIT_FIELDS.includes(field as any),
        field,
      );
    }
  });

  it("beta defaults off and retention cleanup execute disabled", () => {
    assert.equal(ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT, false);
    const prev = process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
    delete process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
    try {
      assert.equal(isAnswerAssistantVerifiedBetaEnabled(), false);
    } finally {
      if (prev === undefined) {
        delete process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED;
      } else {
        process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED = prev;
      }
    }
    assert.equal(getAnswerAssistantRetentionConfig().cleanupExecuteEnabled, false);
    assert.ok(ALLOWLIST_BETA_ROLLBACK_STEPS.length >= 4);
    const readiness = evaluateAllowlistBetaLaunchReadiness();
    assert.ok(readiness.blockers.length >= 0);
  });
});
