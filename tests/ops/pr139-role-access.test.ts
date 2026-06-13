import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  canAccessAdmin,
  canManageUsers,
  normalizeRole,
  ROLE_CONTENT_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_VERIFIED_PLANNER,
} from "@/lib/auth/rbac";
import { getBulkActionPolicy } from "@/lib/admin/bulk-policies";

const ROOT = process.cwd();

describe("PR139 role access (static, no role data changes)", () => {
  it("hub documents PR139-B and no Auth schema change in PR139-A", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-139-ROLE-ACCESS-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-139-B-RBAC-FOUNDATION-DESIGN/);
    assert.match(hub, /변경 없음/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("canManageUsers is super_admin only", () => {
    assert.equal(canManageUsers({ role: ROLE_SUPER_ADMIN }), true);
    assert.equal(canManageUsers({ role: ROLE_CONTENT_ADMIN }), false);
    assert.equal(canManageUsers({ role: ROLE_VERIFIED_PLANNER }), false);
    assert.equal(canManageUsers(null), false);
  });

  it("canAccessAdmin allows content_admin and super_admin only", () => {
    assert.equal(canAccessAdmin({ role: ROLE_SUPER_ADMIN }), true);
    assert.equal(canAccessAdmin({ role: ROLE_CONTENT_ADMIN }), true);
    assert.equal(canAccessAdmin({ role: ROLE_VERIFIED_PLANNER }), false);
    assert.equal(canAccessAdmin({ role: "anonymous_public" }), false);
  });

  it("invalid role normalizes to anonymous_public", () => {
    assert.equal(normalizeRole("hacker"), "anonymous_public");
    assert.equal(normalizeRole(undefined), "anonymous_public");
  });

  it("importDrafts bulk requires superAdmin permission", () => {
    const action = getBulkActionPolicy("importDrafts");
    assert.equal(action.requiredPermission, "superAdmin");
    assert.equal(action.riskLevel, "blocked");
  });

  it("admin layout uses getAdminAccess server guard", () => {
    const layout = readFileSync(
      join(ROOT, "app/admin/layout.tsx"),
      "utf8",
    );
    assert.match(layout, /getAdminAccess/);
    assert.match(layout, /AdminAccessDeniedState/);
    assert.match(layout, /AdminLockedState/);
  });

  it("role access panel admin only not on public home", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminRoleAccessPanel/);

    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminRoleAccessPanel/);
    assert.doesNotMatch(home, /역할별 운영 권한/);
  });

  it("role panel has no prisma writes or role mutation", () => {
    const panel = readFileSync(
      join(ROOT, "components/admin/AdminRoleAccessPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /updateRole|setRole|User\.update/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("verified answer assistant access module keeps allowlist", () => {
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /isUserOnVerifiedAnswerAssistantAllowlist/);
    assert.match(access, /canAccessAdmin/);
    assert.doesNotMatch(access, /expandAllowlist|autoExpand/i);
  });

  it("public search excludes admin-only work_link from admin types", () => {
    const types = readFileSync(join(ROOT, "lib/search/types.ts"), "utf8");
    assert.match(types, /Exclude<PublicSearchDomain, "work_link">/);
  });

  it("prisma schema unchanged for new role tables in PR139", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model RolePermission\b/);
    assert.doesNotMatch(schema, /model UserRoleGrant\b/);
    assert.match(schema, /enum Role/);
  });

  it("feature matrix documents content_admin bulk as conditional", () => {
    const matrix = readFileSync(
      join(ROOT, "lib/auth/role-access-matrix.ts"),
      "utf8",
    );
    assert.match(matrix, /admin-bulk/);
    assert.match(matrix, /conditional/);
    assert.match(matrix, /PR-137/);
  });
});
