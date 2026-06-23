import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  classifyAuthorizedAssetDeliveryError,
  logAuthorizedAssetDeliveryFailure,
} from "@/lib/server/authorized-asset-delivery-errors";
import {
  isSafeApprovedStaticPublicPath,
  redirectToApprovedStaticPath,
} from "@/lib/server/authorized-asset-static-redirect";
import {
  buildAuthorizedStaticAssetsManifest,
  findAuthorizedStaticAssetById,
  findAuthorizedStaticLogoByInsurerId,
  resetAuthorizedStaticAssetsManifestCache,
} from "@/lib/server/authorized-static-assets-manifest";
import {
  buildAuthorizedAssetSignedDownloadUrl,
  buildAuthorizedAssetSignedLogoUrl,
} from "@/lib/server/firebase-authorized-asset-storage";
import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";
import {
  buildCanonicalQueryString,
  buildGcsV4CanonicalRequestParts,
  compareCodePoint,
  generateGcsV4SignedUrl,
} from "@/lib/server/gcs-v4-signed-url";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

const FIXED_NOW = new Date("2026-01-15T12:00:00.000Z");

const { privateKey: testPrivateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const TEST_CONFIG: FirebaseServiceAccountConfig = {
  bucket: "plannerdesk-test-bucket",
  clientEmail: "test-sa@plannerdesk-test.iam.gserviceaccount.com",
  privateKey: testPrivateKey,
};

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

describe("PR-ASSET-05 GCS V4 signer and static fallback", () => {
  it("sorts canonical query with X-Goog-* before response-content-*", () => {
    const canonicalQuery = buildCanonicalQueryString([
      ["response-content-disposition", 'attachment; filename="sample.pdf"'],
      ["response-content-type", "application/pdf"],
      ["X-Goog-Algorithm", "GOOG4-RSA-SHA256"],
      ["X-Goog-Credential", "svc@test/auto/storage/goog4_request"],
      ["X-Goog-Date", "20260115T120000Z"],
      ["X-Goog-Expires", "900"],
      ["X-Goog-SignedHeaders", "host"],
    ]);

    const xIndex = canonicalQuery.indexOf("X-Goog-Algorithm");
    const responseIndex = canonicalQuery.indexOf("response-content-disposition");
    assert.ok(xIndex >= 0);
    assert.ok(responseIndex >= 0);
    assert.ok(xIndex < responseIndex);
    assert.match(canonicalQuery, /^X-Goog-Algorithm=/);
  });

  it("sorts duplicate keys deterministically by encoded value", () => {
    const canonicalQuery = buildCanonicalQueryString([
      ["dup", "z"],
      ["dup", "a"],
      ["dup", "m"],
    ]);
    assert.equal(canonicalQuery, "dup=a&dup=m&dup=z");
  });

  it("uses code-point compare and no localeCompare in signer source", () => {
    const signerSource = readSource("lib/server/gcs-v4-signed-url.ts");
    assert.doesNotMatch(signerSource, /localeCompare/);
    assert.match(signerSource, /compareCodePoint/);
    assert.equal(compareCodePoint("X-Goog", "response"), -1);
    assert.equal(compareCodePoint("response", "X-Goog"), 1);
  });

  it("builds stable canonical request and string-to-sign for fixed inputs", () => {
    const options = {
      expiresInSeconds: 900,
      responseDisposition: 'attachment; filename="claim.pdf"',
      responseType: "application/pdf",
      now: FIXED_NOW,
    };
    const objectPath =
      "plannerdesk/authorized-assets/claim-pdfs/sample/asset.pdf";

    const first = buildGcsV4CanonicalRequestParts(
      TEST_CONFIG,
      objectPath,
      options,
    );
    const second = buildGcsV4CanonicalRequestParts(
      TEST_CONFIG,
      objectPath,
      options,
    );

    assert.equal(first.canonicalQueryString, second.canonicalQueryString);
    assert.equal(first.canonicalRequest, second.canonicalRequest);
    assert.equal(first.stringToSign, second.stringToSign);
    assert.ok(first.canonicalQueryString.startsWith("X-Goog-Algorithm="));
  });

  it("preserves PDF and logo signed URL generation flows", () => {
    const pdfUrl = buildAuthorizedAssetSignedDownloadUrl(
      TEST_CONFIG,
      "plannerdesk/authorized-assets/claim-pdfs/sample/asset.pdf",
      {
        expiresInSeconds: 900,
        downloadFileName: "claim.pdf",
        contentType: "application/pdf",
      },
    );
    assert.match(pdfUrl, /^https:\/\/storage\.googleapis\.com\//);
    assert.match(pdfUrl, /X-Goog-Algorithm=GOOG4-RSA-SHA256/);
    assert.match(pdfUrl, /response-content-disposition=/);
    const pdfQuery = pdfUrl.split("?")[1] ?? "";
    assert.ok(pdfQuery.indexOf("X-Goog-Algorithm=") < pdfQuery.indexOf("response-content-disposition="));
    assert.match(pdfUrl, /X-Goog-Signature=[0-9a-f]+$/);

    const logoUrl = buildAuthorizedAssetSignedLogoUrl(
      TEST_CONFIG,
      "plannerdesk/authorized-assets/insurer-logos/logo-sample.png",
      {
        expiresInSeconds: 900,
        contentType: "image/png",
      },
    );
    assert.match(logoUrl, /^https:\/\/storage\.googleapis\.com\//);
    assert.match(logoUrl, /X-Goog-Signature=[0-9a-f]+$/);
    assert.doesNotMatch(logoUrl, /response-content-disposition=/);

    const directUrl = generateGcsV4SignedUrl(
      TEST_CONFIG,
      "plannerdesk/authorized-assets/claim-pdfs/sample/asset.pdf",
      {
        expiresInSeconds: 900,
        responseDisposition: 'attachment; filename="claim.pdf"',
        responseType: "application/pdf",
        now: FIXED_NOW,
      },
    );
    assert.match(directUrl, /X-Goog-Date=20260115T120000Z/);
    assert.match(directUrl, /X-Goog-Signature=[0-9a-f]+$/);
  });

  it("redirects PDF fallback with relative Location regardless of request.url", () => {
    const path = "/claim-forms/authorized/sample/example.pdf";
    const response = redirectToApprovedStaticPath(path);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("Location"), path);
    assertLocationHasNoForbiddenFragments(response.headers.get("Location") ?? "");
  });

  it("redirects logo fallback with relative Location regardless of request.url", () => {
    const path = "/insurer-logos/authorized/sample/example.png";
    const response = redirectToApprovedStaticPath(path);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("Location"), path);
    assertLocationHasNoForbiddenFragments(response.headers.get("Location") ?? "");
  });

  it("rejects unsafe static fallback targets", () => {
    const unsafePaths = [
      "http://localhost:8080/claim-forms/x.pdf",
      "https://evil.test/insurer-logos/x.png",
      "//claim-forms/authorized/x.pdf",
      "/claim-forms/authorized/../escape.pdf",
      String.raw`\\server\share\logo.png`,
      "localhost/claim-forms/authorized/x.pdf",
    ];
    for (const path of unsafePaths) {
      assert.equal(isSafeApprovedStaticPublicPath(path), false);
      assert.equal(redirectToApprovedStaticPath(path).status, 404);
    }
  });

  it("allows only enabled manifest assets for static fallback helpers", () => {
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

    assert.equal(
      redirectToApprovedStaticPath(enabledPdf.staticPublicPath).status,
      307,
    );
    assert.equal(
      redirectToApprovedStaticPath(enabledLogo.staticPublicPath).status,
      307,
    );

    assert.equal(findAuthorizedStaticAssetById("missing-asset-id"), undefined);
    assert.equal(findAuthorizedStaticLogoByInsurerId("missing-insurer"), undefined);
  });

  it("keeps route sources on relative static redirect and signed URL success path", () => {
    const downloadRoute = readSource(
      "app/api/authorized-assets/download/[assetId]/route.ts",
    );
    const logoRoute = readSource(
      "app/api/authorized-assets/logo/[insurerId]/route.ts",
    );

    assert.match(downloadRoute, /redirectToApprovedStaticPath/);
    assert.match(logoRoute, /redirectToApprovedStaticPath/);
    assert.doesNotMatch(downloadRoute, /new URL\(asset\.staticPublicPath/);
    assert.doesNotMatch(logoRoute, /new URL\(asset\.staticPublicPath/);
    assert.doesNotMatch(downloadRoute, /catch \(error: any\)/);
    assert.doesNotMatch(logoRoute, /catch \(error: any\)/);
    assert.match(downloadRoute, /NextResponse\.redirect\(signedUrl, 307\)/);
    assert.match(logoRoute, /NextResponse\.redirect\(signedUrl, 307\)/);
    assert.doesNotMatch(downloadRoute, /firebase_with_static_fallback/);
    assert.doesNotMatch(logoRoute, /firebase_with_static_fallback/);
  });

  it("classifies delivery errors without any and without secret fields", () => {
    assert.deepEqual(
      classifyAuthorizedAssetDeliveryError(new Error("FIREBASE_AUTH_FAILED")),
      { code: "asset_delivery_credentials_missing", status: 503 },
    );
    assert.deepEqual(
      classifyAuthorizedAssetDeliveryError(new Error("FIREBASE_STORAGE_FORBIDDEN")),
      { code: "asset_delivery_storage_forbidden", status: 403 },
    );
    assert.deepEqual(
      classifyAuthorizedAssetDeliveryError(new Error("FIREBASE_SIGN_FAILED")),
      { code: "asset_delivery_sign_failed", status: 503 },
    );
    assert.deepEqual(classifyAuthorizedAssetDeliveryError("unexpected"), {
      code: "asset_delivery_unexpected",
      status: 503,
    });

    const errorsSource = readSource(
      "lib/server/authorized-asset-delivery-errors.ts",
    );
    assert.doesNotMatch(errorsSource, /: any\b/);
    assert.doesNotMatch(errorsSource, /privateKey|clientEmail|signedUrl/i);

    const originalError = console.error;
    let logged = "";
    console.error = (message?: unknown) => {
      logged = String(message);
    };
    try {
      logAuthorizedAssetDeliveryFailure({
        code: "asset_delivery_sign_failed",
        kind: "claim_pdf",
        assetId: "asset-123",
        deliveryMode: "firebase",
        status: 503,
      });
      assert.match(logged, /"event":"authorized_asset_delivery_failed"/);
      assert.match(logged, /"code":"asset_delivery_sign_failed"/);
      assert.doesNotMatch(logged, /privateKey|clientEmail|signedUrl|stack/i);
    } finally {
      console.error = originalError;
    }
  });
});
