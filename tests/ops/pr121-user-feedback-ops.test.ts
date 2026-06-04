import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR121 user feedback ops (static)", () => {
  it("hub links registry, types, workflow, routing, and PII rules", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-121-USER-FEEDBACK-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-121-FEEDBACK-INTAKE-REGISTRY/);
    assert.match(hub, /PR-121-FEEDBACK-WORKFLOW/);
    assert.match(hub, /PR-121-SENSITIVE-DATA-RULES/);
    assert.match(hub, /문서/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("intake registry defines full field set and status", () => {
    const registry = readFileSync(
      join(ROOT, "docs/PR-121-FEEDBACK-INTAKE-REGISTRY.md"),
      "utf8",
    );
    assert.match(registry, /접수일/);
    assert.match(registry, /기대 동작/);
    assert.match(registry, /처리 상태/);
    assert.match(registry, /처리 PR/);
    assert.match(registry, /FB-/);
  });

  it("feedback types include data and permission categories", () => {
    const types = readFileSync(
      join(ROOT, "docs/PR-121-FEEDBACK-TYPES.md"),
      "utf8",
    );
    assert.match(types, /데이터 누락/);
    assert.match(types, /권한 문제/);
    assert.match(types, /Answer Assistant/);
    assert.match(types, /PR124/);
  });

  it("severity defines Critical and High handling", () => {
    const sev = readFileSync(
      join(ROOT, "docs/PR-121-FEEDBACK-SEVERITY-AND-PRIORITY.md"),
      "utf8",
    );
    assert.match(sev, /Critical/);
    assert.match(sev, /High/);
    assert.match(sev, /P0/);
  });

  it("workflow documents triage flow and separates AA feedback", () => {
    const workflow = readFileSync(
      join(ROOT, "docs/PR-121-FEEDBACK-WORKFLOW.md"),
      "utf8",
    );
    assert.match(workflow, /피드백 접수/);
    assert.match(workflow, /별도 PR/);
    assert.match(workflow, /공식 출처/);
  });

  it("PII rules forbid customer medical and credentials", () => {
    const pii = readFileSync(
      join(ROOT, "docs/PR-121-SENSITIVE-DATA-RULES.md"),
      "utf8",
    );
    assert.match(pii, /고객/);
    assert.match(pii, /비밀번호/);
    assert.match(pii, /allowlist/);
  });
});
