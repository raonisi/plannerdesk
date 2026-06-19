import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { knowledgeFallbackCatalog } from "@/lib/content/knowledge-fallback-catalog";
import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { claimDocumentCandidateFallback } from "@/lib/content/claim-document-candidates";
import {
  findProhibitedPhrase,
  MESSAGE_TEMPLATE_PROHIBITED_PHRASES,
} from "@/lib/message-template/safety";
import {
  countStaticKnowledgeFallback,
  getStaticKnowledgeFallback,
  getStaticKnowledgeFallbackBySlug,
} from "@/lib/public/knowledge-fallback";
import {
  getPublicKnowledgeArticles,
  isKnowledgeArticlePubliclyVisible,
} from "@/lib/public/knowledge-articles";
import {
  resolveVisiblePublicClaimLibrarySurface,
  resolveVisiblePublicKnowledgeArticles,
} from "@/lib/public/public-surface-resolvers";
import { KnowledgeArticleStatus } from "@prisma/client";

const ROOT = process.cwd();

const PR_UX_01_FORBIDDEN_PHRASES = [
  "보험금 받을 수 있습니다",
  "반드시 청구 가능합니다",
  "무조건 보장됩니다",
  "가입하셔야 합니다",
  "가입해야 합니다",
  "이 상품이 정답입니다",
  "지금 안 하면 손해입니다",
  "모르면 손해입니다",
  "큰일 납니다",
  "위험합니다",
  "보험료 절감 확정",
  "보장 확정",
  "누구에게나 좋습니다",
  "주민번호",
  "계약번호를 카톡",
  "진단서를 보내",
] as const;

describe("PR-UX-01 knowledge static fallback", () => {
  it("exposes at least five public knowledge articles from fallback", () => {
    const articles = getStaticKnowledgeFallback();
    assert.ok(articles.length >= 5);
    assert.ok(articles.length <= 10);
    assert.equal(articles.length, countStaticKnowledgeFallback());
    assert.equal(articles.length, knowledgeFallbackCatalog.length);
  });

  it("home resolver count matches public knowledge selector without DB", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await getPublicKnowledgeArticles();
      assert.equal(result.status, "ok");
      assert.ok(result.articles.length > 0);
      const surface = resolveVisiblePublicKnowledgeArticles(result);
      assert.equal(surface.surfaceStatus, "ok");
      assert.equal(surface.count, result.articles.length);
      assert.equal(surface.count, getStaticKnowledgeFallback().length);
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("serves fallback detail pages by slug", () => {
    const article = getStaticKnowledgeFallbackBySlug("claim-before-basic-check");
    assert.ok(article);
    assert.ok(article.bodyParagraphs.length > 0);
    assert.match(article.summary, /청구/);
  });

  it("excludes draft/archived visibility from public fallback policy", () => {
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
  });

  it("passes prohibited phrase scans on public fallback text", () => {
    for (const article of getStaticKnowledgeFallback()) {
      const detail = getStaticKnowledgeFallbackBySlug(article.slug);
      assert.ok(detail);
      const corpus = [
        article.title,
        article.summary,
        detail.content,
        detail.safeCopy ?? "",
      ].join("\n");
      assert.equal(findProhibitedPhrase(corpus), null, article.slug);
      for (const phrase of PR_UX_01_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(
          corpus,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${article.slug}: ${phrase}`,
        );
      }
      for (const phrase of MESSAGE_TEMPLATE_PROHIBITED_PHRASES) {
        assert.doesNotMatch(
          corpus,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${article.slug}: ${phrase}`,
        );
      }
    }
  });

  it("does not hardcode knowledge count in source", () => {
    for (const rel of [
      "lib/content/knowledge-fallback-catalog.ts",
      "lib/public/knowledge-fallback.ts",
      "app/page.tsx",
      "components/dashboard/home-public-stats-strip.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /\b10\b/, rel);
    }
  });

  it("preserves claim library SSOT count at 220 guides+pdfs baseline", () => {
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      {},
    );
    const items = buildClaimLibraryItems(surface.guideDocuments, {});
    assert.equal(surface.libraryItemCount, items.length);
    assert.equal(
      surface.libraryItemCount,
      countPublicClaimLibraryItems(surface.guideDocuments, {}),
    );
    assert.ok(surface.guideDocuments.length >= claimDocumentCandidateFallback.length);
    assert.ok(surface.libraryItemCount > surface.guideDocuments.length);
  });

  it("knowledge page wires category filters instead of self-loop links", () => {
    const page = readFileSync(join(ROOT, "app/knowledge/page.tsx"), "utf8");
    assert.match(page, /category=\$\{KnowledgeArticleCategory\.underwriting\}/);
    assert.match(page, /category=\$\{KnowledgeArticleCategory\.cancellation\}/);
    assert.match(page, /category=\$\{KnowledgeArticleCategory\.operation_safety\}/);
    assert.doesNotMatch(page, /href: "\/knowledge", label: "고지 관련/);
  });
});
