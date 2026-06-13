import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { insurerDirectoryEntries } from "@/lib/content/insurers";
import {
  DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES,
} from "@/lib/directory/public-directory-surface";
import { isUsableExternalHref, resolveSystemLinks } from "@/lib/directory/work-links";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-DIR-A directory primary system CTA and claim consolidation", () => {
  it("renders full-width system primary CTA before secondary actions", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");

    assert.match(desk, /insurerWorkbenchSystemPrimaryCta/);
    assert.match(desk, /resolveSystemLinks/);
    assert.match(desk, /전산 바로가기/);
    assert.doesNotMatch(desk, /insurerWorkbenchActionScrollRow/);
    assert.match(desk, /insurerWorkbenchSecondaryActionGrid/);

    const systemIdx = desk.indexOf("insurerWorkbenchSystemPrimaryCta");
    const claimIdx = desk.indexOf("청구·서류");
    assert.ok(systemIdx > 0 && claimIdx > systemIdx);
  });

  it("consolidates claim entry points into a single 청구·서류 panel", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    const card = read("components/directory/insurer-action-card.tsx");

    assert.match(desk, /InsurerQuickClaimActions/);
    assert.match(desk, /InsurerCardClaimDocumentsSection/);
    assert.match(desk, /hideToggle/);
    assert.doesNotMatch(card, /InsurerQuickClaimActions/);

    assert.doesNotMatch(card, /onOpenClaimDocuments/);
    assert.doesNotMatch(desk, />\s*청구\s*</);
    assert.doesNotMatch(desk, /PDF \{pdfCount\}/);
    assert.doesNotMatch(desk, />\s*서류\s*</);
  });

  it("keeps PDF download and open inside claim panel", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    const listItem = read("components/claim-documents/claim-form-list-item.tsx");

    assert.match(desk, /InsurerCardClaimDocumentsSection/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /바로 열기/);
  });

  it("matches resolveSystemLinks primary count to published registry", () => {
    const published = insurerDirectoryEntries.filter((i) => i.isPublished);
    let primaryCount = 0;
    for (const insurer of published) {
      if (resolveSystemLinks(insurer).primary) primaryCount += 1;
    }
    assert.equal(primaryCount, 37);
    assert.ok(
      published.filter((i) => isUsableExternalHref(i.systemUrl)).length <=
        primaryCount,
    );
  });

  it("does not expose forbidden internal phrases on directory surfaces", () => {
    const targets = [
      "components/directory/insurer-card-desk-actions.tsx",
      "components/directory/insurer-action-card.tsx",
      "components/directory/insurer-compact-workbench-row.tsx",
    ];

    for (const rel of targets) {
      const source = read(rel);
      for (const phrase of DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES) {
        assert.doesNotMatch(source, new RegExp(phrase));
      }
    }
  });

  it("uses mobile-friendly layout without horizontal scroll row", () => {
    const ui = read("lib/directory/insurer-workbench-ui.ts");
    assert.match(ui, /min-h-12 w-full/);
    assert.match(ui, /grid-cols-2/);
  });
});
