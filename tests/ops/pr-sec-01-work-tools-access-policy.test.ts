import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { canAccessAdmin, canAccessWorkTools } from "@/lib/auth/rbac";
import {
  countPublicWorkTools,
  getAllWorkToolIds,
  getWorkToolAccessPolicy,
  isWorkToolPublicVisible,
  isWorkToolsApiPublicReadAllowed,
  isWorkToolsApiRouteRegistered,
  requiredAccessLevelForWorkToolsApi,
  WORK_TOOLS_API_ROUTE_IDS,
  WORK_TOOLS_API_ROUTE_POLICIES,
} from "@/lib/work-tools/work-tools-registry";

const ROOT = process.cwd();

const API_ROUTE_FILES: Record<string, string> = {
  diseases: "app/api/work-tools/diseases/route.ts",
  "diseases/meta": "app/api/work-tools/diseases/meta/route.ts",
  "disease-codes": "app/api/work-tools/disease-codes/route.ts",
  "disease-codes/meta": "app/api/work-tools/disease-codes/meta/route.ts",
  "disease-codes/coverages":
    "app/api/work-tools/disease-codes/[id]/coverages/route.ts",
  "surgery-codes": "app/api/work-tools/surgery-codes/route.ts",
  "surgery-codes/meta": "app/api/work-tools/surgery-codes/meta/route.ts",
  storage: "app/api/work-tools/storage/route.ts",
};

describe("PR-SEC-01 work-tools access policy SSOT", () => {
  it("registry tools resolve allowed access levels only", () => {
    const allowed = new Set(["public", "verified_planner", "admin"]);
    for (const id of getAllWorkToolIds()) {
      const policy = getWorkToolAccessPolicy(id);
      assert.equal(allowed.has(policy.accessLevel), true, id);
      assert.equal(
        ["catalog_only", "client_only", "server_read", "server_write"].includes(
          policy.exposure,
        ),
        true,
        id,
      );
    }
  });

  it("unknown api route defaults to deny", () => {
    assert.equal(isWorkToolsApiRouteRegistered("unknown-route"), false);
    assert.equal(isWorkToolsApiPublicReadAllowed("unknown-route"), false);
    assert.equal(requiredAccessLevelForWorkToolsApi("unknown-route"), "deny");
  });

  it("public api policies are unique and linked to catalog tools", () => {
    const routeIds = WORK_TOOLS_API_ROUTE_POLICIES.map((policy) => policy.routeId);
    assert.equal(new Set(routeIds).size, routeIds.length);
    for (const routeId of WORK_TOOLS_API_ROUTE_IDS) {
      assert.equal(isWorkToolsApiPublicReadAllowed(routeId), true, routeId);
    }
  });

  it("public count matches catalog-visible registry tools", () => {
    const visible = getAllWorkToolIds().filter(
      (id) => getWorkToolAccessPolicy(id).catalogVisible,
    );
    assert.equal(countPublicWorkTools(), visible.length);
    assert.equal(countPublicWorkTools(), 56);
  });

  it("route guard reads registry policy instead of unconditional bypass", () => {
    const guard = readFileSync(
      join(ROOT, "lib/api/work-tools-route-guard.ts"),
      "utf8",
    );
    assert.match(guard, /isWorkToolsApiPublicReadAllowed/);
    assert.match(guard, /requiredAccessLevelForWorkToolsApi/);
    assert.match(guard, /resolveWorkToolsGuard/);
    assert.doesNotMatch(guard, /workToolsPublicReadRouteGuard\(\)[\s\S]*return null;/);
    assert.doesNotMatch(guard, /x-role|headers\.get\(["']role/i);
    assert.doesNotMatch(guard, /searchParams\.get\(["']role/i);
  });

  it("each work-tools api route passes a registered route id to the public guard", () => {
    for (const [routeId, rel] of Object.entries(API_ROUTE_FILES)) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.match(src, /workToolsPublicReadRouteGuard/, rel);
      assert.match(src, new RegExp(`workToolsPublicReadRouteGuard\\("${routeId}"\\)`), rel);
    }
  });

  it("protected rbac helper remains planner/admin only", () => {
    assert.equal(canAccessWorkTools({ role: "verified_planner" }), true);
    assert.equal(canAccessWorkTools({ role: "content_admin" }), true);
    assert.equal(canAccessWorkTools(null), false);
    assert.equal(canAccessWorkTools({ role: "anonymous_public" }), false);
    assert.equal(canAccessAdmin({ role: "verified_planner" }), false);
  });

  it("work-tools page stays public catalog without session gate", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    assert.match(page, /WorkToolsPublicNotice/);
  });

  it("public notice avoids bypass and certainty phrases", () => {
    const notice = readFileSync(
      join(ROOT, "components/work-tools/work-tools-public-notice.tsx"),
      "utf8",
    );
    assert.match(notice, /WORK_TOOLS_PUBLIC_SCOPE_NOTICE/);
    for (const phrase of [
      "우회 가능",
      "제한 없음",
      "누구나 사용 가능",
      "보장 확정",
      "보험금 지급",
    ]) {
      assert.doesNotMatch(notice, new RegExp(phrase));
    }
  });

  it("admin-only registry config is not catalog visible", () => {
    assert.equal(
      isWorkToolPublicVisible({
        id: "fixture-admin-tool",
        status: "admin_only",
        visibility: "admin",
        isAdminOnly: true,
      }),
      false,
    );
  });
});
