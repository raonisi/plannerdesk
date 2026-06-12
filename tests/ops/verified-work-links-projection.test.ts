import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALL_CANDIDATES_FOR_TEST,
  FIXTURE_PUBLISHED_CLAIM,
  FIXTURE_PUBLISHED_PAYMENT_BLOCKED,
  FIXTURE_PLANNER_CUSTOMER_CENTER,
  FIXTURE_PLANNER_PAYMENT,
} from "./verified-work-links-fixtures";
import {
  assertNoAdminFieldsInProjection,
  isWorkLinkPlannerVisible,
  isWorkLinkPublicVisible,
  listPublicVerifiedWorkLinks,
  projectToPlannerVerifiedView,
  projectToPublicVerifiedView,
  PUBLIC_BLOCKED_INFO_TYPES,
} from "@/lib/work-links/verified-projection";
import { WORK_LINK_ADMIN_ONLY_FIELDS } from "@/lib/work-links/review-types";

describe("PR-BS-15 verified work links projection", () => {
  it("blocks draft and needs_review from public visibility", () => {
    for (const candidate of ALL_CANDIDATES_FOR_TEST) {
      if (
        candidate.reviewStatus === "draft" ||
        candidate.reviewStatus === "needs_review"
      ) {
        assert.equal(isWorkLinkPublicVisible(candidate), false);
        assert.equal(projectToPublicVerifiedView(candidate), null);
      }
    }
  });

  it("blocks stale from public visibility", () => {
    const stale = ALL_CANDIDATES_FOR_TEST.filter((c) => c.reviewStatus === "stale");
    assert.ok(stale.length >= 1);
    for (const candidate of stale) {
      assert.equal(isWorkLinkPublicVisible(candidate), false);
    }
  });

  it("requires published + public + officialSourceUrl + lastVerifiedAt for public", () => {
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PUBLISHED_CLAIM), true);
    const projected = projectToPublicVerifiedView(FIXTURE_PUBLISHED_CLAIM);
    assert.ok(projected);
    assert.equal(projected!.officialSourceUrl, FIXTURE_PUBLISHED_CLAIM.officialSourceUrl);
    assert.equal(projected!.lastVerifiedAt, FIXTURE_PUBLISHED_CLAIM.lastVerifiedAt);
  });

  it("blocks paymentInfo from public even when published", () => {
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PUBLISHED_PAYMENT_BLOCKED), false);
    assert.ok(PUBLIC_BLOCKED_INFO_TYPES.has("paymentInfo"));
    assert.equal(
      listPublicVerifiedWorkLinks([FIXTURE_PUBLISHED_PAYMENT_BLOCKED]).length,
      0,
    );
  });

  it("allows verified + planner for planner-only rows", () => {
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PLANNER_CUSTOMER_CENTER), false);
    assert.equal(isWorkLinkPlannerVisible(FIXTURE_PLANNER_CUSTOMER_CENTER), true);
    const projected = projectToPlannerVerifiedView(FIXTURE_PLANNER_CUSTOMER_CENTER);
    assert.ok(projected);
    assert.equal("plannerNotice" in projected!, true);
  });

  it("allows paymentInfo on planner when verified + planner scope", () => {
    assert.equal(isWorkLinkPlannerVisible(FIXTURE_PLANNER_PAYMENT), true);
    assert.equal(isWorkLinkPublicVisible(FIXTURE_PLANNER_PAYMENT), false);
  });

  it("strips admin-only fields from projections", () => {
    const publicView = projectToPublicVerifiedView(FIXTURE_PUBLISHED_CLAIM)!;
    const plannerView = projectToPlannerVerifiedView(FIXTURE_PLANNER_CUSTOMER_CENTER)!;
    assert.ok(assertNoAdminFieldsInProjection(publicView as unknown as Record<string, unknown>));
    assert.ok(assertNoAdminFieldsInProjection(plannerView as unknown as Record<string, unknown>));
    for (const field of WORK_LINK_ADMIN_ONLY_FIELDS) {
      assert.equal(field in publicView, false);
      assert.equal(field in plannerView, false);
    }
  });

  it("blocks items without officialSourceUrl or lastVerifiedAt", () => {
    const noSource = {
      ...FIXTURE_PUBLISHED_CLAIM,
      officialSourceUrl: null,
    };
    const noDate = {
      ...FIXTURE_PUBLISHED_CLAIM,
      lastVerifiedAt: null,
    };
    assert.equal(isWorkLinkPublicVisible(noSource), false);
    assert.equal(isWorkLinkPublicVisible(noDate), false);
  });
});
