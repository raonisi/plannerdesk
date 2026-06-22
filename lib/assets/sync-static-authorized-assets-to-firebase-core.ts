import { createHash } from "node:crypto";

import type { AuthorizedStaticAsset } from "@/lib/server/authorized-static-assets-manifest";
import {
  getFirebaseObjectMetadata,
  sha256Buffer,
  uploadFirebaseAuthorizedAsset,
  type FirebaseObjectMetadata,
} from "@/lib/server/firebase-authorized-asset-storage";
import type { FirebaseServiceAccountConfig } from "@/lib/server/firebase-service-account";
import { readStaticAssetBytes } from "@/lib/server/authorized-static-assets-manifest";

const PDF_MAGIC = Buffer.from("%PDF-");
const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);
const PDF_MAX_BYTES = 40 * 1024 * 1024;
const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LEARNING_MAX_BYTES = 40 * 1024 * 1024;

export type SyncAuthorizedAssetResult = {
  assetId: string;
  kind: AuthorizedStaticAsset["kind"];
  status: "uploaded" | "skipped" | "failed";
  firebaseObjectPath: string;
  sha256?: string;
  bytes?: number;
  reason?: string;
};

export type SyncAuthorizedAssetsOptions = {
  rootDir: string;
  assets: AuthorizedStaticAsset[];
  config: FirebaseServiceAccountConfig;
  apply: boolean;
  uploadImpl?: typeof uploadFirebaseAuthorizedAsset;
  metadataImpl?: typeof getFirebaseObjectMetadata;
};

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

function extensionFromPath(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

function validateAssetBytes(
  asset: AuthorizedStaticAsset,
  buffer: Buffer,
): string | null {
  const maxBytes =
    asset.kind === "insurer_logo"
      ? LOGO_MAX_BYTES
      : LEARNING_MAX_BYTES;

  if (buffer.byteLength > maxBytes) {
    return "size_limit";
  }

  if (asset.kind === "claim_pdf" || asset.contentType === "application/pdf") {
    if (!isPdfBuffer(buffer)) return "invalid_pdf";
    return null;
  }

  if (asset.kind === "insurer_logo") {
    const ext = extensionFromPath(asset.staticPublicPath);
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) return "invalid_image_ext";
    return null;
  }

  if (asset.kind === "learning_resource") {
    const ext = extensionFromPath(asset.staticPublicPath);
    if (ext === "pdf" && !isPdfBuffer(buffer)) return "invalid_pdf";
    if (ext === "zip" || ext === "pdf") return null;
    return "invalid_learning_resource";
  }

  return "invalid_kind";
}

export async function syncAuthorizedStaticAssetsToFirebase(
  options: SyncAuthorizedAssetsOptions,
): Promise<SyncAuthorizedAssetResult[]> {
  const upload = options.uploadImpl ?? uploadFirebaseAuthorizedAsset;
  const getMetadata = options.metadataImpl ?? getFirebaseObjectMetadata;
  const results: SyncAuthorizedAssetResult[] = [];

  for (const asset of options.assets) {
    const base = {
      assetId: asset.assetId,
      kind: asset.kind,
      firebaseObjectPath: asset.firebaseObjectPath,
    };

    if (!asset.enabled) {
      results.push({ ...base, status: "failed", reason: "disabled" });
      continue;
    }

    let buffer: Buffer;
    try {
      buffer = readStaticAssetBytes(options.rootDir, asset);
    } catch {
      results.push({ ...base, status: "failed", reason: "static_missing" });
      continue;
    }

    const validationError = validateAssetBytes(asset, buffer);
    if (validationError) {
      results.push({ ...base, status: "failed", reason: validationError });
      continue;
    }

    const sha256 = sha256Buffer(buffer);
    if (asset.sha256 && asset.sha256 !== sha256) {
      results.push({ ...base, status: "failed", reason: "checksum_mismatch" });
      continue;
    }

    if (!options.apply) {
      results.push({
        ...base,
        status: "skipped",
        sha256,
        bytes: buffer.byteLength,
        reason: "dry_run",
      });
      continue;
    }

    try {
      const existing = await getMetadata(options.config, asset.firebaseObjectPath);
      if (existing?.sha256 === sha256) {
        results.push({
          ...base,
          status: "skipped",
          sha256,
          bytes: buffer.byteLength,
          reason: "unchanged",
        });
        continue;
      }

      const metadata: FirebaseObjectMetadata = {
        assetId: asset.assetId,
        insurerId: asset.insurerId,
        sha256,
        contentType: asset.contentType,
        reviewedAt: asset.reviewedAt,
        permissionRecordKey: asset.permissionRecordKey,
      };

      await upload(options.config, asset.firebaseObjectPath, buffer, metadata);
      results.push({
        ...base,
        status: "uploaded",
        sha256,
        bytes: buffer.byteLength,
      });
    } catch {
      results.push({ ...base, status: "failed", reason: "upload_failed" });
    }
  }

  return results;
}

export function formatSyncResultsTable(results: SyncAuthorizedAssetResult[]): string {
  const header = "assetId\tstatus\tbytes\tsha256\treason";
  const rows = results.map((row) =>
    [
      row.assetId,
      row.status,
      row.bytes ?? "",
      row.sha256 ?? "",
      row.reason ?? "",
    ].join("\t"),
  );
  return [header, ...rows].join("\n");
}

export function sha256ForTest(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}
