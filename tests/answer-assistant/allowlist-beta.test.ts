import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  ALLOWLIST_BETA_OPERATOR_CHECKLIST,
  ALLOWLIST_BETA_ROLLBACK_STEPS,
  evaluateAllowlistBetaLaunchReadiness,
  getAllowlistBetaOperationalStatus,
  isVerifiedAnswerAssistantAllowlistBetaOperational,
} from "@/lib/answer-assistant/allowlist-beta";
import {
  ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT,
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "@/lib/answer-assistant/feature-gate";

const ROOT = join(import.meta.dirname, "../..");

function withEnv(
  vars: Record<string, string | undefined>,
  fn: () => void,
): void {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const value = vars[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(vars)) {
      const value = previous[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

describe("allowlist beta (PR-99-B)", () => {
  it("beta code default is false", () => {
    assert.equal(ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT, false);
  });

  it("beta env unset stays OFF", () => {
    withEnv(
      {
        ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED: undefined,
        ANSWER_ASSISTANT_VERIFIED_PREVIEW: undefined,
        ANSWER_ASSISTANT_VERIFIED_ALLOWLIST: undefined,
      },
      () => {
        assert.equal(isAnswerAssistantVerifiedBetaEnabled(), false);
        assert.equal(isAnswerAssistantVerifiedGateEnvEnabled(), false);
        assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), false);
        assert.equal(getAllowlistBetaOperationalStatus(), "disabled");
      },
    );
  });

  it("beta ON without allowlist is not operational", () => {
    withEnv(
      {
        ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED: "true",
        ANSWER_ASSISTANT_VERIFIED_PREVIEW: undefined,
        ANSWER_ASSISTANT_VERIFIED_ALLOWLIST: undefined,
      },
      () => {
        assert.equal(isAnswerAssistantVerifiedGateEnvEnabled(), true);
        assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), false);
        assert.equal(getAllowlistBetaOperationalStatus(), "not_configured");
        assert.equal(isVerifiedAnswerAssistantAllowlistBetaOperational(), false);
        const readiness = evaluateAllowlistBetaLaunchReadiness();
        assert.equal(readiness.ready, false);
        assert.ok(readiness.blockers.length > 0);
      },
    );
  });

  it("beta ON with allowlist is operational", () => {
    withEnv(
      {
        ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED: "true",
        ANSWER_ASSISTANT_VERIFIED_ALLOWLIST: "user-pilot-1",
      },
      () => {
        assert.equal(getAllowlistBetaOperationalStatus(), "operational");
        assert.equal(isVerifiedAnswerAssistantAllowlistBetaOperational(), true);
        assert.equal(isAnswerAssistantVerifiedPreviewEnabled(), true);
      },
    );
  });

  it("planner actions enforce beta operational check", () => {
    const source = readFileSync(
      join(ROOT, "app/planner/answer-assistant/actions.ts"),
      "utf8",
    );
    assert.match(source, /isVerifiedAnswerAssistantAllowlistBetaOperational/);
    assert.match(source, /beta_not_configured/);
    assert.match(source, /BETA_NOT_CONFIGURED/);
  });

  it("verified page shows beta notices", () => {
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /allowlistBetaActive/);
    assert.match(page, /betaActiveNotice/);
  });

  it("forbidden public routes absent", () => {
    const appDir = join(ROOT, "app");
    const publicAnswer = join(appDir, "answer-assistant");
    try {
      readFileSync(publicAnswer);
      assert.fail("public answer-assistant route must not exist");
    } catch (error) {
      assert.match(String(error), /ENOENT/);
    }
  });

  it("documents rollback and operator checklist", () => {
    assert.ok(ALLOWLIST_BETA_ROLLBACK_STEPS.length >= 3);
    assert.ok(ALLOWLIST_BETA_OPERATOR_CHECKLIST.length >= 5);
    const doc = readFileSync(
      join(ROOT, "docs/PR-99B-ANSWER-ASSISTANT-ALLOWLIST-BETA.md"),
      "utf8",
    );
    assert.match(doc, /ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED/);
    assert.match(doc, /Rollback/);
  });
});
