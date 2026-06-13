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
  CLAIM_INSURER_CARD_EMPTY_MESSAGE,
  CLAIM_INSURER_CARD_NOTICE,
} from "@/lib/claim-documents/claim-pdf-governance";

const ROOT = process.cwd();

describe("PR-BS-22 insurer card claim documents integration", () => {
  it("reuses claim library SSOT for insurer card mapping", () => {
    const items = buildClaimLibraryItems([]);
    const samsung = items.find(
      (item): item is Extract<typeof item, { kind: "pdf" }> =>
        item.kind === "pdf" && item.insurerSlug === "samsung-fire",
    );
    assert.ok(samsung);
    const mapped = getClaimItemsForInsurer(
      { id: "samsung-fire", name: "삼성화재" },
      items,
    );
    assert.ok(
      mapped.some((item) => item.kind === "pdf" && item.id === samsung.id),
    );
  });

  it("preserves PDF hrefs used by card and claim-documents page", () => {
    for (const form of claimFormFiles) {
      assert.match(form.href, /^\/claim-forms\/bohumschool\/.+\.pdf$/);
      const diskPath = join(ROOT, "public", form.href.replace(/^\//, ""));
      assert.equal(existsSync(diskPath), true, `missing ${diskPath}`);
    }
  });

  it("insurer card embeds claim documents inside the consolidated claim panel", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const desk = readFileSync(
      join(ROOT, "components/directory/insurer-card-desk-actions.tsx"),
      "utf8",
    );
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    assert.match(card, /InsurerCardDeskActions/);
    assert.match(card, /claimPanelOpen=\{claimDocumentsOpen\}/);
    assert.match(card, /onClaimPanelOpenChange=\{setClaimDocumentsOpen\}/);
    assert.match(desk, /InsurerCardClaimDocumentsSection/);
    assert.match(desk, /청구·서류/);
    assert.match(section, /aria-expanded=\{isOpen\}/);
    assert.match(section, /aria-controls=\{panelId\}/);
    assert.match(section, /청구 안내/);
    assert.match(section, /variant="card"/);
  });

  it("card section keeps PDF download and open actions", () => {
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );
    assert.match(section, /ClaimFormListItem/);
    assert.match(section, /variant="card"/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /download=\{item\.fileName\}/);
    assert.match(section, /CLAIM_INSURER_CARD_NOTICE/);
    assert.match(section, /CLAIM_INSURER_CARD_EMPTY_MESSAGE/);
    assert.equal(CLAIM_INSURER_CARD_NOTICE.length > 0, true);
    assert.equal(CLAIM_INSURER_CARD_EMPTY_MESSAGE.length > 0, true);
  });

  it("keeps standalone claim-documents route", () => {
    assert.equal(existsSync(join(ROOT, "app/claim-documents/page.tsx")), true);
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    assert.match(card, /\/claim-documents\?insurer=/);
  });

  it("directory explorer passes claim items into workbench rows", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    assert.match(explorer, /getClaimItemsForInsurer/);
    assert.match(explorer, /InsurerCompactWorkbenchRow/);
    assert.match(explorer, /claimItems=\{getClaimItemsForInsurer/);
  });
});
