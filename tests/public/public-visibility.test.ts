import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { VerificationStatus } from "@prisma/client";
import {
  DisclosureLinkStatus,
  KnowledgeArticleStatus,
  MessageTemplateStatus,
} from "@prisma/client";
import {
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
  PUBLIC_VERIFICATION_STATUSES,
} from "@/lib/public/insurers";
import { isClaimDocumentPubliclyVisible } from "@/lib/public/claim-documents";
import {
  isKnowledgeArticlePubliclyVisible,
  PUBLIC_KNOWLEDGE_ARTICLE_STATUSES,
  PUBLIC_KNOWLEDGE_WHERE,
} from "@/lib/public/knowledge-articles";
import {
  getPublicDisclosureLinks,
  isDisclosureLinkPubliclyVisible,
  PUBLIC_DISCLOSURE_LINK_WHERE,
} from "@/lib/public/disclosure-links";
import {
  isMessageTemplatePubliclyVisible,
  PUBLIC_MESSAGE_TEMPLATE_WHERE,
} from "@/lib/public/message-templates";
import {
  isPublishedContentPubliclyVisible,
  wouldPublishDraft,
} from "@/lib/public/visibility";

describe("Public visibility guards (PR110, no database)", () => {
  describe("verification content (insurer, claim document)", () => {
    it("allows published verified and needs_review only", () => {
      for (const status of PUBLIC_VERIFICATION_STATUSES) {
        assert.equal(
          isPublishedContentPubliclyVisible({
            isPublished: true,
            verificationStatus: status,
          }),
          true,
        );
      }
    });

    it("blocks draft, unverified, pending, and unpublished", () => {
      const blocked: VerificationStatus[] = [
        VerificationStatus.draft,
        VerificationStatus.unverified,
        VerificationStatus.pending,
      ];
      for (const status of blocked) {
        assert.equal(isPublicVerificationStatus(status), false);
        assert.equal(
          isInsurerPubliclyVisible({
            isPublished: true,
            verificationStatus: status,
          }),
          false,
        );
        assert.equal(
          isClaimDocumentPubliclyVisible({
            isPublished: true,
            verificationStatus: status,
          }),
          false,
        );
      }
      assert.equal(
        isInsurerPubliclyVisible({
          isPublished: false,
          verificationStatus: VerificationStatus.verified,
        }),
        false,
      );
    });

    it("detects forbidden publish draft combination", () => {
      assert.equal(
        wouldPublishDraft({
          isPublished: true,
          verificationStatus: VerificationStatus.draft,
        }),
        true,
      );
    });
  });

  describe("knowledge articles", () => {
    it("PUBLIC_KNOWLEDGE_WHERE requires published + allowed statuses", () => {
      assert.equal(PUBLIC_KNOWLEDGE_WHERE.isPublished, true);
      assert.deepEqual(PUBLIC_KNOWLEDGE_WHERE.status.in, [
        ...PUBLIC_KNOWLEDGE_ARTICLE_STATUSES,
      ]);
    });

    it("blocks draft, archived, rejected on public surface", () => {
      const blocked = [
        KnowledgeArticleStatus.draft,
        KnowledgeArticleStatus.archived,
        KnowledgeArticleStatus.rejected,
      ];
      for (const status of blocked) {
        assert.equal(
          isKnowledgeArticlePubliclyVisible({ isPublished: true, status }),
          false,
        );
      }
    });
  });

  describe("disclosure links", () => {
    it("requires published status and reviewedAt", () => {
      assert.equal(PUBLIC_DISCLOSURE_LINK_WHERE.isPublished, true);
      assert.equal(
        isDisclosureLinkPubliclyVisible({
          isPublished: true,
          status: DisclosureLinkStatus.published,
          reviewedAt: new Date(),
        }),
        true,
      );
      assert.equal(
        isDisclosureLinkPubliclyVisible({
          isPublished: true,
          status: DisclosureLinkStatus.needs_review,
          reviewedAt: new Date(),
        }),
        false,
      );
      assert.equal(
        isDisclosureLinkPubliclyVisible({
          isPublished: true,
          status: DisclosureLinkStatus.published,
          reviewedAt: null,
        }),
        false,
      );
    });

    it("falls back to static insurer disclosure links without database access", async () => {
      const previousDatabaseUrl = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      try {
        const result = await getPublicDisclosureLinks();
        assert.equal(result.status, "ok");
        assert.equal(result.data.length, 86);
        assert.ok(
          result.data.some(
            (entry) =>
              entry.id === "disclosure-product-samsung-fire" &&
              entry.url === "https://www.samsungfire.com/page/VH.REIF0011.do",
          ),
        );
        assert.ok(
          result.data.some(
            (entry) =>
              entry.id === "disclosure-terms-carrot-digital" &&
              entry.url ===
                "https://www.carrotins.com/desktop/disclosure/sale/?afcDtFlgcd",
          ),
        );
      } finally {
        if (previousDatabaseUrl === undefined) {
          delete process.env.DATABASE_URL;
        } else {
          process.env.DATABASE_URL = previousDatabaseUrl;
        }
      }
    });
  });

  describe("message templates", () => {
    it("requires published, reviewed, not internal-only, safeCopy", () => {
      assert.equal(PUBLIC_MESSAGE_TEMPLATE_WHERE.isPublished, true);
      assert.equal(PUBLIC_MESSAGE_TEMPLATE_WHERE.isInternalOnly, false);
      assert.equal(
        isMessageTemplatePubliclyVisible({
          isPublished: true,
          status: MessageTemplateStatus.published,
          isInternalOnly: false,
          reviewedAt: new Date(),
          safeCopy: "안내 문구",
        }),
        true,
      );
      assert.equal(
        isMessageTemplatePubliclyVisible({
          isPublished: true,
          status: MessageTemplateStatus.published,
          isInternalOnly: true,
          reviewedAt: new Date(),
          safeCopy: "안내",
        }),
        false,
      );
    });
  });
});
