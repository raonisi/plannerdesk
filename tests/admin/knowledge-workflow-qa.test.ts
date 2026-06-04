import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = process.cwd();

describe("Knowledge archive workflow (PR113, static)", () => {
  it("admin status labels use operational wording", () => {
    const labels = readFileSync(
      join(ROOT, "lib/knowledge/workflow-labels.ts"),
      "utf8",
    );
    assert.match(labels, /검수 대기/);
    assert.match(labels, /공개 가능/);
    assert.match(labels, /수정 필요/);
    assert.match(labels, /보류/);
  });

  it("admin page includes workflow guide and quick filters", () => {
    const page = readFileSync(join(ROOT, "app/admin/knowledge/page.tsx"), "utf8");
    const guide = readFileSync(
      join(ROOT, "components/admin/knowledge/KnowledgeAdminWorkflowGuide.tsx"),
      "utf8",
    );
    assert.match(page, /KnowledgeAdminWorkflowGuide/);
    assert.match(guide, /검수 대기/);
    assert.match(guide, /공개 가능·미게시/);
  });

  it("registration form documents review steps", () => {
    const form = readFileSync(join(ROOT, "app/admin/knowledge/form.tsx"), "utf8");
    assert.match(form, /KNOWLEDGE_REGISTRATION_STEPS/);
    assert.match(form, /검수 상태/);
    assert.doesNotMatch(form, /검수 없이 공개/);
  });

  it("public archive avoids admin-style status badges on cards", () => {
    const list = readFileSync(
      join(ROOT, "app/knowledge/knowledge-archive-list.tsx"),
      "utf8",
    );
    assert.match(list, /publicKnowledgeTrustHint/);
    assert.doesNotMatch(list, /검수: \{item\.statusLabel\}/);
  });

  it("public knowledge fetch visibility guard unchanged", () => {
    const source = readFileSync(
      join(ROOT, "lib/public/knowledge-articles.ts"),
      "utf8",
    );
    assert.match(source, /PUBLIC_KNOWLEDGE_WHERE/);
    assert.match(source, /isPublished:\s*true/);
    assert.match(source, /KnowledgeArticleStatus\.verified/);
    assert.match(source, /KnowledgeArticleStatus\.needs_review/);
    assert.doesNotMatch(source, /KnowledgeArticleStatus\.draft/);
  });

  it("knowledge bulk actions keep confirmation overrides", () => {
    const list = readFileSync(
      join(ROOT, "app/admin/knowledge/knowledge-admin-list.tsx"),
      "utf8",
    );
    assert.match(list, /KNOWLEDGE_CONFIRM_OVERRIDES/);
    assert.match(list, /executeKnowledgeBulkAction/);
    assert.match(list, /대상 수를 확인/);
  });
});
