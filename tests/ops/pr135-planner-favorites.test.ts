import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ClaimDocumentCategory,
  VerificationStatus,
} from "@prisma/client";

import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import {
  buildAllowedIdSet,
  filterFavoriteIdsToCatalog,
} from "@/lib/planner-favorites/filter-ids";
import { SEARCH_QUERY_FAVORITES_DEFERRED_REASON } from "@/lib/planner-favorites/copy";

const ROOT = process.cwd();

describe("PR135 planner favorites (static, client-only)", () => {
  it("hub documents PR135-B separation and no migration in PR135-A", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-135-PLANNER-FAVORITES-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-135-B/);
    assert.match(hub, /client-only/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    const plan = readFileSync(
      join(ROOT, "docs/PR-135-IMPLEMENTATION-PLAN.md"),
      "utf8",
    );
    assert.match(plan, /B안/);
    assert.match(plan, /migration 생성하지 않음|DB migration.*불필요|migration.*없음/i);
  });

  it("prisma schema has no Favorite or Bookmark model", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model\s+Favorite\b/);
    assert.doesNotMatch(schema, /model\s+Bookmark\b/);
  });

  it("catalog filter drops ids not in public snapshot", () => {
    const allowed = buildAllowedIdSet(["a", "b"]);
    const filtered = filterFavoriteIdsToCatalog(
      ["a", "secret-draft", "b", ""],
      allowed,
    );
    assert.deepEqual(filtered, ["a", "b"]);
  });

  it("claim favorite id prefixes are stable", () => {
    const guideId = claimLibraryFavoriteId({
      kind: "guide",
      document: {
        id: "doc-1",
        title: "t",
        slug: "s",
        summary: null,
        category: ClaimDocumentCategory.actual_expense,
        verificationStatus: VerificationStatus.verified,
        insurerId: null,
        insurerName: null,
        lastVerifiedAt: null,
        claimFormUrl: null,
        officialSourceUrl: null,
        requiredDocuments: null,
        optionalDocuments: null,
        customerMessageTemplate: null,
        cautionNote: null,
      },
    });
    assert.equal(guideId, "doc:doc-1");
  });

  it("home panel aggregates insurers claim knowledge without admin routes", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/planner-work-favorites-panel.tsx"),
      "utf8",
    );
    assert.match(panel, /PlannerWorkFavoritesPanel/);
    assert.match(panel, /filterFavoriteIdsToCatalog/);
    assert.match(panel, /useFavorites/);
    assert.doesNotMatch(panel, /\/admin/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /PlannerWorkFavoritesPanel/);
    assert.doesNotMatch(home, /setFavorites\(/);
  });

  it("search favorites only on safe domains not work_link", () => {
    const toggle = readFileSync(
      join(ROOT, "components/search/search-result-favorite-toggle.tsx"),
      "utf8",
    );
    assert.match(toggle, /insurer/);
    assert.match(toggle, /claim_document/);
    assert.match(toggle, /knowledge_article/);
    assert.doesNotMatch(toggle, /work_link/);
    assert.doesNotMatch(toggle, /disclosure_link/);
    assert.doesNotMatch(toggle, /message_template/);
  });

  it("storage keys document ids only namespaces", () => {
    assert.equal(
      PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
      "plannerdesk:favoriteClaimDocuments",
    );
    assert.equal(
      PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
      "plannerdesk:favoriteKnowledgeArticles",
    );
    assert.match(SEARCH_QUERY_FAVORITES_DEFERRED_REASON, /검색어/);
    assert.match(SEARCH_QUERY_FAVORITES_DEFERRED_REASON, /고객/);
  });

  it("no server favorite API or prisma favorite writes", () => {
    const libFiles = [
      "lib/planner-favorites/storage-keys.ts",
      "lib/planner-favorites/filter-ids.ts",
      "hooks/useLocalIdFavorites.ts",
    ];
    for (const rel of libFiles) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /prisma\./);
      assert.doesNotMatch(src, /fetch\(/);
    }
  });
});
