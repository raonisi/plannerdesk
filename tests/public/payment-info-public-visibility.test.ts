import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isPaymentInfoPublicVisible,
  PAYMENT_INFO_HIGH_RISK_TYPES,
} from "@/lib/payment-info/payment-info-policy";
import {
  isWorkLinkPublicVisible,
  listPublicVerifiedWorkLinks,
  projectToPublicVerifiedView,
} from "@/lib/work-links/verified-projection";
import {
  FIXTURE_PLANNER_PAYMENT,
  FIXTURE_PUBLISHED_PAYMENT_BLOCKED,
  makeCandidate,
} from "../ops/verified-work-links-fixtures";

describe("PR-BS-17 payment info public visibility", () => {
  it("treats all payment high-risk types as non-public", () => {
    for (const infoType of PAYMENT_INFO_HIGH_RISK_TYPES) {
      assert.equal(isPaymentInfoPublicVisible({ infoType }), false);
      if (infoType !== "paymentInfo") continue;
      const candidate = makeCandidate({
        infoType: "paymentInfo",
        reviewStatus: "published",
        visibilityScope: "public",
        officialSourceUrl: "https://example.invalid/official",
        lastVerifiedAt: "2026-06-01",
        riskLevel: "high",
      });
      assert.equal(isWorkLinkPublicVisible(candidate), false);
      assert.equal(projectToPublicVerifiedView(candidate), null);
    }
  });

  it("blocks published paymentInfo with public scope from directory projection", () => {
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PUBLISHED_PAYMENT_BLOCKED), false);
    assert.equal(
      listPublicVerifiedWorkLinks([FIXTURE_PUBLISHED_PAYMENT_BLOCKED]).length,
      0,
    );
  });

  it("allows planner-only paymentInfo on planner path but never public", () => {
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PLANNER_PAYMENT), false);
    assert.equal(isPaymentInfoPublicVisible(FIXTURE_PLANNER_PAYMENT), false);
  });
});
