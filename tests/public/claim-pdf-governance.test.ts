import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import {
  CLAIM_PDF_CAUTION_TEXT,
  enrichStoredClaimPdfMetadata,
  isStoredClaimPdfPath,
  resolveOfficialSourceUrlForInsurerSlug,
} from "@/lib/claim-documents/claim-pdf-governance";
import { claimFormToLibraryItem } from "@/lib/claim-documents/library-items";
import {
  isLegacyThirdPartyAssetReference,
  PRIVATE_ASSET_REVIEW_PREFIX,
  resolveClaimFormPublicAssetView,
} from "@/lib/public/public-asset-policy";

const ROOT = process.cwd();

describe("PR-BS-20 claim PDF governance", () => {
  it("legacy catalog paths are blocked from public static serving", () => {
    assert.ok(claimFormFiles.length > 0);
    for (const form of claimFormFiles) {
      assert.equal(isLegacyThirdPartyAssetReference(form.href, form.sourceUrl), true);
      assert.equal(isStoredClaimPdfPath(form.href), false);
      assert.equal(existsSync(join(ROOT, "public", form.href.replace(/^\//, ""))), false);
    }
    assert.equal(
      existsSync(join(ROOT, PRIVATE_ASSET_REVIEW_PREFIX, "claim-forms")),
      true,
    );
  });

  it("enriches PDF metadata with governance fields", () => {
    const sample = claimFormFiles.find((form) =>
      form.insurerSlug === "samsung-fire",
    );
    assert.ok(sample);
    const meta = enrichStoredClaimPdfMetadata(sample);
    assert.equal(meta.fileType, "pdf");
    assert.equal(meta.sourceType, "stored_pdf");
    assert.equal(meta.documentTitle, sample.label);
    assert.equal(meta.fileName, sample.href.split("/").pop());
    assert.equal(meta.cautionText, CLAIM_PDF_CAUTION_TEXT);
    assert.equal(meta.reviewStatus, "verified");
    assert.ok(meta.officialSourceUrl?.startsWith("https://"));
  });

  it("maps samsung-fire slug to insurer official URL", () => {
    const url = resolveOfficialSourceUrlForInsurerSlug("samsung-fire");
    assert.equal(url, "https://www.samsungfire.com/v2/html/claim/01/C_010_030_001.html");
  });

  it("library item uses public asset resolver instead of local legacy href", () => {
    const sample = claimFormFiles[0]!;
    const item = claimFormToLibraryItem(sample);
    assert.ok(item);
    assert.equal(item.kind, "pdf");
    assert.ok(item.publicAssetView);
    assert.notEqual(item.href, sample.href);
    assert.equal(item.sourceType, "stored_pdf");
  });

  it("review copies remain under private-asset-review storage", () => {
    const sample = claimFormFiles.find((form) => form.insurerSlug === "samsung-fire");
    assert.ok(sample);
    const diskPath = join(ROOT, PRIVATE_ASSET_REVIEW_PREFIX, sample.href.replace(/^\//, ""));
    assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
  });

  it("claim list item exposes asset-policy actions", () => {
    const source = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(source, /renderPdfAssetActions/);
    assert.match(source, /publicAssetView/);
    assert.match(source, /PUBLIC_CTA_OFFICIAL_GUIDE_OPEN|PUBLIC_CTA_OFFICIAL_GUIDE_CHECK/);
    assert.doesNotMatch(source, /bohumschool/i);
  });

  it("claim explorer shows governance notice", () => {
    const source = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    assert.match(source, /CLAIM_PDF_(GOVERNANCE|ACCORDION)_NOTICE/);
  });

  it("public asset resolver returns official external or pending for legacy forms", () => {
    const sample = claimFormFiles[0]!;
    const official = resolveOfficialSourceUrlForInsurerSlug(sample.insurerSlug);
    const view = resolveClaimFormPublicAssetView(sample, official);
    assert.ok(view === null || view.kind === "official_external" || view.kind === "pending");
  });
});
