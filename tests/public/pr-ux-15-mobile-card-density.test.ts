import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { buildHomePublicStats } from "@/lib/dashboard/home-data-state";
import {
  mobileCardActions,
  mobileCardActionsTight,
  mobileCardBadgeRow,
  mobileCardDescription,
  mobileCardShell,
  mobileCardTitle,
  mobileCardTouchTarget,
} from "@/lib/mobile/card-density";
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

describe("PR-UX-15 mobile card density", () => {
  it("card-density tokens prevent overflow and support wrap-friendly CTAs", () => {
    assert.match(mobileCardShell, /min-w-0/);
    assert.match(mobileCardShell, /overflow-hidden/);
    assert.match(mobileCardTitle, /line-clamp-2/);
    assert.match(mobileCardTitle, /break-words/);
    assert.match(mobileCardDescription, /line-clamp-2/);
    assert.match(mobileCardBadgeRow, /flex-wrap/);
    assert.match(mobileCardActions, /flex-col/);
    assert.match(mobileCardActions, /flex-wrap/);
    assert.match(mobileCardActionsTight, /flex-col/);
    assert.match(mobileCardTouchTarget, /min-h-11/);
  });

  it("field-usability re-exports card-density without duplicating tokens", () => {
    const field = readSource("lib/mobile/field-usability.ts");
    assert.match(field, /from "\.\/card-density"/);
    assert.match(field, /mobileCardShell/);
    assert.doesNotMatch(field, /export const mobileCardShell/);
  });

  it("insurer card shell uses mobile overflow guard and clamped names", () => {
    const ui = readSource("lib/directory/insurer-card-ui.ts");
    assert.match(ui, /min-w-0 max-w-full overflow-hidden/);
    assert.match(ui, /line-clamp-2 break-words/);
    assert.match(ui, /min-h-\[44px\]/);
  });

  it("home surfaces apply mobile card tokens for search, stats, and recents", () => {
    const home = readSource("app/home-client.tsx");
    const stats = readSource("components/dashboard/home-public-stats-strip.tsx");
    const tile = readSource("components/launcher/home-compact-work-tile.tsx");
    const favorites = readSource(
      "components/dashboard/planner-work-favorites-panel.tsx",
    );

    assert.match(home, /mobileCardTitleSm/);
    assert.match(home, /mobileCardDescription/);
    assert.match(home, /mobileCardShell/);
    assert.match(home, /line-clamp-2 min-w-0 flex-1 break-keep font-medium/);
    assert.match(stats, /mobileCardShell/);
    assert.match(stats, /mobileCardTabular/);
    assert.match(tile, /mobileCardShell/);
    assert.match(tile, /mobileCardTitleSm/);
    assert.match(favorites, /mobileCardPadding/);
    assert.match(favorites, /line-clamp-2 break-keep/);
    assert.match(favorites, /min-h-11 min-w-11/);
  });

  it("directory and disclosure cards keep title-first hierarchy with wrapping badges", () => {
    const disclosure = readSource("components/disclosure/disclosure-card.tsx");
    assert.match(disclosure, /mobileCardTitle/);
    assert.match(disclosure, /mobileCardBadgeRow/);
    assert.match(disclosure, /mobileCardActions/);
    assert.match(disclosure, /mobileCardActionsTight/);
    assert.match(disclosure, /buttons\.base/);
  });

  it("claim documents group and list items use mobile card actions and titles", () => {
    const group = readSource("app/claim-documents/insurer-claim-group.tsx");
    const item = readSource("components/claim-documents/claim-form-list-item.tsx");

    assert.match(group, /mobileCardTitle/);
    assert.match(group, /mobileCardActionsTight/);
    assert.match(group, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.match(item, /mobileCardShell/);
    assert.match(item, /mobileCardActionsTight/);
    assert.match(item, /mobileCardTitle/);
    assert.match(item, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.match(item, /PUBLIC_CTA_PDF_OPEN/);
  });

  it("work-tools and message-templates cards use shared density tokens", () => {
    const toolCard = readSource("components/launcher/tool-card.tsx");
    const accordion = readSource("components/launcher/tool-accordion-card.tsx");
    const library = readSource("app/message-templates/message-template-library.tsx");

    assert.match(toolCard, /mobileCardShell/);
    assert.match(toolCard, /mobileCardTitleSm/);
    assert.match(toolCard, /mobileCardBadgeRow/);
    assert.match(accordion, /mobileCardDescription/);
    assert.match(library, /mobileCardShell/);
    assert.match(library, /mobileCardBadgeRow/);
    assert.match(library, /PUBLIC_CTA_COPY_SAFE/);
    assert.match(library, /CopyActionButton/);
  });

  it("knowledge archive cards stack title, badges, and full-width mobile CTA", () => {
    const knowledge = readSource("app/knowledge/knowledge-archive-list.tsx");
    assert.match(knowledge, /mobileCardTitle/);
    assert.match(knowledge, /mobileCardBadgeRow/);
    assert.match(knowledge, /mobileCardActions/);
    assert.match(knowledge, /EmptyState/);
    assert.match(knowledge, /min-h-11/);
    assert.match(knowledge, /mobileFiltersOpen/);
  });

  it("preserves PR-UX-11 skip link, PR-UX-14 copy UX, and public count SSOT", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const overlay = {};
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      overlay,
    );

    assert.equal(buildClaimLibraryItems(guides, overlay).length, 220);
    assert.equal(surface.libraryItemCount, 220);
    assert.equal(countPublicClaimLibraryItems(guides, overlay), 220);
    assert.equal(MAIN_CONTENT_ID, "main-content");

    const workToolCount = countPublicWorkTools();
    assert.ok(workToolCount > 0);

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
      claimDocumentCount: 220,
      disclosureLinkCount: 5,
      messageTemplateCount: 3,
      workToolCount,
      knowledgeArticleCount: 10,
    });
    assert.equal(stats.claimDocuments.kind, "count");
    if (stats.claimDocuments.kind === "count") {
      assert.equal(stats.claimDocuments.value, 220);
    }
    assert.equal(stats.workTools.kind, "count");
    if (stats.workTools.kind === "count") {
      assert.equal(stats.workTools.value, workToolCount);
    }

    const copyButton = readSource("components/ui/copy-action-button.tsx");
    assert.match(copyButton, /buttons\.base/);
    assert.doesNotMatch(
      readSource("lib/planner-favorites/recent-work.ts"),
      /mobileCardShell/,
    );
  });
});
