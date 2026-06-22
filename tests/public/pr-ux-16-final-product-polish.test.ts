import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import {
  PUBLIC_CTA_COPY_CLAIM_GUIDE,
  PUBLIC_CTA_COPY_SAFE,
  PUBLIC_CTA_COPYING_LABEL,
  PUBLIC_CTA_FILTER_RESET,
  PUBLIC_CTA_OFFICIAL_SOURCE_OPEN,
  PUBLIC_CTA_PDF_OPEN,
} from "@/lib/public/public-cta-labels";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { countPublicWorkTools } from "@/lib/work-tools/work-tools-registry";
import { MAIN_CONTENT_ID } from "@/components/skip-to-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-UX-16 final product polish", () => {
  it("public CTA labels module defines shared action copy", () => {
    const labels = readSource("lib/public/public-cta-labels.ts");
    assert.match(labels, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(labels, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.match(labels, /PUBLIC_CTA_COPY_SAFE/);
    assert.match(labels, /PUBLIC_CTA_OFFICIAL_SOURCE_OPEN/);
    assert.equal(PUBLIC_CTA_PDF_OPEN, "PDF 바로 열기");
    assert.equal(PUBLIC_CTA_COPY_SAFE, "안전 문구 복사");
    assert.equal(PUBLIC_CTA_FILTER_RESET, "필터 초기화");
  });

  it("claim and disclosure surfaces import shared CTA labels", () => {
    const claimItem = readSource("components/claim-documents/claim-form-list-item.tsx");
    const disclosure = readSource("components/disclosure/disclosure-card.tsx");
    const group = readSource("app/claim-documents/insurer-claim-group.tsx");

    assert.match(claimItem, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(claimItem, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.doesNotMatch(claimItem, /PDF 열기/);
    assert.match(disclosure, /PUBLIC_CTA_OFFICIAL_SOURCE_OPEN/);
    assert.match(group, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.match(group, /PUBLIC_CTA_COPYING_LABEL/);
  });

  it("message templates and directory copy use unified labels", () => {
    const library = readSource("app/message-templates/message-template-library.tsx");
    const card = readSource("components/directory/insurer-action-card.tsx");
    assert.match(library, /PUBLIC_CTA_COPY_SAFE/);
    assert.match(library, /CopyActionButton/);
    assert.match(card, /PUBLIC_CTA_COPY_DIRECTORY/);
  });

  it("filter reset and copy button defaults use shared labels", () => {
    const filter = readSource("components/launcher/responsive-category-filter.tsx");
    const copyBtn = readSource("components/ui/copy-action-button.tsx");
    assert.match(filter, /PUBLIC_CTA_FILTER_RESET/);
    assert.match(filter, /aria-label/);
    assert.match(copyBtn, /PUBLIC_CTA_COPYING_LABEL/);
  });

  it("verified work link card avoids duplicate CTAs and uses min-h-11", () => {
    const card = readSource("components/work-links/VerifiedWorkLinkCard.tsx");
    assert.match(card, /showSourceLink/);
    assert.match(card, /PUBLIC_CTA_OFFICIAL_GUIDE_OPEN/);
    assert.match(card, /min-h-11/);
    assert.match(card, /<h3/);
  });

  it("card titles relax line-clamp on desktop", () => {
    const density = readSource("lib/mobile/card-density.ts");
    assert.match(density, /sm:line-clamp-none/);
  });

  it("empty state and accessibility regressions remain", () => {
    const empty = readSource("components/public/empty-state.tsx");
    assert.match(empty, /<h3/);
    assert.match(empty, /aria-label/);
    assert.match(readSource("components/skip-to-content.tsx"), /본문으로 바로가기/);
    assert.equal(MAIN_CONTENT_ID, "main-content");

    const toast = readSource("components/ui/copy-toast.tsx");
    assert.match(toast, /aria-live/);
  });

  it("preserves public count SSOT and safeCopy flow", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const overlay = {};
    assert.equal(buildClaimLibraryItems(guides, overlay).length, 220);
    assert.equal(
      resolveVisiblePublicClaimLibrarySurface({ status: "ok", data: [] }, overlay)
        .libraryItemCount,
      220,
    );
    assert.equal(countPublicClaimLibraryItems(guides, overlay), 220);
    assert.ok(countPublicWorkTools() > 0);

    const library = readSource("app/message-templates/message-template-library.tsx");
    assert.match(library, /applySafeCopyPlaceholders/);
    assert.match(library, /safeCopy/);
    assert.doesNotMatch(
      readSource("lib/planner-favorites/recent-work.ts"),
      /public-cta-labels/,
    );
  });
});
