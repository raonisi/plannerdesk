import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  getPlannerVerifiedWorkLinks,
  getPublicVerifiedWorkLinks,
} from "@/lib/work-links/verified-catalog";
import { VERIFIED_WORK_LINK_DISPLAY_FIXTURES } from "@/lib/work-links/verified-fixtures";

const ROOT = process.cwd();
const PUBLIC_FIXTURE_MARKERS = [
  "example.invalid",
  "예시 보험사 E",
  "mock-wl-pub-claim-005",
] as const;

describe("PR-WC-01 public fixture exclusion", () => {
  it("keeps fixture data available only for explicit test imports", () => {
    assert.ok(VERIFIED_WORK_LINK_DISPLAY_FIXTURES.length > 0);
    assert.equal(
      VERIFIED_WORK_LINK_DISPLAY_FIXTURES[0]?.officialSourceUrl,
      "https://example.invalid/official/claim-guide",
    );
  });

  it("does not serialize fixture markers from runtime verified catalogs", () => {
    const runtimeCatalog = JSON.stringify({
      planner: getPlannerVerifiedWorkLinks(),
      public: getPublicVerifiedWorkLinks(),
    });

    for (const marker of PUBLIC_FIXTURE_MARKERS) {
      assert.doesNotMatch(runtimeCatalog, new RegExp(marker.replace(".", "\\.")));
    }
  });

  it("keeps runtime catalog composition independent from mock and fixture modules", () => {
    const catalog = readFileSync(
      join(ROOT, "lib/work-links/verified-catalog.ts"),
      "utf8",
    );

    assert.doesNotMatch(catalog, /verified-fixtures|review-mock-candidates/);
    assert.doesNotMatch(
      catalog,
      /VERIFIED_WORK_LINK_DISPLAY_FIXTURES|WORK_LINK_REVIEW_MOCK_CANDIDATES/,
    );
    assert.match(catalog, /listPublicVerifiedWorkLinks/);
    assert.match(catalog, /listPlannerVerifiedWorkLinks/);
  });

  it("keeps search and claim pages on the fixture-free runtime catalog", () => {
    for (const path of ["app/search/page.tsx", "app/claim-documents/page.tsx"]) {
      const source = readFileSync(join(ROOT, path), "utf8");
      assert.match(source, /getPublicVerifiedWorkLinks/);
      assert.doesNotMatch(source, /verified-fixtures|example\.invalid|예시 보험사/);
    }
  });

  it("preserves DB-backed operational work-link search with scoped dedupe", () => {
    const search = readFileSync(
      join(ROOT, "lib/search/work-links-search.ts"),
      "utf8",
    );

    assert.match(search, /prisma\.insurer\.findMany/);
    assert.match(search, /isPublished:\s*true/);
    assert.match(search, /dedupeSearchResultsByLinkIdentity/);
    assert.match(search, /rankSearchResults/);
  });
});
