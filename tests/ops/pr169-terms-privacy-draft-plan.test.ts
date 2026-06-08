import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import {
  LEGAL_REVIEW_REQUIRED_ITEMS,
  PR169_DRAFT_VERDICTS,
  PR169_ENTRY_CONDITIONS,
  PR169_FORBIDDEN_PHRASES,
  PR169_OPEN_CRITICAL_COUNT,
  PR169_SCOPE_NOTICE,
  PR169_TEST_FILES,
  TERMS_PRIVACY_DRAFT_CHECKLIST,
  TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS,
  TERMS_PRIVACY_NO_GO_CRITERIA,
} from "@/lib/ops/terms-privacy-draft-plan";

const ROOT = process.cwd();

const PAYMENT_FORBIDDEN = ["stripe", "createCheckout", "billingPortal", "tosspayments"];

describe("PR169 terms privacy draft plan (static, no legal finalization)", () => {
  it("hub is draft plan not terms finalization", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Draft Plan|초안/);
    assert.match(hub, /약관 확정|결제|schema|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /검토 필요/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /법무 검토 완료/);
  });

  it("entry conditions met critical zero", () => {
    assert.equal(PR169_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
    assert.equal(PR169_OPEN_CRITICAL_COUNT, 0);
  });

  it("panel admin only no prisma billing checkout or consent form", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminTermsPrivacyDraftPlanPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminTermsPrivacyDraftPlanPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\.|stripe|checkout|createSubscription/i);
    assert.match(panel, /PR169_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminTermsPrivacyDraftPlanPanel/);
  });

  it("verdicts conditional ready legal finalization blocked", () => {
    assert.equal(PR169_DRAFT_VERDICTS.termsPrivacyDraftPlan, "conditional");
    assert.equal(PR169_DRAFT_VERDICTS.draftScopeDefined, "ready");
    assert.equal(PR169_DRAFT_VERDICTS.legalFinalization, "blocked");
    assert.equal(PR169_DRAFT_VERDICTS.billingImplementation, "blocked");
  });

  it("forbidden expressions block legal done refund guarantee and aa final", () => {
    const phrases = TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS.map((r) => r.phrase);
    assert.ok(phrases.includes("법무 검토 완료"));
    assert.ok(phrases.includes("환불 보장"));
    assert.ok(phrases.includes("AI가 최종 판단"));
    assert.ok(LEGAL_REVIEW_REQUIRED_ITEMS.some((r) => r.priority === "critical"));
  });

  it("no-go blocks final terms raw storage and billing without impl", () => {
    const situations = TERMS_PRIVACY_NO_GO_CRITERIA.map((r) => r.situation);
    assert.ok(situations.some((s) => s.includes("확정")));
    assert.ok(situations.some((s) => s.includes("원문")));
    assert.ok(situations.some((s) => s.includes("결제")));
  });

  it("no payment routes subscription models or billing deps", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
    assert.doesNotMatch(schema, /model PrivacyConsent\b/);
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);

    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const dep of PAYMENT_FORBIDDEN) {
      assert.doesNotMatch(pkg, new RegExp(`"${dep}"`));
    }
  });

  it("usage audit forbids prompt response raw storage", () => {
    const joined = FORBIDDEN_USAGE_AUDIT_FIELDS.join(" ").toLowerCase();
    assert.match(joined, /prompt|response|원문/i);
    const ssot = readFileSync(
      join(ROOT, "lib/ops/terms-privacy-draft-plan.ts"),
      "utf8",
    );
    assert.doesNotMatch(ssot, /from ["']@\/lib\/prisma/);
  });

  it("checklist blocks live terms pending legal final gap", () => {
    assert.ok(
      TERMS_PRIVACY_DRAFT_CHECKLIST.find((c) => c.id === "no-final")?.status ===
        "met",
    );
    assert.ok(
      TERMS_PRIVACY_DRAFT_CHECKLIST.find((c) => c.id === "legal-final")?.status ===
        "gap",
    );
    assert.ok(
      TERMS_PRIVACY_DRAFT_CHECKLIST.find((c) => c.id === "live-terms")?.status ===
        "pending",
    );
  });

  it("public home has no forbidden legal or payout phrases", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const phrase of PR169_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(home, new RegExp(phrase));
    }
  });

  it("operating checklist links PR169 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR169_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR169_SCOPE_NOTICE, /초안/);
    assert.match(PR169_SCOPE_NOTICE, /확정/);
  });
});
