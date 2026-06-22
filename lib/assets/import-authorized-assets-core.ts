import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

import type { AuthorizedThirdPartyAsset } from "@/lib/content/authorized-third-party-assets";
import {
  getEnabledAuthorizedAssets,
  validateAuthorizedAsset,
} from "@/lib/content/authorized-third-party-assets";
import { PRIVATE_ASSET_REVIEW_PREFIX } from "@/lib/public/public-asset-policy";

export const PDF_MAX_BYTES = 40 * 1024 * 1024;
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const PDF_MAGIC = Buffer.from("%PDF-");
const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

export type ImportFetch = (url: string) => Promise<Buffer>;

export type ImportAuthorizedAssetResult = {
  assetId: string;
  kind: AuthorizedThirdPartyAsset["kind"];
  status: "imported" | "skipped" | "failed";
  publicPath: string;
  sha256?: string;
  bytes?: number;
  reason?: string;
};

export type ImportAuthorizedAssetsOptions = {
  rootDir: string;
  assets?: AuthorizedThirdPartyAsset[];
  fetchImpl?: ImportFetch;
  copyFromReview?: boolean;
};

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function assertPublicPathSafe(rootDir: string, publicPath: string): string {
  const diskPath = resolve(rootDir, "public", publicPath.replace(/^\//, ""));
  const publicRoot = resolve(rootDir, "public");
  if (!diskPath.startsWith(publicRoot)) {
    throw new Error(`PATH_TRAVERSAL:${publicPath}`);
  }
  return diskPath;
}

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

function isAllowedImageExtension(publicPath: string): boolean {
  const ext = publicPath.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_IMAGE_EXTENSIONS.has(ext);
}

function readLegacyReviewFile(
  rootDir: string,
  legacyReviewPath: string | undefined,
): Buffer | null {
  if (!legacyReviewPath) return null;
  const diskPath = join(rootDir, PRIVATE_ASSET_REVIEW_PREFIX, legacyReviewPath);
  if (!existsSync(diskPath)) return null;
  return readFileSync(diskPath);
}

async function loadAssetBytes(
  asset: AuthorizedThirdPartyAsset,
  options: ImportAuthorizedAssetsOptions,
): Promise<Buffer> {
  if (options.copyFromReview !== false && asset.kind === "claim_pdf") {
    const legacy = readLegacyReviewFile(options.rootDir, asset.legacyReviewPath);
    if (legacy) return legacy;
  }

  const fetchImpl = options.fetchImpl;
  if (!fetchImpl) {
    throw new Error("SOURCE_UNAVAILABLE");
  }

  const sourceHost = new URL(asset.sourceUrl).hostname.toLowerCase();
  if (sourceHost !== asset.sourceHost.toLowerCase()) {
    throw new Error("SOURCE_HOST_MISMATCH");
  }

  return fetchImpl(asset.sourceUrl);
}

export async function importAuthorizedAssets(
  options: ImportAuthorizedAssetsOptions,
): Promise<ImportAuthorizedAssetResult[]> {
  const rootDir = options.rootDir;
  const assets = options.assets ?? getEnabledAuthorizedAssets();
  const results: ImportAuthorizedAssetResult[] = [];

  for (const asset of assets) {
    const base = {
      assetId: asset.assetId,
      kind: asset.kind,
      publicPath: asset.publicPath,
    };

    const validation = validateAuthorizedAsset(asset);
    if (validation) {
      results.push({
        ...base,
        status: "failed",
        reason: validation.reason,
      });
      continue;
    }

    if (!asset.enabled || !asset.permissionReference.trim()) {
      results.push({ ...base, status: "skipped", reason: "disabled" });
      continue;
    }

    let diskPath: string;
    try {
      diskPath = assertPublicPathSafe(rootDir, asset.publicPath);
    } catch {
      results.push({ ...base, status: "failed", reason: "path_traversal" });
      continue;
    }

    let buffer: Buffer;
    try {
      buffer = await loadAssetBytes(asset, options);
    } catch (error) {
      results.push({
        ...base,
        status: "failed",
        reason: error instanceof Error ? error.message : "load_failed",
      });
      continue;
    }

    const maxBytes = asset.kind === "claim_pdf" ? PDF_MAX_BYTES : LOGO_MAX_BYTES;
    if (buffer.byteLength > maxBytes) {
      results.push({ ...base, status: "failed", reason: "size_limit" });
      continue;
    }

    if (asset.kind === "claim_pdf") {
      if (!isPdfBuffer(buffer)) {
        results.push({ ...base, status: "failed", reason: "invalid_pdf" });
        continue;
      }
    } else if (asset.kind === "insurer_logo") {
      if (!isAllowedImageExtension(asset.publicPath)) {
        results.push({ ...base, status: "failed", reason: "invalid_image_ext" });
        continue;
      }
    }

    const digest = sha256(buffer);
    if (asset.checksumSha256 && asset.checksumSha256 !== digest) {
      results.push({ ...base, status: "failed", reason: "checksum_mismatch" });
      continue;
    }

    mkdirSync(dirname(diskPath), { recursive: true });
    writeFileSync(diskPath, buffer);

    results.push({
      ...base,
      status: "imported",
      sha256: digest,
      bytes: buffer.byteLength,
    });
  }

  return results;
}

export function importAuthorizedAssetsFromLocalReview(
  options: Omit<ImportAuthorizedAssetsOptions, "fetchImpl">,
): ImportAuthorizedAssetResult[] {
  const rootDir = options.rootDir;
  const assets = options.assets ?? getEnabledAuthorizedAssets();
  const results: ImportAuthorizedAssetResult[] = [];

  for (const asset of assets) {
    const base = {
      assetId: asset.assetId,
      kind: asset.kind,
      publicPath: asset.publicPath,
    };

    if (!asset.enabled || !asset.permissionReference.trim()) {
      results.push({ ...base, status: "skipped", reason: "disabled" });
      continue;
    }

    if (asset.kind !== "claim_pdf" || !asset.legacyReviewPath) {
      results.push({ ...base, status: "skipped", reason: "not_local_pdf" });
      continue;
    }

    const legacy = readLegacyReviewFile(rootDir, asset.legacyReviewPath);
    if (!legacy) {
      results.push({ ...base, status: "failed", reason: "legacy_missing" });
      continue;
    }

    if (!isPdfBuffer(legacy)) {
      results.push({ ...base, status: "failed", reason: "invalid_pdf" });
      continue;
    }

    if (legacy.byteLength > PDF_MAX_BYTES) {
      results.push({ ...base, status: "failed", reason: "size_limit" });
      continue;
    }

    const digest = sha256(legacy);
    if (asset.checksumSha256 && asset.checksumSha256 !== digest) {
      results.push({ ...base, status: "failed", reason: "checksum_mismatch" });
      continue;
    }

    let diskPath: string;
    try {
      diskPath = assertPublicPathSafe(rootDir, asset.publicPath);
    } catch {
      results.push({ ...base, status: "failed", reason: "path_traversal" });
      continue;
    }

    mkdirSync(dirname(diskPath), { recursive: true });
    copyFileSync(
      join(rootDir, PRIVATE_ASSET_REVIEW_PREFIX, asset.legacyReviewPath),
      diskPath,
    );

    results.push({
      ...base,
      status: "imported",
      sha256: digest,
      bytes: legacy.byteLength,
    });
  }

  return results;
}

export function formatImportResultsTable(
  results: ImportAuthorizedAssetResult[],
): string {
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
