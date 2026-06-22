import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import {
  HOME_FAVORITES_EMPTY_TITLE,
  HOME_RECENTS_EMPTY_TITLE,
} from "@/lib/planner-favorites/copy";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicClaimLibrarySurface,
} from "@/lib/public/public-surface-resolvers";
import { MAIN_CONTENT_ID } from "@/components/skip-to-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-UX-13 empty state standardization", () => {
  it("shared EmptyState renders title, description, heading, and optional actions", () => {
    const component = readSource("components/public/empty-state.tsx");
    assert.match(component, /export function EmptyState/);
    assert.match(component, /<h3/);
    assert.match(component, /role=\{role\}/);
    assert.match(component, /min-h-11/);
    assert.match(component, /buttons\.base/);
    assert.match(component, /aria-label/);
  });

  it("content-page re-exports EmptyState without duplicating markup", () => {
    const page = readSource("components/content-page.tsx");
    assert.match(page, /from "@\/components\/public\/empty-state"/);
    assert.doesNotMatch(page, /border-dashed border-\[#E3DED4\].*p-8/);
  });

  it("empty-state-panel composes compact EmptyState with link actions", () => {
    const panel = readSource("components/launcher/empty-state-panel.tsx");
    assert.match(panel, /variant="compact"/);
    assert.match(panel, /EmptyState/);
  });

  it("directory search empty uses reset CTA and distinct copy", () => {
    const explorer = readSource("app/directory/directory-explorer.tsx");
    assert.match(explorer, /DIRECTORY_SEARCH_EMPTY_TITLE/);
    assert.match(explorer, /DIRECTORY_SEARCH_EMPTY_DESCRIPTION/);
    assert.match(explorer, /resetDirectoryFilters/);
    assert.match(explorer, /EMPTY_STATE_RESET_FILTERS_LABEL/);
    assert.doesNotMatch(explorer, /불러오지 못했습니다/);
  });

  it("claim documents filter empty uses search reset CTA", () => {
    const explorer = readSource("app/claim-documents/claim-document-explorer.tsx");
    assert.match(explorer, /CLAIM_SEARCH_EMPTY_TITLE/);
    assert.match(explorer, /CLAIM_SEARCH_EMPTY_DESCRIPTION/);
    assert.match(explorer, /resetFilters/);
    assert.match(explorer, /EMPTY_STATE_RESET_SEARCH_LABEL/);
    assert.match(readSource("components/claim-documents/claim-form-list-item.tsx"), /PUBLIC_CTA_PDF_OPEN/);
  });

  it("disclosure, work-tools, message-templates, and knowledge wire filter reset CTAs", () => {
    const disclosure = readSource("app/disclosure-links/disclosure-link-center.tsx");
    const workTools = readSource("app/work-tools/work-tools-client.tsx");
    const messages = readSource("app/message-templates/message-template-library.tsx");
    const knowledge = readSource("app/knowledge/knowledge-archive-list.tsx");

    assert.match(disclosure, /DISCLOSURE_SEARCH_EMPTY_TITLE/);
    assert.match(disclosure, /resetDisclosureFilters/);

    assert.match(workTools, /WORK_TOOLS_SEARCH_EMPTY_TITLE/);
    assert.match(workTools, /resetWorkToolFilters/);
    assert.match(workTools, /EMPTY_STATE_VIEW_ALL_TOOLS_LABEL/);

    assert.match(messages, /MESSAGE_TEMPLATE_SEARCH_EMPTY_TITLE/);
    assert.match(messages, /resetMessageFilters/);

    assert.match(knowledge, /KNOWLEDGE_SEARCH_EMPTY_TITLE/);
    assert.match(knowledge, /EMPTY_STATE_VIEW_ALL_KNOWLEDGE_LABEL/);
    assert.match(knowledge, /defaultKnowledgeArchiveFilterState/);
  });

  it("home recents and favorites use standardized empty copy", () => {
    const home = readSource("app/home-client.tsx");
    const panel = readSource("components/dashboard/planner-work-favorites-panel.tsx");
    assert.match(home, /HOME_RECENTS_EMPTY_TITLE/);
    assert.match(home, /EmptyStatePanel/);
    assert.match(panel, /HOME_FAVORITES_EMPTY_TITLE/);
    assert.match(panel, /EmptyStatePanel/);
    assert.equal(HOME_RECENTS_EMPTY_TITLE, "아직 최근 사용한 업무가 없습니다.");
    assert.equal(HOME_FAVORITES_EMPTY_TITLE, "즐겨찾기한 업무가 없습니다.");
  });

  it("error and catalog-empty pages keep distinct titles from search-empty", () => {
    const directoryPage = readSource("app/directory/page.tsx");
    const claimPage = readSource("app/claim-documents/page.tsx");
    assert.match(directoryPage, /errorTitle/);
    assert.match(directoryPage, /emptyTitle/);
    assert.match(claimPage, /불러오지 못했습니다/);
    assert.match(claimPage, /공개된 청구서류 안내가 아직 없습니다/);
  });

  it("empty-state copy module defines search-no-results titles", () => {
    const copy = readSource("lib/public/empty-state-copy.ts");
    assert.match(copy, /DIRECTORY_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /CLAIM_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /DISCLOSURE_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /WORK_TOOLS_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /MESSAGE_TEMPLATE_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /KNOWLEDGE_SEARCH_EMPTY_TITLE/);
    assert.match(copy, /EMPTY_STATE_RESET_FILTERS_LABEL/);
  });

  it("preserves claim 220 count, skip link, and copy UX regressions", () => {
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

    const messages = readSource("app/message-templates/message-template-library.tsx");
    assert.match(messages, /CopyActionButton/);
    assert.match(messages, /safeCopy/);
    assert.doesNotMatch(
      readSource("lib/planner-favorites/recent-work.ts"),
      /empty-state-copy/,
    );
  });
});
