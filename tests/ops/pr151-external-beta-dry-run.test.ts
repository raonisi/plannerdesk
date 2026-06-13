import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR150_FINAL_VERDICTS,
  PR150_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/external-release-decision";
import {
  EXTERNAL_BETA_DRY_RUN_CHECKLIST,
  PR151_DRY_RUN_VERDICTS,
  PR151_ENTRY_CONDITIONS,
  PR151_OPEN_CRITICAL_COUNT,
  PR151_SCOPE_NOTICE,
  ROLE_DRY_RUN_SCENARIOS,
} from "@/lib/ops/external-beta-dry-run";
import { canAccessAdmin, canManageUsers } from "@/lib/auth/rbac";

const ROOT = process.cwd();

const PUBLIC_NOTICE_ROUTES = [
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/knowledge/page.tsx",
  "app/search/page.tsx",
] as const;

describe("PR151 external beta dry run (static, no launch)", () => {
  it("hub forbids launch and links PR150 PR149", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-150/);
    assert.match(hub, /PR-149/);
    assert.match(hub, /dry-run|Dry Run/i);
    assert.match(hub, /실행 없음/);
    assert.match(hub, /Conditional Go/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
  });

  it("PR150 entry allows dry-run", () => {
    assert.equal(PR150_FINAL_VERDICTS.limitedExternalBeta, "conditional_go");
    assert.equal(PR150_OPEN_CRITICAL_COUNT, 0);
    const unmet = PR151_ENTRY_CONDITIONS.filter((c) => !c.met);
    assert.equal(unmet.length, 0);
  });

  it("dry-run panel admin only no deploy or role writes", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminPlanningPanels.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminExternalBetaDryRunPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminExternalBetaDryRunPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminExternalBetaDryRunPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /deploy|push|allowlist|updateRole|beta user/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("role scenarios cover public planner admin aa beta", () => {
    assert.equal(ROLE_DRY_RUN_SCENARIOS.length, 11);
    const text = ROLE_DRY_RUN_SCENARIOS.map((r) => r.scenario).join(" ");
    assert.match(text, /public user/);
    assert.match(text, /allowlisted/);
    assert.match(text, /content_admin/);
    assert.match(text, /super_admin/);
    assert.match(text, /beta user/);
    const fails = ROLE_DRY_RUN_SCENARIOS.filter((r) => r.status === "fail");
    assert.equal(fails.length, 0);
  });

  it("dry run conditional pr157 no_go no critical fails in checklist", () => {
    assert.equal(PR151_DRY_RUN_VERDICTS.externalBetaDryRun, "conditional_go");
    assert.equal(PR151_DRY_RUN_VERDICTS.pr152Entry, "conditional_go");
    assert.equal(PR151_DRY_RUN_VERDICTS.pr157LaunchDecision, "no_go");
    assert.equal(PR151_OPEN_CRITICAL_COUNT, 0);
    const fails = EXTERNAL_BETA_DRY_RUN_CHECKLIST.filter((c) => c.status === "fail");
    assert.equal(fails.length, 0);
  });

  it("scope forbids beta user and allowlist change", () => {
    assert.match(PR151_SCOPE_NOTICE, /beta user|allowlist/);
    assert.match(PR151_SCOPE_NOTICE, /배포|외부 공개/);
  });

  it("public routes have data responsibility notice", () => {
    for (const route of PUBLIC_NOTICE_ROUTES) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /DataResponsibilityInlineNotice/);
    }
  });

  it("no payment routes and admin layout guards", () => {
    assert.equal(existsSync(join(ROOT, "app/payment")), false);
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    assert.equal(canAccessAdmin({ role: "verified_planner" }), false);
    assert.equal(canManageUsers({ role: "content_admin" }), false);
  });

  it("answer assistant only under planner not public root", () => {
    assert.equal(existsSync(join(ROOT, "app/answer-assistant")), false);
    assert.equal(existsSync(join(ROOT, "app/planner/answer-assistant")), true);
    const access = readFileSync(
      join(ROOT, "lib/answer-assistant/verified-access.ts"),
      "utf8",
    );
    assert.match(access, /not_allowlisted/);
  });

  it("build script does not run migrate deploy", () => {
    const pkgJson = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    assert.equal(pkgJson.scripts.build, "prisma generate && next build");
  });

  it("operating checklist links PR151 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-151-EXTERNAL-BETA-DRY-RUN-OPS/);
  });

  it("PR140 deferred roadmap marks PR151 complete", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-140-DEFERRED-PR-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR151-A 완료/);
  });
});
