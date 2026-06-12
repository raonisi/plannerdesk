import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { canAccessAdmin, canAccessWorkTools } from "@/lib/auth/rbac";

const ROOT = process.cwd();

const WORK_TOOLS_API_ROUTES = [
  "app/api/work-tools/diseases/route.ts",
  "app/api/work-tools/diseases/meta/route.ts",
  "app/api/work-tools/storage/route.ts",
  "app/api/work-tools/disease-codes/route.ts",
  "app/api/work-tools/disease-codes/meta/route.ts",
  "app/api/work-tools/disease-codes/[id]/coverages/route.ts",
  "app/api/work-tools/surgery-codes/route.ts",
  "app/api/work-tools/surgery-codes/meta/route.ts",
] as const;

describe("PR173-A / PR-BS-19C work-tools access policy", () => {
  it("work-tools page is public without planner gate", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    assert.doesNotMatch(page, /AccessRestrictedPanel/);
    assert.match(page, /WorkToolsPublicNotice/);
    assert.doesNotMatch(page, /prisma\./);
  });

  it("read-only work-tools api routes use public read guard", () => {
    for (const route of WORK_TOOLS_API_ROUTES) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /workToolsPublicReadRouteGuard/, route);
    }
  });

  it("protected guard remains available for future write routes", () => {
    const guard = readFileSync(
      join(ROOT, "lib/api/work-tools-route-guard.ts"),
      "utf8",
    );
    assert.match(guard, /workToolsPublicReadRouteGuard/);
    assert.match(guard, /workToolsRouteGuard/);
    assert.match(guard, /Unauthorized/);
    assert.match(guard, /Forbidden/);
    assert.doesNotMatch(guard, /stack|secret|allowlist|supabase|render\.com/i);
  });

  it("canAccessWorkTools rbac helper unchanged", () => {
    assert.equal(canAccessWorkTools({ role: "verified_planner" }), true);
    assert.equal(canAccessWorkTools({ role: "content_admin" }), true);
    assert.equal(canAccessWorkTools({ role: "super_admin" }), true);
    assert.equal(canAccessWorkTools(null), false);
    assert.equal(canAccessWorkTools({ role: "anonymous_public" }), false);
    assert.equal(canAccessWorkTools({ role: "moderator" }), false);
  });

  it("admin guard unchanged", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    assert.equal(canAccessAdmin({ role: "verified_planner" }), false);
  });

  it("public header links to work-tools as public nav entry", () => {
    const header = readFileSync(join(ROOT, "components/header.tsx"), "utf8");
    assert.match(header, /href:\s*"\/work-tools"/);
    assert.match(header, /uiLabels\.workTools/);
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
  });

  it("public home links to work-tools with public copy", () => {
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.match(home, /href="\/work-tools"/);
    assert.match(home, /WORK_TOOLS_PUBLIC_HOME_CARD_DESCRIPTION/);
  });

  it("public route smoke may include work-tools", () => {
    const script = readFileSync(
      join(ROOT, "scripts/smoke-public-routes.mjs"),
      "utf8",
    );
    assert.match(script, /\/work-tools/);
  });

  it("public visibility helpers unchanged", () => {
    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(insurers, /verificationStatus: \{ in:/);
  });
});
