import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-23 insurer card financial report UI polish", () => {
  it("uses premium financial report card shell and hierarchy", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const ui = readFileSync(
      join(ROOT, "lib/directory/insurer-card-ui.ts"),
      "utf8",
    );

    assert.match(card, /insurerCardShell/);
    assert.match(card, /InsurerCardContactStrip/);
    assert.match(card, /InsurerCardDeskActions/);
    assert.match(card, /sections=\{\["support"\]\}/);
    assert.match(card, /sections=\{\["official"\]\}/);
    assert.match(ui, /insurerCardPrimaryButton/);
    assert.match(ui, /insurerCardClaimToggle/);
  });

  it("preserves claim documents PDF actions with card variant", () => {
    const section = readFileSync(
      join(ROOT, "components/directory/insurer-card-claim-documents-section.tsx"),
      "utf8",
    );
    const listItem = readFileSync(
      join(ROOT, "components/claim-documents/claim-form-list-item.tsx"),
      "utf8",
    );

    assert.match(section, /variant="card"/);
    assert.match(section, /aria-expanded=\{isOpen\}/);
    assert.match(section, /aria-controls=\{panelId\}/);
    assert.match(listItem, /variant === "card"/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /download=\{item\.fileName\}/);
    assert.match(listItem, /PDF 바로 열기/);
    assert.match(listItem, /보험사 공식 안내 확인/);
  });

  it("keeps quick claim actions and standalone claim-documents route", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    assert.match(card, /InsurerQuickClaimActions/);
    assert.equal(existsSync(join(ROOT, "app/claim-documents/page.tsx")), true);
  });
});
