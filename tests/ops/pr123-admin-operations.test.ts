import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("PR123 admin operations manual (static, no database)", () => {
  it("hub links roles, content ops, bulk, and feedback handling", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-123-ADMIN-OPERATIONS-MANUAL.md"),
      "utf8",
    );
    assert.match(hub, /PR-123-ADMIN-ROLES/);
    assert.match(hub, /PR-123-BULK-OPERATIONS/);
    assert.match(hub, /PR-123-FEEDBACK-AND-FRESHNESS-HANDLING/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("roles document maps code RBAC and workflow roles", () => {
    const roles = readFileSync(
      join(ROOT, "docs/PR-123-ADMIN-ROLES.md"),
      "utf8",
    );
    assert.match(roles, /super_admin/);
    assert.match(roles, /content_admin/);
    assert.match(roles, /reviewer/);
    assert.match(roles, /코드 RBAC/);
    assert.match(roles, /후속 Auth PR/);
  });

  it("content operations cover insurer, claim, and knowledge stages", () => {
    const insurer = readFileSync(
      join(ROOT, "docs/PR-123-INSURER-OPERATIONS.md"),
      "utf8",
    );
    const claim = readFileSync(
      join(ROOT, "docs/PR-123-CLAIM-DOCUMENT-OPERATIONS.md"),
      "utf8",
    );
    const knowledge = readFileSync(
      join(ROOT, "docs/PR-123-KNOWLEDGE-OPERATIONS.md"),
      "utf8",
    );
    for (const doc of [insurer, claim, knowledge]) {
      assert.match(doc, /등록/);
      assert.match(doc, /검수/);
      assert.match(doc, /공개/);
      assert.match(doc, /보류/);
    }
    assert.match(claim, /무조건 필요/);
    assert.match(knowledge, /과장 금지/);
  });

  it("bulk ops forbids unchecked mass publish and importDrafts", () => {
    const bulk = readFileSync(
      join(ROOT, "docs/PR-123-BULK-OPERATIONS.md"),
      "utf8",
    );
    assert.match(bulk, /setPublishedTrue/);
    assert.match(bulk, /importDrafts/);
    assert.match(bulk, /validateServerBulkAction/);
    assert.match(bulk, /금지/);
  });

  it("feedback routing connects PR124 PR126 PR127 PR128", () => {
    const handling = readFileSync(
      join(ROOT, "docs/PR-123-FEEDBACK-AND-FRESHNESS-HANDLING.md"),
      "utf8",
    );
    assert.match(handling, /PR124/);
    assert.match(handling, /PR126/);
    assert.match(handling, /PR127/);
    assert.match(handling, /PR128/);
    assert.match(handling, /정상/);
    assert.match(handling, /수정 필요/);
  });

  it("mistake prevention checklist has fourteen items", () => {
    const checklist = readFileSync(
      join(ROOT, "docs/PR-123-OPERATOR-MISTAKE-PREVENTION.md"),
      "utf8",
    );
    assert.match(checklist, /public visibility/);
    assert.match(checklist, /일괄작업/);
    assert.match(checklist, /OPS-CHK-/);
    const rows = checklist.match(/^\| [0-9]+ \|/gm);
    assert.ok(rows && rows.length >= 10);
  });
});
