import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import { resolveVisiblePublicClaimDocuments } from "@/lib/public/public-surface-resolvers";
import {
  matchesPublicMessageCategory,
  publicMessageCategoryFilterTabs,
} from "@/lib/public/message-template-display";
import {
  matchesWorkToolCategory,
  WORK_TOOL_CATEGORIES,
} from "@/lib/tool-display";
import { countPublicWorkTools } from "@/lib/work-tools/work-tools-registry";
import { PUBLIC_FORBIDDEN_PHRASES } from "@/lib/ops/public-smoke-expansion";

const ROOT = process.cwd();

describe("PR-UX-06 mobile filter usability", () => {
  it("responsive category filter component exposes mobile select and desktop pills", () => {
    const component = readFileSync(
      join(ROOT, "components/launcher/responsive-category-filter.tsx"),
      "utf8",
    );
    assert.match(component, /ResponsiveCategoryFilter/);
    assert.match(component, /lg:hidden/);
    assert.match(component, /hidden lg:block/);
    assert.match(component, /CategoryPillBar/);
    assert.match(component, /aria-label=\{ariaLabel\}/);
    assert.match(component, /PUBLIC_CTA_FILTER_RESET/);
    assert.match(component, /총 \{totalCount\}개 중 \{visibleCount\}개/);
    assert.match(component, /min-h-11/);
  });

  it("work-tools wires responsive mobile filter with catalog total count", () => {
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(client, /ResponsiveCategoryFilter/);
    assert.match(client, /work-tools-category-filter/);
    assert.match(client, /totalToolCount/);
    assert.match(client, /allTools\(\)\.length/);
    assert.match(client, /resetWorkToolFilters/);
    assert.match(client, /visibleCount=\{filteredTools\.length\}/);
    assert.doesNotMatch(
      client,
      /<CategoryPillBar[\s\S]*?업무 도구 카테고리/,
    );
  });

  it("message-templates wires responsive mobile filter and reset", () => {
    const library = readFileSync(
      join(ROOT, "app/message-templates/message-template-library.tsx"),
      "utf8",
    );
    assert.match(library, /ResponsiveCategoryFilter/);
    assert.match(library, /message-templates-category-filter/);
    assert.match(library, /resetMessageFilters/);
    assert.match(library, /totalCount=\{templates\.length\}/);
    assert.match(library, /visibleCount=\{filteredTemplates\.length\}/);
    assert.match(library, /message-channel-filter/);
    assert.match(library, /aria-label="채널"/);
  });

  it("category and search filters compose for work tools", () => {
    const favoriteIds = ["insurance-age"] as const;
    assert.equal(
      matchesWorkToolCategory("insure-calc", "all", "insurance-age", favoriteIds),
      true,
    );
    assert.equal(
      matchesWorkToolCategory("insure-calc", "insure-calc", "insurance-age", favoriteIds),
      true,
    );
    assert.equal(
      matchesWorkToolCategory("search", "insure-calc", "disease-search", favoriteIds),
      false,
    );
    assert.equal(
      matchesWorkToolCategory("insure-calc", "favorites", "insurance-age", favoriteIds),
      true,
    );
    assert.equal(
      matchesWorkToolCategory("search", "favorites", "disease-search", favoriteIds),
      false,
    );
    assert.ok(WORK_TOOL_CATEGORIES.length >= 6);
  });

  it("category filter composes for message templates", () => {
    const tabIds = publicMessageCategoryFilterTabs.map((tab) => tab.id);
    assert.ok(tabIds.includes("all"));
    assert.equal(matchesPublicMessageCategory("claim_guide", "all"), true);
    assert.equal(matchesPublicMessageCategory("claim_guide", "claim_guide"), true);
    assert.equal(matchesPublicMessageCategory("claim_guide", "customer_care"), false);
  });

  it("work tools public count stays independent from selected category UI", () => {
    const count = countPublicWorkTools();
    assert.ok(count > 0);
    const client = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.doesNotMatch(client, /totalCount=\{filteredTools\.length\}/);
    assert.match(client, /totalCount=\{totalToolCount\}/);
  });

  it("claim library SSOT count remains at 220 baseline", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const libraryCount = countPublicClaimLibraryItems(guides, {});
    assert.ok(libraryCount >= 200);
  });

  it("filter surfaces avoid forbidden sales phrases", () => {
    const surfaces = [
      "components/launcher/responsive-category-filter.tsx",
      "app/work-tools/work-tools-client.tsx",
      "app/message-templates/message-template-library.tsx",
    ];
    const combined = surfaces
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
});
