import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { insurerDirectoryEntries } from "@/lib/content/insurers";
import { DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES } from "@/lib/directory/public-directory-surface";
import { resolveSystemLinks } from "@/lib/directory/work-links";
import {
  assertNoForbiddenPublicCopy,
  stripPublicCopyScanNoise,
} from "@/lib/public/public-copy-guard";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-DIR-B mobile primary system CTA enhancement", () => {
  it("renders a dedicated mobile system portal CTA above secondary actions", () => {
    const cta = read("components/directory/insurer-system-portal-primary-cta.tsx");
    const card = read("components/directory/insurer-action-card.tsx");
    const row = read("components/directory/insurer-compact-workbench-row.tsx");

    assert.match(cta, /resolveSystemLinks/);
    assert.match(cta, /전산 바로가기/);
    assert.match(cta, /ExternalTabAnchor/);
    assert.match(card, /InsurerSystemPortalPrimaryCta/);
    assert.match(card, /lg:hidden/);
    assert.match(card, /hideSystemPortalCta/);
    assert.match(row, /InsurerSystemPortalPrimaryCta/);
    assert.match(row, /lg:hidden/);
  });

  it("keeps mobile system CTA before 청구·서류 in DOM order", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    const ctaIdx = desk.indexOf("InsurerSystemPortalPrimaryCta");
    const claimIdx = desk.indexOf("청구·서류");
    assert.ok(ctaIdx > 0 && claimIdx > ctaIdx);
  });

  it("uses full-width mobile primary styling with 48px touch target", () => {
    const ui = read("lib/directory/insurer-workbench-ui.ts");
    assert.match(ui, /min-h-12 w-full/);
    assert.match(ui, /max-lg:min-h-12/);
    assert.match(ui, /justify-between/);
  });

  it("uses a 2-column secondary grid until lg without horizontal scroll", () => {
    const ui = read("lib/directory/insurer-workbench-ui.ts");
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    assert.match(ui, /grid-cols-2 gap-2 lg:grid-cols-4/);
    assert.doesNotMatch(desk, /overflow-x-auto/);
    assert.doesNotMatch(desk, /insurerWorkbenchActionScrollRow/);
  });

  it("does not render a system portal anchor when primary href is missing", () => {
    const cta = read("components/directory/insurer-system-portal-primary-cta.tsx");
    assert.match(cta, /systemLinks\.primary/);
    assert.match(cta, /DIRECTORY_SYSTEM_PORTAL_UNAVAILABLE_LABEL/);
    assert.match(cta, /aria-disabled="true"/);
    assert.doesNotMatch(cta, /href=\{systemLinks\.primary\}[\s\S]*?: null/);
    assert.doesNotMatch(
      cta,
      /<ExternalTabAnchor[\s\S]*?systemLinks\.primary === null/,
    );
  });

  it("matches resolveSystemLinks primary count to published registry", () => {
    const published = insurerDirectoryEntries.filter((i) => i.isPublished);
    let primaryCount = 0;
    for (const insurer of published) {
      if (resolveSystemLinks(insurer).primary) primaryCount += 1;
    }
    assert.equal(primaryCount, 37);
  });

  it("keeps PDF download and open inside claim panel", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    const listItem = read("components/claim-documents/claim-form-list-item.tsx");
    assert.match(desk, /InsurerCardClaimDocumentsSection/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /바로 열기/);
  });

  it("does not expose forbidden copy on directory mobile CTA surfaces", () => {
    const targets = [
      "components/directory/insurer-system-portal-primary-cta.tsx",
      "components/directory/insurer-card-desk-actions.tsx",
      "components/directory/insurer-action-card.tsx",
      "components/directory/insurer-compact-workbench-row.tsx",
    ];
    for (const rel of targets) {
      const source = stripPublicCopyScanNoise(read(rel));
      assertNoForbiddenPublicCopy(source, rel);
      for (const phrase of DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES) {
        assert.doesNotMatch(source, new RegExp(phrase));
      }
    }
  });

  it("does not duplicate default-fold claim or PDF buttons", () => {
    const desk = read("components/directory/insurer-card-desk-actions.tsx");
    assert.doesNotMatch(desk, />\s*PDF\s*</);
    assert.doesNotMatch(desk, />\s*서류\s*</);
    assert.doesNotMatch(desk, />\s*청구\s*</);
    assert.match(desk, /청구·서류/);
  });

  it("regression: claim-documents and admin save wiring remain intact", () => {
    const claimItem = read("components/claim-documents/claim-form-list-item.tsx");
    const governance = read(
      "components/admin/claim-documents/claim-document-governance-detail.tsx",
    );
    assert.match(claimItem, /PDF 다운로드/);
    assert.match(claimItem, /PDF 바로 열기/);
    assert.match(governance, /저장/);
  });
});
