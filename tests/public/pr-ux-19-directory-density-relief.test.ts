import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-UX-19 directory density relief", () => {
  it("renders compact mobile rows below lg and desktop cards at lg+", () => {
    const explorer = read("app/directory/directory-explorer.tsx");

    assert.match(explorer, /InsurerCompactMobileRow/);
    assert.match(explorer, /gap-2 lg:hidden/);
    assert.match(explorer, /hidden lg:grid/);
    assert.match(explorer, /InsurerActionCard/);
    assert.match(explorer, /InsurerCompactWorkbenchRow/);
  });

  it("prioritizes system portal CTA and collapses secondary actions by default", () => {
    const mobileRow = read("components/directory/insurer-compact-mobile-row.tsx");

    assert.match(mobileRow, /InsurerSystemPortalPrimaryCta/);
    assert.match(mobileRow, /자세히 보기/);
    assert.match(mobileRow, /aria-expanded=\{expanded\}/);
    assert.match(mobileRow, /aria-controls=\{detailPanelId\}/);
    assert.doesNotMatch(mobileRow, /InsurerCardDeskActions/);
    assert.match(mobileRow, /\{expanded \? \(/);
    assert.match(mobileRow, /workbenchDetailOnly/);
  });

  it("manages single expanded insurer and resets on filter changes", () => {
    const explorer = read("app/directory/directory-explorer.tsx");

    assert.match(explorer, /expandedMobileInsurer/);
    assert.match(explorer, /mobileListResetKey/);
    assert.match(explorer, /setExpandedInsurerId\(open \? insurer\.id : null\)/);
  });

  it("preserves claim, disclosure, and favorite flows in the detail panel", () => {
    const mobileRow = read("components/directory/insurer-compact-mobile-row.tsx");
    const actionCard = read("components/directory/insurer-action-card.tsx");
    const cta = read("components/directory/insurer-system-portal-primary-cta.tsx");

    assert.match(mobileRow, /onToggleFavorite/);
    assert.match(mobileRow, /InsurerActionCard/);
    assert.match(actionCard, /InsurerCardClaimDocumentsSection/);
    assert.match(actionCard, /disclosureLinks/);
    assert.match(cta, /resolveSystemLinks/);
    assert.match(cta, /ExternalTabAnchor/);
  });

  it("keeps external link safety attributes on directory surfaces", () => {
    const cta = read("components/directory/insurer-system-portal-primary-cta.tsx");
    const external = read("lib/ui/external-link.ts");

    assert.match(cta, /ExternalTabAnchor/);
    assert.match(external, /noopener/);
    assert.match(external, /noreferrer/);
  });

  it("does not change admin, prisma, or package boundaries", () => {
    const explorer = read("app/directory/directory-explorer.tsx");
    const adminLayout = read("app/admin/layout.tsx");

    assert.doesNotMatch(explorer, /href:\s*"\/admin"/);
    assert.doesNotMatch(adminLayout, /InsurerCompactMobileRow/);
    assert.doesNotMatch(read("package.json"), /"zustand"/);
    assert.doesNotMatch(read("prisma/schema.prisma"), /InsurerCompactMobileRow/);
  });

  it("keeps search, tabs, sort, and empty-state flows in directory explorer", () => {
    const explorer = read("app/directory/directory-explorer.tsx");

    assert.match(explorer, /toChosung/);
    assert.match(explorer, /activeTab/);
    assert.match(explorer, /sortMode/);
    assert.match(explorer, /resetDirectoryFilters/);
    assert.match(explorer, /DIRECTORY_SEARCH_EMPTY_TITLE/);
    assert.match(explorer, /displayedInsurers\.length/);
  });
});
