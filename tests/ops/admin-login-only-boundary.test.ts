import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { canAccessAdmin, canAccessWorkTools } from "@/lib/auth/rbac";

const ROOT = process.cwd();

describe("PR-BS-19C admin login-only boundary", () => {
  it("admin guard unchanged for verified planner", () => {
    assert.equal(canAccessAdmin({ role: "verified_planner" }), false);
    assert.equal(canAccessAdmin({ role: "super_admin" }), true);
  });

  it("canAccessWorkTools rbac helper unchanged for planner sessions", () => {
    assert.equal(canAccessWorkTools({ role: "verified_planner" }), true);
    assert.equal(canAccessWorkTools(null), false);
  });

  it("admin section still uses layout access guard", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    const adminHome = readFileSync(join(ROOT, "app/admin/page.tsx"), "utf8");
    assert.doesNotMatch(adminHome, /work-tools/);
  });

  it("work-tools is public while admin layout stays gated", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    assert.match(layout, /getAdminAccess/);
  });
});
