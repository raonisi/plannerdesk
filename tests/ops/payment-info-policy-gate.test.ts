import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  isPaymentInfoHighRiskType,
  isPaymentInfoPlannerCandidate,
  isPaymentInfoPublicVisible,
  PAYMENT_INFO_HIGH_RISK_TYPES,
  PLANNERDESK_PG_SCOPE_NOTICE,
} from "@/lib/payment-info/payment-info-policy";
import { makeCandidate } from "./verified-work-links-fixtures";

const ROOT = process.cwd();

describe("PR-BS-17 payment info policy gate", () => {
  it("classifies payment info types as high-risk", () => {
    for (const type of PAYMENT_INFO_HIGH_RISK_TYPES) {
      assert.equal(isPaymentInfoHighRiskType(type), true);
    }
    assert.equal(isPaymentInfoHighRiskType("claimGuide"), false);
  });

  it("blocks payment info from public visibility", () => {
    for (const type of PAYMENT_INFO_HIGH_RISK_TYPES) {
      assert.equal(isPaymentInfoPublicVisible({ infoType: type }), false);
    }
    const publishedPublicPayment = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "published",
      visibilityScope: "public",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-01",
      riskLevel: "high",
    });
    assert.equal(isPaymentInfoPublicVisible(publishedPublicPayment), false);
  });

  it("requires officialSourceUrl for planner payment candidates", () => {
    const base = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "verified",
      visibilityScope: "planner",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-08",
      riskLevel: "high",
    });
    assert.equal(isPaymentInfoPlannerCandidate(base), true);
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, officialSourceUrl: null }),
      false,
    );
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, officialSourceUrl: "  " }),
      false,
    );
  });

  it("requires lastVerifiedAt for planner payment candidates", () => {
    const base = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "verified",
      visibilityScope: "planner",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-08",
      riskLevel: "high",
    });
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, lastVerifiedAt: null }),
      false,
    );
  });

  it("requires verified or published review status for planner payment", () => {
    const base = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "verified",
      visibilityScope: "planner",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-08",
      riskLevel: "high",
    });
    assert.equal(isPaymentInfoPlannerCandidate(base), true);
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, reviewStatus: "published" }),
      true,
    );
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, reviewStatus: "draft" }),
      false,
    );
  });

  it("requires planner visibility scope for payment info", () => {
    const base = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "verified",
      visibilityScope: "planner",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-08",
      riskLevel: "high",
    });
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, visibilityScope: "public" }),
      false,
    );
  });

  it("requires high risk level for planner payment candidates", () => {
    const base = makeCandidate({
      infoType: "paymentInfo",
      reviewStatus: "verified",
      visibilityScope: "planner",
      officialSourceUrl: "https://example.invalid/official",
      lastVerifiedAt: "2026-05-08",
      riskLevel: "high",
    });
    assert.equal(
      isPaymentInfoPlannerCandidate({ ...base, riskLevel: "medium" }),
      false,
    );
  });

  it("documents PlannerDesk PG scope separately from insurer payment info", () => {
    assert.match(PLANNERDESK_PG_SCOPE_NOTICE, /PlannerDesk/);
    assert.match(PLANNERDESK_PG_SCOPE_NOTICE, /보험사/);
    const doc = readFileSync(
      join(ROOT, "docs/PR-BS-17-CARD-PAYMENT-INFO-POLICY-GATE.md"),
      "utf8",
    );
    assert.match(doc, /PlannerDesk PG/);
    assert.match(doc, /보험사.*납입/);
  });

  it("does not introduce checkout billing subscription or webhook routes", () => {
    for (const dir of [
      "app/checkout",
      "app/billing",
      "app/subscription",
      "app/webhook",
      "app/api/webhook",
    ]) {
      assert.equal(existsSync(join(ROOT, dir)), false, `${dir} must not exist`);
    }
  });

  it("does not add PG SDK dependencies to package.json", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    for (const dep of [
      "tosspayments",
      "portone",
      "nicepay",
      "@tosspayments",
      "stripe",
    ]) {
      assert.doesNotMatch(pkg, new RegExp(dep, "i"), `package.json must not reference ${dep}`);
    }
  });
});
