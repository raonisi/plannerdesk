import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DIRECTORY_VISIBLE_EAGER_LOGO_COUNT,
  DIRECTORY_VISIBLE_PRIORITY_LOGO_COUNT,
  directoryLogoLoadingProps,
} from "@/lib/directory/directory-logo-loading";
import {
  respondAuthorizedAssetFirebaseCatchFailure,
  respondAuthorizedAssetFirebaseFailure,
} from "@/lib/server/authorized-asset-firebase-fallback";
import {
  AUTHORIZED_LOGO_SIGNED_URL_CACHE_MAX_ENTRIES,
  AUTHORIZED_LOGO_SIGNED_URL_CACHE_TTL_MS,
  getAuthorizedLogoSignedUrlCacheSizeForTests,
  resetAuthorizedLogoSignedUrlCacheForTests,
  resolveAuthorizedLogoSignedUrl,
} from "@/lib/server/authorized-asset-logo-signed-url-cache";
import { findAuthorizedStaticLogoByInsurerId } from "@/lib/server/authorized-static-assets-manifest";
import type { FirebaseObjectMetadata } from "@/lib/server/firebase-authorized-asset-storage";

const ROOT = process.cwd();
const SAMPLE_INSURER_ID = "samsung-fire";

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

function sampleLogoAsset() {
  const asset = findAuthorizedStaticLogoByInsurerId(SAMPLE_INSURER_ID);
  assert.ok(asset);
  return asset;
}

const sampleConfig = {
  bucket: "bucket.test",
  clientEmail: "svc@test.iam.gserviceaccount.com",
  privateKey: "fake",
};

const sampleMetadata: FirebaseObjectMetadata = {
  assetId: "logo-samsung-fire",
  insurerId: SAMPLE_INSURER_ID,
  sha256: "abc",
  contentType: "image/png",
  reviewedAt: "2026-06-01",
  permissionRecordKey: "bohumschool_archive_redistribution",
};

describe("PR-ASSET-09A logo signed URL cache", () => {
  it("first logo request uses metadata lookup and signing", async () => {
    resetAuthorizedLogoSignedUrlCacheForTests();
    const asset = sampleLogoAsset();
    let metadataCalls = 0;
    let signCalls = 0;
    const now = () => 1_700_000_000_000;

    const result = await resolveAuthorizedLogoSignedUrl(
      {
        config: sampleConfig,
        asset,
        expiresInSeconds: 300,
      },
      {
        now,
        getMetadata: async () => {
          metadataCalls += 1;
          return sampleMetadata;
        },
        buildSignedUrl: () => {
          signCalls += 1;
          return "https://storage.googleapis.com/bucket.test/object?sig=redacted";
        },
      },
    );

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.cacheHit, false);
    assert.equal(metadataCalls, 1);
    assert.equal(signCalls, 1);
  });

  it("reuses cached signed URL within TTL without metadata or signing", async () => {
    resetAuthorizedLogoSignedUrlCacheForTests();
    const asset = sampleLogoAsset();
    let metadataCalls = 0;
    let signCalls = 0;
    const nowMs = 1_700_000_000_000;
    const deps = {
      now: () => nowMs,
      getMetadata: async () => {
        metadataCalls += 1;
        return sampleMetadata;
      },
      buildSignedUrl: () => {
        signCalls += 1;
        return "https://storage.googleapis.com/bucket.test/object?sig=redacted";
      },
    };

    const first = await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );
    const second = await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.equal(second.cacheHit, true);
    assert.equal(second.signedUrl, first.signedUrl);
    assert.equal(metadataCalls, 1);
    assert.equal(signCalls, 1);
  });

  it("regenerates signed URL after TTL expiry", async () => {
    resetAuthorizedLogoSignedUrlCacheForTests();
    const asset = sampleLogoAsset();
    let signCalls = 0;
    let nowMs = 1_700_000_000_000;
    const deps = {
      now: () => nowMs,
      getMetadata: async () => sampleMetadata,
      buildSignedUrl: () => {
        signCalls += 1;
        return `https://storage.googleapis.com/bucket.test/object?sig=${signCalls}`;
      },
    };

    await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );
    nowMs += AUTHORIZED_LOGO_SIGNED_URL_CACHE_TTL_MS + 1;
    const afterExpiry = await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );

    assert.equal(afterExpiry.ok, true);
    if (!afterExpiry.ok) return;
    assert.equal(afterExpiry.cacheHit, false);
    assert.equal(signCalls, 2);
  });

  it("does not cache object-missing failures", async () => {
    resetAuthorizedLogoSignedUrlCacheForTests();
    const asset = sampleLogoAsset();
    let metadataCalls = 0;

    const deps = {
      getMetadata: async () => {
        metadataCalls += 1;
        return null;
      },
      buildSignedUrl: () => {
        throw new Error("should_not_sign");
      },
    };

    const first = await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );
    const second = await resolveAuthorizedLogoSignedUrl(
      { config: sampleConfig, asset, expiresInSeconds: 300 },
      deps,
    );

    assert.equal(first.ok, false);
    assert.equal(second.ok, false);
    assert.equal(metadataCalls, 2);
    assert.equal(getAuthorizedLogoSignedUrlCacheSizeForTests(), 0);
  });

  it("evicts oldest entries when max cache size is exceeded", async () => {
    resetAuthorizedLogoSignedUrlCacheForTests();
    const asset = sampleLogoAsset();
    const baseNow = 1_700_000_000_000;

    for (let index = 0; index < AUTHORIZED_LOGO_SIGNED_URL_CACHE_MAX_ENTRIES + 1; index += 1) {
      const insurerId = `insurer-${index}`;
      await resolveAuthorizedLogoSignedUrl(
        {
          config: sampleConfig,
          asset: { ...asset, insurerId, assetId: `logo-${index}` },
          expiresInSeconds: 300,
        },
        {
          now: () => baseNow,
          getMetadata: async () => ({
            ...sampleMetadata,
            insurerId,
            assetId: `logo-${index}`,
          }),
          buildSignedUrl: () =>
            `https://storage.googleapis.com/bucket.test/object?sig=${insurerId}`,
        },
      );
    }

    assert.equal(
      getAuthorizedLogoSignedUrlCacheSizeForTests(),
      AUTHORIZED_LOGO_SIGNED_URL_CACHE_MAX_ENTRIES,
    );
  });

  it("preserves firebase_with_static_fallback failure semantics", () => {
    const response = respondAuthorizedAssetFirebaseFailure({
      code: "asset_delivery_object_missing",
      kind: "insurer_logo",
      assetId: "logo-sample",
      deliveryMode: "firebase_with_static_fallback",
      status: 404,
      staticPublicPath: "/insurer-logos/authorized/sample/example.png",
      unavailableError: "logo_unavailable",
    });
    assert.equal(response.status, 307);
    assert.match(response.headers.get("Location") ?? "", /^\/insurer-logos\//);

    const catchResponse = respondAuthorizedAssetFirebaseCatchFailure(
      new Error("FIREBASE_STORAGE_FORBIDDEN"),
      {
        kind: "insurer_logo",
        assetId: "logo-sample",
        deliveryMode: "firebase_with_static_fallback",
        staticPublicPath: "/insurer-logos/authorized/sample/example.png",
        unavailableError: "logo_unavailable",
      },
    );
    assert.equal(catchResponse.status, 307);
  });

  it("does not add static fallback in firebase-only mode", () => {
    const response = respondAuthorizedAssetFirebaseFailure({
      code: "asset_delivery_object_missing",
      kind: "insurer_logo",
      assetId: "logo-sample",
      deliveryMode: "firebase",
      status: 404,
      staticPublicPath: "/insurer-logos/authorized/sample/example.png",
      unavailableError: "logo_unavailable",
    });
    assert.equal(response.status, 404);
  });

  it("logo route uses resolveAuthorizedLogoSignedUrl cache helper", () => {
    const route = readSource("app/api/authorized-assets/logo/[insurerId]/route.ts");
    assert.match(route, /resolveAuthorizedLogoSignedUrl/);
    assert.doesNotMatch(route, /getFirebaseObjectMetadata/);
    assert.doesNotMatch(route, /buildAuthorizedAssetSignedLogoUrl/);
  });

  it("keeps default lazy loading on InsurerLogo", () => {
    const logo = readSource("components/directory/insurer-logo.tsx");
    assert.match(logo, /loading = "lazy"/);
  });

  it("eager-loads only the first visible directory logos", () => {
    assert.equal(directoryLogoLoadingProps(0).loading, "eager");
    assert.equal(directoryLogoLoadingProps(2).fetchPriority, "high");
    assert.equal(
      directoryLogoLoadingProps(DIRECTORY_VISIBLE_EAGER_LOGO_COUNT - 1).loading,
      "eager",
    );
    assert.equal(
      directoryLogoLoadingProps(DIRECTORY_VISIBLE_EAGER_LOGO_COUNT).loading,
      "lazy",
    );
    assert.equal(
      directoryLogoLoadingProps(DIRECTORY_VISIBLE_PRIORITY_LOGO_COUNT).fetchPriority,
      undefined,
    );

    const explorer = readSource("app/directory/directory-explorer.tsx");
    assert.match(explorer, /directoryLogoLoadingProps/);
    assert.match(explorer, /logoLoading=\{logoLoading\.loading\}/);
  });
});
