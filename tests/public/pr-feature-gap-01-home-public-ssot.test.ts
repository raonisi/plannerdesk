import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { claimFormFiles } from "@/lib/content/claim-form-files";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import {
  buildHomePublicStats,
  resolveHomeLoadState,
} from "@/lib/dashboard/home-data-state";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { countPublicWorkTools, isWorkToolIdPublicVisible } from "@/lib/work-tools/work-tools-registry";
import { WORK_TOOL_CATALOG_IDS } from "@/lib/work-tools/work-tool-catalog";

const ROOT = process.cwd();

describe("PR-FEATURE-GAP-01 home public SSOT", () => {
  it("uses claim fallback when db returns empty — same as /claim-documents guides", () => {
    const surface = resolveVisiblePublicClaimDocuments({ status: "ok", data: [] });
    assert.equal(surface.surfaceStatus, "ok");
    assert.equal(surface.items.length, claimDocumentCandidateFallback.length);
    assert.ok(surface.items.length > 0);
  });

  it("home claim library count matches buildClaimLibraryItems — current public policy", () => {
    const claimResult = { status: "ok" as const, data: [] };
    const overlay = {};
    const homeSurface = resolveVisiblePublicClaimLibrarySurface(
      claimResult,
      overlay,
    );
    const pageItems = buildClaimLibraryItems(
      homeSurface.guideDocuments,
      overlay,
    );
    assert.equal(homeSurface.libraryItemCount, pageItems.length);
    assert.equal(
      homeSurface.libraryItemCount,
      countPublicClaimLibraryItems(homeSurface.guideDocuments, overlay),
    );
    assert.ok(homeSurface.libraryItemCount > claimDocumentCandidateFallback.length);
  });

  it("includes insurer PDF and guide items in public claim library count", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const items = buildClaimLibraryItems(guides, {});
    const pdfCount = items.filter((item) => item.kind === "pdf").length;
    const guideCount = items.filter((item) => item.kind === "guide").length;
    assert.equal(pdfCount, claimFormFiles.length);
    assert.equal(guideCount, guides.length);
    assert.equal(items.length, pdfCount + guideCount);
  });

  it("hides PDF items when governance overlay marks isVisible false", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const baseline = buildClaimLibraryItems(guides, {});
    const firstPdf = baseline.find((item) => item.kind === "pdf");
    assert.ok(firstPdf);
    const documentKey = firstPdf.governanceDocumentKey;
    const overlay = {
      [documentKey]: { isVisible: false, isDownloadEnabled: true },
    };
    const withHidden = buildClaimLibraryItems(guides, overlay);
    assert.equal(withHidden.length, baseline.length - 1);
    assert.equal(
      resolveVisiblePublicClaimLibrarySurface(
        { status: "ok", data: [] },
        overlay,
      ).libraryItemCount,
      withHidden.length,
    );
  });

  it("home page wires claim library surface and governance overlay", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /resolveVisiblePublicClaimLibrarySurface/);
    assert.match(page, /safeGetPublicClaimPdfGovernanceOverlay/);
    assert.match(page, /libraryItemCount/);
    assert.match(page, /resolveVisiblePublicDisclosureLinks/);
    assert.match(page, /resolveVisiblePublicWorkTools/);
  });

  it("claim and directory pages share claim guide surface resolver", () => {
    for (const rel of ["app/claim-documents/page.tsx", "app/directory/page.tsx"]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.match(src, /resolveVisiblePublicClaimDocuments/, rel);
    }
  });

  it("work tools count matches registry-visible catalog ids", () => {
    const count = countPublicWorkTools();
    const publicCatalogCount = WORK_TOOL_CATALOG_IDS.filter((id) =>
      isWorkToolIdPublicVisible(id),
    ).length;
    assert.ok(count > 0);
    assert.equal(count, publicCatalogCount);
  });

  it("buildHomePublicStats uses library item count not guide-only count", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const libraryCount = countPublicClaimLibraryItems(guides, {});
    assert.ok(libraryCount > guides.length);

    const stats = buildHomePublicStats({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 10,
      claimDocumentCount: libraryCount,
      disclosureLinkCount: 5,
      messageTemplateCount: 3,
      workToolCount: 50,
      knowledgeArticleCount: 2,
    });
    assert.equal(stats.claimDocuments.kind, "count");
    if (stats.claimDocuments.kind === "count") {
      assert.equal(stats.claimDocuments.value, libraryCount);
      assert.notEqual(stats.claimDocuments.value, guides.length);
    }
  });

  it("stats strip shows six domain labels in responsive grid", () => {
    const strip = readFileSync(
      join(ROOT, "components/dashboard/home-public-stats-strip.tsx"),
      "utf8",
    );
    assert.match(strip, /공시·약관/);
    assert.match(strip, /고객 문구/);
    assert.match(strip, /업무 도구/);
    assert.match(strip, /grid-cols-2/);
    assert.match(strip, /sm:grid-cols-3/);
  });

  it("empty load state considers all domain counts", () => {
    const state = resolveHomeLoadState({
      fetch: {
        insurers: "ok",
        claimDocuments: "ok",
        disclosureLinks: "ok",
        messageTemplates: "ok",
        workTools: "ok",
        knowledge: "ok",
      },
      insurerCount: 0,
      claimDocumentCount: 0,
      disclosureLinkCount: 0,
      messageTemplateCount: 0,
      workToolCount: 0,
      knowledgeArticleCount: 0,
    });
    assert.equal(state, "empty");
  });
});
