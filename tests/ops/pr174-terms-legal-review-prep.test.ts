import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import {
  INSURANCE_DOMAIN_FORBIDDEN_EXPRESSIONS,
  LEGAL_BETA_NO_GO_CRITERIA,
  LEGAL_REVIEW_PREP_CHECKLIST,
  LEGAL_REVIEWER_QUESTIONS,
  PAYMENT_PG_LEGAL_QUESTIONS,
  PR174_ENTRY_CONDITIONS,
  PR174_FORBIDDEN_PHRASES,
  PR174_OPEN_CRITICAL_COUNT,
  PR174_REVIEW_VERDICTS,
  PR174_TEST_FILES,
  REFUND_CANCEL_LEGAL_QUESTIONS,
  TERMS_OF_SERVICE_DRAFT_CANDIDATES,
} from "@/lib/ops/terms-legal-review-prep";

const ROOT = process.cwd();

const PAYMENT_FORBIDDEN = ["stripe", "createCheckout", "billingPortal", "tosspayments"];

describe("PR174 terms legal review prep (static, no legal finalization)", () => {
  it("hub is legal handoff prep not terms finalization", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-174-TERMS-LEGAL-REVIEW-PREP.md"),
      "utf8",
    );
    assert.match(hub, /Legal Review Prep|법무 검토/);
    assert.match(hub, /초안 후보|검토 필요|법무 확인 필요/);
    assert.match(hub, /약관 확정|결제|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /법무 검토 완료/);
    assert.doesNotMatch(hub, /즉시 적용 가능/);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR174_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR174_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma billing checkout or consent form", () => {
    const shell = readFileSync(join(ROOT, "components/admin/AdminPlanningPanels.tsx"), "utf8");
    assert.match(shell, /AdminTermsLegalReviewPrepPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminTermsLegalReviewPrepPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|stripe|checkout|createSubscription/i);
    assert.match(panel, /PR174_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminTermsLegalReviewPrepPanel/);
  });

  it("verdicts conditional ready all finalization blocked", () => {
    assert.equal(PR174_REVIEW_VERDICTS.legalReviewPrep, "conditional");
    assert.equal(PR174_REVIEW_VERDICTS.handoffPacket, "ready");
    assert.equal(PR174_REVIEW_VERDICTS.termsFinalization, "blocked");
    assert.equal(PR174_REVIEW_VERDICTS.privacyFinalization, "blocked");
    assert.equal(PR174_REVIEW_VERDICTS.refundPolicyFinalization, "blocked");
    assert.equal(PR174_REVIEW_VERDICTS.paymentPolicyFinalization, "blocked");
    assert.equal(PR174_REVIEW_VERDICTS.publicBetaLegalGo, "blocked");
  });

  it("draft candidates and legal questions documented", () => {
    assert.ok(TERMS_OF_SERVICE_DRAFT_CANDIDATES.length >= 11);
    assert.equal(REFUND_CANCEL_LEGAL_QUESTIONS.length, 8);
    assert.equal(PAYMENT_PG_LEGAL_QUESTIONS.length, 8);
    assert.equal(INSURANCE_DOMAIN_FORBIDDEN_EXPRESSIONS.length, 11);
    assert.equal(LEGAL_REVIEWER_QUESTIONS.length, 10);
    assert.ok(LEGAL_BETA_NO_GO_CRITERIA.length >= 14);
  });

  it("checklist covers handoff packet without legal done", () => {
    const legalDone = LEGAL_REVIEW_PREP_CHECKLIST.find((r) => r.id === "legal-done");
    assert.equal(legalDone?.status, "gap");
    assert.ok(
      LEGAL_REVIEW_PREP_CHECKLIST.filter((r) => r.status === "met").length >= 10,
    );
  });

  it("no payment routes checkout billing subscription", () => {
    for (const dir of ["app/checkout", "app/billing", "app/payment", "app/api/refund"]) {
      assert.equal(existsSync(join(ROOT, dir)), false);
    }
    for (const route of PAYMENT_FORBIDDEN) {
      const shell = readFileSync(join(ROOT, "components/admin/AdminPlanningPanels.tsx"), "utf8");
      assert.doesNotMatch(shell, new RegExp(route, "i"));
    }
  });

  it("aa metadata-only audit and verified access unchanged", () => {
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.length >= 5);
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /getVerifiedAnswerAssistantAccess/);
  });

  it("forbidden phrases exclude finalization and legal done", () => {
    for (const phrase of [
      "법무 검토 완료",
      "이용약관 확정",
      "환불 보장",
      "즉시 적용 가능",
    ]) {
      assert.ok(PR174_FORBIDDEN_PHRASES.includes(phrase), phrase);
    }
  });

  it("test files exist", () => {
    for (const rel of PR174_TEST_FILES) {
      assert.equal(existsSync(join(ROOT, rel)), true, rel);
    }
  });
});
