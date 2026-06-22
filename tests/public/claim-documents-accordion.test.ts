import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claimFormFiles } from "@/lib/content/claim-form-files";
import {
  buildClaimLibraryItems,
  filterClaimLibraryItems,
  groupFilteredClaimItems,
  groupMatchesInsurerFilterKey,
} from "@/lib/claim-documents/claim-library";
import {
  resolveInsurerMarketSegmentForItem,
} from "@/lib/claim-documents/insurer-category";
import { groupClaimItemsByInsurer } from "@/lib/claim-documents/group-by-insurer";

const ROOT = process.cwd();

describe("PR-BS-21 claim documents accordion UX", () => {
  it("groups claim items by insurer without duplicating entries", () => {
    const items = buildClaimLibraryItems([]);
    const groups = groupClaimItemsByInsurer(items);
    const groupedCount = groups.reduce((sum, group) => sum + group.items.length, 0);
    assert.equal(groupedCount, items.length);
    assert.ok(groups.length > 0);
    for (const group of groups) {
      assert.ok(group.label.length > 0);
      assert.ok(group.items.length > 0);
      assert.ok(["life", "non_life", "other"].includes(group.marketSegment));
    }
  });

  it("filters by insurer market segment", () => {
    const items = buildClaimLibraryItems([]);
    const lifeItems = filterClaimLibraryItems(items, {
      query: "",
      category: "all",
      status: "all",
      documentNature: "all",
      selectedInsurerKey: "all",
      marketSegment: "life",
    });
    assert.ok(lifeItems.length > 0);
    for (const item of lifeItems) {
      assert.equal(resolveInsurerMarketSegmentForItem(item), "life");
    }
  });

  it("matches insurer filter keys for accordion auto-expand", () => {
    const items = buildClaimLibraryItems([]);
    const samsung = items.find(
      (item) => item.kind === "pdf" && item.insurerSlug === "samsung-fire",
    );
    assert.ok(samsung);
    const groups = groupFilteredClaimItems([samsung]);
    assert.equal(groups.length, 1);
    assert.equal(
      groupMatchesInsurerFilterKey(groups[0], "samsung-fire"),
      true,
    );
  });

  it("preserves stored PDF hrefs (no path changes)", () => {
    for (const form of claimFormFiles) {
      assert.match(form.href, /^\/claim-forms\/bohumschool\/.+\.pdf$/);
      const diskPath = join(ROOT, "public", form.href.replace(/^\//, ""));
      assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
    }
  });

  it("accordion group exposes accessibility attributes", () => {
    const source = readFileSync(
      join(ROOT, "app/claim-documents/insurer-claim-group.tsx"),
      "utf8",
    );
    assert.match(source, /aria-expanded=\{isExpanded\}/);
    assert.match(source, /aria-controls=\{panelId\}/);
    assert.match(source, /role="region"/);
    assert.match(source, /variant="accordion"/);
  });

  it("accordion list item keeps PDF download and open actions", () => {
    const source = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(source, /PDF 다운로드/);
    assert.match(source, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(source, /download=\{item\.fileName\}/);
    assert.match(source, /PUBLIC_CTA_OFFICIAL_GUIDE_CHECK/);
  });

  it("explorer shows accordion notice and empty search copy", () => {
    const explorer = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    assert.match(explorer, /CLAIM_PDF_ACCORDION_NOTICE/);
    assert.match(explorer, /CLAIM_SEARCH_EMPTY_DESCRIPTION/);
    assert.match(explorer, /EMPTY_STATE_RESET_SEARCH_LABEL/);
  });

  it("filters expose life and non-life segment options", () => {
    const filters = readFileSync(
      join(ROOT, "app/claim-documents/claim-forms-filters.tsx"),
      "utf8",
    );
    const segments = readFileSync(
      join(ROOT, "lib/claim-documents/insurer-category.ts"),
      "utf8",
    );
    assert.match(filters, /INSURER_MARKET_SEGMENT_OPTIONS/);
    assert.match(segments, /생명보험/);
    assert.match(segments, /손해보험/);
    assert.match(segments, /기타/);
    assert.doesNotMatch(filters, /VerificationStatus\.draft/);
  });
});
