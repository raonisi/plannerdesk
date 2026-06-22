import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildClaimLibraryItems,
  countClaimLibraryDispositions,
  countPublicClaimLibraryItems,
} from "@/lib/claim-documents/claim-library";
import { claimFormFiles } from "@/lib/content/claim-form-files";
import { insurerLogoSrc } from "@/lib/directory/insurer-logo";
import {
  isBlockedPublicAssetUrl,
  isLegacyThirdPartyAssetReference,
  isVerifiedOfficialInsurerUrl,
  PRIVATE_ASSET_REVIEW_PREFIX,
  resolveClaimFormPublicAssetView,
} from "@/lib/public/public-asset-policy";
import { resolveVisiblePublicClaimLibrarySurface } from "@/lib/public/public-surface-resolvers";
import type { PublicInsurer } from "@/lib/public/insurers";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-ASSET-01 public asset governance", () => {
  it("blocks legacy third-party and archive URLs by default", () => {
    assert.equal(isLegacyThirdPartyAssetReference("/claim-forms/bohumschool/x.pdf"), true);
    assert.equal(
      isBlockedPublicAssetUrl(
        "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/claim-docs/a.pdf",
      ),
      true,
    );
    assert.equal(isBlockedPublicAssetUrl("#"), true);
    assert.equal(
      isBlockedPublicAssetUrl("https://bohumschool-archive.onrender.com/api/v1/x"),
      true,
    );
    assert.equal(
      isVerifiedOfficialInsurerUrl("https://www.samsungfire.com/v2/html/claim/01/C_010_030_001.html"),
      true,
    );
  });

  it("legacy claim forms resolve to official external or hidden — not local public PDF", () => {
    const sample = claimFormFiles[0]!;
    const view = resolveClaimFormPublicAssetView(sample, "https://www.samsungfire.com/");
    assert.ok(view === null || view.kind === "official_external" || view.kind === "pending");
    assert.notEqual(view?.kind, "approved_local");
  });

  it("unapproved PDFs are not served from public/claim-forms", () => {
    assert.equal(existsSync(join(ROOT, "public/claim-forms")), false);
    assert.equal(existsSync(join(ROOT, PRIVATE_ASSET_REVIEW_PREFIX, "claim-forms")), true);
  });

  it("public claim UI uses asset resolver wiring", () => {
    const item = readSource("components/claim-documents/claim-form-list-item.tsx");
    const library = readSource("lib/claim-documents/library-items.ts");
    assert.match(item, /publicAssetView/);
    assert.match(item, /renderPdfAssetActions/);
    assert.match(library, /resolveClaimFormPublicAssetView/);
    assert.doesNotMatch(item, /bohumschool/i);
  });

  it("insurer logos default to text fallback without permission evidence", () => {
    const logo = readSource("lib/directory/insurer-logo.ts");
    assert.match(logo, /resolveInsurerLogoPublicSrc/);
    const insurer = {
      id: "samsung-fire",
      name: "삼성화재",
      officialWebsiteUrl: "https://www.samsungfire.com/",
    } as PublicInsurer;
    assert.equal(insurerLogoSrc(insurer), null);
  });

  it("home and claim counts use the same policy-filtered library SSOT", () => {
    const guides = resolveVisiblePublicClaimLibrarySurface({
      status: "ok",
      data: [],
    });
    const items = buildClaimLibraryItems(guides.guideDocuments, {});
    const counts = countClaimLibraryDispositions(items);
    assert.equal(guides.libraryItemCount, counts.publicGuideCount);
    assert.equal(countPublicClaimLibraryItems(guides.guideDocuments, {}), counts.publicGuideCount);
    assert.ok(counts.publicGuideCount > 0);
    assert.ok(counts.downloadableAssetCount <= counts.publicGuideCount);
  });

  it("public surfaces avoid forbidden legal-certainty asset copy", () => {
    for (const rel of [
      "components/claim-documents/claim-form-list-item.tsx",
      "components/work-tools/work-tools-public-notice.tsx",
      "lib/public/public-asset-policy.ts",
    ]) {
      const src = readSource(rel);
      for (const phrase of [
        "권리 확인 완료",
        "라이선스 보장",
        "우회 링크",
        "미러 자료",
        "다운로드 보장",
      ]) {
        assert.doesNotMatch(src, new RegExp(phrase), `${rel}: ${phrase}`);
      }
    }
  });
});
