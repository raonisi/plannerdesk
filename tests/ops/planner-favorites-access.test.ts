import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import type { WorkToolsAccessState } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";

const ROOT = process.cwd();

describe("PR-BS-06 planner favorites access", () => {
  it("requires authenticated work-tools session for favorites UI", () => {
    assert.equal(isPlannerFavoritesEnabled({ status: "locked" }), false);
    const denied: WorkToolsAccessState = {
      status: "denied",
      session: { expires: "2099-01-01", user: { role: "user" } },
    };
    assert.equal(isPlannerFavoritesEnabled(denied), false);

    const authenticated: WorkToolsAccessState = {
      status: "authenticated",
      session: { expires: "2099-01-01", user: { role: "verified_planner" } },
    };
    assert.equal(isPlannerFavoritesEnabled(authenticated), true);
  });

  it("home page gates favorites panel with work-tools access", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    assert.match(page, /getWorkToolsAccess/);
    assert.match(page, /isPlannerFavoritesEnabled/);
    assert.match(page, /plannerFavoritesEnabled/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /PlannerFavoritesLoginPrompt/);
    assert.doesNotMatch(home, /plannerFavoritesEnabled\s*\?\s*null/);
  });

  it("directory and claim pages pass planner favorites flag", () => {
    const workTools = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(workTools, /getWorkToolsAccess/);

    for (const rel of [
      "app/directory/page.tsx",
      "app/claim-documents/page.tsx",
      "app/knowledge/page.tsx",
      "app/search/page.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.match(src, /getWorkToolsAccess/);
      assert.match(src, /plannerFavoritesEnabled/);
    }
  });

  it("does not add favorite prisma models or server APIs", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model\s+Favorite\b/);
    const access = readFileSync(
      join(ROOT, "lib/planner-favorites/planner-access.ts"),
      "utf8",
    );
    assert.doesNotMatch(access, /prisma\./);
  });
});
