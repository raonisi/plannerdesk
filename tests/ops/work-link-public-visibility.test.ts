import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "@/lib/work-links/review-mock-candidates";
import {
  DEFAULT_WORK_LINK_VISIBILITY_SCOPE,
  isWorkLinkPublicPublishCandidate,
  projectWorkLinkToPublic,
  stripAdminOnlyWorkLinkFields,
} from "@/lib/work-links/review-rules";
import {
  WORK_LINK_ADMIN_ONLY_FIELDS,
  type WorkLinkReviewCandidate,
} from "@/lib/work-links/review-types";

describe("PR-BS-14 work link public visibility rules", () => {
  it("draft and needs_review are never public publish candidates", () => {
    for (const candidate of WORK_LINK_REVIEW_MOCK_CANDIDATES) {
      if (
        candidate.reviewStatus === "draft" ||
        candidate.reviewStatus === "needs_review"
      ) {
        assert.equal(isWorkLinkPublicPublishCandidate(candidate), false);
        assert.equal(projectWorkLinkToPublic(candidate), null);
      }
    }
  });

  it("items without officialSourceUrl are not public publish candidates", () => {
    const withoutSource = WORK_LINK_REVIEW_MOCK_CANDIDATES.filter(
      (c) => !c.officialSourceUrl,
    );
    assert.ok(withoutSource.length >= 1);
    for (const candidate of withoutSource) {
      assert.equal(isWorkLinkPublicPublishCandidate(candidate), false);
    }
  });

  it("default visibilityScope is admin for all mock candidates", () => {
    for (const candidate of WORK_LINK_REVIEW_MOCK_CANDIDATES) {
      assert.equal(candidate.visibilityScope, DEFAULT_WORK_LINK_VISIBILITY_SCOPE);
      assert.equal(isWorkLinkPublicPublishCandidate(candidate), false);
    }
  });

  it("public projection strips admin-only fields", () => {
    const sample: WorkLinkReviewCandidate = {
      ...WORK_LINK_REVIEW_MOCK_CANDIDATES[1]!,
      reviewStatus: "published",
      visibilityScope: "public",
      officialSourceUrl: "https://example.invalid/official",
    };
    const stripped = stripAdminOnlyWorkLinkFields(sample);
    for (const field of WORK_LINK_ADMIN_ONLY_FIELDS) {
      assert.equal(field in stripped, false);
    }
  });

  it("published public scope with official source can project without admin fields", () => {
    const candidate: WorkLinkReviewCandidate = {
      id: "mock-test-public",
      title: "테스트 공개 후보",
      insurerName: "예시",
      infoType: "disclosure",
      targetUrl: null,
      officialSourceUrl: "https://example.invalid/official/disclosure",
      sourceLabel: "placeholder",
      riskLevel: "medium",
      reviewStatus: "published",
      visibilityScope: "public",
      lastVerifiedAt: "2026-06-01",
      staleAfterDays: 90,
      reviewNotePrivate: "must not leak",
      adminMemo: "must not leak",
    };
    assert.equal(isWorkLinkPublicPublishCandidate(candidate), true);
    const projected = projectWorkLinkToPublic(candidate);
    assert.ok(projected);
    for (const field of WORK_LINK_ADMIN_ONLY_FIELDS) {
      assert.equal(field in projected, false);
    }
    assert.equal("reviewNotePrivate" in projected, false);
  });
});
