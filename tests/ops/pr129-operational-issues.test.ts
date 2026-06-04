import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

const FORBIDDEN_INTAKE_PHRASES = [
  "주민번호를 입력",
  "계약번호를 기록",
  "상담 원문 전체",
  "고객명:",
];

describe("PR129 operational issues ops (static)", () => {
  it("hub links registry, workflow, routing, PII, and template", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-129-OPERATIONAL-ISSUES-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-129-ISSUE-INTAKE-REGISTRY/);
    assert.match(hub, /PR-129-ISSUE-WORKFLOW/);
    assert.match(hub, /PR-129-PII-AND-SENSITIVE-DATA-RULES/);
    assert.match(hub, /문서/);
    assert.match(hub, /PR130/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("intake registry defines OPS id and full field set", () => {
    const registry = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-INTAKE-REGISTRY.md"),
      "utf8",
    );
    assert.match(registry, /OPS-/);
    assert.match(registry, /접수일/);
    assert.match(registry, /기대 동작/);
    assert.match(registry, /재확인/);
    assert.match(registry, /연결 PR/);
    for (const phrase of FORBIDDEN_INTAKE_PHRASES) {
      assert.doesNotMatch(registry, new RegExp(phrase));
    }
  });

  it("issue types cover visibility, bulk, AA, and deployment", () => {
    const types = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-TYPES.md"),
      "utf8",
    );
    assert.match(types, /public visibility/);
    assert.match(types, /Admin bulk/);
    assert.match(types, /Answer Assistant/);
    assert.match(types, /배포/);
    assert.match(types, /PR128/);
  });

  it("severity blocks Critical High from backlog-only closure", () => {
    const sev = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-SEVERITY.md"),
      "utf8",
    );
    assert.match(sev, /Critical/);
    assert.match(sev, /High/);
    assert.match(sev, /backlog/);
    assert.match(sev, /public visibility/);
  });

  it("workflow includes PII removal and re-verify states", () => {
    const workflow = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-WORKFLOW.md"),
      "utf8",
    );
    assert.match(workflow, /민감정보 제거/);
    assert.match(workflow, /재확인 완료/);
    assert.match(workflow, /긴급/);
  });

  it("routing links PR121 through PR130 and high-risk paths", () => {
    const routing = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-TO-PR-ROUTING.md"),
      "utf8",
    );
    assert.match(routing, /PR129/);
    assert.match(routing, /PR130/);
    assert.match(routing, /PR127/);
    assert.match(routing, /PR128/);
    assert.match(routing, /배포 보류/);
  });

  it("PII rules forbid customer identifiers and allow metadata summaries", () => {
    const pii = readFileSync(
      join(ROOT, "docs/PR-129-PII-AND-SENSITIVE-DATA-RULES.md"),
      "utf8",
    );
    assert.match(pii, /고객명/);
    assert.match(pii, /계약번호/);
    assert.match(pii, /상담 원문/);
    assert.match(pii, /metadata/);
  });

  it("report template includes monthly summary and Critical High section", () => {
    const template = readFileSync(
      join(ROOT, "docs/PR-129-ISSUE-REPORT-TEMPLATE.md"),
      "utf8",
    );
    assert.match(template, /월간 운영 이슈 요약/);
    assert.match(template, /Critical\/High/);
  });

  it("operating checklist links PR129 hub", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/OPERATING_QA_CHECKLIST.md"),
      "utf8",
    );
    assert.match(checklist, /PR-129-OPERATIONAL-ISSUES-OPS/);
  });
});
