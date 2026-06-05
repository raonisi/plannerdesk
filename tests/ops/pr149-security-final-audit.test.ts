import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PR149_SCOPE_NOTICE,
  PR149_SECURITY_VERDICT,
  SECURITY_FINAL_CHECKLIST,
} from "@/lib/ops/security-final-audit";
import { canAccessAdmin, canManageUsers } from "@/lib/auth/rbac";

const ROOT = process.cwd();

describe("PR149 security final audit (static, no auth changes)", () => {
  it("hub forbids RBAC change and links PR139 PR148", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-149-SECURITY-FINAL-AUDIT-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-139-ROLE-ACCESS-OPS/);
    assert.match(hub, /PR-148-AI-LIMITED-BETA/);
    assert.match(hub, /Auth\/RBAC/);
    assert.doesNotMatch(hub, /AUTH_SECRET=/);
    assert.match(hub, /Conditional Go/);
  });

  it("security panel admin only no prisma or role mutation", () => {
    const shell = readFileSync(
      join(ROOT, "components/admin/AdminShell.tsx"),
      "utf8",
    );
    assert.match(shell, /AdminSecurityFinalAuditPanel/);
    const home = readFileSync(join(ROOT, "app/home-client.tsx"), "utf8");
    assert.doesNotMatch(home, /AdminSecurityFinalAuditPanel/);

    const panel = readFileSync(
      join(ROOT, "components/admin/AdminSecurityFinalAuditPanel.tsx"),
      "utf8",
    );
    assert.doesNotMatch(panel, /prisma\./);
    assert.doesNotMatch(panel, /updateRole|updateAllowlist|User\.update/i);
    assert.match(panel, /overflow-x-auto/);
  });

  it("admin layout enforces getAdminAccess", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    assert.match(layout, /AdminAccessDeniedState/);
  });

  it("build script does not run migrate deploy", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    const pkgJson = JSON.parse(pkg) as { scripts: Record<string, string> };
    assert.equal(pkgJson.scripts.build, "prisma generate && next build");
    assert.doesNotMatch(pkgJson.scripts.build, /migrate deploy/);

    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    assert.match(ci, /npm run build/);
    assert.match(ci, /no prisma migrate deploy/i);
  });

  it("no payment or subscription routes or models", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    assert.doesNotMatch(schema, /model Payment\b/);
    assert.doesNotMatch(schema, /model Subscription\b/);

    assert.equal(existsSync(join(ROOT, "app/payment")), false);
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
  });

  it("public visibility uses isPublished guard", () => {
    const vis = readFileSync(
      join(ROOT, "lib/public/visibility.ts"),
      "utf8",
    );
    assert.match(vis, /isPublishedContentPubliclyVisible/);
    const insurers = readFileSync(
      join(ROOT, "lib/public/insurers.ts"),
      "utf8",
    );
    assert.match(insurers, /isPublished:\s*true/);
  });

  it("answer assistant audit schema excludes query and draft", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    const block = schema.slice(
      schema.indexOf("model AnswerAssistantUsageAudit"),
      schema.indexOf("model AnswerAssistantBetaFeedback"),
    );
    assert.doesNotMatch(block, /\bquery\b/);
    assert.doesNotMatch(block, /\bdraft\b/);
  });

  it("security checklist has no gap", () => {
    const gaps = SECURITY_FINAL_CHECKLIST.filter((c) => c.status === "gap");
    assert.equal(gaps.length, 0);
    assert.equal(PR149_SECURITY_VERDICT.pr150Entry, "conditional_go");
  });

  it("rbac content_admin cannot manage users", () => {
    assert.equal(canManageUsers({ role: "content_admin" }), false);
    assert.equal(canManageUsers({ role: "super_admin" }), true);
    assert.equal(canAccessAdmin({ role: "verified_planner" }), false);
  });

  it("scope notice forbids auth and allowlist changes", () => {
    assert.match(PR149_SCOPE_NOTICE, /allowlist/);
    assert.match(PR149_SCOPE_NOTICE, /migration/);
  });

  it("operating checklist links PR149 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-149-SECURITY-FINAL-AUDIT-OPS/);
  });
});
