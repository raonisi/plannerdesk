import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VerificationStatus } from "@prisma/client";
import {
  ADMIN_BULK_DOMAINS,
  evaluateBulkActionEligibility,
  GLOBAL_FORBIDDEN_BULK_OPERATIONS,
  isBulkActionImplemented,
  isGloballyForbiddenBulkOperation,
  validateServerBulkAction,
} from "@/lib/admin/bulk-policies";
import {
  BULK_ACTION_MAX_IDS,
  bulkRunError,
  parseBulkIds,
  shouldSkipPublish,
  shouldSkipVerified,
} from "@/lib/admin/bulk-run";
import {
  ROLE_CONTENT_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_VERIFIED_PLANNER,
} from "@/lib/auth/rbac";

const sampleItem = {
  id: "fixture-id-1",
  title: "Fixture (not production)",
  status: "verified",
  isPublished: false,
};

describe("Admin bulk safety (PR107, no database)", () => {
  describe("GLOBAL_FORBIDDEN_BULK_OPERATIONS", () => {
    it("lists high-risk operation ids with labels", () => {
      assert.ok(GLOBAL_FORBIDDEN_BULK_OPERATIONS.length >= 5);
      for (const op of GLOBAL_FORBIDDEN_BULK_OPERATIONS) {
        assert.equal(isGloballyForbiddenBulkOperation(op), true);
      }
      assert.equal(isGloballyForbiddenBulkOperation("importDrafts"), false);
      assert.equal(isGloballyForbiddenBulkOperation("setPublishedTrue"), false);
    });
  });

  describe("validateServerBulkAction", () => {
    it("blocks importDrafts on every enabled domain", () => {
      for (const domain of ADMIN_BULK_DOMAINS) {
        const result = validateServerBulkAction(domain, "importDrafts");
        assert.ok(result);
        assert.equal(result.ok, false);
      }
    });

    it("blocks actions not wired for the domain", () => {
      const result = validateServerBulkAction("insurers", "archive");
      assert.ok(result);
      assert.equal(result.ok, false);
    });

    it("allows implemented insurer bulk actions", () => {
      for (const actionId of [
        "markNeedsReview",
        "markVerified",
        "setPublishedTrue",
        "setPublishedFalse",
      ] as const) {
        assert.equal(
          validateServerBulkAction("insurers", actionId),
          null,
          actionId,
        );
      }
    });
  });

  describe("isBulkActionImplemented", () => {
    it("matches domain wiring matrix", () => {
      assert.equal(
        isBulkActionImplemented("insurers", "setPublishedTrue"),
        true,
      );
      assert.equal(
        isBulkActionImplemented("knowledgeArticles", "archive"),
        true,
      );
      assert.equal(
        isBulkActionImplemented("disclosureLinks", "setInternalOnlyTrue"),
        false,
      );
    });
  });

  describe("evaluateBulkActionEligibility (UI hint)", () => {
    it("denies non-admin roles", () => {
      const result = evaluateBulkActionEligibility(
        "insurers",
        "markNeedsReview",
        ROLE_VERIFIED_PLANNER,
        [sampleItem],
      );
      assert.equal(result.allowed, false);
    });

    it("denies publish without selection", () => {
      const result = evaluateBulkActionEligibility(
        "insurers",
        "setPublishedTrue",
        ROLE_CONTENT_ADMIN,
        [],
      );
      assert.equal(result.allowed, false);
      assert.match(result.reason ?? "", /선택/);
    });

    it("denies bulk publish when draft status is selected", () => {
      const result = evaluateBulkActionEligibility(
        "insurers",
        "setPublishedTrue",
        ROLE_SUPER_ADMIN,
        [{ ...sampleItem, status: "draft" }],
      );
      assert.equal(result.allowed, false);
    });

    it("allows content_admin manage action with selection", () => {
      const result = evaluateBulkActionEligibility(
        "claimDocuments",
        "markNeedsReview",
        ROLE_CONTENT_ADMIN,
        [sampleItem],
      );
      assert.equal(result.allowed, true);
    });
  });

  describe("parseBulkIds", () => {
    it("rejects non-array input", () => {
      const result = parseBulkIds("not-an-array");
      assert.deepEqual(result, bulkRunError("선택 항목 형식이 올바르지 않습니다."));
    });

    it("rejects empty selection", () => {
      const result = parseBulkIds([]);
      assert.deepEqual(result, bulkRunError("선택된 항목이 없습니다."));
    });

    it("rejects more than max ids", () => {
      const ids = Array.from(
        { length: BULK_ACTION_MAX_IDS + 1 },
        (_, i) => `fixture-${i}`,
      );
      const result = parseBulkIds(ids);
      assert.equal(typeof result === "object" && "ok" in result && result.ok, false);
      if (typeof result === "object" && "message" in result) {
        assert.match(result.message, /최대/);
      }
    });

    it("deduplicates and trims ids", () => {
      const result = parseBulkIds(["  a  ", "a", "b", "", 1]);
      assert.deepEqual(result, ["a", "b"]);
    });
  });

  describe("publish skip guards (verification entities)", () => {
    it("skips publish for draft verification status", () => {
      assert.equal(
        shouldSkipPublish({
          id: "x",
          verificationStatus: VerificationStatus.draft,
          isPublished: false,
        }),
        true,
      );
    });

    it("skips verified transition from draft", () => {
      assert.equal(
        shouldSkipVerified({
          id: "x",
          verificationStatus: VerificationStatus.draft,
          isPublished: false,
        }),
        true,
      );
    });
  });
});
