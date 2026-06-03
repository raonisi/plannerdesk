import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "@/lib/answer-assistant/feature-gate";
import {
  checkVerifiedAnswerAssistantRateLimit,
  consumeVerifiedAnswerAssistantRateLimit,
  resetVerifiedAnswerAssistantRateLimitStore,
} from "@/lib/answer-assistant/rate-limit";
import { VERIFIED_ANSWER_ASSIST_RATE_LIMIT } from "@/lib/answer-assistant/rate-limit-config";
import {
  clearAnswerAssistantUsageLogBuffer,
  getAnswerAssistantUsageLogBuffer,
  logAnswerAssistantUsage,
} from "@/lib/answer-assistant/usage-log";

const PLANNER_ROOT = join(process.cwd(), "app/planner/answer-assistant");
const PANEL_SOURCE = readFileSync(
  join(process.cwd(), "components/answer-assistant/answer-assistant-panel.tsx"),
  "utf8",
);
const ACTIONS_SOURCE = readFileSync(join(PLANNER_ROOT, "actions.ts"), "utf8");
const PAGE_SOURCE = readFileSync(join(PLANNER_ROOT, "page.tsx"), "utf8");

describe("Answer Assistant verified preview prep (PR-97-B)", () => {
  it("keeps feature gate default OFF", () => {
    assert.equal(ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT, false);
    const previous = process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    delete process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), false);
    if (previous === undefined) {
      delete process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW;
    } else {
      process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW = previous;
    }
  });

  it("planner page uses verified access guard and noindex metadata", () => {
    assert.match(PAGE_SOURCE, /getVerifiedAnswerAssistantAccess/);
    assert.match(PAGE_SOURCE, /index:\s*false/);
    assert.match(PAGE_SOURCE, /AnswerAssistantPanelShell/);
  });

  it("verified server action checks feature gate before generation", () => {
    assert.match(ACTIONS_SOURCE, /isAnswerAssistantVerifiedPreviewEnabled/);
    assert.match(ACTIONS_SOURCE, /FEATURE_DISABLED/);
    assert.match(ACTIONS_SOURCE, /NOT_ALLOWLISTED/);
    assert.match(ACTIONS_SOURCE, /checkVerifiedAnswerAssistantRateLimit/);
    assert.match(ACTIONS_SOURCE, /logAnswerAssistantUsage/);
    assert.match(ACTIONS_SOURCE, /audience:\s*"verified_planner"/);
  });

  it("panel disables generation UI and excludes copy/send controls", () => {
    assert.match(PANEL_SOURCE, /generationEnabled/);
    assert.match(PANEL_SOURCE, /fieldset/);
    assert.doesNotMatch(PANEL_SOURCE, /navigator\.clipboard/i);
    assert.doesNotMatch(PANEL_SOURCE, /고객에게\s*보내/i);
    assert.doesNotMatch(PANEL_SOURCE, /카카오/i);
  });
});

describe("Answer Assistant verified rate limit", () => {
  it("blocks after minute and day thresholds", async () => {
    resetVerifiedAnswerAssistantRateLimitStore();
    const userId = "test-user-rate-limit";

    for (let index = 0; index < VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perMinute; index += 1) {
      const check = await checkVerifiedAnswerAssistantRateLimit(userId);
      assert.equal(check.allowed, true);
      await consumeVerifiedAnswerAssistantRateLimit(userId);
    }

    const blocked = await checkVerifiedAnswerAssistantRateLimit(userId);
    assert.equal(blocked.allowed, false);
    if (!blocked.allowed) {
      assert.equal(blocked.reason, "minute");
    }
  });
});

describe("Answer Assistant usage log", () => {
  it("stores metadata only without query or draft text fields", async () => {
    clearAnswerAssistantUsageLogBuffer();
    await logAnswerAssistantUsage({
      timestamp: new Date().toISOString(),
      userId: "user-1",
      audience: "verified_planner",
      outcome: "blocked",
      blockedReason: "FEATURE_DISABLED",
      candidateCount: 0,
    });

    const entry = getAnswerAssistantUsageLogBuffer().at(-1);
    assert.ok(entry);
    assert.equal(entry?.userId, "user-1");
    assert.equal("query" in (entry ?? {}), false);
    assert.equal("draft" in (entry ?? {}), false);
    assert.equal("rawOutput" in (entry ?? {}), false);
  });
});
