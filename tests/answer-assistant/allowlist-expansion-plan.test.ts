import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildExpansionPreconditions,
  evaluateAllowlistExpansionPlan,
  computeWave1AddSlots,
} from "@/lib/answer-assistant/allowlist-expansion-plan";
import { getAllowlistExpansionPlanConfig } from "@/lib/answer-assistant/allowlist-expansion-plan-config";
import type { BetaExpansionDecisionReport } from "@/lib/answer-assistant/beta-expansion-decision";

const ROOT = process.cwd();

function minimalDecisionReport(
  overrides: Partial<BetaExpansionDecisionReport> = {},
): BetaExpansionDecisionReport {
  return {
    period: { start: "2026-01-01T00:00:00.000Z", end: "2026-02-01T00:00:00.000Z" },
    usage: {
      totalBetaRequests: 50,
      success: 30,
      blocked: 20,
      rateLimited: 2,
      promptInjectionBlocked: 0,
      outputSafetyBlocked: 0,
      providerError: 1,
      insufficientEvidence: 2,
      permissionDenied: 0,
      notAllowlisted: 1,
      providerNotConfigured: 0,
    },
    feedback: {
      totalFeedback: 3,
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
    },
    retention: {
      lastCleanupDate: null,
      cleanupOverdue: false,
      oldAuditCandidateCount: 0,
      oldFeedbackCandidateCount: 0,
      criticalFeedbackProtectedCount: 0,
      linkedUsageAuditProtectedCount: 0,
    },
    operational: {
      rateLimitHealthy: true,
      usageAuditHealthy: true,
      retentionHealthy: true,
      cleanupOverdue: false,
      betaOperational: true,
      allowlistBetaStatus: "operational",
      providerErrorElevated: false,
      permissionDeniedElevated: false,
      notAllowlistedElevated: false,
    },
    safetyNoGoRows: [],
    noGoTriggers: [],
    improvementTriggers: [],
    maintainConditionsMet: [],
    maintainConditionsMissing: [],
    expansionConditionsMet: ["min_operation_days", "min_beta_requests"],
    expansionConditionsMissing: [],
    decision: "LIMITED_EXPANSION_CANDIDATE",
    decisionCandidates: ["LIMITED_EXPANSION_CANDIDATE"],
    rationale: ["stable"],
    noGoReasons: [],
    improvementItems: [],
    expansionScopeNote: "allowlist only",
    forbiddenReminders: [],
    nextPr: "PR-104-C",
    nextPrSummary: "plan",
    config: {
      minOperationDays: 14,
      minBetaRequests: 20,
      cleanupOverdueDays: 90,
      feedbackBacklogMax: 15,
      improvementEvidenceMissingMin: 3,
      improvementProviderErrorMin: 5,
      improvementInsufficientEvidencePct: 25,
      improvementNotAllowlistedMin: 10,
      improvementRateLimitedMin: 15,
      providerErrorRateMaxPct: 15,
    },
    ...overrides,
  };
}

describe("Answer Assistant allowlist expansion plan (PR-104-C)", () => {
  it("admin expansion-plan route is admin-only and noindex", () => {
    const page = readFileSync(
      join(ROOT, "app/admin/answer-assistant/expansion-plan/page.tsx"),
      "utf8",
    );
    assert.match(page, /getAdminAccess/);
    assert.match(page, /index:\s*false/);
    assert.doesNotMatch(page, /verified_planner/);
  });

  it("does not expose auto allowlist apply controls", () => {
    const view = readFileSync(
      join(
        ROOT,
        "components/admin/answer-assistant/AllowlistExpansionPlanView.tsx",
      ),
      "utf8",
    );
    assert.doesNotMatch(view, /<button[^>]*>[^<]*allowlist/i);
    assert.doesNotMatch(view, /<button[^>]*>[^<]*확대/i);
    assert.match(view, /확대 실행 PR이 아닙니다/);
    assert.match(view, /allowlist 자동/);
  });

  it("plan module avoids forbidden payload field names", () => {
    const source = readFileSync(
      join(ROOT, "lib/answer-assistant/allowlist-expansion-plan.ts"),
      "utf8",
    );
    for (const field of [
      "rawPrompt",
      "rawOutput",
      "generatedAnswer",
      "customerName",
      "contractNumber",
    ]) {
      assert.equal(source.includes(`${field}:`), false);
    }
  });

  it("critical signal yields PAUSE_AND_FIX_REQUIRED", () => {
    const report = minimalDecisionReport({
      feedback: {
        ...minimalDecisionReport().feedback,
        criticalFeedback: 1,
      },
      noGoTriggers: ["CRITICAL_STOP"],
      decision: "PAUSE_BETA",
    });
    const pre = buildExpansionPreconditions(report);
    const result = evaluateAllowlistExpansionPlan({
      pr103Decision: report.decision,
      preconditionsMet: pre.every((r) => r.met),
      noGoTriggers: report.noGoTriggers,
      improvementTriggers: [],
      currentAllowlistCount: 2,
      wave2CumulativeCap: 10,
      wave1SuggestedAdds: 3,
    });
    assert.equal(result.decision, "PAUSE_AND_FIX_REQUIRED");
    assert.notEqual(result.decision, "READY_FOR_WAVE_1_PLAN");
  });

  it("non LIMITED decision blocks wave 1 ready", () => {
    const report = minimalDecisionReport({
      decision: "EXPANSION_NOT_READY",
    });
    const pre = buildExpansionPreconditions(report);
    const result = evaluateAllowlistExpansionPlan({
      pr103Decision: report.decision,
      preconditionsMet: pre.every((r) => r.met),
      noGoTriggers: [],
      improvementTriggers: ["EVIDENCE_MISSING"],
      currentAllowlistCount: 2,
      wave2CumulativeCap: 10,
      wave1SuggestedAdds: 3,
    });
    assert.ok(
      result.decision === "EXPANSION_BLOCKED" ||
        result.decision === "EXPANSION_REQUIRES_IMPROVEMENT" ||
        result.decision === "KEEP_CURRENT_ALLOWLIST",
    );
    assert.notEqual(result.decision, "READY_FOR_WAVE_1_PLAN");
  });

  it("LIMITED_EXPANSION_CANDIDATE with preconditions can be READY_FOR_WAVE_1", () => {
    const report = minimalDecisionReport();
    const pre = buildExpansionPreconditions(report);
    assert.ok(pre.every((r) => r.met));
    const result = evaluateAllowlistExpansionPlan({
      pr103Decision: "LIMITED_EXPANSION_CANDIDATE",
      preconditionsMet: true,
      noGoTriggers: [],
      improvementTriggers: [],
      currentAllowlistCount: 2,
      wave2CumulativeCap: 10,
      wave1SuggestedAdds: 3,
    });
    assert.equal(result.decision, "READY_FOR_WAVE_1_PLAN");
  });

  it("wave1 slots respect max and percent cap", () => {
    const config = getAllowlistExpansionPlanConfig();
    assert.equal(computeWave1AddSlots(0, config), Math.min(config.wave1MaxAdd, 3));
    assert.ok(computeWave1AddSlots(10, config) <= config.wave1MaxAdd);
  });

  it("documents PR-104-C", () => {
    const doc = readFileSync(
      join(
        ROOT,
        "docs/PR-104C-ANSWER-ASSISTANT-LIMITED-ALLOWLIST-EXPANSION-PLAN.md",
      ),
      "utf8",
    );
    assert.match(doc, /PR-104-C/);
    assert.match(doc, /확대 실행 PR이 아닙니다/);
    assert.match(doc, /Wave 1/);
    assert.match(doc, /자동 확대/);
  });

  it("links from beta-decision and admin hub", () => {
    const decisionPage = readFileSync(
      join(ROOT, "app/admin/answer-assistant/beta-decision/page.tsx"),
      "utf8",
    );
    const adminPage = readFileSync(
      join(ROOT, "app/admin/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(decisionPage, /expansion-plan/);
    assert.match(adminPage, /expansion-plan/);
  });
});
