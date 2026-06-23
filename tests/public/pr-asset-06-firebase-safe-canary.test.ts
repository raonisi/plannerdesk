import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  buildAuthorizedLogoHref,
  buildAuthorizedPdfDownloadHref,
  getAuthorizedAssetDeliveryMode,
  isFirebaseAuthorizedAssetDelivery,
} from "@/lib/public/authorized-asset-delivery-mode";
import { logAuthorizedAssetDeliveryFailure } from "@/lib/server/authorized-asset-delivery-errors";
import {
  respondAuthorizedAssetFirebaseCatchFailure,
  respondAuthorizedAssetFirebaseFailure,
} from "@/lib/server/authorized-asset-firebase-fallback";
import {
  buildAuthorizedStaticAssetsManifest,
  resetAuthorizedStaticAssetsManifestCache,
} from "@/lib/server/authorized-static-assets-manifest";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

const FORBIDDEN_LOCATION_FRAGMENTS = [
  "localhost",
  "127.0.0.1",
  "http://",
  "https://",
  "//",
  "..",
  "\\",
] as const;

function assertLocationHasNoForbiddenFragments(location: string): void {
  for (const fragment of FORBIDDEN_LOCATION_FRAGMENTS) {
    assert.equal(
      location.includes(fragment),
      false,
      `Location must not include ${fragment}`,
    );
  }
}

const PDF_STATIC_PATH = "/claim-forms/authorized/sample/example.pdf";
const LOGO_STATIC_PATH = "/insurer-logos/authorized/sample/example.png";

describe("PR-ASSET-06 Firebase safe canary mode", () => {
  it("defaults to static when env is unset", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    try {
      delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      assert.equal(getAuthorizedAssetDeliveryMode(), "static");
      assert.equal(isFirebaseAuthorizedAssetDelivery(), false);
      assert.equal(
        buildAuthorizedPdfDownloadHref("asset-1", PDF_STATIC_PATH),
        PDF_STATIC_PATH,
      );
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("resolves firebase, firebase_with_static_fallback, and invalid values", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    try {
      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
      assert.equal(getAuthorizedAssetDeliveryMode(), "firebase");

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE =
        "firebase_with_static_fallback";
      assert.equal(
        getAuthorizedAssetDeliveryMode(),
        "firebase_with_static_fallback",
      );
      assert.equal(isFirebaseAuthorizedAssetDelivery(), true);

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "invalid";
      assert.equal(getAuthorizedAssetDeliveryMode(), "static");
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("uses API hrefs for firebase and canary modes", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    try {
      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
      assert.equal(
        buildAuthorizedPdfDownloadHref("asset-1", PDF_STATIC_PATH),
        "/api/authorized-assets/download/asset-1",
      );
      assert.equal(
        buildAuthorizedLogoHref("insurer-1", LOGO_STATIC_PATH),
        "/api/authorized-assets/logo/insurer-1",
      );

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE =
        "firebase_with_static_fallback";
      assert.equal(
        buildAuthorizedPdfDownloadHref("asset-1", PDF_STATIC_PATH),
        "/api/authorized-assets/download/asset-1",
      );
      assert.equal(
        buildAuthorizedLogoHref("insurer-1", LOGO_STATIC_PATH),
        "/api/authorized-assets/logo/insurer-1",
      );
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("keeps firebase mode failures as safe 404 or 503 without static fallback", () => {
    const failureCases = [
      {
        code: "asset_delivery_config_missing" as const,
        status: 503 as const,
        unavailableError: "storage_unavailable",
      },
      {
        code: "asset_delivery_object_missing" as const,
        status: 404 as const,
        unavailableError: "download_unavailable",
      },
      {
        code: "asset_delivery_sign_failed" as const,
        status: 503 as const,
        unavailableError: "download_unavailable",
      },
    ];

    for (const failureCase of failureCases) {
      const response = respondAuthorizedAssetFirebaseFailure({
        code: failureCase.code,
        kind: "claim_pdf",
        assetId: "asset-1",
        deliveryMode: "firebase",
        status: failureCase.status,
        staticPublicPath: PDF_STATIC_PATH,
        unavailableError: failureCase.unavailableError,
      });
      assert.notEqual(response.status, 307);
      if (failureCase.status === 404) {
        assert.equal(response.status, 404);
      } else {
        assert.equal(response.status, failureCase.status);
      }
    }

    const catchResponse = respondAuthorizedAssetFirebaseCatchFailure(
      new Error("FIREBASE_STORAGE_FORBIDDEN"),
      {
        kind: "insurer_logo",
        assetId: "logo-1",
        deliveryMode: "firebase",
        staticPublicPath: LOGO_STATIC_PATH,
        unavailableError: "logo_unavailable",
      },
    );
    assert.equal(catchResponse.status, 403);
  });

  it("falls back to relative static paths in firebase_with_static_fallback mode", () => {
    const failureCases = [
      {
        code: "asset_delivery_config_missing" as const,
        status: 503 as const,
      },
      {
        code: "asset_delivery_credentials_missing" as const,
        status: 503 as const,
      },
      {
        code: "asset_delivery_storage_forbidden" as const,
        status: 403 as const,
      },
      {
        code: "asset_delivery_object_missing" as const,
        status: 404 as const,
      },
      {
        code: "asset_delivery_metadata_invalid" as const,
        status: 404 as const,
      },
      {
        code: "asset_delivery_content_type_invalid" as const,
        status: 404 as const,
      },
      {
        code: "asset_delivery_sign_failed" as const,
        status: 503 as const,
      },
      {
        code: "asset_delivery_unexpected" as const,
        status: 503 as const,
      },
    ];

    for (const failureCase of failureCases) {
      const pdfResponse = respondAuthorizedAssetFirebaseFailure({
        code: failureCase.code,
        kind: "claim_pdf",
        assetId: "asset-1",
        deliveryMode: "firebase_with_static_fallback",
        status: failureCase.status,
        staticPublicPath: PDF_STATIC_PATH,
        unavailableError: "download_unavailable",
      });
      assert.equal(pdfResponse.status, 307);
      assert.equal(pdfResponse.headers.get("Location"), PDF_STATIC_PATH);
      assert.match(pdfResponse.headers.get("Location") ?? "", /^\/claim-forms\//);

      const logoResponse = respondAuthorizedAssetFirebaseFailure({
        code: failureCase.code,
        kind: "insurer_logo",
        assetId: "logo-1",
        deliveryMode: "firebase_with_static_fallback",
        status: failureCase.status,
        staticPublicPath: LOGO_STATIC_PATH,
        unavailableError: "logo_unavailable",
      });
      assert.equal(logoResponse.status, 307);
      assert.equal(logoResponse.headers.get("Location"), LOGO_STATIC_PATH);
      assert.match(logoResponse.headers.get("Location") ?? "", /^\/insurer-logos\//);
    }

    const catchResponse = respondAuthorizedAssetFirebaseCatchFailure(
      new Error("FIREBASE_SIGN_FAILED"),
      {
        kind: "claim_pdf",
        assetId: "asset-1",
        deliveryMode: "firebase_with_static_fallback",
        staticPublicPath: PDF_STATIC_PATH,
        unavailableError: "download_unavailable",
      },
    );
    assert.equal(catchResponse.status, 307);
    assert.equal(catchResponse.headers.get("Location"), PDF_STATIC_PATH);
  });

  it("blocks forbidden fragments in canary fallback Location headers", () => {
    const response = respondAuthorizedAssetFirebaseFailure({
      code: "asset_delivery_object_missing",
      kind: "claim_pdf",
      assetId: "asset-1",
      deliveryMode: "firebase_with_static_fallback",
      status: 404,
      staticPublicPath: PDF_STATIC_PATH,
      unavailableError: "download_unavailable",
    });
    assertLocationHasNoForbiddenFragments(response.headers.get("Location") ?? "");
  });

  it("keeps manifest-approved static paths for enabled assets only", () => {
    resetAuthorizedStaticAssetsManifestCache();
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const enabledPdf = manifest.find(
      (asset) => asset.kind === "claim_pdf" && asset.enabled,
    );
    const enabledLogo = manifest.find(
      (asset) => asset.kind === "insurer_logo" && asset.enabled,
    );
    assert.ok(enabledPdf);
    assert.ok(enabledLogo);

    const pdfResponse = respondAuthorizedAssetFirebaseFailure({
      code: "asset_delivery_object_missing",
      kind: "claim_pdf",
      assetId: enabledPdf.assetId,
      deliveryMode: "firebase_with_static_fallback",
      status: 404,
      staticPublicPath: enabledPdf.staticPublicPath,
      unavailableError: "download_unavailable",
    });
    assert.equal(pdfResponse.status, 307);
    assert.match(
      pdfResponse.headers.get("Location") ?? "",
      /^\/claim-forms\/authorized\//,
    );
  });

  it("returns 404 for missing or disabled assets before canary fallback", () => {
    const downloadRoute = readSource(
      "app/api/authorized-assets/download/[assetId]/route.ts",
    );
    const logoRoute = readSource(
      "app/api/authorized-assets/logo/[insurerId]/route.ts",
    );

    assert.match(downloadRoute, /!asset/);
    assert.match(downloadRoute, /!asset\.enabled/);
    assert.match(logoRoute, /!asset \|\| !asset\.enabled/);

    const downloadGuardIndex = downloadRoute.indexOf("return notFound();");
    const downloadStaticIndex = downloadRoute.indexOf('deliveryMode === "static"');
    assert.ok(downloadGuardIndex < downloadStaticIndex);
  });

  it("keeps route sources on canary fallback helper and signed URL success path", () => {
    const downloadRoute = readSource(
      "app/api/authorized-assets/download/[assetId]/route.ts",
    );
    const logoRoute = readSource(
      "app/api/authorized-assets/logo/[insurerId]/route.ts",
    );

    assert.match(downloadRoute, /respondAuthorizedAssetFirebaseFailure/);
    assert.match(logoRoute, /respondAuthorizedAssetFirebaseFailure/);
    assert.match(downloadRoute, /deliveryMode === "static"/);
    assert.match(logoRoute, /deliveryMode === "static"/);
    assert.match(downloadRoute, /NextResponse\.redirect\(signedUrl, 307\)/);
    assert.match(logoRoute, /NextResponse\.redirect\(signedUrl, 307\)/);
    assert.doesNotMatch(downloadRoute, /new URL\(asset\.staticPublicPath/);
    assert.doesNotMatch(logoRoute, /new URL\(asset\.staticPublicPath/);
  });

  it("logs canary failures without secrets", () => {
    const originalError = console.error;
    let logged = "";
    console.error = (message?: unknown) => {
      logged = String(message);
    };
    try {
      logAuthorizedAssetDeliveryFailure({
        code: "asset_delivery_credentials_missing",
        kind: "insurer_logo",
        assetId: "logo-1",
        deliveryMode: "firebase_with_static_fallback",
        status: 503,
      });
      assert.match(logged, /"deliveryMode":"firebase_with_static_fallback"/);
      assert.match(logged, /"code":"asset_delivery_credentials_missing"/);
      assert.doesNotMatch(
        logged,
        /privateKey|clientEmail|signedUrl|stack|Authorization/i,
      );
    } finally {
      console.error = originalError;
    }
  });
});
