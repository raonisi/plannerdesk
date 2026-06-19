import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { VerificationStatus } from "@prisma/client";

import { summarizeClaimItemsFreshness } from "@/lib/claim-documents/freshness-summary";
import { documentToLibraryItem } from "@/lib/claim-documents/library-items";
import {
  FRESHNESS_RECENT_DAYS,
  FRESHNESS_STALE_DAYS,
  getFreshnessLabel,
  getFreshnessPresentation,
  getFreshnessStatus,
  isVerificationStale,
} from "@/lib/public/freshness";
import { countPublicClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import { resolveVisiblePublicClaimLibrarySurface } from "@/lib/public/public-surface-resolvers";

const ROOT = process.cwd();
const NOW = new Date("2026-06-19T12:00:00.000Z");

function daysAgo(days: number): string {
  const date = new Date(NOW);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

describe("PR-DATA-FRESH-01 freshness badges", () => {
  it("does not classify null lastVerifiedAt as recent", () => {
    assert.equal(
      getFreshnessStatus({ lastVerifiedAt: null }, { now: NOW }),
      "missing_date",
    );
    assert.equal(
      getFreshnessPresentation({ lastVerifiedAt: null }).label,
      "확인일 미등록",
    );
  });

  it("classifies age buckets at 30/90 day boundaries", () => {
    assert.equal(
      getFreshnessStatus({ lastVerifiedAt: daysAgo(10) }, { now: NOW }),
      "recent",
    );
    assert.equal(
      getFreshnessStatus({ lastVerifiedAt: daysAgo(45) }, { now: NOW }),
      "needs_check",
    );
    assert.equal(
      getFreshnessStatus({ lastVerifiedAt: daysAgo(120) }, { now: NOW }),
      "stale",
    );
    assert.equal(FRESHNESS_RECENT_DAYS, 30);
    assert.equal(FRESHNESS_STALE_DAYS, 90);
  });

  it("keeps needs_review visible without changing public visibility policy", () => {
    assert.equal(
      getFreshnessStatus(
        {
          lastVerifiedAt: daysAgo(5),
          verificationStatus: VerificationStatus.needs_review,
        },
        { now: NOW },
      ),
      "needs_review",
    );
    assert.equal(
      getFreshnessLabel("needs_review", "public"),
      "검수 필요",
    );

    const insurers = readFileSync(join(ROOT, "lib/public/insurers.ts"), "utf8");
    const claims = readFileSync(join(ROOT, "lib/public/claim-documents.ts"), "utf8");
    assert.match(insurers, /PUBLIC_VERIFICATION_STATUSES/);
    assert.match(claims, /PUBLIC_VERIFICATION_STATUSES/);
  });

  it("uses admin-only labels on admin freshness badge", () => {
    const adminBadge = readFileSync(
      join(ROOT, "components/admin/admin-freshness-badge.tsx"),
      "utf8",
    );
    const publicBadge = readFileSync(
      join(ROOT, "components/content/freshness-badge.tsx"),
      "utf8",
    );
    assert.match(adminBadge, /audience="admin"/);
    assert.doesNotMatch(publicBadge, /adminMemo|reviewNote|internalNote/i);
    assert.equal(
      getFreshnessLabel("missing_date", "admin"),
      "확인일 없음",
    );
  });

  it("does not expose admin-only freshness phrases on public components", () => {
    const targets = [
      "components/content/freshness-badge.tsx",
      "components/content/data-freshness-meta.tsx",
      "components/directory/insurer-action-card.tsx",
      "components/disclosure/disclosure-card.tsx",
      "app/claim-documents/insurer-claim-group.tsx",
    ];

    for (const rel of targets) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      assert.doesNotMatch(source, /freshnessUncertain/);
      assert.doesNotMatch(source, /확인일 정보 부족/);
      assert.doesNotMatch(source, /최신성 확인 필요/);
      assert.doesNotMatch(source, /verificationStatus\s*===/);
    }
  });

  it("preserves home claim library SSOT count", () => {
    const surface = resolveVisiblePublicClaimLibrarySurface(
      { status: "ok", data: [] },
      {},
    );
    assert.equal(
      surface.libraryItemCount,
      countPublicClaimLibraryItems(surface.guideDocuments, {}),
    );
    assert.ok(surface.libraryItemCount > surface.guideDocuments.length);
  });

  it("summarizes claim group freshness using worst status", () => {
    const guide = documentToLibraryItem({
      id: "guide-1",
      slug: "guide-1",
      title: "Guide",
      category: "other",
      verificationStatus: VerificationStatus.needs_review,
      lastVerifiedAt: daysAgo(3),
      insurerId: null,
      insurerName: "삼성화재",
      summary: null,
      requiredDocuments: null,
      optionalDocuments: null,
      claimFormUrl: null,
      officialSourceUrl: "https://example.com",
      customerMessageTemplate: null,
      cautionNote: null,
    });

    const presentation = summarizeClaimItemsFreshness([guide]);
    assert.equal(presentation.status, "needs_review");
    assert.match(presentation.label, /검수 필요/);
  });

  it("treats invalid dates as missing", () => {
    assert.equal(
      getFreshnessStatus({ lastVerifiedAt: "invalid" }, { now: NOW }),
      "missing_date",
    );
    assert.equal(isVerificationStale({ lastVerifiedAt: "invalid" }, { now: NOW }), true);
  });

  it("keeps claim-documents explorer free of suspense loading fallback", () => {
    const page = readFileSync(join(ROOT, "app/claim-documents/page.tsx"), "utf8");
    assert.doesNotMatch(page, /ExplorerLoadingPanel/);
    assert.doesNotMatch(page, /<Suspense/);
    assert.match(page, /ClaimDocumentExplorer/);
  });
});
