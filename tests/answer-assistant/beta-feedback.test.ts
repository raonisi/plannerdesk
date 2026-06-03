import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  BETA_FEEDBACK_FORBIDDEN_STORED_FIELDS,
  BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH,
} from "@/lib/answer-assistant/beta-feedback-constants";
import {
  isBetaFeedbackIncidentCandidateHint,
  validateBetaFeedbackSubmit,
} from "@/lib/answer-assistant/beta-feedback-validation";
import { BETA_SAFETY_REVIEW_OPERATOR_RULES } from "@/lib/answer-assistant/beta-feedback-review-criteria";

const ROOT = process.cwd();

describe("Answer Assistant beta feedback (PR-101)", () => {
  it("schema adds minimal feedback model without prompt fields", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const migration = readFileSync(
      join(
        ROOT,
        "prisma/migrations/20260603140000_add_answer_assistant_beta_feedback/migration.sql",
      ),
      "utf8",
    );
    assert.match(schema, /model AnswerAssistantBetaFeedback/);
    assert.match(migration, /AnswerAssistantBetaFeedback/);
    assert.doesNotMatch(schema, /rawPrompt/);
    assert.doesNotMatch(schema, /rawOutput/);
  });

  it("rejects sensitive shortNote", () => {
    const result = validateBetaFeedbackSubmit({
      feedbackType: "safety_concern",
      safetySignal: "privacy_risk",
      severity: "high",
      usefulness: "not_applicable",
      noteCategory: "other",
      shortNote: "고객 홍길동 연락처 010-1234-5678",
      usageAuditId: "",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "SENSITIVE_CONTENT");
  });

  it("accepts structured feedback without note", () => {
    const result = validateBetaFeedbackSubmit({
      feedbackType: "blocked_experience",
      safetySignal: "blocking_felt_wrong",
      severity: "medium",
      usefulness: "partial",
      noteCategory: "blocking",
      shortNote: "",
      usageAuditId: "",
    });
    assert.equal(result.ok, true);
    assert.equal(result.data?.shortNote, null);
  });

  it("incident hint is advisory only", () => {
    assert.equal(
      isBetaFeedbackIncidentCandidateHint({
        feedbackType: "safety_concern",
        safetySignal: "none",
        severity: "low",
      }),
      true,
    );
    assert.equal(
      BETA_SAFETY_REVIEW_OPERATOR_RULES.some((r) =>
        r.includes("자동"),
      ),
      true,
    );
  });

  it("admin feedback route is admin-only", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/answer-assistant/feedback/page.tsx"),
      "utf8",
    );
    assert.match(page, /getAdminAccess/);
    assert.match(page, /index:\s*false/);
    assert.doesNotMatch(page, /auto.*allowlist/i);
  });

  it("planner feedback action requires allowlist beta", () => {
    const actions = readFileSync(
      join(ROOT, "app/planner/answer-assistant/feedback-actions.ts"),
      "utf8",
    );
    assert.match(actions, /isVerifiedAnswerAssistantAllowlistBetaOperational/);
    assert.match(actions, /persistBetaSafetyFeedback/);
    assert.doesNotMatch(actions, /rawPrompt/);
  });

  it("panel includes beta feedback form for verified pilots", () => {
    const panel = readFileSync(
      join(ROOT, "components/answer-assistant/answer-assistant-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /BetaSafetyFeedbackForm/);
    assert.match(panel, /showBetaFeedback/);
  });

  it("short note max length matches schema", () => {
    assert.equal(BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH, 120);
    for (const field of BETA_FEEDBACK_FORBIDDEN_STORED_FIELDS) {
      assert.ok(field.length > 0);
    }
  });

  it("documents PR-101", () => {
    const doc = readFileSync(
      join(ROOT, "docs/PR-101-ANSWER-ASSISTANT-BETA-FEEDBACK-SAFETY-REVIEW.md"),
      "utf8",
    );
    assert.match(doc, /\/admin\/answer-assistant\/feedback/);
    assert.match(doc, /자동 제재/);
  });
});
