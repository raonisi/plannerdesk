import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR118 user feedback ops (static)", () => {
  it("PR118 hub states no feedback and no arbitrary features", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-118-USER-FEEDBACK-OPS.md"),
      "utf8",
    );
    assert.match(hub, /피드백 정보 부족/);
    assert.match(hub, /임의/);
    assert.match(hub, /PR-118-USER-FEEDBACK-INTAKE/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("intake form defines feedback table columns", () => {
    const intake = readFileSync(
      join(ROOT, "docs/PR-118-USER-FEEDBACK-INTAKE.md"),
      "utf8",
    );
    assert.match(intake, /피드백 원문/);
    assert.match(intake, /불편 유형/);
    assert.match(intake, /심각도/);
    assert.match(intake, /미수집/);
  });

  it("triage doc lists screen areas and PR119 handoff", () => {
    const triage = readFileSync(
      join(ROOT, "docs/PR-118-FEEDBACK-TRIAGE-AND-PLAN.md"),
      "utf8",
    );
    assert.match(triage, /보험사 디렉터리/);
    assert.match(triage, /Answer Assistant/);
    assert.match(triage, /PR119/);
    assert.match(triage, /즉시 반영/);
    assert.match(triage, /product code 수정/);
  });

  it("PR119 data quality doc exists and references handoff items", () => {
    const pr119 = readFileSync(
      join(ROOT, "docs/PR-119-OPERATIONAL-DATA-QUALITY-OPS.md"),
      "utf8",
    );
    assert.match(pr119, /청구서류/);
    assert.match(pr119, /public visibility guard/);
  });
});
