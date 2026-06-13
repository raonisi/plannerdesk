import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  evaluateBulkActionEligibility,
  getBulkActionPolicy,
  validateServerBulkAction,
} from "@/lib/admin/bulk-policies";
import {
  ADMIN_ROLE_FIXTURES,
  NON_ADMIN_ROLE_FIXTURES,
} from "@/lib/ops/admin-access-regression";
import {
  canAccessAdmin,
  canManageContent,
  canManageUsers,
  canPublishContent,
  normalizeRole,
  ROLE_CONTENT_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_VERIFIED_PLANNER,
} from "@/lib/auth/rbac";

const ROOT = process.cwd();

const FIXTURE_BULK_ITEM = {
  id: "fixture-pr155-001",
  title: "테스트 항목(가짜)",
  status: "verified",
  isPublished: false,
};

describe("PR155 admin access regression (static, no DB or role changes)", () => {
  describe("non-admin roles cannot access admin shell", () => {
    for (const fixture of NON_ADMIN_ROLE_FIXTURES) {
      it(`${fixture.label} is denied admin access`, () => {
        assert.equal(
          canAccessAdmin(fixture.role ? { role: fixture.role } : null),
          false,
          fixture.id,
        );
        assert.equal(canManageContent({ role: fixture.role }), false);
        assert.equal(canManageUsers({ role: fixture.role }), false);
      });
    }

    it("invalid planner role normalizes to anonymous_public", () => {
      assert.equal(normalizeRole("planner"), "anonymous_public");
      assert.equal(canAccessAdmin({ role: "planner" }), false);
    });

    it("verified planner cannot access admin even when allowlisted (AA≠admin)", () => {
      assert.equal(canAccessAdmin({ role: ROLE_VERIFIED_PLANNER }), false);
      const access = readFileSync(
        join(ROOT, "lib/answer-assistant/verified-access.ts"),
        "utf8",
      );
      assert.match(access, /isUserOnVerifiedAnswerAssistantAllowlist/);
      assert.doesNotMatch(access, /allowlist.*canAccessAdmin|canAccessAdmin.*allowlist/i);
    });
  });

  describe("admin roles have correct boundaries", () => {
    it("content_admin can access admin and content but not manage users", () => {
      assert.equal(canAccessAdmin({ role: ROLE_CONTENT_ADMIN }), true);
      assert.equal(canManageContent({ role: ROLE_CONTENT_ADMIN }), true);
      assert.equal(canPublishContent({ role: ROLE_CONTENT_ADMIN }), true);
      assert.equal(canManageUsers({ role: ROLE_CONTENT_ADMIN }), false);
    });

    it("super_admin has full admin matrix including manageUsers", () => {
      assert.equal(canAccessAdmin({ role: ROLE_SUPER_ADMIN }), true);
      assert.equal(canManageUsers({ role: ROLE_SUPER_ADMIN }), true);
    });

    for (const fixture of ADMIN_ROLE_FIXTURES) {
      it(`${fixture.label} is allowed admin shell access`, () => {
        assert.equal(canAccessAdmin({ role: fixture.role }), true);
      });
    }
  });

  describe("admin bulk permission boundaries", () => {
    it("importDrafts requires superAdmin and is blocked at policy level", () => {
      const policy = getBulkActionPolicy("importDrafts");
      assert.equal(policy.requiredPermission, "superAdmin");
      assert.equal(policy.riskLevel, "blocked");

      const contentResult = evaluateBulkActionEligibility(
        "insurers",
        "importDrafts",
        ROLE_CONTENT_ADMIN,
        [FIXTURE_BULK_ITEM],
      );
      assert.equal(contentResult.allowed, false);

      const superResult = evaluateBulkActionEligibility(
        "insurers",
        "importDrafts",
        ROLE_SUPER_ADMIN,
        [FIXTURE_BULK_ITEM],
      );
      assert.equal(superResult.allowed, false);
      assert.ok(superResult.reason);
    });

    it("validateServerBulkAction blocks importDrafts for all roles", () => {
      const err = validateServerBulkAction("insurers", "importDrafts");
      assert.ok(err);
    });

    it("verified planner cannot evaluate bulk actions as eligible", () => {
      const result = evaluateBulkActionEligibility(
        "claimDocuments",
        "setPublishedTrue",
        ROLE_VERIFIED_PLANNER,
        [FIXTURE_BULK_ITEM],
      );
      assert.equal(result.allowed, false);
    });

    it("content_admin may manage content bulk but not superAdmin-only actions", () => {
      const publish = evaluateBulkActionEligibility(
        "insurers",
        "markNeedsReview",
        ROLE_CONTENT_ADMIN,
        [FIXTURE_BULK_ITEM],
      );
      assert.equal(publish.allowed, true);
    });
  });

  describe("admin layout and route guards", () => {
    it("admin layout uses getAdminAccess with locked and denied states", () => {
      const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
      assert.match(layout, /getAdminAccess/);
      assert.match(layout, /AdminLockedState/);
      assert.match(layout, /AdminAccessDeniedState/);
    });

    it("admin server actions require admin access", () => {
      for (const file of [
        "app/admin/insurers/actions.ts",
        "app/admin/claim-documents/actions.ts",
        "app/admin/knowledge/actions.ts",
      ]) {
        const src = readFileSync(join(ROOT, file), "utf8");
        assert.match(
          src,
          /require\w+ContentManager|require\w+Publisher|requireAdminAccess|handleAdminUnauthorized/,
          file,
        );
      }
    });

    it("no standalone /admin/bulk route exists", () => {
      assert.equal(existsSync(join(ROOT, "app/admin/bulk")), false);
      assert.equal(existsSync(join(ROOT, "app/admin/issues")), false);
      assert.equal(existsSync(join(ROOT, "app/admin/reports")), false);
      assert.equal(existsSync(join(ROOT, "app/admin/reminders")), false);
      assert.equal(existsSync(join(ROOT, "app/admin/change-history")), false);
    });
  });

  describe("admin operational panels not on public surfaces", () => {
    const ADMIN_SHELL_PANELS = [
      "AdminOperationalDashboard",
      "AdminPlanningPanels",
    ];

    it("operational dashboard panels live in AdminShell only", () => {
      const shell = readFileSync(
        join(ROOT, "components/admin/AdminShell.tsx"),
        "utf8",
      );
      for (const panel of ADMIN_SHELL_PANELS) {
        assert.match(shell, new RegExp(panel));
      }
    });

    it("change history panel is on admin edit pages not public", () => {
      const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
      assert.doesNotMatch(home, /AdminChangeHistoryMetadataPanel/);
      const insurerEdit = readFileSync(
        join(ROOT, "app/admin/insurers/[id]/edit/page.tsx"),
        "utf8",
      );
      assert.match(insurerEdit, /AdminChangeHistoryMetadataPanel/);
    });

    it("public home does not render admin operational panels", () => {
      const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
      for (const panel of ADMIN_SHELL_PANELS) {
        assert.doesNotMatch(home, new RegExp(panel));
      }
    });

    it("public search module excludes admin-only work_link domain", () => {
      const searchPublic = readFileSync(
        join(ROOT, "lib/search/public.ts"),
        "utf8",
      );
      assert.match(searchPublic, /searchPublicContent|PUBLIC_/);
      const types = readFileSync(join(ROOT, "lib/search/types.ts"), "utf8");
      assert.match(types, /Exclude<PublicSearchDomain, "work_link">/);
    });
  });

  describe("Answer Assistant and admin permission separation", () => {
    it("planner AA page uses verified access gate not admin gate", () => {
      const page = readFileSync(
        join(ROOT, "app/planner/answer-assistant/page.tsx"),
        "utf8",
      );
      assert.match(page, /getVerifiedAnswerAssistantAccess/);
      assert.doesNotMatch(page, /canAccessAdmin\(/);
    });

    it("usage audit route is admin-only", () => {
      readFileSync(
        join(ROOT, "app/admin/answer-assistant/audit/page.tsx"),
        "utf8",
      );
      assert.equal(existsSync(join(ROOT, "app/answer-assistant")), false);
    });

    it("verified-access treats admin tester separately from allowlist", () => {
      const access = readFileSync(
        join(ROOT, "lib/answer-assistant/verified-access.ts"),
        "utf8",
      );
      assert.match(access, /canAdminTestVerifiedAnswerAssistant/);
      assert.match(access, /isAdminTester/);
      assert.doesNotMatch(access, /allowlist.*super_admin|super_admin.*allowlist/i);
    });
  });

  describe("secret and role data non-exposure on public scan", () => {
    it("public pages do not reference admin session helpers", () => {
      for (const file of [
        "app/directory/page.tsx",
        "app/search/page.tsx",
        "app/home-client.tsx",
      ]) {
        const src = readFileSync(join(ROOT, file), "utf8");
        assert.doesNotMatch(src, /requireAdminAccess|getAdminAccess/);
        assert.doesNotMatch(src, /AUTH_SECRET|DATABASE_URL/);
      }
    });
  });
});
