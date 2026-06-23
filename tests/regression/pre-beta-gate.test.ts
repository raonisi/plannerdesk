import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { canAccessAdmin, canAccessWorkTools } from "@/lib/auth/rbac";

const ROOT = process.cwd();

const GATE_TEST_PATHS = [
  "tests/public/public-routes-smoke.test.ts",
  "tests/public/public-visibility.test.ts",
  "tests/admin/admin-access-regression.test.ts",
  "tests/ops/pr147-data-responsibility-notice.test.ts",
  "tests/ops/pr148-ai-limited-beta-policy.test.ts",
  "tests/ops/pr149-security-final-audit.test.ts",
  "tests/ops/pr154-public-smoke-expansion.test.ts",
  "tests/ops/pr155-admin-access-regression.test.ts",
  "tests/ops/pr173a-work-tools-access.test.ts",
  "tests/ops/pr-sec-01-work-tools-access-policy.test.ts",
  "tests/public/pr-asset-01-public-asset-governance.test.ts",
  "tests/public/pr-asset-02-authorized-pdf-logo-restore.test.ts",
  "tests/public/pr-asset-04-static-to-firebase-migration.test.ts",
  "tests/public/pr-asset-05-gcs-v4-signer-and-fallback.test.ts",
  "tests/public/pr-asset-06-firebase-safe-canary.test.ts",
  "tests/public/pr-asset-08-nh-single-retry-diagnostics.test.ts",
  "tests/ops/pr173b-work-tools-storage-config.test.ts",
  "tests/ops/pr173c-claim-boundary.test.ts",
] as const;

describe("PR173-D pre-beta regression gate manifest (static, no DB)", () => {
  it("package.json wires answer-assistant and regression suites", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    assert.match(pkg.scripts.test, /test:answer-assistant/);
    assert.match(pkg.scripts.test, /test:regression/);
    assert.match(pkg.scripts["test:public"], /tests\/public/);
    assert.match(pkg.scripts["test:admin"], /tests\/admin/);
    assert.match(pkg.scripts["test:work-tools"], /pr173/);
  });

  it("ci workflow runs lint typecheck and test without migrate deploy", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    assert.match(ci, /npm run lint/);
    assert.match(ci, /npm run typecheck/);
    assert.match(ci, /npm run test/);
    assert.match(ci, /no prisma migrate deploy/i);
    for (const line of ci.split(/\r?\n/)) {
      if (!line.includes("run:")) continue;
      assert.doesNotMatch(line, /migrate deploy|db:seed|prisma db seed/i, line);
    }
  });

  it("gate test files exist on disk", () => {
    for (const rel of GATE_TEST_PATHS) {
      assert.equal(existsSync(join(ROOT, rel)), true, rel);
    }
  });

  it("public cannot access admin or work-tools by rbac", () => {
    assert.equal(canAccessAdmin(null), false);
    assert.equal(canAccessAdmin({ role: "anonymous_public" }), false);
    assert.equal(canAccessWorkTools(null), false);
    assert.equal(canAccessWorkTools({ role: "anonymous_public" }), false);
  });

  it("work-tools page is public and read apis use public read guard", () => {
    const page = readFileSync(join(ROOT, "app/work-tools/page.tsx"), "utf8");
    assert.doesNotMatch(page, /getWorkToolsAccess/);
    for (const route of [
      "app/api/work-tools/diseases/route.ts",
      "app/api/work-tools/storage/route.ts",
    ]) {
      const src = readFileSync(join(ROOT, route), "utf8");
      assert.match(src, /workToolsPublicReadRouteGuard\("/);
    }
  });

  it("admin layout enforces getAdminAccess", () => {
    const layout = readFileSync(join(ROOT, "app/admin/layout.tsx"), "utf8");
    assert.match(layout, /getAdminAccess/);
    assert.match(layout, /AdminAccessDeniedState|AdminLockedState/);
  });

  it("answer assistant uses verified access and metadata-only audit", () => {
    const page = readFileSync(
      join(ROOT, "app/planner/answer-assistant/page.tsx"),
      "utf8",
    );
    assert.match(page, /getVerifiedAnswerAssistantAccess/);
    assert.ok(FORBIDDEN_USAGE_AUDIT_FIELDS.length >= 5);
    const usage = readFileSync(join(ROOT, "lib/answer-assistant/usage-log.ts"), "utf8");
    assert.match(usage, /FORBIDDEN_USAGE_AUDIT_FIELDS/);
  });

  it("payment billing checkout routes are not introduced", () => {
    assert.equal(existsSync(join(ROOT, "app/checkout")), false);
    assert.equal(existsSync(join(ROOT, "app/billing")), false);
    assert.equal(existsSync(join(ROOT, "app/payment")), false);
    assert.equal(existsSync(join(ROOT, "app/api/refund")), false);
  });

  it("public visibility helpers filter unpublished content", () => {
    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(insurers, /verificationStatus: \{ in:/);
  });
});
