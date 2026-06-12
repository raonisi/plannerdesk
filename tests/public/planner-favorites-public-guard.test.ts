import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR-BS-06 planner favorites public guard", () => {
  it("home hides favorites list and recents without planner session", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /plannerFavoritesEnabled\s*\?/);
    assert.match(home, /PlannerFavoritesLoginPrompt/);
    assert.match(home, /PlannerWorkFavoritesPanel/);
    assert.doesNotMatch(
      home,
      /<PlannerWorkFavoritesPanel[\s\S]*?\/>\s*<section[\s\S]*?최근 사용/,
    );
  });

  it("search shows login prompt on favorite toggle when not authenticated", () => {
    const toggle = readFileSync(
      join(ROOT, "components/search/search-result-favorite-toggle.tsx"),
      "utf8",
    );
    assert.match(toggle, /GatedFavoriteButton/);
    assert.match(toggle, /PlannerFavoritesScope/);
    assert.match(toggle, /plannerFavoritesEnabled/);

    const gated = readFileSync(
      join(ROOT, "components/planner-favorites/gated-favorite-button.tsx"),
      "utf8",
    );
    assert.match(gated, /PlannerFavoritesLoginPrompt/);
    assert.match(gated, /usePlannerFavoritesEnabled/);
  });

  it("claim favorites strip is hidden on public session", () => {
    const explorer = readFileSync(
      join(ROOT, "app/claim-documents/claim-document-explorer.tsx"),
      "utf8",
    );
    assert.match(explorer, /plannerFavoritesEnabled\s*\?/);
    assert.match(explorer, /ClaimDocumentFavoritesStrip/);
  });

  it("directory hides favorites tab without planner session", () => {
    const explorer = readFileSync(
      join(ROOT, "app/directory/directory-explorer.tsx"),
      "utf8",
    );
    assert.match(explorer, /filter\(\(tab\) => tab\.value !== "favorites"\)/);
    assert.match(explorer, /onToggleFavorite=\{plannerFavoritesEnabled/);
  });

  it("public search results do not import work-tools access in client bundle", () => {
    const results = readFileSync(
      join(ROOT, "app/search/search-results.tsx"),
      "utf8",
    );
    assert.doesNotMatch(results, /getWorkToolsAccess/);
    assert.match(results, /plannerFavoritesEnabled/);
  });
});

describe("PR-BS-13 planner favorites public visibility", () => {
  it("public pages do not render favorites list without planner session", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /plannerFavoritesEnabled\s*\?/);
    assert.match(home, /PlannerWorkFavoritesPanel/);
    assert.match(home, /PlannerFavoritesLoginPrompt/);
  });

  it("favorite-safety module exists for href and label guards", () => {
    const safety = readFileSync(
      join(ROOT, "lib/planner-favorites/favorite-safety.ts"),
      "utf8",
    );
    assert.match(safety, /isUnsafeFavoriteHref/);
    assert.match(safety, /isPlannerFavoriteAllowed/);
    assert.match(safety, /PLANNER_FAVORITES_FORBIDDEN_STORAGE_FIELDS/);
  });
});
