import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { MAIN_CONTENT_ID } from "@/components/skip-to-content";

const ROOT = process.cwd();

const PUBLIC_PAGES_USING_APP_SHELL = [
  "app/page.tsx",
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/work-tools/page.tsx",
  "app/message-templates/page.tsx",
  "app/knowledge/page.tsx",
  "app/knowledge/[slug]/page.tsx",
  "app/search/page.tsx",
] as const;

const PUBLIC_PAGES_WITH_MANUAL_MAIN = [] as const;

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function countMatches(source: string, pattern: RegExp): number {
  return (source.match(pattern) ?? []).length;
}

describe("PR-UX-11 accessibility basics", () => {
  it("skip link component exposes Korean label and main-content target", () => {
    const skip = readSource("components/skip-to-content.tsx");
    assert.match(skip, /본문으로 바로가기/);
    assert.match(skip, /MAIN_CONTENT_ID/);
    assert.match(skip, /href=\{`#\$\{MAIN_CONTENT_ID\}`\}/);
    assert.equal(MAIN_CONTENT_ID, "main-content");
  });

  it("global skip link styles appear on keyboard focus", () => {
    const css = readSource("app/globals.css");
    assert.match(css, /\.skip-to-content/);
    assert.match(css, /\.skip-to-content:focus(?:-visible)?/);
  });

  it("AppShell renders skip link and a single main landmark", () => {
    const shell = readSource("components/app-shell.tsx");
    assert.match(shell, /SkipToContent/);
    assert.match(shell, /\{\.\.\.publicMainLandmarkProps\}/);
    assert.equal(countMatches(shell, /<main/g), 1);
  });

  it("public AppShell pages do not declare duplicate main-content ids", () => {
    for (const file of PUBLIC_PAGES_USING_APP_SHELL) {
      const source = readSource(file);
      assert.match(source, /AppShell/);
      assert.equal(
        countMatches(source, /id="main-content"/g),
        0,
        `${file} should rely on AppShell for main landmark`,
      );
    }
  });

  it("public pages outside AppShell declare exactly one main landmark", () => {
    for (const file of PUBLIC_PAGES_WITH_MANUAL_MAIN) {
      const source = readSource(file);
      assert.match(source, /SkipToContent/);
      assert.match(source, /\{\.\.\.publicMainLandmarkProps\}/);
      assert.equal(
        countMatches(source, /<main/g),
        1,
        `${file} should expose one main landmark`,
      );
    }
  });

  it("mobile nav menu button keeps aria-expanded and aria-controls", () => {
    const drawer = readSource("components/navigation/mobile-nav-drawer.tsx");
    assert.match(drawer, /aria-expanded=\{open\}/);
    assert.match(drawer, /aria-controls=\{DRAWER_ID\}/);
    assert.match(drawer, /aria-label=\{uiLabels\.mobileMenuOpen\}/);
    assert.match(drawer, /aria-label=\{uiLabels\.mobileMenuClose\}/);
  });

  it("claim accordion exposes aria-expanded aligned with panel state", () => {
    const group = readSource("app/claim-documents/insurer-claim-group.tsx");
    assert.match(group, /aria-expanded=\{isExpanded\}/);
    assert.match(group, /aria-controls=\{panelId\}/);
  });

  it("icon favorite button and copy buttons expose meaningful accessible names", () => {
    const favorite = readSource("components/launcher/favorite-button.tsx");
    const claimItem = readSource(
      "components/claim-documents/claim-form-list-item.tsx",
    );
    const messageLibrary = readSource(
      "app/message-templates/message-template-library.tsx",
    );

    assert.match(favorite, /aria-label=\{active \? `\$\{label\} 즐겨찾기 해제` : `\$\{label\} 즐겨찾기 추가`\}/);
    assert.match(claimItem, /PUBLIC_CTA_COPY_CLAIM_GUIDE/);
    assert.match(claimItem, /aria-label=\{`\$\{title\} \$\{PUBLIC_CTA_PDF_LINK_COPY\}`\}/);
    assert.match(messageLibrary, /ariaLabel=\{`\$\{template\.title\} \$\{PUBLIC_CTA_COPY_SAFE\}`\}/);
  });

  it("preserves home public SSOT count wiring", () => {
    const home = readSource("app/page.tsx");
    assert.match(home, /buildHomePublicStats/);
    assert.match(home, /resolveVisiblePublicClaimLibrarySurface/);
    assert.match(home, /libraryItemCount/);
  });

  it("preserves public claim library 220-item count policy", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const overlay = {};
    const items = buildClaimLibraryItems(guides, overlay);
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      overlay,
    );

    assert.equal(items.length, 220);
    assert.equal(surface.libraryItemCount, 220);
    assert.equal(countPublicClaimLibraryItems(guides, overlay), 220);
  });
});
