import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import {
  BETA_AGGREGATE_RISKS,
  BETA_REVIEW_SUMMARY_CHECKLIST,
  DOMAIN_READINESS_ASSESSMENT,
  PR157_TO_PR171_SUMMARY,
  PR172_ENTRY_CONDITIONS,
  PR172_FORBIDDEN_PHRASES,
  PR172_OPEN_CRITICAL_COUNT,
  PR172_REVIEW_VERDICTS,
  PR172_SCOPE_NOTICE,
  PR172_TEST_FILES,
  PR173_ENTRY_CONDITIONS,
  PUBLIC_BETA_NO_GO,
} from "@/lib/ops/beta-review-summary";

const ROOT = process.cwd();

describe("PR172 beta review summary (static, no public beta execution)", () => {
  it("hub is synthesis report not public beta execution", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-172-BETA-REVIEW-SUMMARY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Beta Review Summary|종합 보고/);
    assert.match(hub, /공개 베타 실행|user|role|allowlist|운영 DB|없음/);
    assert.match(hub, /Conditional Go|Conditional Ready/);
    assert.match(hub, /검토 필요/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /공개 베타 즉시 실행/);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR172_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR172_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no user role allowlist db or billing changes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminBetaReviewSummaryPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminBetaReviewSummaryPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|allowlist\.|createUser|sendgrid|checkout/i);
    assert.match(panel, /PR172_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminBetaReviewSummaryPanel/);
  });

  it("verdicts conditional go public beta blocked", () => {
    assert.equal(PR172_REVIEW_VERDICTS.betaReviewSummary, "conditional");
    assert.equal(PR172_REVIEW_VERDICTS.synthesisComplete, "ready");
    assert.equal(PR172_REVIEW_VERDICTS.pr173Entry, "conditional_go");
    assert.equal(PR172_REVIEW_VERDICTS.publicBetaExecution, "blocked");
    assert.equal(PR172_REVIEW_VERDICTS.paidMonetization, "blocked");
  });

  it("synthesis covers PR157 through PR171", () => {
    assert.equal(PR157_TO_PR171_SUMMARY.length, 15);
    const ids = PR157_TO_PR171_SUMMARY.map((r) => r.id);
    for (let n = 157; n <= 171; n++) {
      assert.ok(ids.includes(`PR${n}`), `missing PR${n}`);
    }
  });

  it("domain assessment and aggregate risks documented", () => {
    assert.ok(DOMAIN_READINESS_ASSESSMENT.length >= 19);
    assert.ok(BETA_AGGREGATE_RISKS.filter((r) => r.grade === "critical").length >= 10);
    assert.ok(BETA_AGGREGATE_RISKS.some((r) => r.risk.includes("AA")));
  });

  it("no-go blocks critical access ai billing and terms final", () => {
    const situations = PUBLIC_BETA_NO_GO.map((r) => r.situation);
    assert.ok(situations.some((s) => s.includes("Critical")));
    assert.ok(situations.some((s) => s.includes("allowlist")));
    assert.ok(situations.some((s) => s.includes("약관")));
    assert.ok(situations.some((s) => s.includes("결제")));
  });

  it("pr173 entry requires critical zero and blocks public execution in checklist", () => {
    const crit = PR173_ENTRY_CONDITIONS.find((c) => c.id === "crit0");
    assert.equal(crit?.status, "met");
    const noPub = BETA_REVIEW_SUMMARY_CHECKLIST.find((c) => c.id === "no-pub");
    assert.equal(noPub?.status, "met");
    const pubExec = BETA_REVIEW_SUMMARY_CHECKLIST.find((c) => c.id === "pub-exec");
    assert.equal(pubExec?.status, "pending");
  });

  it("no billing routes schema changes or forbidden phrases in ssot", () => {
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);

    const ssot = readFileSync(
      join(ROOT, "lib/ops/beta-review-summary.ts"),
      "utf8",
    );
    for (const phrase of PR172_FORBIDDEN_PHRASES) {
      assert.ok(!ssot.includes(`"${phrase}"`) || ssot.includes("FORBIDDEN"));
    }
    assert.match(PR172_SCOPE_NOTICE, /종합 보고/);
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.length >= 5);
  });

  it("test files exist", () => {
    for (const f of PR172_TEST_FILES) {
      assert.equal(existsSync(join(ROOT, f)), true, `missing ${f}`);
    }
  });
});
