import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR120 pre-launch final ops (static)", () => {
  it("PR120 hub links summary, risks, checklist, and decision", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-120-PRE-LAUNCH-FINAL-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-120-PR105-119-SUMMARY/);
    assert.match(hub, /PR-120-INTEGRATED-RISKS/);
    assert.match(hub, /PR-120-FINAL-LAUNCH-CHECKLIST/);
    assert.match(hub, /PR-120-LAUNCH-DECISION/);
    assert.match(hub, /조건부 운영 가능/);
  });

  it("PR105-119 summary covers PR105 through PR119", () => {
    const summary = readFileSync(
      join(ROOT, "docs/PR-120-PR105-119-SUMMARY.md"),
      "utf8",
    );
    for (const pr of [
      "PR105",
      "PR106",
      "PR107",
      "PR110",
      "PR115",
      "PR117",
      "PR118",
      "PR119",
    ]) {
      assert.match(summary, new RegExp(pr));
    }
    assert.match(summary, /release:migrate|migrate 없음/);
  });

  it("launch decision defines four outcomes and gates G1 G2 G3", () => {
    const decision = readFileSync(
      join(ROOT, "docs/PR-120-LAUNCH-DECISION.md"),
      "utf8",
    );
    assert.match(decision, /정식 운영 가능/);
    assert.match(decision, /조건부 운영 가능/);
    assert.match(decision, /정식 운영 보류/);
    assert.match(decision, /정식 운영 중단/);
    assert.match(decision, /G1/);
    assert.match(decision, /G2/);
    assert.match(decision, /G3/);
  });

  it("build script does not include migrate deploy", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    assert.doesNotMatch(pkg.scripts.build, /migrate deploy/);
    assert.match(pkg.scripts.build, /prisma generate/);
  });

  it("integrated risks table includes smoke and data gates", () => {
    const risks = readFileSync(
      join(ROOT, "docs/PR-120-INTEGRATED-RISKS.md"),
      "utf8",
    );
    assert.match(risks, /PR117/);
    assert.match(risks, /PR119/);
    assert.match(risks, /Critical/);
  });
});
