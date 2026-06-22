import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { disclosureLinkEntries } from "@/lib/content/disclosure-links";
import {
  DISCLOSURE_LINK_STATUS_COPY,
  hasRegisteredPublicDisclosureUrl,
  resolveDisclosureRegistrationFromPair,
  resolvePublicDisclosureLinkStatus,
} from "@/lib/public/disclosure-link-status";
import { getPublicDisclosureLinks } from "@/lib/public/disclosure-links";
import {
  resolveVisiblePublicClaimDocuments,
  resolveVisiblePublicDisclosureLinks,
} from "@/lib/public/public-surface-resolvers";
import { PUBLIC_FORBIDDEN_PHRASES } from "@/lib/ops/public-smoke-expansion";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("PR-UX-09 disclosure link registration status", () => {
  it("treats null, undefined, blank, and invalid URLs as unregistered", () => {
    for (const value of [null, undefined, "", "   ", "not-a-url", "javascript:alert(1)"]) {
      assert.equal(hasRegisteredPublicDisclosureUrl(value), false);
    }
    assert.equal(
      hasRegisteredPublicDisclosureUrl("https://www.example.com/disclosure"),
      true,
    );
  });

  it("resolves pairwise registration status for split disclosure and terms URLs", () => {
    const complete = resolveDisclosureRegistrationFromPair({
      disclosureUrl: "https://www.example.com/product",
      termsUrl: "https://www.example.com/terms",
    });
    assert.equal(complete.status, "complete");
    assert.equal(complete.label, DISCLOSURE_LINK_STATUS_COPY.complete.label);
    assert.equal(complete.hasDisclosureLink, true);
    assert.equal(complete.hasTermsLink, true);

    const partial = resolveDisclosureRegistrationFromPair({
      disclosureUrl: "https://www.example.com/product",
      termsUrl: null,
    });
    assert.equal(partial.status, "partial");
    assert.equal(partial.label, DISCLOSURE_LINK_STATUS_COPY.partial.label);
    assert.equal(partial.hasDisclosureLink, true);
    assert.equal(partial.hasTermsLink, false);

    const missing = resolveDisclosureRegistrationFromPair({
      disclosureUrl: "",
      termsUrl: "   ",
    });
    assert.equal(missing.status, "missing");
    assert.equal(missing.label, DISCLOSURE_LINK_STATUS_COPY.missing.label);
    assert.equal(missing.hasAnyOfficialLink, false);
  });

  it("uses registered/missing for unified single-URL public cards", () => {
    const registered = resolvePublicDisclosureLinkStatus({
      url: "https://www.example.com/disclosure-room",
    });
    assert.equal(registered.status, "registered");
    assert.equal(registered.label, "공식 자료 경로 등록");
    assert.match(registered.description, /공식 홈페이지/);

    const missing = resolvePublicDisclosureLinkStatus({ url: null });
    assert.equal(missing.status, "missing");
    assert.equal(missing.label, "공식 링크 준비 중");
    assert.match(missing.description, /등록되지 않았습니다/);
  });

  it("disclosure card renders link status badge, helper copy, and freshness separately", () => {
    const card = readSource("components/disclosure/disclosure-card.tsx");
    assert.match(card, /LinkStatusBadge/);
    assert.match(card, /resolvePublicDisclosureLinkStatus/);
    assert.match(card, /FreshnessBadge/);
    assert.match(card, /linkStatus\.description/);
    assert.match(card, /linkStatus\.hasAnyOfficialLink && entry\.url/);
    assert.match(card, /role="status"/);
  });

  it("does not render external CTA without a registered URL", () => {
    const card = readSource("components/disclosure/disclosure-card.tsx");
    assert.match(card, /linkStatus\.hasAnyOfficialLink && entry\.url/);
    assert.match(card, /role="status"/);
    assert.doesNotMatch(card, /href="#"/);
    assert.doesNotMatch(card, /href=\{\s*""\s*\}/);
  });

  it("keeps external link security and new-tab accessible naming", () => {
    const card = readSource("components/disclosure/disclosure-card.tsx");
    assert.match(card, /ExternalTabAnchor/);
    assert.match(card, /PUBLIC_CTA_OFFICIAL_SOURCE_OPEN/);

    const external = readSource("lib/ui/external-link.ts");
    assert.match(external, /noopener noreferrer/);
    assert.match(external, /새 탭에서 열림/);
  });

  it("avoids forbidden certainty phrases in status copy", () => {
    const statusModule = readSource("lib/public/disclosure-link-status.ts");
    const badge = readSource("components/disclosure/link-status-badge.tsx");
    const combined = `${statusModule}\n${badge}`;

    for (const phrase of [
      "링크 정상",
      "접속 가능",
      "최신 자료",
      "검증 완료",
      "공식 확인 완료",
      "보장",
      "보험금",
    ]) {
      assert.doesNotMatch(combined, new RegExp(phrase));
    }

    for (const phrase of PUBLIC_FORBIDDEN_PHRASES.slice(0, 8)) {
      if (phrase.length < 4) continue;
      assert.doesNotMatch(combined, new RegExp(phrase));
    }
  });

  it("preserves public disclosure count selector and static 43-entry baseline", () => {
    assert.equal(disclosureLinkEntries.length, 43);

    const resolver = readSource("lib/public/public-surface-resolvers.ts");
    assert.match(resolver, /resolveVisiblePublicDisclosureLinks/);
    assert.match(resolver, /result\.data\.length/);

    const surface = resolveVisiblePublicDisclosureLinks({
      status: "ok",
      data: disclosureLinkEntries.map((entry, index) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        url: entry.sourceUrl ?? null,
        category: entry.category as never,
        targetType: "insurer" as never,
        sourceName: null,
        isOfficialSource: true,
        lastVerifiedAt: entry.lastVerifiedAt,
        publishedAt: entry.lastVerifiedAt,
        sortOrder: index,
        insurerId: null,
        insurerName: null,
      })),
    });
    assert.equal(surface.count, 43);
  });

  it("preserves public claim library 220-item count policy", () => {
    const guides = resolveVisiblePublicClaimDocuments({
      status: "ok",
      data: [],
    }).items;
    const items = buildClaimLibraryItems(guides, {});
    assert.equal(items.length, 220);
    assert.equal(countPublicClaimLibraryItems(guides, {}), 220);
  });

  it("static disclosure fallback remains unified without schema changes", async () => {
    const result = await getPublicDisclosureLinks();
    assert.equal(result.status, "ok");
    if (result.status === "ok") {
      assert.equal(result.data.length, 43);
      assert.ok(result.data.every((entry) => entry.url?.trim()));
    }

    const page = readSource("app/disclosure-links/page.tsx");
    assert.match(page, /getPublicDisclosureLinks/);
    const schema = readSource("prisma/schema.prisma");
    assert.doesNotMatch(schema, /linkHealthCheck/);
  });
});
