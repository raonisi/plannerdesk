import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  MONETIZATION_FORBIDDEN_EXPRESSIONS,
  PR165_ENTRY_CONDITIONS,
  PR165_FORBIDDEN_PHRASES,
  PR165_OPEN_CRITICAL_COUNT,
  PR165_READINESS_VERDICTS,
  PR165_SCOPE_NOTICE,
  PR165_TEST_FILES,
  PAYMENT_LEGAL_READINESS_CHECKLIST,
} from "@/lib/ops/payment-legal-readiness";

const ROOT = process.cwd();

const PAYMENT_FORBIDDEN = [
  "stripe",
  "createCheckout",
  "billingPortal",
  "PaymentIntent",
  "tosspayments",
  "iamport",
];

describe("PR165 payment legal readiness (static, no billing)", () => {
  it("hub is legal readiness not payment implementation", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-165-PAYMENT-LEGAL-READINESS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /Legal Readiness|법무/);
    assert.match(hub, /결제 기능|PG|가격표|변경 없음/);
    assert.match(hub, /Conditional Ready/);
    assert.match(hub, /검토 필요/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.doesNotMatch(hub, /법무 검토 완료/);
  });

  it("entry conditions met for PR165", () => {
    assert.equal(PR165_ENTRY_CONDITIONS.filter((c) => !c.met).length, 0);
  });

  it("panel admin only no prisma stripe checkout or paid role", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminPaymentLegalReadinessPanel/);
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminPaymentLegalReadinessPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /stripe|checkout|webhook|createSubscription/i);
    assert.match(panel, /PR165_SCOPE_NOTICE/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminPaymentLegalReadinessPanel/);
  });

  it("verdicts conditional ready actual monetization not ready", () => {
    assert.equal(PR165_OPEN_CRITICAL_COUNT, 0);
    assert.equal(PR165_READINESS_VERDICTS.paymentLegalReadiness, "conditional");
    assert.equal(PR165_READINESS_VERDICTS.actualMonetizationGo, "not_ready");
    assert.equal(PR165_READINESS_VERDICTS.billingImplementation, "blocked");
  });

  it("no payment routes subscription models or billing deps", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Subscription\b/);
    assert.doesNotMatch(schema, /model Payment\b/);
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);

    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"stripe"/);
    for (const rel of ["app/page.tsx", "app/home-client.tsx"]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      for (const phrase of PAYMENT_FORBIDDEN) {
        assert.doesNotMatch(src, new RegExp(phrase));
      }
      assert.doesNotMatch(src, /지금 결제하면/);
      assert.doesNotMatch(src, /유료 플랜 확정/);
    }
  });

  it("forbidden expressions documented no refund guarantee on public home", () => {
    const phrases = MONETIZATION_FORBIDDEN_EXPRESSIONS.map((r) => r.phrase);
    assert.ok(phrases.includes("환불 보장"));
    assert.ok(phrases.includes("법무 검토 완료"));
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    for (const phrase of PR165_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(home, new RegExp(phrase));
    }
  });

  it("aa route guard unchanged no access expansion", () => {
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /getVerifiedAnswerAssistantAccess/);
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /allowlist|NOT_ALLOWLISTED/i);
  });

  it("checklist documents readiness gaps not paid launch", () => {
    const gaps = PAYMENT_LEGAL_READINESS_CHECKLIST.filter(
      (c) => c.status === "gap" || c.status === "pending",
    );
    assert.ok(gaps.some((c) => c.id === "terms-final"));
    assert.ok(gaps.some((c) => c.id === "paid-launch"));
    assert.ok(
      PAYMENT_LEGAL_READINESS_CHECKLIST.find((c) => c.id === "no-billing")?.status ===
        "met",
    );
  });

  it("no-go doc exists and forbids arbitrary pricing", () => {
    const noGo = readFileSync(
      join(ROOT, "docs/PR-165-NO-GO-CRITERIA.md"),
      "utf8",
    );
    assert.match(noGo, /No-Go/);
    assert.match(noGo, /가격표/);
  });

  it("operating checklist links PR165 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-165-PAYMENT-LEGAL-READINESS-OPS/);
  });

  it("test files exist", () => {
    for (const file of PR165_TEST_FILES) {
      readFileSync(join(ROOT, file), "utf8");
    }
  });

  it("scope notice matches SSOT", () => {
    assert.match(PR165_SCOPE_NOTICE, /결제 기능/);
    assert.match(PR165_SCOPE_NOTICE, /가격표/);
  });
});
