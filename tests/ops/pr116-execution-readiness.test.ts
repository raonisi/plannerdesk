import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR116 limited release execution readiness (static)", () => {
  it("PR116 document set exists and links PR115", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-116-LIMITED-RELEASE-EXECUTION-READINESS.md"),
      "utf8",
    );
    assert.match(hub, /PR-116-PRE-DEPLOY-EXECUTION-CHECKLIST/);
    assert.match(hub, /PR-116-DEPLOY-EXECUTION-READINESS-DECISION/);
    assert.match(hub, /PR-115-LIMITED-RELEASE-FINAL-OPS/);
    assert.match(hub, /실제 배포/);
    assert.doesNotMatch(hub, /railway up/i);
  });

  it("execution checklist covers A through G without secret values", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/PR-116-PRE-DEPLOY-EXECUTION-CHECKLIST.md"),
      "utf8",
    );
    for (const section of [
      "## A. Git",
      "## B. 검증 명령",
      "## C. 환경변수",
      "## D. DB / Migration",
      "## E. 관리자 접근",
      "## F. 배포 후 Smoke",
      "## G. 중단 조건",
    ]) {
      assert.match(checklist, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    assert.match(checklist, /값 출력 금지/);
    assert.match(checklist, /release:migrate.*실행하지 않/);
    assert.match(checklist, /rollback 대상/);
    assert.match(checklist, /DATABASE_URL/);
    assert.doesNotMatch(checklist, /postgresql:\/\/.+@/);
  });

  it("decision matrix defines four deploy outcomes", () => {
    const matrix = readFileSync(
      join(ROOT, "docs/PR-116-DEPLOY-EXECUTION-READINESS-DECISION.md"),
      "utf8",
    );
    assert.match(matrix, /배포 가능/);
    assert.match(matrix, /조건부 배포 가능/);
    assert.match(matrix, /배포 보류/);
    assert.match(matrix, /배포 중단/);
    assert.match(matrix, /migration 실행/);
    assert.match(matrix, /Rollback 대상 commit/);
  });

  it("env example lists auth and db variable names only as placeholders", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");
    assert.match(example, /DATABASE_URL=/);
    assert.match(example, /AUTH_SECRET=/);
    assert.doesNotMatch(example, /postgresql:\/\/[^=\s]+@/);
  });
});
