import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  KNOWLEDGE_SEED_ITEMS,
  KNOWLEDGE_DETAIL_SLUGS,
} from "@/app/knowledge/knowledge-seed";
import { isKnowledgeArticlePubliclyVisible } from "@/lib/public/knowledge-articles";
import { KnowledgeArticleStatus } from "@prisma/client";

const ROOT = process.cwd();

const FORBIDDEN_PHRASES = [
  "무조건",
  "반드시 지급",
  "즉시 지급",
  "보험금 확정",
  "가입하면 해결",
  "설득 필살기",
];

describe("PR125 knowledge quality ops (static, no database)", () => {
  it("hub links standards, classification, change log, visibility", () => {
    const hub = readFileSync(
      join(ROOT, "docs/PR-125-KNOWLEDGE-QUALITY-OPS.md"),
      "utf8",
    );
    assert.match(hub, /PR-125-CONTENT-QUALITY-STANDARDS/);
    assert.match(hub, /PR-125-CONTENT-CHANGE-LOG/);
    assert.match(hub, /미접근/);
    assert.doesNotMatch(hub, /AUTH_SECRET=[^<\s]/);
  });

  it("seed items have slugs and needs_review status", () => {
    assert.equal(KNOWLEDGE_SEED_ITEMS.length, 10);
    for (const item of KNOWLEDGE_SEED_ITEMS) {
      assert.ok(item.slug?.trim(), item.id);
      assert.equal(item.status, "needs_review", item.id);
      assert.equal(item.aiUsable, false, item.id);
    }
    const slugs = new Set(KNOWLEDGE_SEED_ITEMS.map((i) => i.slug));
    assert.equal(slugs.size, 10);
  });

  it("seed titles and summaries avoid forbidden claim phrases", () => {
    for (const item of KNOWLEDGE_SEED_ITEMS) {
      const text = `${item.title} ${item.summary}`;
      for (const phrase of FORBIDDEN_PHRASES) {
        assert.doesNotMatch(
          text,
          new RegExp(phrase),
          `${item.id} contains "${phrase}"`,
        );
      }
    }
  });

  it("seed item 4 uses practical actual-expense title pattern", () => {
    const item = KNOWLEDGE_SEED_ITEMS.find((i) => i.id === "knowledge-4");
    assert.ok(item);
    assert.match(item.title, /실손 청구 전 확인할 기본 서류/);
    assert.equal(item.slug, "actual-expense-claim-basic-documents");
  });

  it("detail slugs remain subset of seed slugs", () => {
    const seedSlugs = new Set(KNOWLEDGE_SEED_ITEMS.map((i) => i.slug));
    for (const slug of KNOWLEDGE_DETAIL_SLUGS) {
      assert.ok(seedSlugs.has(slug), slug);
    }
  });

  it("visibility guard blocks draft and archived knowledge", () => {
    assert.equal(
      isKnowledgeArticlePubliclyVisible({
        isPublished: true,
        status: KnowledgeArticleStatus.draft,
      }),
      false,
    );
    assert.equal(
      isKnowledgeArticlePubliclyVisible({
        isPublished: true,
        status: KnowledgeArticleStatus.archived,
      }),
      false,
    );
    assert.equal(
      isKnowledgeArticlePubliclyVisible({
        isPublished: true,
        status: KnowledgeArticleStatus.needs_review,
      }),
      true,
    );
  });

  it("quality standards document defines good and bad tags", () => {
    const standards = readFileSync(
      join(ROOT, "docs/PR-125-CONTENT-QUALITY-STANDARDS.md"),
      "utf8",
    );
    assert.match(standards, /실손/);
    assert.match(standards, /무조건/);
    assert.match(standards, /피해야 할 태그/);
  });
});
