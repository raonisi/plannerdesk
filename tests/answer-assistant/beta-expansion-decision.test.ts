import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  evaluateBetaExpansionDecision,
  assertAnswerAssistantAuditSchemaSafe,
  type BetaExpansionDecisionEvaluationInput,
} from "@/lib/answer-assistant/beta-expansion-decision";
import { getBetaExpansionDecisionConfig } from "@/lib/answer-assistant/beta-expansion-decision-config";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";

const ROOT = process.cwd();

const BASE_OPERATIONAL = {
  rateLimitHealthy: true,
  usageAuditHealthy: true,
  retentionHealthy: true,
  cleanupOverdue: false,
  betaOperational: true,
  allowlistBetaStatus: "operational",
  providerErrorElevated: false,
  permissionDeniedElevated: false,
  notAllowlistedElevated: false,
};

const BASE_RETENTION = {
  lastCleanupDate: null,
  cleanupOverdue: false,
  oldAuditCandidateCount: 0,
  oldFeedbackCandidateCount: 0,
  criticalFeedbackProtectedCount: 0,
  linkedUsageAuditProtectedCount: 0,
};

const BASE_USAGE = {
  totalBetaRequests: 50,
  success: 30,
  blocked: 20,
  rateLimited: 2,
  promptInjectionBlocked: 1,
  outputSafetyBlocked: 0,
  providerError: 1,
  insufficientEvidence: 3,
  permissionDenied: 0,
  notAllowlisted: 2,
  providerNotConfigured: 0,
};

const BASE_FEEDBACK = {
  totalFeedback: 5,
  criticalFeedback: 0,
  needsFix: 1,
  unsafeOutput: 0,
  fieldExposureRisk: 0,
  outputSafetyMiss: 0,
  claimJudgmentRisk: 0,
  medicalInterpretationRisk: 0,
  lossAdjustmentRisk: 0,
  productSolicitationRisk: 0,
  evidenceMissing: 0,
  wrongSource: 0,
  uiConfusing: 0,
  tooRestrictive: 0,
  blockedIncorrectly: 0,
  reviewBacklog: 2,
};

function evaluate(
  overrides: Partial<BetaExpansionDecisionEvaluationInput> = {},
) {
  const config = getBetaExpansionDecisionConfig();
  return evaluateBetaExpansionDecision({
    usage: BASE_USAGE,
    feedback: BASE_FEEDBACK,
    retention: BASE_RETENTION,
    operational: BASE_OPERATIONAL,
    structuralNoGo: [],
    periodDays: 30,
    config,
    ...overrides,
  });
}

describe("Answer Assistant beta expansion decision (PR-103)", () => {
  it("admin beta-decision route is admin-only and noindex", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/answer-assistant/beta-decision/page.tsx"),
      "utf8",
    );
    assert.match(page, /getAdminAccess/);
    assert.match(page, /AdminLockedState/);
    assert.match(page, /AdminAccessDeniedState/);
    assert.match(page, /index:\s*false/);
    assert.doesNotMatch(page, /verified_planner/);
  });

  it("does not expose auto expansion or gate ON controls", () => {
    const view = readFileSync(
      join(
        ROOT,
        "components/admin/answer-assistant/BetaExpansionDecisionView.tsx",
      ),
      "utf8",
    );
    assert.doesNotMatch(view, /<button[^>]*>[^<]*allowlist/i);
    assert.doesNotMatch(view, /<button[^>]*>[^<]*feature gate/i);
    assert.doesNotMatch(view, /<button[^>]*>[^<]*beta.*중단/i);
    assert.doesNotMatch(view, /<button[^>]*>[^<]*제재/i);
    assert.doesNotMatch(view, /<button[^>]*>[^<]*발송/i);
    assert.match(view, /allowlist 자동 확대/);
    assert.match(view, /feature gate ON/);
    assert.doesNotMatch(view, /rawPrompt/i);
    assert.doesNotMatch(view, /rawOutput/i);
    assert.doesNotMatch(view, /generatedAnswer/i);
    assert.match(view, /판단 자료/);
  });

  it("decision module avoids forbidden response field names", () => {
    const source = readFileSync(
      join(ROOT, "lib/answer-assistant/beta-expansion-decision.ts"),
      "utf8",
    );
    const forbidden = [
      "rawPrompt",
      "rawOutput",
      "generatedAnswer",
      "draftAnswer",
      "providerResponse",
      "customerName",
      "contractNumber",
      "diagnosis",
      "medicalRecord",
      "ocrText",
    ];
    for (const field of forbidden) {
      assert.equal(
        source.includes(`${field}:`),
        false,
        `must not expose ${field} in types`,
      );
    }
  });

  it("critical signal blocks LIMITED_EXPANSION_CANDIDATE", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, criticalFeedback: 1 },
    });
    assert.ok(result.noGoTriggers.includes("CRITICAL_STOP"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
    assert.ok(
      result.decision === "PAUSE_BETA" ||
        result.decision === "EXPANSION_NOT_READY" ||
        result.decision === "IMPROVE_BEFORE_EXPANSION",
    );
  });

  it("field exposure risk triggers No-Go", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, fieldExposureRisk: 1 },
    });
    assert.ok(result.noGoTriggers.includes("FIELD_EXPOSURE_RISK"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("output safety miss triggers No-Go", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, outputSafetyMiss: 1 },
    });
    assert.ok(result.noGoTriggers.includes("OUTPUT_SAFETY_MISS"));
    assert.equal(result.decision, "PAUSE_BETA");
  });

  it("claim judgment risk triggers No-Go", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, claimJudgmentRisk: 1 },
    });
    assert.ok(result.noGoTriggers.includes("CLAIM_JUDGMENT_RISK"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("medical interpretation risk triggers No-Go", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, medicalInterpretationRisk: 1 },
    });
    assert.ok(result.noGoTriggers.includes("MEDICAL_INTERPRETATION_RISK"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("loss adjustment risk triggers No-Go", () => {
    const result = evaluate({
      feedback: { ...BASE_FEEDBACK, lossAdjustmentRisk: 1 },
    });
    assert.ok(result.noGoTriggers.includes("LOSS_ADJUSTMENT_RISK"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("rate limit unhealthy triggers No-Go", () => {
    const result = evaluate({
      operational: { ...BASE_OPERATIONAL, rateLimitHealthy: false },
    });
    assert.ok(result.noGoTriggers.includes("RATE_LIMIT_NOT_OPERATIONAL"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("usage audit unhealthy triggers No-Go", () => {
    const result = evaluate({
      operational: { ...BASE_OPERATIONAL, usageAuditHealthy: false },
    });
    assert.ok(result.noGoTriggers.includes("USAGE_AUDIT_NOT_DURABLE"));
    assert.notEqual(result.decision, "LIMITED_EXPANSION_CANDIDATE");
  });

  it("stable metrics can yield CONTINUE or LIMITED candidate", () => {
    const stable = evaluate();
    assert.ok(
      stable.decision === "CONTINUE_CURRENT_BETA" ||
        stable.decision === "LIMITED_EXPANSION_CANDIDATE" ||
        stable.decision === "EXPANSION_NOT_READY",
    );
    if (stable.decision === "LIMITED_EXPANSION_CANDIDATE") {
      assert.equal(stable.noGoTriggers.length, 0);
    }
  });

  it("documents PR-103", () => {
    const doc = readFileSync(
      join(
        ROOT,
        "docs/PR-103-ANSWER-ASSISTANT-BETA-EXPANSION-DECISION.md",
      ),
      "utf8",
    );
    assert.match(doc, /PR-103/);
    assert.match(doc, /beta 확대 실행 PR이 아닙니다/);
    assert.match(doc, /CONTINUE_CURRENT_BETA/);
    assert.match(doc, /allowlist 자동 확대/);
    assert.match(doc, /PR-104/);
  });

  it("audit schema has no forbidden payload fields", () => {
    assert.equal(assertAnswerAssistantAuditSchemaSafe(), true);
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const start = schema.indexOf("model AnswerAssistantUsageAudit");
    const end = schema.indexOf("\n}", start);
    const block = schema.slice(start, end);
    for (const field of FORBIDDEN_USAGE_AUDIT_FIELDS) {
      assert.equal(
        block.includes(`${field} `) || block.includes(`${field}\n`),
        false,
        `audit model must not store ${field}`,
      );
    }
  });

  it("links from admin answer assistant hub", () => {
    const adminPage = readFileSync(
      join(ROOT, "app/admin/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(adminPage, /\/admin\/answer-assistant\/beta-decision/);
  });
});
