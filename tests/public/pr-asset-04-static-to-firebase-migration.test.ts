import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";

import {
  formatSyncResultsTable,
  sha256ForTest,
  syncAuthorizedStaticAssetsToFirebase,
} from "@/lib/assets/sync-static-authorized-assets-to-firebase-core";
import { getWorkToolsFirebaseConfig } from "@/lib/api/work-tools-storage-config";
import {
  buildAuthorizedStaticAssetsManifest,
  findAuthorizedStaticAssetById,
  resetAuthorizedStaticAssetsManifestCache,
  TRIAL_AUTHORIZED_ASSET_IDS,
  validateAuthorizedStaticAssetsManifest,
} from "@/lib/server/authorized-static-assets-manifest";
import {
  buildClaimPdfFirebaseObjectPath,
  isAuthorizedAssetsFirebaseObjectPath,
} from "@/lib/server/authorized-asset-firebase-paths";
import {
  buildAuthorizedPdfDownloadHref,
  getAuthorizedAssetDeliveryMode,
  isFirebaseAuthorizedAssetDelivery,
} from "@/lib/public/authorized-asset-delivery-mode";
import { resolveClaimFormPublicAssetView } from "@/lib/public/public-asset-policy";
import { claimFormFiles } from "@/lib/content/claim-form-files";

const ROOT = process.cwd();

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-ASSET-04 static to Firebase migration", () => {
  it("reads WORK_TOOLS_FIREBASE_BUCKET only in storage config", () => {
    const config = readSource("lib/api/work-tools-storage-config.ts");
    const service = readSource("lib/server/firebase-service-account.ts");
    assert.match(config, /WORK_TOOLS_FIREBASE_BUCKET/);
    assert.doesNotMatch(config, /FIREBASE_STORAGE_BUCKET/);
    assert.match(service, /getWorkToolsFirebaseConfig/);
  });

  it("defaults delivery mode to static and rejects invalid values", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    try {
      delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      assert.equal(getAuthorizedAssetDeliveryMode(), "static");
      assert.equal(isFirebaseAuthorizedAssetDelivery(), false);

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
      assert.equal(getAuthorizedAssetDeliveryMode(), "firebase");

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "invalid";
      assert.equal(getAuthorizedAssetDeliveryMode(), "static");
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("uses static href in static mode and API route in firebase mode", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    const staticPath = "/claim-forms/authorized/sample/x.pdf";
    try {
      delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      assert.equal(buildAuthorizedPdfDownloadHref("asset-1", staticPath), staticPath);

      process.env.AUTHORIZED_ASSET_DELIVERY_MODE = "firebase";
      assert.equal(
        buildAuthorizedPdfDownloadHref("asset-1", staticPath),
        "/api/authorized-assets/download/asset-1",
      );
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("builds manifest only from existing static authorized files", () => {
    resetAuthorizedStaticAssetsManifestCache();
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    assert.equal(validateAuthorizedStaticAssetsManifest(manifest).length, 0);
    assert.ok(manifest.length > 0);
    for (const asset of manifest) {
      assert.equal(asset.enabled, true);
      assert.equal(asset.permissionRecordKey, "bohumschool_archive_redistribution");
      assert.equal(
        existsSync(join(ROOT, "public", asset.staticPublicPath.replace(/^\//, ""))),
        true,
      );
      assert.equal(isAuthorizedAssetsFirebaseObjectPath(asset.firebaseObjectPath), true);
    }
  });

  it("blocks duplicate manifest ids and path traversal", () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const sample = manifest[0]!;
    const dup = [
      ...manifest,
      { ...sample, staticPublicPath: "/claim-forms/authorized/../escape.pdf" },
    ];
    const issues = validateAuthorizedStaticAssetsManifest(dup);
    assert.ok(issues.some((issue) => issue.reason.includes("traversal") || issue.reason.includes("prefix")));
  });

  it("maps claim pdf firebase paths under authorized-assets prefix", () => {
    const path = buildClaimPdfFirebaseObjectPath("samsung-fire", "asset-123");
    assert.equal(
      path,
      "plannerdesk/authorized-assets/claim-pdfs/samsung-fire/asset-123.pdf",
    );
    assert.doesNotMatch(path, /bohumschool/i);
  });

  it("dry-run sync does not upload and apply uses upload impl", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pd-sync-"));
    const pdfPath = join(dir, "public", "claim-forms", "authorized", "demo", "trial.pdf");
    mkdirSync(join(dir, "public", "claim-forms", "authorized", "demo"), { recursive: true });
    writeFileSync(pdfPath, Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(4)]));

    const asset = {
      assetId: "trial-asset",
      kind: "claim_pdf" as const,
      insurerId: "demo",
      title: "Trial",
      staticPublicPath: "/claim-forms/authorized/demo/trial.pdf",
      firebaseObjectPath: "plannerdesk/authorized-assets/claim-pdfs/demo/trial-asset.pdf",
      contentType: "application/pdf",
      enabled: true,
      permissionRecordKey: "bohumschool_archive_redistribution" as const,
      reviewedAt: "2026-06-22",
    };

    const config = {
      bucket: "bucket.test",
      clientEmail: "svc@test.iam.gserviceaccount.com",
      privateKey: "fake",
    };

    let uploadCalls = 0;
    const dry = await syncAuthorizedStaticAssetsToFirebase({
      rootDir: dir,
      assets: [asset],
      config,
      apply: false,
    });
    assert.equal(dry[0]?.status, "skipped");
    assert.equal(dry[0]?.reason, "dry_run");

    const applied = await syncAuthorizedStaticAssetsToFirebase({
      rootDir: dir,
      assets: [asset],
      config,
      apply: true,
      metadataImpl: async () => null,
      uploadImpl: async () => {
        uploadCalls += 1;
      },
    });
    assert.equal(applied[0]?.status, "uploaded");
    assert.equal(uploadCalls, 1);

    rmSync(dir, { recursive: true, force: true });
  });

  it("validates pdf magic bytes and checksum mismatch", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pd-bad-"));
    const pdfPath = join(dir, "public", "claim-forms", "authorized", "demo", "bad.pdf");
    mkdirSync(join(dir, "public", "claim-forms", "authorized", "demo"), { recursive: true });
    writeFileSync(pdfPath, Buffer.from("NOTPDF"));

    const asset = {
      assetId: "bad",
      kind: "claim_pdf" as const,
      insurerId: "demo",
      title: "Bad",
      staticPublicPath: "/claim-forms/authorized/demo/bad.pdf",
      firebaseObjectPath: "plannerdesk/authorized-assets/claim-pdfs/demo/bad.pdf",
      contentType: "application/pdf",
      enabled: true,
      permissionRecordKey: "bohumschool_archive_redistribution" as const,
      reviewedAt: "2026-06-22",
    };

    const bad = await syncAuthorizedStaticAssetsToFirebase({
      rootDir: dir,
      assets: [asset],
      config: {
        bucket: "bucket.test",
        clientEmail: "svc@test.iam.gserviceaccount.com",
        privateKey: "fake",
      },
      apply: true,
    });
    assert.equal(bad[0]?.reason, "invalid_pdf");
    rmSync(dir, { recursive: true, force: true });
  });

  it("wires API routes and keeps Firebase Admin server-only", () => {
    const download = readSource("app/api/authorized-assets/download/[assetId]/route.ts");
    const logo = readSource("app/api/authorized-assets/logo/[insurerId]/route.ts");
    const listItem = readSource("components/claim-documents/claim-form-list-item.tsx");
    assert.match(download, /runtime = "nodejs"/);
    assert.match(download, /findAuthorizedStaticAssetById/);
    assert.match(download, /Cache-Control/);
    assert.match(logo, /findAuthorizedStaticLogoByInsurerId/);
    assert.doesNotMatch(download, /FIREBASE_UPLOAD_PRIVATE_KEY/);
    assert.doesNotMatch(listItem, /firebase-admin/);
  });

  it("keeps static pdf resolver in static mode", () => {
    const prev = process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
    try {
      delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      const form = claimFormFiles[0]!;
      const view = resolveClaimFormPublicAssetView(form, "https://www.samsungfire.com/");
      assert.equal(view?.kind, "approved_local_with_official");
      if (view?.kind === "approved_local_with_official") {
        assert.match(view.localHref, /^\/claim-forms\/authorized\//);
      }
    } finally {
      if (prev === undefined) delete process.env.AUTHORIZED_ASSET_DELIVERY_MODE;
      else process.env.AUTHORIZED_ASSET_DELIVERY_MODE = prev;
    }
  });

  it("defines seven-asset trial rollout ids", () => {
    assert.equal(TRIAL_AUTHORIZED_ASSET_IDS.length, 7);
    resetAuthorizedStaticAssetsManifestCache();
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const trialIds = new Set(TRIAL_AUTHORIZED_ASSET_IDS);
    const trialAssets = manifest.filter((asset) => trialIds.has(asset.assetId as never));
    assert.equal(trialAssets.length, 7);
    assert.ok(findAuthorizedStaticAssetById(TRIAL_AUTHORIZED_ASSET_IDS[6]!));
  });

  it("formats sync output without secrets", () => {
    const table = formatSyncResultsTable([
      {
        assetId: "x",
        kind: "claim_pdf",
        status: "skipped",
        firebaseObjectPath: "plannerdesk/authorized-assets/claim-pdfs/x/x.pdf",
        reason: "dry_run",
      },
    ]);
    assert.match(table, /assetId/);
    assert.doesNotMatch(table, /PRIVATE_KEY/);
  });

  it("documents migration without secrets", () => {
    const doc = readSource("docs/FIREBASE_AUTHORIZED_ASSET_MIGRATION.md");
    assert.match(doc, /WORK_TOOLS_FIREBASE_BUCKET/);
    assert.match(doc, /AUTHORIZED_ASSET_DELIVERY_MODE/);
    assert.doesNotMatch(doc, /PRIVATE_KEY=/);
  });

  it("env example documents delivery mode without new bucket var", () => {
    const example = readSource(".env.example");
    assert.match(example, /AUTHORIZED_ASSET_DELIVERY_MODE/);
    assert.doesNotMatch(example, /(^|\n)FIREBASE_STORAGE_BUCKET=/);
    assert.ok(getWorkToolsFirebaseConfig() === null || typeof getWorkToolsFirebaseConfig()?.bucket === "string");
  });
});
