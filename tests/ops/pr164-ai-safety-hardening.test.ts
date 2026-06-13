import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR164_ENTRY_CONDITIONS,
  PR164_OPEN_CRITICAL_COUNT,
  PR164_SAFETY_VERDICTS,
  PR164_SCOPE_NOTICE,
  PR164_TEST_FILES,
  SAFETY_HARDENING_CHECKLIST,
} from "@/lib/ops/ai-safety-hardening";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";

const ROOT = process.cwd();

describe("PR164 AI safety hardening (static, no access expansion)", () => {
  it("hub is safety hardening not feature expansion", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-164-AI-SAFETY-HARDENING-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Safety Hardening|안전성 보강/);
    assert.match(hub, /접근 확대|provider|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("entry conditions met for PR164", () => {
    assert.equal(PR164_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
  });

  it("panel admin only no prisma allowlist or guard weakening", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminAiSafetyHardeningPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminAiSafetyHardeningPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|allowlist.*push|updateMany/i);
    assert.match(panel, /PR164_SCOPE_NOTICE/);
  });

  it("verdicts conditional ready output and audit ready", () => {
    assert.equal(PR164_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR164_SAFETY_VERDICTS.safetyHardeningPrepared, "conditional");
    assert.equal(PR164_SAFETY_VERDICTS.outputSafetyRules, "ready");
    assert.equal(PR164_SAFETY_VERDICTS.auditMetadataOnly, "ready");
    assert.equal(PR164_SAFETY_VERDICTS.accessGuardIntegrity, "ready");
  });

  it("output-safety and validation hardened without provider calls", () => {
    const outputSafety = readFileSync(
      join(ROOT, "lib/answer-assistant/output-safety.ts"),
      "utf8",
    );
    assert.match(outputSafety, /OUTPUT_BLOCKED_SECRET_LEAK/);
    assert.match(outputSafety, /OUTPUT_BLOCKED_CLAIM_DOCUMENT_ONLY/);
    const validation = readFileSync(
      join(ROOT, "lib/answer-assistant/validation.ts"),
      "utf8",
    );
    assert.match(validation, /CLAIM_DOCUMENT_ONLY_KEYWORDS/);
    assert.match(validation, /PROFESSIONAL_CERTAINTY_KEYWORDS/);
    assert.match(validation, /usage audit/);
    const provider = readFileSync(
      join(ROOT, "lib/answer-assistant/provider.ts"),
      "utf8",
    );
    assert.doesNotMatch(provider, /fetch\(\s*['"]https:\/\/api\./);
  });

  it("verified access gate unchanged", () => {
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /allowlist|NOT_ALLOWLISTED/i);
    const actions = readFileSync(
      join(ROOT, "app/planner/answer-assistant/actions.ts"),
      "utf8",
    );
    assert.match(actions, /getVerifiedAnswerAssistantAccess/);
  });

  it("usage audit metadata-only forbidden fields present", () => {
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.length >= 5);
    const usageLog = readFileSync(
      join(ROOT, "lib/answer-assistant/usage-log.ts"),
      "utf8",
    );
    assert.match(usageLog, /FORBIDDEN_USAGE_AUDIT_FIELDS/);
    assert.doesNotMatch(usageLog, /promptText|responseText|queryText/i);
  });

  it("rollback disable includes PR164 triggers", () => {
    const rollback = readFileSync(
      join(ROOT, "lib/answer-assistant/rollback-disable.ts"),
      "utf8",
    );
    assert.match(rollback, /payout_certainty_output/);
    assert.match(rollback, /secret_leak_risk/);
    assert.match(rollback, /repeated_safety_failure/);
  });

  it("checklist has no open critical static gaps except live provider", () => {
    const pending = SAFETY_HARDENING_CHECKLIST.filter(
      (c) => c.status === "partial" || c.status === "pending",
    );
    assert.equal(pending.length, 1);
    assert.equal(pending[0]?.id, "live");
  });

  it("test files exist", () => {
    for (const file of PR164_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR164_SCOPE_NOTICE, /접근 확대/);
    assert.match(PR164_SCOPE_NOTICE, /provider/);
  });
});
