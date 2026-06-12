import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { canAccessWorkTools } from "@/lib/auth/rbac";
import {
  CODE_SEARCH_API_ROUTE_PREFIXES,
  CODE_SEARCH_ARCHIVE_NOT_OFFICIAL_NOTICE,
  CODE_SEARCH_ARCHIVE_PROXY_HOST,
  CODE_SEARCH_HIGH_RISK_TYPES,
  CODE_SEARCH_WORK_TOOLS_TOOL_IDS,
  isCodeSearchHighRiskType,
  isCodeSearchPublicAllowed,
  isCodeSearchWorkToolsToolId,
  routeUsesArchiveProxy,
} from "@/lib/work-tools/code-search-safety";

const ROOT = process.cwd();

const CODE_API_ROUTES = [
  "app/api/work-tools/disease-codes/route.ts",
  "app/api/work-tools/disease-codes/meta/route.ts",
  "app/api/work-tools/disease-codes/[id]/coverages/route.ts",
  "app/api/work-tools/surgery-codes/route.ts",
  "app/api/work-tools/surgery-codes/meta/route.ts",
  "app/api/work-tools/diseases/route.ts",
  "app/api/work-tools/diseases/meta/route.ts",
] as const;

describe("PR-BS-18 code search safety gate", () => {
  it("classifies code search types as high-risk", () => {
    for (const type of CODE_SEARCH_HIGH_RISK_TYPES) {
      assert.equal(isCodeSearchHighRiskType(type), true);
    }
    assert.equal(isCodeSearchHighRiskType("insurer"), false);
  });

  it("blocks code search from public allowance", () => {
    assert.equal(isCodeSearchPublicAllowed(), false);
  });

  it("maps work-tools tool ids for code search panels", () => {
    for (const id of CODE_SEARCH_WORK_TOOLS_TOOL_IDS) {
      assert.equal(isCodeSearchWorkToolsToolId(id), true);
    }
    assert.equal(isCodeSearchWorkToolsToolId("bmi-calculator"), false);
  });

  it("keeps work-tools page and API guards", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.match(page, /getWorkToolsAccess/);
    for (const route of CODE_API_ROUTES) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /workToolsRouteGuard/, route);
    }
    const guard = readFileSync(
      join(ROOT, "lib/api/work-tools-route-guard.ts"),
      "utf8",
    );
    assert.match(guard, /getWorkToolsAccess/);
    assert.match(guard, /401/);
    assert.match(guard, /403/);
  });

  it("restricts work-tools access to verified planner and admin", () => {
    assert.equal(canAccessWorkTools({ role: "verified_planner" }), true);
    assert.equal(canAccessWorkTools({ role: "super_admin" }), true);
    assert.equal(canAccessWorkTools(null), false);
    assert.equal(canAccessWorkTools({ role: "anonymous_public" }), false);
  });

  it("documents archive proxy as non-official source", () => {
    assert.match(CODE_SEARCH_ARCHIVE_NOT_OFFICIAL_NOTICE, /공식/);
    assert.match(CODE_SEARCH_ARCHIVE_NOT_OFFICIAL_NOTICE, /archive/i);
    for (const route of CODE_API_ROUTES) {
      const src = readFileSync(join(ROOT, route), "utf8");
      if (src.includes(CODE_SEARCH_ARCHIVE_PROXY_HOST)) {
        assert.equal(routeUsesArchiveProxy(src), true, route);
        assert.doesNotMatch(src, /공식 출처|official source/i);
      }
    }
  });

  it("lists guarded API prefixes for code search", () => {
    assert.ok(CODE_SEARCH_API_ROUTE_PREFIXES.length >= 3);
    for (const prefix of CODE_SEARCH_API_ROUTE_PREFIXES) {
      assert.match(prefix, /^\/api\/work-tools\//);
    }
  });

  it("does not change prisma schema for code search gate", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /DiseaseCode|SurgeryCode|KcdCode/i);
  });

  it("does not add PG or public code search routes", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.doesNotMatch(pkg, /"app\/api\/public\/disease-codes"/);
    const doc = readFileSync(
      join(ROOT, "docs/PR-BS-18-CODE-SEARCH-SAFETY-GATE.md"),
      "utf8",
    );
    assert.match(doc, /public.*금지|Public 노출 금지/);
  });
});
