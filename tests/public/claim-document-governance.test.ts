import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import { DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS } from "@/lib/claim-documents/governance-defaults";
import {
  buildClaimDocumentGovernanceList,
  computeClaimDocumentGovernanceSummary,
  filterClaimDocumentsForPublicUser,
  isClaimDocumentDownloadEnabled,
  mergeClaimFormWithGovernance,
} from "@/lib/claim-documents/governance-helpers";
import { CLAIM_DOCUMENT_GOVERNANCE_REGISTRY } from "@/lib/claim-documents/governance-registry";

const ROOT = process.cwd();

describe("PR-BS-25 claim document governance helpers", () => {
  it("merges PDF SSOT with unknown governance when registry entry is missing", () => {
    const sample = claimFormFiles[0];
    const merged = mergeClaimFormWithGovernance(sample);

    assert.equal(merged.href, sample.href);
    assert.equal(merged.governance.filePath, sample.href);
    assert.equal(merged.governance.reviewStatus, DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS);
    assert.equal(merged.governance.isVisible, true);
    assert.equal(merged.governance.isDownloadEnabled, true);
    assert.equal(merged.governance.lastVerifiedAt, undefined);
  });

  it("does not bulk-mark all PDFs as verified", () => {
    const items = buildClaimDocumentGovernanceList();
    assert.ok(items.length > 0);
    assert.equal(
      items.every((item) => item.governance.reviewStatus === "verified"),
      false,
    );
  });

  it("computes summary from registry-backed metadata without inflating verified counts", () => {
    const items = buildClaimDocumentGovernanceList();
    const summary = computeClaimDocumentGovernanceSummary(items);

    assert.equal(summary.total, claimFormFiles.length);
    assert.equal(summary.missingLastVerified, items.length);
    assert.ok(summary.missingOfficialUrl >= 0);
    assert.ok(summary.missingOfficialUrl <= items.length);
    assert.ok(summary.needsReview >= 0);
  });

  it("keeps public helper defaults visible and downloadable", () => {
    const items = buildClaimDocumentGovernanceList();
    const publicItems = filterClaimDocumentsForPublicUser(items);

    assert.equal(publicItems.length, items.length);
    assert.equal(
      publicItems.every((item) => isClaimDocumentDownloadEnabled(item.governance)),
      true,
    );
  });

  it("legacy PDF catalog remains in private review storage only", () => {
    for (const form of claimFormFiles) {
      const merged = mergeClaimFormWithGovernance(form);
      assert.equal(merged.href, form.href);
      assert.match(form.href, /^\/claim-forms\/bohumschool\/.+\.pdf$/);
      const diskPath = join(ROOT, "private-asset-review", form.href.replace(/^\//, ""));
      assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
    }
  });

  it("starts with an empty explicit governance registry", () => {
    assert.equal(Array.isArray(CLAIM_DOCUMENT_GOVERNANCE_REGISTRY), true);
    assert.equal(CLAIM_DOCUMENT_GOVERNANCE_REGISTRY.length, 0);
  });
});
