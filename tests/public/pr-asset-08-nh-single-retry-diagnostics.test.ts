import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";

import {
  diagnosticContainsForbiddenSecrets,
  formatUploadFailureDiagnostic,
  sanitizeUploadMessageSummary,
} from "@/lib/assets/authorized-asset-upload-diagnostics";
import {
  buildUploadFailureDiagnostic,
  selectSyncAssetsForRun,
  syncAuthorizedStaticAssetsToFirebase,
} from "@/lib/assets/sync-static-authorized-assets-to-firebase-core";
import { AuthorizedAssetFirebaseUploadError } from "@/lib/server/authorized-asset-firebase-errors";
import {
  buildAuthorizedStaticAssetsManifest,
  TRIAL_AUTHORIZED_ASSET_IDS,
} from "@/lib/server/authorized-static-assets-manifest";

const ROOT = process.cwd();
const NH_ASSET_ID =
  "bohumschool-nh-general-9d70e8a0-def0-4455-a1e4-a058d94508a0";

function readSource(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("PR-ASSET-08 NH single retry diagnostics", () => {
  it("selects exactly one enabled asset with --asset-id", () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const selection = selectSyncAssetsForRun(manifest, { assetId: NH_ASSET_ID });
    assert.equal(selection.ok, true);
    if (!selection.ok) return;
    assert.equal(selection.singleAssetMode, true);
    assert.equal(selection.assets.length, 1);
    assert.equal(selection.assets[0]?.assetId, NH_ASSET_ID);
  });

  it("rejects missing assetId", () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const selection = selectSyncAssetsForRun(manifest, {
      assetId: "missing-asset-id",
    });
    assert.equal(selection.ok, false);
    if (selection.ok) return;
    assert.match(selection.error, /asset_not_found/);
  });

  it("rejects disabled asset", () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const sample = manifest[0]!;
    const disabledManifest = [{ ...sample, enabled: false }];
    const selection = selectSyncAssetsForRun(disabledManifest, {
      assetId: sample.assetId,
    });
    assert.equal(selection.ok, false);
    if (selection.ok) return;
    assert.match(selection.error, /asset_disabled/);
  });

  it("dry-run with --asset-id performs zero Firebase writes", async () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const selection = selectSyncAssetsForRun(manifest, { assetId: NH_ASSET_ID });
    assert.equal(selection.ok, true);
    if (!selection.ok) return;

    let uploadCalls = 0;
    let metadataCalls = 0;
    const results = await syncAuthorizedStaticAssetsToFirebase({
      rootDir: ROOT,
      assets: selection.assets,
      config: {
        bucket: "bucket.test",
        clientEmail: "svc@test.iam.gserviceaccount.com",
        privateKey: "fake",
      },
      apply: false,
      emitUploadDiagnostics: true,
      metadataImpl: async () => {
        metadataCalls += 1;
        return null;
      },
      uploadImpl: async () => {
        uploadCalls += 1;
      },
    });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.reason, "dry_run");
    assert.equal(uploadCalls, 0);
    assert.equal(metadataCalls, 0);
  });

  it("apply with --asset-id targets only one upload attempt", async () => {
    const dir = mkdtempSync(join(tmpdir(), "pd-single-"));
    const pdfPath = join(
      dir,
      "public",
      "claim-forms",
      "authorized",
      "demo",
      "trial.pdf",
    );
    mkdirSync(join(dir, "public", "claim-forms", "authorized", "demo"), {
      recursive: true,
    });
    writeFileSync(pdfPath, Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(4)]));

    const asset = {
      assetId: "trial-asset",
      kind: "claim_pdf" as const,
      insurerId: "demo",
      title: "Trial",
      staticPublicPath: "/claim-forms/authorized/demo/trial.pdf",
      firebaseObjectPath:
        "plannerdesk/authorized-assets/claim-pdfs/demo/trial-asset.pdf",
      contentType: "application/pdf",
      enabled: true,
      permissionRecordKey: "bohumschool_archive_redistribution" as const,
      reviewedAt: "2026-06-22",
    };

    let uploadCalls = 0;
    const results = await syncAuthorizedStaticAssetsToFirebase({
      rootDir: dir,
      assets: [asset],
      config: {
        bucket: "bucket.test",
        clientEmail: "svc@test.iam.gserviceaccount.com",
        privateKey: "fake",
      },
      apply: true,
      emitUploadDiagnostics: true,
      metadataImpl: async () => null,
      uploadImpl: async () => {
        uploadCalls += 1;
      },
    });

    assert.equal(results.length, 1);
    assert.equal(uploadCalls, 1);
    assert.equal(results[0]?.status, "uploaded");
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits sanitized upload diagnostics without secrets", () => {
    const diagnostic = buildUploadFailureDiagnostic(
      NH_ASSET_ID,
      "upload",
      new AuthorizedAssetFirebaseUploadError({
        httpStatus: 503,
        errorCode: "firebase_upload_http_503",
        messageSummary:
          "privateKey=secret client_email=test@example.com Authorization Bearer abc plannerdesk/authorized-assets/claim-pdfs/nh-general/file.pdf",
        retryable: true,
      }),
    );
    const output = formatUploadFailureDiagnostic(diagnostic);
    assert.equal(diagnostic.operation, "upload");
    assert.equal(diagnostic.httpStatus, 503);
    assert.equal(diagnostic.retryable, true);
    assert.doesNotMatch(output, /privateKey/i);
    assert.doesNotMatch(output, /client_email/i);
    assert.doesNotMatch(output, /Bearer/i);
    assert.equal(diagnosticContainsForbiddenSecrets(output), false);
    assert.ok(sanitizeUploadMessageSummary("x".repeat(400)).length <= 300);
  });

  it("documents --asset-id in sync script usage", () => {
    const script = readSource("scripts/assets/sync-static-authorized-assets-to-firebase.ts");
    const core = readSource("lib/assets/sync-static-authorized-assets-to-firebase-core.ts");
    assert.match(script, /--asset-id/);
    assert.match(script, /selectSyncAssetsForRun/);
    assert.match(script, /emitUploadDiagnostics: selection\.singleAssetMode/);
    assert.match(core, /selectSyncAssetsForRun/);
    assert.match(core, /emitUploadDiagnostics/);
  });

  it("preserves bulk trial selection without --asset-id", () => {
    const manifest = buildAuthorizedStaticAssetsManifest(ROOT);
    const selection = selectSyncAssetsForRun(manifest, {
      trial: true,
      trialAssetIds: TRIAL_AUTHORIZED_ASSET_IDS,
    });
    assert.equal(selection.ok, true);
    if (!selection.ok) return;
    assert.equal(selection.singleAssetMode, false);
    assert.equal(selection.assets.length, TRIAL_AUTHORIZED_ASSET_IDS.length);
  });
});
