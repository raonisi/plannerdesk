import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR130 monthly operations (static)", () => {
  it("hub links cycle summary, template, roadmap, and entry gate", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-130-CYCLE-121-129-SUMMARY/);
    assert.match(hub, /PR-130-MONTHLY-REPORT-TEMPLATE/);
    assert.match(hub, /PR-131-140-ENHANCEMENT-ROADMAP/);
    assert.match(hub, /PR-130-PR131-ENTRY-GATE/);
    assert.match(hub, /조건부/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("cycle summary covers PR121 through PR129", () => {
    const cycle = readFileSync(
      join(ROOT, "docs/PR-130-CYCLE-121-129-SUMMARY.md"),
      "utf8",
    );
    for (const pr of [
      "PR121",
      "PR122",
      "PR123",
      "PR124",
      "PR125",
      "PR126",
      "PR127",
      "PR128",
      "PR129",
    ]) {
      assert.match(cycle, new RegExp(pr));
    }
  });

  it("roadmap defines PR131-140 and scoring without mandating implementation", () => {
    const roadmap = readFileSync(
      join(ROOT, "docs/PR-131-140-ENHANCEMENT-ROADMAP.md"),
      "utf8",
    );
    assert.match(roadmap, /PR131/);
    assert.match(roadmap, /PR140/);
    assert.match(roadmap, /PR134/);
    assert.match(roadmap, /Codex 제한검수/);
    assert.doesNotMatch(roadmap, /무조건 구현/);
  });

  it("entry gate blocks full PR131 when Critical or undocumented High remain", () => {
    const gate = readFileSync(
      join(ROOT, "docs/PR-130-PR131-ENTRY-GATE.md"),
      "utf8",
    );
    assert.match(gate, /조건부/);
    assert.match(gate, /Critical/);
    assert.match(gate, /PR124/);
  });

  it("feedback summary does not instruct collecting customer PII", () => {
    const feedback = readFileSync(
      join(ROOT, "docs/PR-130-FEEDBACK-SUMMARY.md"),
      "utf8",
    );
    const pii = readFileSync(
      join(ROOT, "docs/PR-129-PII-AND-SENSITIVE-DATA-RULES.md"),
      "utf8",
    );
    assert.match(feedback, /Registry/);
    assert.match(pii, /고객명/);
    assert.doesNotMatch(feedback, /주민번호를 입력/);
  });

  it("AA judgment keeps allowlist and no auto expansion", () => {
    const aa = readFileSync(
      join(ROOT, "docs/PR-130-ANSWER-ASSISTANT-JUDGMENT.md"),
      "utf8",
    );
    assert.match(aa, /allowlist/);
    assert.match(aa, /자동 확대 없음/);
    assert.match(aa, /PR137.*보류/);
  });

  it("operating checklist links PR130 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-130-MONTHLY-OPERATIONS-REPORT-OPS/);
  });

  it("monthly template references OPS and FB registries", () => {
    const template = readFileSync(
      join(ROOT, "docs/PR-130-MONTHLY-REPORT-TEMPLATE.md"),
      "utf8",
    );
    assert.match(template, /PR-121-FEEDBACK-INTAKE-REGISTRY/);
    assert.match(template, /PR-129-ISSUE-INTAKE-REGISTRY/);
    assert.match(template, /Critical/);
  });
});
