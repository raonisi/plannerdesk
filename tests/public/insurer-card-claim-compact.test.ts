import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import {
  buildClaimLibraryItems,
  getClaimItemsForInsurer,
} from "@/lib/claim-documents/claim-library";
import {
  CLAIM_INSURER_CARD_COMPACT_NOTICE,
  CLAIM_INSURER_CARD_SEARCH_EMPTY_MESSAGE,
} from "@/lib/claim-documents/claim-pdf-governance";
import {
  filterInsurerCardClaimItems,
  INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT,
  INSURER_CARD_CLAIM_SEARCH_THRESHOLD,
  resolveInsurerCardVisibleClaimItems,
  shouldCompactInsurerCardClaimList,
  shouldShowInsurerCardClaimSearch,
} from "@/lib/directory/insurer-card-claim-compact";

const ROOT = process.cwd();

describe("PR-BS-24 insurer card claim documents compact mode", () => {
  it("shows all items when count is at or below the compact threshold", () => {
    const items = buildClaimLibraryItems([]);
    const smallInsurerItems = getClaimItemsForInsurer(
      { id: "kb-life", name: "KB손보" },
      items,
    );

    assert.ok(smallInsurerItems.length <= INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT);
    const resolved = resolveInsurerCardVisibleClaimItems(smallInsurerItems, {
      showAll: false,
      query: "",
    });
    assert.equal(resolved.isCompacted, false);
    assert.equal(resolved.visibleItems.length, smallInsurerItems.length);
  });

  it("shows only five items by default for long insurer lists", () => {
    const items = buildClaimLibraryItems([]);
    const samsungItems = getClaimItemsForInsurer(
      { id: "samsung-fire", name: "삼성화재" },
      items,
    );

    assert.ok(samsungItems.length > INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT);
    const compact = resolveInsurerCardVisibleClaimItems(samsungItems, {
      showAll: false,
      query: "",
    });
    assert.equal(compact.isCompacted, true);
    assert.equal(compact.visibleItems.length, INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT);
    assert.equal(compact.totalCount, samsungItems.length);

    const expanded = resolveInsurerCardVisibleClaimItems(samsungItems, {
      showAll: true,
      query: "",
    });
    assert.equal(expanded.isCompacted, false);
    assert.equal(expanded.visibleItems.length, samsungItems.length);
  });

  it("filters claim items by search query without changing order", () => {
    const items = buildClaimLibraryItems([]);
    const samsungItems = getClaimItemsForInsurer(
      { id: "samsung-fire", name: "삼성화재" },
      items,
    );
    const firstTitle =
      samsungItems[0]?.kind === "pdf" ? samsungItems[0].title : null;
    assert.ok(firstTitle);

    const filtered = filterInsurerCardClaimItems(samsungItems, firstTitle.slice(0, 4));
    assert.ok(filtered.length >= 1);
    assert.equal(filtered[0], samsungItems.find((item) => item === filtered[0]));
  });

  it("enables search only for insurers with many claim documents", () => {
    assert.equal(shouldCompactInsurerCardClaimList(5), false);
    assert.equal(shouldCompactInsurerCardClaimList(6), true);
    assert.equal(shouldShowInsurerCardClaimSearch(7), false);
    assert.equal(shouldShowInsurerCardClaimSearch(8), true);
  });

  it("preserves PDF download actions in card claim section UI", () => {
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.match(section, /showAllDocuments/);
    assert.match(section, /전체 \$\{totalCount\}개 보기/);
    assert.match(section, /간단히 보기/);
    assert.match(section, /aria-expanded=\{showAllDocuments\}/);
    assert.match(section, /CLAIM_INSURER_CARD_COMPACT_NOTICE/);
    assert.match(section, /CLAIM_INSURER_CARD_SEARCH_EMPTY_MESSAGE/);
    assert.match(section, /variant="card"/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /download=\{item\.fileName\}/);
    assert.match(listItem, /PUBLIC_CTA_PDF_OPEN/);
    assert.equal(CLAIM_INSURER_CARD_COMPACT_NOTICE.length > 0, true);
    assert.equal(CLAIM_INSURER_CARD_SEARCH_EMPTY_MESSAGE.length > 0, true);
  });

  it("preserves stored PDF assets and claim-documents route", () => {
    for (const form of claimFormFiles) {
      assert.match(form.href, /^\/claim-forms\/bohumschool\/.+\.pdf$/);
      const diskPath = join(ROOT, "public", form.href.replace(/^\//, ""));
      assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
    }
    assert.equal(existsSync(join(ROOT, "app/claim-documents/page.tsx")), true);
  });
});
