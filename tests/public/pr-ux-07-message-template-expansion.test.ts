import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  publicMessageTemplateCatalog,
} from "@/lib/content/public-message-template-catalog";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
  MESSAGE_TEMPLATE_PROHIBITED_PHRASES,
} from "@/lib/message-template/safety";
import {
  countStaticMessageTemplateFallback,
  getStaticMessageTemplateFallback,
} from "@/lib/public/message-template-fallback";
import {
  applySafeCopyPlaceholders,
  publicMessageCategoryFilterTabs,
  publicMessageCategoryLabels,
} from "@/lib/public/message-template-display";
import {
  getPublicMessageTemplates,
} from "@/lib/public/message-templates";
import { resolveVisiblePublicMessageTemplates } from "@/lib/public/public-surface-resolvers";
import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { resolveVisiblePublicClaimDocuments } from "@/lib/public/public-surface-resolvers";
import { MessageTemplateCategory } from "@prisma/client";

const ROOT = process.cwd();

const PR_UX_07_FORBIDDEN_PHRASES = [
  "가입하셔야 합니다",
  "가입해야 합니다",
  "지금 가입하세요",
  "이 상품이 답입니다",
  "누구에게나 유리합니다",
  "무조건 보장됩니다",
  "보험금이 나옵니다",
  "반드시 청구 가능합니다",
  "보험료가 줄어듭니다",
  "지금 안 하면 손해입니다",
  "모르면 손해입니다",
  "큰일 납니다",
  "무조건 바꾸세요",
  "반드시 해지하세요",
] as const;

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-UX-07 message template expansion", () => {
  it("public fallback exposes at least 30 templates via selector", () => {
    const fallback = getStaticMessageTemplateFallback();
    assert.ok(fallback.length >= 30, `expected >= 30, got ${fallback.length}`);
    assert.equal(fallback.length, countStaticMessageTemplateFallback());
    assert.equal(fallback.length, publicMessageTemplateCatalog.length);
  });

  it("has no duplicate ids, titles, or safeCopy bodies", () => {
    const fallback = getStaticMessageTemplateFallback();
    const ids = new Set<string>();
    const titles = new Set<string>();
    const copies = new Set<string>();

    for (const template of fallback) {
      assert.ok(!ids.has(template.id), template.id);
      assert.ok(!titles.has(template.title), template.title);
      assert.ok(!copies.has(template.safeCopy.trim()), template.id);
      ids.add(template.id);
      titles.add(template.title);
      copies.add(template.safeCopy.trim());
    }
  });

  it("passes safety scans on every public template", () => {
    for (const template of getStaticMessageTemplateFallback()) {
      assert.ok(template.safeCopy.trim().length > 0, template.id);
      assert.equal(findProhibitedPhrase(template.safeCopy), null, template.id);
      assert.equal(findSensitiveVariable(template.safeCopy), null, template.id);

      for (const phrase of PR_UX_07_FORBIDDEN_PHRASES) {
        assert.doesNotMatch(
          template.safeCopy,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${template.id}: ${phrase}`,
        );
      }
      for (const phrase of MESSAGE_TEMPLATE_PROHIBITED_PHRASES) {
        assert.doesNotMatch(
          template.safeCopy,
          new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
          `${template.id}: ${phrase}`,
        );
      }
    }
  });

  it("does not request sensitive PII via message copy", () => {
    const combined = getStaticMessageTemplateFallback()
      .map((item) => item.safeCopy)
      .join("\n");

    for (const phrase of [
      "진단명을 보내",
      "병력 전체",
      "신분증 사진",
      "계약번호 전체",
      "카드번호",
      "비밀번호",
    ]) {
      assert.doesNotMatch(combined, new RegExp(phrase));
    }

    const privacyTemplates = getStaticMessageTemplateFallback().filter((item) =>
      item.safeCopy.includes("민감한"),
    );
    assert.ok(privacyTemplates.length >= 2);
  });

  it("supports placeholder substitution for customer name", () => {
    const withName = getStaticMessageTemplateFallback().find((item) =>
      item.safeCopy.includes("{고객명}"),
    );
    assert.ok(withName);
    const replaced = applySafeCopyPlaceholders(
      withName!.safeCopy,
      "홍길동",
      "김설계",
    );
    assert.match(replaced, /홍길동/);
    assert.doesNotMatch(replaced, /\{고객명\}/);
  });

  it("covers expanded category groups including contract maintenance", () => {
    const categories = new Set(
      getStaticMessageTemplateFallback().map((item) => item.category),
    );
    for (const category of [
      MessageTemplateCategory.greeting,
      MessageTemplateCategory.follow_up,
      MessageTemplateCategory.appointment,
      MessageTemplateCategory.policy_review,
      MessageTemplateCategory.claim_guide,
      MessageTemplateCategory.contract_maintenance,
      MessageTemplateCategory.customer_care,
      MessageTemplateCategory.notice,
      MessageTemplateCategory.cancellation_defense,
    ]) {
      assert.ok(categories.has(category), category);
    }

    assert.ok(
      publicMessageCategoryFilterTabs.some(
        (tab) => tab.id === MessageTemplateCategory.contract_maintenance,
      ),
    );
    assert.equal(
      publicMessageCategoryLabels[MessageTemplateCategory.contract_maintenance],
      "계약 유지",
    );
  });

  it("home resolver count matches public selector without DB", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await getPublicMessageTemplates();
      assert.equal(result.status, "ok");
      const surface = resolveVisiblePublicMessageTemplates(result);
      assert.equal(surface.count, result.data.length);
      assert.ok(surface.count >= 30);
      assert.equal(surface.count, getStaticMessageTemplateFallback().length);
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("message template library keeps search, filter, and copy wiring", () => {
    const library = readSource("app/message-templates/message-template-library.tsx");
    assert.match(library, /CopyActionButton/);
    assert.match(library, /applySafeCopyPlaceholders/);
    assert.match(library, /publicMessageCategoryFilterTabs/);
    assert.match(library, /PUBLIC_CTA_COPY_SAFE/);
  });

  it("preserves claim library 220 count and avoids schema changes", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    assert.equal(buildClaimLibraryItems(guides, {}).length, 220);
    assert.equal(countPublicClaimLibraryItems(guides, {}), 220);

    const schema = readSource("prisma/schema.prisma");
    assert.doesNotMatch(schema, /messageTemplateCount/);
  });
});
