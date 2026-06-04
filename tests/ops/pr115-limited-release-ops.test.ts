import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR115 limited release final ops (static)", () => {
  it("PR115 document set exists and links PR114", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-115-LIMITED-RELEASE-FINAL-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-115-FINAL-SMOKE-CHECKLIST/);
    assert.match(hub, /PR-115-ROLLBACK-DRILL/);
    assert.match(hub, /PR-115-DEPLOY-DECISION-MATRIX/);
    assert.match(hub, /PR-114-LIMITED-RELEASE-OPS/);
  });

  it("final smoke checklist covers required sections A through G", () => {
    const smoke = readFileSync(
      join(ROOT, "docs/PR-115-FINAL-SMOKE-CHECKLIST.md"),
      "utf8",
    );
    for (const section of [
      "## A. 기본 검증 명령",
      "## B. 정적 Smoke",
      "## C. Public Route Smoke",
      "## D. Admin Route Smoke",
      "## E. Admin Bulk Safety",
      "## F. Answer Assistant Beta",
      "## G. 보험사/청구서류",
    ]) {
      assert.match(smoke, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    assert.match(smoke, /npm run build/);
    assert.doesNotMatch(smoke, /release:migrate.*배포 검증/);
  });

  it("rollback drill is document-only", () => {
    const drill = readFileSync(
      join(ROOT, "docs/PR-115-ROLLBACK-DRILL.md"),
      "utf8",
    );
    assert.match(drill, /실제 rollback/);
    assert.match(drill, /실행하지 않/);
    assert.match(drill, /즉시 중단 조건/);
    assert.match(drill, /rollback 후 확인/);
  });

  it("deploy decision matrix defines four outcomes", () => {
    const matrix = readFileSync(
      join(ROOT, "docs/PR-115-DEPLOY-DECISION-MATRIX.md"),
      "utf8",
    );
    assert.match(matrix, /배포 가능/);
    assert.match(matrix, /조건부 배포 가능/);
    assert.match(matrix, /배포 보류/);
    assert.match(matrix, /배포 중단/);
    assert.match(matrix, /Codex 제한검수/);
  });

  it("build script does not include migrate deploy", () => {
    const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
    assert.match(pkg, /"build": "prisma generate && next build"/);
    assert.doesNotMatch(pkg, /"build":.*migrate deploy/);
  });
});
