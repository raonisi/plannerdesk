import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";

import {
  authorizedThirdPartyAssets,
  countEnabledAuthorizedClaimPdfs,
  countEnabledAuthorizedLogos,
  findAuthorizedClaimPdf,
  findAuthorizedInsurerLogo,
  isAuthorizedPublicPath,
  isPathTraversalPublicPath,
  PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
  validateAuthorizedAsset,
  validateAuthorizedAssetManifest,
} from "@/lib/content/authorized-third-party-assets";
import {
  buildClaimLibraryItems,
  countClaimGuideDispositions,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { claimFormFiles } from "@/lib/content/claim-form-files";
import { insurerLogoSrc } from "@/lib/directory/insurer-logo";
import {
  importAuthorizedAssets,
  PDF_MAX_BYTES,
} from "@/lib/assets/import-authorized-assets-core";
import {
  buildClaimPdfDownloadFileName,
  resolveClaimFormPublicAssetView,
  resolveInsurerLogoPublicSrc,
} from "@/lib/public/public-asset-policy";
import { resolveVisiblePublicClaimLibrarySurface } from "@/lib/public/public-surface-resolvers";
import type { AuthorizedThirdPartyAsset } from "@/lib/content/authorized-third-party-assets";
import type { PublicInsurer } from "@/lib/public/insurers";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-ASSET-02 authorized PDF and logo restore", () => {
  it("manifest validates without duplicate ids or paths", () => {
    assert.equal(validateAuthorizedAssetManifest().length, 0);
    assert.ok(countEnabledAuthorizedClaimPdfs() > 0);
    assert.equal(countEnabledAuthorizedLogos(), 44);
    assert.equal(
      authorizedThirdPartyAssets.every(
        (asset) => asset.permissionReference === PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
      ),
      true,
    );
  });

  it("blocks path traversal and missing permissionReference", () => {
    assert.equal(isPathTraversalPublicPath("../escape.pdf"), true);
    assert.equal(isAuthorizedPublicPath("/claim-forms/authorized/x/y.pdf"), true);
    assert.equal(isAuthorizedPublicPath("/claim-forms/bohumschool/x.pdf"), false);

    const sample = findAuthorizedClaimPdf(claimFormFiles[0]!.id);
    assert.ok(sample);
    const withoutPermission: AuthorizedThirdPartyAsset = {
      ...sample,
      permissionReference: "",
    };
    assert.equal(
      validateAuthorizedAsset(withoutPermission)?.reason,
      "permissionReference required",
    );
  });

  it("authorized claim PDF resolves to local download with official link", () => {
    const form = claimFormFiles[0]!;
    const view = resolveClaimFormPublicAssetView(
      form,
      "https://www.samsungfire.com/",
    );
    assert.equal(view?.kind, "approved_local_with_official");
    if (view?.kind === "approved_local_with_official") {
      assert.match(view.localHref, /^\/claim-forms\/authorized\//);
      assert.equal(view.localLabel, "PDF 다운로드");
      assert.match(view.downloadFileName, /\.pdf$/);
    }
  });

  it("import core validates pdf magic bytes and checksum", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pd-import-"));
    const asset: AuthorizedThirdPartyAsset = {
      assetId: "test-pdf",
      kind: "claim_pdf",
      insurerId: "sample",
      title: "테스트",
      sourceUrl: "https://example.com/a.pdf",
      sourceHost: "example.com",
      permissionStatus: "authorized",
      permissionReference: PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
      permissionScope: "download_and_redistribute",
      reviewedAt: "2026-06-22",
      publicPath: "/claim-forms/authorized/sample/test-pdf.pdf",
      enabled: true,
    };

    const bad = await importAuthorizedAssets({
      rootDir: dir,
      assets: [asset],
      fetchImpl: async () => Buffer.from("NOTPDF"),
      copyFromReview: false,
    });
    assert.equal(bad[0]?.status, "failed");
    assert.equal(bad[0]?.reason, "invalid_pdf");

    const goodBuffer = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(8)]);
    const good = await importAuthorizedAssets({
      rootDir: dir,
      assets: [asset],
      fetchImpl: async () => goodBuffer,
      copyFromReview: false,
    });
    assert.equal(good[0]?.status, "imported");
    assert.equal(
      existsSync(join(dir, "public/claim-forms/authorized/sample/test-pdf.pdf")),
      true,
    );

    const mismatch = await importAuthorizedAssets({
      rootDir: dir,
      assets: [{ ...asset, checksumSha256: "deadbeef" }],
      fetchImpl: async () => goodBuffer,
      copyFromReview: false,
    });
    assert.equal(mismatch[0]?.status, "failed");
    assert.equal(mismatch[0]?.reason, "checksum_mismatch");

    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects oversize pdf and invalid logo extension", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pd-size-"));
    const huge = Buffer.alloc(PDF_MAX_BYTES + 1, 0x25);
    huge.write("%PDF-", 0);

    const pdfResult = await importAuthorizedAssets({
      rootDir: dir,
      assets: [
        {
          assetId: "huge",
          kind: "claim_pdf",
          title: "huge",
          sourceUrl: "https://example.com/h.pdf",
          sourceHost: "example.com",
          permissionStatus: "authorized",
          permissionReference: PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
          permissionScope: "download_and_redistribute",
          reviewedAt: "2026-06-22",
          publicPath: "/claim-forms/authorized/x/huge.pdf",
          enabled: true,
        },
      ],
      fetchImpl: async () => huge,
      copyFromReview: false,
    });
    assert.equal(pdfResult[0]?.reason, "size_limit");

    const logoResult = await importAuthorizedAssets({
      rootDir: dir,
      assets: [
        {
          assetId: "logo-bad",
          kind: "insurer_logo",
          insurerId: "x",
          title: "logo",
          sourceUrl: "https://example.com/x.gif",
          sourceHost: "example.com",
          permissionStatus: "authorized",
          permissionReference: PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
          permissionScope: "download_and_redistribute",
          reviewedAt: "2026-06-22",
          publicPath: "/insurer-logos/authorized/x.gif",
          enabled: true,
        },
      ],
      fetchImpl: async () => Buffer.from("GIF"),
      copyFromReview: false,
    });
    assert.equal(logoResult[0]?.reason, "logo extension not allowed");
    rmSync(dir, { recursive: true, force: true });
  });

  it("public claim UI renders download and official CTAs from resolver", () => {
    const item = readSource("components/claim-documents/claim-form-list-item.tsx");
    assert.match(item, /approved_local_with_official/);
    assert.match(item, /download=\{view\.downloadFileName\}/);
    assert.match(item, /PUBLIC_CTA_PDF_DOWNLOAD|PDF 다운로드/);
    assert.doesNotMatch(item, /bohumschool/i);
  });

  it("authorized logos use internal public paths only", () => {
    const insurer = {
      id: "samsung-fire",
      name: "삼성화재",
      officialWebsiteUrl: "https://www.samsungfire.com/",
    } as PublicInsurer;
    const src = insurerLogoSrc(insurer);
    assert.equal(src, "/insurer-logos/authorized/samsung-fire.png");
    assert.equal(
      resolveInsurerLogoPublicSrc("samsung-fire"),
      "/insurer-logos/authorized/samsung-fire.png",
    );
    assert.equal(
      existsSync(join(ROOT, "public/insurer-logos/authorized/samsung-fire.png")),
      true,
    );
  });

  it("home and claim counts align with guide disposition SSOT", () => {
    const surface = resolveVisiblePublicClaimLibrarySurface({
      status: "ok",
      data: [],
    });
    const items = buildClaimLibraryItems(surface.guideDocuments, {});
    const counts = countClaimGuideDispositions(items);
    assert.equal(surface.libraryItemCount, counts.publicGuideCount);
    assert.equal(
      countPublicClaimLibraryItems(surface.guideDocuments, {}),
      counts.publicGuideCount,
    );
    assert.equal(counts.downloadablePdfCount, countEnabledAuthorizedClaimPdfs());
    assert.ok(counts.officialGuideLinkCount >= counts.downloadablePdfCount);
    assert.equal(counts.needsConfirmationCount, 0);
  });

  it("serves authorized PDFs from public path without bohumschool segment", () => {
    const sample = findAuthorizedClaimPdf(claimFormFiles[0]!.id)!;
    assert.match(sample.publicPath, /^\/claim-forms\/authorized\//);
    assert.doesNotMatch(sample.publicPath, /\/bohumschool\//);
    assert.equal(existsSync(join(ROOT, "public", sample.publicPath.replace(/^\//, ""))), true);
    assert.equal(existsSync(join(ROOT, "public/claim-forms/bohumschool")), false);
  });

  it("builds readable download filenames", () => {
    assert.equal(
      buildClaimPdfDownloadFileName('청구서/양식'),
      "청구서_양식.pdf",
    );
  });
});
