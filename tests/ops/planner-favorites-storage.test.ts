import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";

const ROOT = process.cwd();

describe("PR-BS-13 planner favorites storage boundaries", () => {
  it("uses scoped localStorage keys without forbidden payload fields", () => {
    const keys = Object.values(PLANNER_FAVORITE_STORAGE_KEYS);
    assert.ok(keys.length >= 4);
    for (const key of keys) {
      assert.match(key, /^plannerdesk[.:]/);
    }

    const hook = readFileSync(join(ROOT, "hooks/useLocalIdFavorites.ts"), "utf8");
    assert.match(hook, /ids: Array\.from\(ids\)/);
    assert.doesNotMatch(hook, /customerName/);
    assert.doesNotMatch(hook, /answerAssistant/);
  });

  it("recent-work module delegates href safety to favorite-safety", () => {
    const recent = readFileSync(
      join(ROOT, "lib/planner-favorites/recent-work.ts"),
      "utf8",
    );
    assert.match(recent, /isUnsafeFavoriteHref/);
    assert.match(recent, /sanitizeRecentWorkItems/);
  });

  it("work-tools favorites stay behind planner gate", () => {
    const workToolsPage = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(workToolsPage, /getWorkToolsAccess/);

    const workToolsClient = readFileSync(
      join(ROOT, "app/work-tools/work-tools-client.tsx"),
      "utf8",
    );
    assert.match(workToolsClient, /plannerdesk\.workTools\.favorites/);
    assert.doesNotMatch(workToolsClient, /getWorkToolsAccess/);
  });
});
