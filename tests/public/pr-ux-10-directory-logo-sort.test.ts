import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import {
  getInsurerDisplayCategory,
  INSURER_CATEGORY_SORT_ORDER,
} from "@/lib/directory/insurer-display-category";
import {
  INSURER_SORT_OPTIONS,
  sortPublicInsurers,
} from "@/lib/directory/insurer-sort";
import { resolveVisiblePublicClaimDocuments } from "@/lib/public/public-surface-resolvers";
import { PUBLIC_FORBIDDEN_PHRASES } from "@/lib/ops/public-smoke-expansion";
import type { PublicInsurer } from "@/lib/public/insurers";

const ROOT = process.cwd();

function sampleInsurer(
  overrides: Partial<PublicInsurer> & Pick<PublicInsurer, "id" | "name">,
): PublicInsurer {
  return {
    category: "life",
    verificationStatus: "verified",
    lastVerifiedAt: "2026-01-01",
    officialWebsiteUrl: "https://example.com",
    plannerPortalUrl: null,
    systemUrl: null,
    customerCenterPhone: null,
    helpdeskPhone: null,
    callMonitoringPhone: null,
    claimPageUrl: null,
    claimFaxNumber: null,
    claimFaxHandlingType: "unknown",
    faxNumber: null,
    registeredMailAddress: null,
    mailingAddress: null,
    claimFormUrl: null,
    termsUrl: null,
    cardPaymentInitialAvailable: null,
    cardPaymentRecurringAvailable: null,
    cardPaymentStatus: "unknown",
    cardPaymentNote: null,
    isFeatured: false,
    supportedBrowsers: ["chrome"],
    ...overrides,
  };
}

describe("PR-UX-10 directory logo and sort", () => {
  it("directory explorer exposes sort select with aria-label", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    assert.match(explorer, /aria-label="보험사 정렬"/);
    assert.match(explorer, /sortPublicInsurers/);
    assert.match(explorer, /getInsurerDisplayCategory/);
    assert.match(explorer, /DEFAULT_INSURER_SORT/);
  });

  it("shared insurer logo component provides alt text and initials fallback", () => {
    const logo = readFileSync(
      join(ROOT, "components/directory/insurer-logo.tsx"),
      "utf8",
    );
    const actionCard = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    const compactRow = readFileSync(
      join(ROOT, "components/directory/insurer-compact-workbench-row.tsx"),
      "utf8",
    );
    assert.match(logo, /alt=\{`\$\{insurer\.name\} 로고`\}/);
    assert.match(logo, /insurerLogoLabel/);
    assert.match(logo, /aria-hidden="true"/);
    assert.match(actionCard, /from "@\/components\/directory\/insurer-logo"/);
    assert.doesNotMatch(actionCard, /const INSURER_LOGO_SOURCES/);
    assert.match(compactRow, /<InsurerLogo/);
    assert.match(compactRow, /insurer=\{insurer\}/);
    assert.match(compactRow, /size="compact"/);
  });

  it("sorts insurers by Korean name", () => {
    const insurers = [
      sampleInsurer({ id: "b", name: "한화생명" }),
      sampleInsurer({ id: "a", name: "DB생명" }),
      sampleInsurer({ id: "c", name: "교보생명" }),
    ];
    const sorted = sortPublicInsurers(insurers, "name");
    const expected = [...insurers]
      .map((insurer) => insurer.name)
      .sort((a, b) => a.localeCompare(b, "ko-KR"));
    assert.deepEqual(
      sorted.map((insurer) => insurer.name),
      expected,
    );
  });

  it("sorts insurers by display category life → non_life → digital → mutual", () => {
    const insurers = [
      sampleInsurer({ id: "mutual-1", name: "우체국공제" }),
      sampleInsurer({ id: "life-1", name: "삼성생명", category: "life" }),
      sampleInsurer({
        id: "digital-1",
        name: "캐롯손해보험",
        category: "non_life",
      }),
      sampleInsurer({ id: "fire-1", name: "삼성화재", category: "non_life" }),
    ];
    const sorted = sortPublicInsurers(insurers, "category");
    assert.equal(getInsurerDisplayCategory(sorted[0]!), "life");
    assert.equal(getInsurerDisplayCategory(sorted[1]!), "non_life");
    assert.equal(getInsurerDisplayCategory(sorted[2]!), "digital");
    assert.equal(getInsurerDisplayCategory(sorted[3]!), "mutual");
    assert.ok(
      INSURER_CATEGORY_SORT_ORDER.life <
        INSURER_CATEGORY_SORT_ORDER.non_life,
    );
  });

  it("combines search filter logic with sort application in explorer", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    const filterIndex = explorer.indexOf("const filteredInsurers = useMemo");
    const sortIndex = explorer.indexOf("const displayedInsurers = useMemo");
    assert.ok(filterIndex > 0 && sortIndex > filterIndex);
    assert.match(explorer, /displayedInsurers\.map/);
  });

  it("keeps system portal CTA and insurer name on cards", () => {
    const card = readFileSync(
      join(ROOT, "components/directory/insurer-action-card.tsx"),
      "utf8",
    );
    assert.match(card, /InsurerSystemPortalPrimaryCta/);
    assert.match(card, /\{insurer\.name\}/);
    assert.match(card, /getInsurerWorkbenchCategoryLabel/);
  });

  it("claim library SSOT count baseline preserved", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const libraryCount = countPublicClaimLibraryItems(guides, {});
    assert.ok(libraryCount >= 200);
  });

  it("directory sort surfaces avoid forbidden sales phrases", () => {
    const files = [
      "app/directory/directory-explorer.tsx",
      "components/directory/insurer-logo.tsx",
      "lib/directory/insurer-sort.ts",
    ];
    const combined = files
      .map((rel) => readFileSync(join(ROOT, rel), "utf8"))
      .join("\n");
    for (const phrase of PUBLIC_FORBIDDEN_PHRASES) {
      assert.doesNotMatch(
        combined,
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `forbidden phrase: ${phrase}`,
      );
    }
  });

  it("default sort mode is featured server order", () => {
    assert.equal(INSURER_SORT_OPTIONS[0]?.value, "featured");
    const insurers = [
      sampleInsurer({ id: "z", name: "한화생명" }),
      sampleInsurer({ id: "a", name: "DB생명" }),
    ];
    const sorted = sortPublicInsurers(insurers, "featured");
    assert.deepEqual(sorted, insurers);
  });
});
