import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  getAnswerAssistantVerifiedAllowlistUserIds,
  isUserOnVerifiedAnswerAssistantAllowlist,
  isVerifiedAnswerAssistantAllowlistConfigured,
} from "@/lib/answer-assistant/allowlist";
import {
  ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "@/lib/answer-assistant/feature-gate";
import {
  evaluateVerifiedAnswerAssistantReleaseReadiness,
  isVerifiedAnswerAssistantRateLimitDurable,
} from "@/lib/answer-assistant/release-readiness";
import {
  checkVerifiedAnswerAssistantRateLimit,
  consumeVerifiedAnswerAssistantRateLimit,
  recordVerifiedAnswerAssistantBlockedAttempt,
  resetVerifiedAnswerAssistantRateLimitStore,
  VERIFIED_ANSWER_ASSIST_RATE_LIMIT,
} from "@/lib/answer-assistant/rate-limit";

const PLANNER_ACTIONS = readFileSync(
  join(process.cwd(), "app/planner/answer-assistant/actions.ts"),
  "utf8",
);

describe("Answer Assistant release decision (PR-98)", () => {
  it("keeps code default OFF and requires explicit env for activation", () => {
    assert.equal(ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT, false);
    const previous = process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    delete process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), false);
    process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW = "true";
    assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), true);
    process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW = "false";
    assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), false);
    if (previous === undefined) {
      delete process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    } else {
      process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW = previous;
    }
  });

  it("treats empty allowlist as not configured", () => {
    const previous = process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST;
    delete process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST;
    assert.equal(isVerifiedAnswerAssistantAllowlistConfigured(), false);
    assert.equal(isUserOnVerifiedAnswerAssistantAllowlist("user-a"), false);

    process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST = "user-a, user-b";
    assert.equal(getAnswerAssistantVerifiedAllowlistUserIds().size, 2);
    assert.equal(isUserOnVerifiedAnswerAssistantAllowlist("user-a"), true);
    assert.equal(isUserOnVerifiedAnswerAssistantAllowlist("user-c"), false);

    if (previous === undefined) {
      delete process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST;
    } else {
      process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST = previous;
    }
  });

  it("reports No-Go when durable rate limit store is absent", () => {
    assert.equal(isVerifiedAnswerAssistantRateLimitDurable(), false);
    const readiness = evaluateVerifiedAnswerAssistantReleaseReadiness();
    assert.equal(readiness.verdict, "no_go");
    assert.ok(
      readiness.blockers.some((blocker) =>
        blocker.includes("persistent rate limit"),
      ),
    );
  });

  it("server action enforces gate order: access, feature gate, allowlist, rate limit", () => {
    assert.match(PLANNER_ACTIONS, /getVerifiedAnswerAssistantAccess/);
    assert.match(PLANNER_ACTIONS, /isAnswerAssistantVerifiedPreviewEnabled/);
    assert.match(PLANNER_ACTIONS, /NOT_ALLOWLISTED/);
    assert.match(PLANNER_ACTIONS, /checkVerifiedAnswerAssistantRateLimit/);
    assert.match(PLANNER_ACTIONS, /recordVerifiedAnswerAssistantBlockedAttempt/);
    assert.match(PLANNER_ACTIONS, /generateInternalAnswerDraft/);

    const fnStart = PLANNER_ACTIONS.indexOf(
      "export async function generateVerifiedAnswerAssistantDraftAction",
    );
    const body = PLANNER_ACTIONS.slice(fnStart);
    const accessIndex = body.indexOf("getVerifiedAnswerAssistantAccess");
    const gateIndex = body.indexOf("isAnswerAssistantVerifiedPreviewEnabled");
    const allowlistIndex = body.indexOf("NOT_ALLOWLISTED");
    const rateIndex = body.indexOf("checkVerifiedAnswerAssistantRateLimit");
    const generateIndex = body.indexOf("generateInternalAnswerDraft");
    assert.ok(accessIndex < gateIndex);
    assert.ok(gateIndex < allowlistIndex);
    assert.ok(allowlistIndex < rateIndex);
    assert.ok(rateIndex < generateIndex);
  });

  it("uses PR-98 rate limit defaults (3/min, 20/day)", () => {
    assert.equal(VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perMinute, 3);
    assert.equal(VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perDay, 20);
  });
});

describe("Answer Assistant abuse cooldown (PR-98)", () => {
  it("applies cooldown after repeated prompt injection blocks", () => {
    resetVerifiedAnswerAssistantRateLimitStore();
    const userId = "abuse-test-user";

    for (let index = 0; index < VERIFIED_ANSWER_ASSIST_RATE_LIMIT.promptInjectionBeforeCooldown; index += 1) {
      recordVerifiedAnswerAssistantBlockedAttempt(userId, "PROMPT_INJECTION");
    }

    const blocked = checkVerifiedAnswerAssistantRateLimit(userId);
    assert.equal(blocked.allowed, false);
    if (!blocked.allowed) {
      assert.equal(blocked.reason, "abuse_cooldown");
    }
  });

  it("does not consume minute quota when only checking", () => {
    resetVerifiedAnswerAssistantRateLimitStore();
    const userId = "quota-check-user";
    checkVerifiedAnswerAssistantRateLimit(userId);
    consumeVerifiedAnswerAssistantRateLimit(userId);
    const snapshot = checkVerifiedAnswerAssistantRateLimit(userId);
    assert.equal(snapshot.allowed, true);
  });
});
