import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  publicMessageTemplateCatalog,
  publicMessageTemplateDraftSampleId,
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
  getPublicMessageTemplates,
  isMessageTemplatePubliclyVisible,
} from "@/lib/public/message-templates";
import { resolveVisiblePublicMessageTemplates } from "@/lib/public/public-surface-resolvers";
import { MessageTemplateCategory, MessageTemplateStatus } from "@prisma/client";

const ROOT = process.cwd();

const PR_MESSAGE_01_FORBIDDEN_PHRASES = [
  "가입하셔야 합니다",
  "가입해야 합니다",
  "지금 안 하면 손해입니다",
  "무조건 유리합니다",
  "보험금 받을 수 있습니다",
  "반드시 청구 가능합니다",
  "이 상품이 정답입니다",
  "보장 확정",
  "보험료 절감 확정",
  "모르면 손해",
  "큰일 납니다",
  "위험합니다",
  "누구에게나 좋습니다",
  "병명",
  "진단서",
  "계약번호",
  "주민번호",
  "카톡으로 보내",
  "카카오톡으로 보내",
] as const;

describe("PR-MESSAGE-01 public safe message templates", () => {
  it("static fallback exposes public templates via selector", () => {
    const fallback = getStaticMessageTemplateFallback();
    assert.ok(fallback.length >= 30);
    assert.equal(fallback.length, countStaticMessageTemplateFallback());
    assert.equal(fallback.length, publicMessageTemplateCatalog.length);
  });

  it("every public template has non-empty safeCopy", () => {
    for (const template of getStaticMessageTemplateFallback()) {
      assert.ok(template.safeCopy.trim().length > 0, template.id);
      assert.ok(template.title.trim().length > 0, template.id);
      assert.ok(template.description.trim().length > 0, template.id);
    }
  });

  it("passes prohibited phrase and sensitive variable scans", () => {
    for (const template of getStaticMessageTemplateFallback()) {
      const prohibited = findProhibitedPhrase(template.safeCopy);
      assert.equal(prohibited, null, `${template.id}: ${prohibited}`);
      const sensitive = findSensitiveVariable(template.safeCopy);
      assert.equal(sensitive, null, `${template.id}: ${sensitive}`);
      for (const phrase of PR_MESSAGE_01_FORBIDDEN_PHRASES) {
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

  it("excludes draft sample from public fallback", () => {
    const ids = getStaticMessageTemplateFallback().map((item) => item.id);
    assert.doesNotMatch(ids.join(","), new RegExp(publicMessageTemplateDraftSampleId));
    assert.equal(
      isMessageTemplatePubliclyVisible({
        isPublished: true,
        status: MessageTemplateStatus.published,
        isInternalOnly: false,
        reviewedAt: new Date(),
        safeCopy: "",
      }),
      false,
    );
    assert.equal(
      isMessageTemplatePubliclyVisible({
        isPublished: false,
        status: MessageTemplateStatus.published,
        isInternalOnly: false,
        reviewedAt: new Date(),
        safeCopy: "안내",
      }),
      false,
    );
  });

  it("home resolver count matches static fallback without DB", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const result = await getPublicMessageTemplates();
      assert.equal(result.status, "ok");
      const surface = resolveVisiblePublicMessageTemplates(result);
      assert.equal(surface.surfaceStatus, "ok");
      assert.equal(surface.count, result.data.length);
      assert.equal(surface.count, getStaticMessageTemplateFallback().length);
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it("covers recommended category groups with at least one template", () => {
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
  });

  it("message-templates page uses public fetch helper", () => {
    const page = readFileSync(join(ROOT, "app/message-templates/page.tsx"), "utf8");
    assert.match(page, /getPublicMessageTemplates/);
    assert.match(page, /MessageTemplateLibrary/);
  });

  it("copy UI remains wired in message template library", () => {
    const library = readFileSync(
      join(ROOT, "app/message-templates/message-template-library.tsx"),
      "utf8",
    );
    assert.match(library, /CopyActionButton/);
    assert.match(library, /copyWithFeedback/);
    assert.match(library, /CopyToast/);
    assert.match(library, /PUBLIC_CTA_COPY_SAFE/);
  });

  it("does not hardcode message template count in source", () => {
    for (const rel of [
      "lib/content/public-message-template-catalog.ts",
      "lib/public/message-template-fallback.ts",
      "app/page.tsx",
      "components/dashboard/home-public-stats-strip.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(src, /\b16\b/, rel);
      assert.doesNotMatch(src, /\b12\b/, rel);
    }
  });
});
