import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { insurerDirectoryEntries } from "@/lib/content/insurers";
import {
  DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES,
  DIRECTORY_PUBLIC_GLOBAL_NOTICE,
} from "@/lib/directory/public-directory-surface";
import { isUsableExternalHref, resolveSystemLinks } from "@/lib/directory/work-links";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-BS-31 directory card restore and status cleanup", () => {
  it("defaults directory explorer to card grid with InsurerActionCard", () => {
    const explorer = read("app/directory/directory-explorer.tsx");

    assert.match(explorer, /useState<ViewMode>\("grid"\)/);
    assert.match(explorer, /InsurerActionCard/);
    assert.match(explorer, /InsurerCompactWorkbenchRow/);
    assert.match(explorer, /viewMode === "list"/);
    assert.match(explorer, /DIRECTORY_PUBLIC_GLOBAL_NOTICE/);
  });

  it("hides internal status phrases from public directory card surfaces", () => {
    const actionCard = read("components/directory/insurer-action-card.tsx");
    const deskActions = read("components/directory/insurer-card-desk-actions.tsx");
    const systemCta = read("components/directory/insurer-system-portal-primary-cta.tsx");
    const compactRow = read("components/directory/insurer-compact-workbench-row.tsx");
    const directoryPage = read("app/directory/page.tsx");

    for (const phrase of DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES) {
      assert.doesNotMatch(actionCard, new RegExp(phrase));
      assert.doesNotMatch(deskActions, new RegExp(phrase));
      assert.doesNotMatch(systemCta, new RegExp(phrase));
      assert.doesNotMatch(compactRow, new RegExp(phrase));
    }

    assert.doesNotMatch(actionCard, /DataFreshnessMeta/);
    assert.doesNotMatch(actionCard, /publicContentTrustHint/);
    assert.doesNotMatch(compactRow, /getCompactInsurerStatusLabel/);
    assert.doesNotMatch(compactRow, /statusLabel/);
    assert.doesNotMatch(directoryPage, /VerifiedWorkLinksSection/);
    assert.doesNotMatch(directoryPage, /예시 보험사/);
    assert.match(directoryPage, /DIRECTORY_PUBLIC_GLOBAL_NOTICE/);
  });

  it("uses resolveSystemLinks for 전산 buttons instead of systemUrl-only mapping", () => {
    const systemCta = read("components/directory/insurer-system-portal-primary-cta.tsx");
    const compactRow = read("components/directory/insurer-compact-workbench-row.tsx");

    assert.match(compactRow, /InsurerCardDeskActions/);
    assert.match(systemCta, /resolveSystemLinks/);
    assert.doesNotMatch(compactRow, /href=\{insurer\.systemUrl\}/);
  });

  it("keeps at least as many primary 전산 links as legacy systemUrl-only baseline", () => {
    const published = insurerDirectoryEntries.filter((insurer) => insurer.isPublished);
    let systemUrlOnly = 0;
    let resolvePrimary = 0;

    for (const insurer of published) {
      if (isUsableExternalHref(insurer.systemUrl)) systemUrlOnly += 1;
      if (resolveSystemLinks(insurer).primary) resolvePrimary += 1;
    }

    assert.ok(resolvePrimary >= systemUrlOnly);
    assert.ok(resolvePrimary > 0);
  });

  it("does not render missing-link placeholders on card official sections", () => {
    const actionCard = read("components/directory/insurer-action-card.tsx");
    const primaryLinks = read("components/directory/insurer-primary-work-links.tsx");

    assert.match(actionCard, /hideMissingSlots/);
    assert.match(primaryLinks, /if \(hidden\) return null/);
  });

  it("keeps PDF download, claim-documents, and admin governance intact", () => {
    const actionCard = read("components/directory/insurer-action-card.tsx");
    const listItem = read("components/claim-documents/claim-form-list-item.tsx");
    const adminActions = read("app/admin/claim-documents/governance/actions.ts");
    const claimPage = read("app/claim-documents/page.tsx");

    assert.match(actionCard, /InsurerCardClaimDocumentsSection|InsurerCardDeskActions/);
    assert.match(listItem, /PDF 다운로드/);
    assert.match(listItem, /PUBLIC_CTA_PDF_OPEN/);
    assert.match(adminActions, /saveClaimDocumentGovernance/);
    assert.match(claimPage, /claim-documents/);
  });
});
