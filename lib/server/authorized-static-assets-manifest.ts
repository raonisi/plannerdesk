/**
 * Server-only manifest of static authorized assets eligible for Firebase sync.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX,
  AUTHORIZED_LOGO_PUBLIC_PREFIX,
  authorizedThirdPartyAssets,
  type AuthorizedThirdPartyAsset,
} from "@/lib/content/authorized-third-party-assets";
import {
  buildClaimPdfFirebaseObjectPath,
  buildInsurerLogoFirebaseObjectPath,
  buildLearningResourceFirebaseObjectPath,
} from "@/lib/server/authorized-asset-firebase-paths";

export type AuthorizedAssetKind =
  | "claim_pdf"
  | "insurer_logo"
  | "learning_resource";

export type AuthorizedStaticAsset = {
  assetId: string;
  kind: AuthorizedAssetKind;
  insurerId?: string;
  title: string;
  staticPublicPath: string;
  firebaseObjectPath: string;
  contentType: string;
  enabled: boolean;
  permissionRecordKey: "bohumschool_archive_redistribution";
  reviewedAt: string;
  sha256?: string;
  byteSize?: number;
};

export const BOHUMSCHOOL_ARCHIVE_PERMISSION_RECORD_KEY =
  "bohumschool_archive_redistribution" as const;

const LEARNING_RESOURCE_DEFINITIONS: Array<{
  assetId: string;
  title: string;
  staticPublicPath: string;
  contentType: string;
}> = [
  {
    assetId: "learning-nonlife-mock-exams",
    title: "손해보험 모의고사",
    staticPublicPath: "/downloads/non-life-insurance-mock-exams.zip",
    contentType: "application/zip",
  },
  {
    assetId: "learning-life-mock-exams",
    title: "생명보험 모의고사",
    staticPublicPath: "/downloads/life-insurance-mock-exams.zip",
    contentType: "application/zip",
  },
  {
    assetId: "learning-variable-mock-exams",
    title: "변액보험 모의고사",
    staticPublicPath: "/downloads/variable-insurance-mock-exams.zip",
    contentType: "application/zip",
  },
  {
    assetId: "learning-nonlife-textbook",
    title: "손해보험 교재",
    staticPublicPath: "/downloads/non-life-insurance-textbook.pdf",
    contentType: "application/pdf",
  },
  {
    assetId: "learning-life-textbook",
    title: "생명보험 교재",
    staticPublicPath: "/downloads/life-insurance-textbook.pdf",
    contentType: "application/pdf",
  },
  {
    assetId: "learning-variable-textbook",
    title: "변액보험 교재",
    staticPublicPath: "/downloads/variable-insurance-textbook.pdf",
    contentType: "application/pdf",
  },
];

/** Trial sync set for staged Firebase rollout (7 assets). */
export const TRIAL_AUTHORIZED_ASSET_IDS = [
  "bohumschool-kyobo-digital-2082cac9-1b1f-4dea-8d39-6dc5f588f381",
  "bohumschool-kyobo-digital-2d4aa7e7-549b-4c2b-b7e0-7155f97f3b56",
  "bohumschool-kyobo-life-65e806e7-a190-49e5-9993-fe78a5ac0381",
  "logo-samsung-fire",
  "logo-hanwha-general",
  "logo-hyundai-marine",
  "learning-nonlife-textbook",
] as const;

export type AuthorizedStaticManifestIssue = {
  assetId: string;
  reason: string;
};

function extensionFromPublicPath(publicPath: string): string {
  const segment = publicPath.split("/").pop() ?? "";
  const dot = segment.lastIndexOf(".");
  return dot >= 0 ? segment.slice(dot + 1).toLowerCase() : "";
}

function contentTypeForThirdPartyAsset(
  asset: AuthorizedThirdPartyAsset,
): string {
  if (asset.kind === "claim_pdf") return "application/pdf";
  const ext = extensionFromPublicPath(asset.publicPath);
  if (ext === "svg") return "image/svg+xml";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

function resolveStaticDiskPath(rootDir: string, staticPublicPath: string): string {
  const normalized = staticPublicPath.trim();
  if (
    !normalized.startsWith("/") ||
    normalized.includes("..") ||
    normalized.includes("\\")
  ) {
    throw new Error("INVALID_STATIC_PUBLIC_PATH");
  }
  const diskPath = resolve(rootDir, "public", normalized.replace(/^\//, ""));
  const publicRoot = resolve(rootDir, "public");
  if (!diskPath.startsWith(publicRoot)) {
    throw new Error("STATIC_PATH_OUTSIDE_PUBLIC_ROOT");
  }
  return diskPath;
}

function mapThirdPartyAsset(
  asset: AuthorizedThirdPartyAsset,
): AuthorizedStaticAsset | null {
  if (!asset.enabled || !asset.permissionReference.trim()) {
    return null;
  }

  if (asset.kind === "claim_pdf") {
    return {
      assetId: asset.assetId,
      kind: "claim_pdf",
      insurerId: asset.insurerId,
      title: asset.title,
      staticPublicPath: asset.publicPath,
      firebaseObjectPath: buildClaimPdfFirebaseObjectPath(
        asset.insurerId ?? "common",
        asset.assetId,
      ),
      contentType: "application/pdf",
      enabled: true,
      permissionRecordKey: BOHUMSCHOOL_ARCHIVE_PERMISSION_RECORD_KEY,
      reviewedAt: asset.reviewedAt,
    };
  }

  if (asset.kind === "insurer_logo") {
    const insurerId = asset.insurerId ?? asset.assetId.replace(/^logo-/, "");
    const ext = extensionFromPublicPath(asset.publicPath);
    return {
      assetId: asset.assetId,
      kind: "insurer_logo",
      insurerId,
      title: asset.title,
      staticPublicPath: asset.publicPath,
      firebaseObjectPath: buildInsurerLogoFirebaseObjectPath(insurerId, ext),
      contentType: contentTypeForThirdPartyAsset(asset),
      enabled: true,
      permissionRecordKey: BOHUMSCHOOL_ARCHIVE_PERMISSION_RECORD_KEY,
      reviewedAt: asset.reviewedAt,
    };
  }

  return null;
}

function mapLearningResource(def: (typeof LEARNING_RESOURCE_DEFINITIONS)[number]): AuthorizedStaticAsset {
  const ext = extensionFromPublicPath(def.staticPublicPath);
  return {
    assetId: def.assetId,
    kind: "learning_resource",
    title: def.title,
    staticPublicPath: def.staticPublicPath,
    firebaseObjectPath: buildLearningResourceFirebaseObjectPath(def.assetId, ext),
    contentType: def.contentType,
    enabled: true,
    permissionRecordKey: BOHUMSCHOOL_ARCHIVE_PERMISSION_RECORD_KEY,
    reviewedAt: "2026-06-22",
  };
}

export function buildAuthorizedStaticAssetsManifest(
  rootDir: string,
): AuthorizedStaticAsset[] {
  const assets: AuthorizedStaticAsset[] = [];

  for (const source of authorizedThirdPartyAssets) {
    const mapped = mapThirdPartyAsset(source);
    if (!mapped) continue;
    if (!existsSync(resolveStaticDiskPath(rootDir, mapped.staticPublicPath))) {
      continue;
    }
    assets.push(enrichWithFileStats(rootDir, mapped));
  }

  for (const def of LEARNING_RESOURCE_DEFINITIONS) {
    const mapped = mapLearningResource(def);
    if (!existsSync(resolveStaticDiskPath(rootDir, mapped.staticPublicPath))) {
      continue;
    }
    assets.push(enrichWithFileStats(rootDir, mapped));
  }

  return assets;
}

function enrichWithFileStats(
  rootDir: string,
  asset: AuthorizedStaticAsset,
): AuthorizedStaticAsset {
  const diskPath = resolveStaticDiskPath(rootDir, asset.staticPublicPath);
  const stats = statSync(diskPath);
  return {
    ...asset,
    byteSize: stats.size,
  };
}

export function validateAuthorizedStaticAsset(
  asset: AuthorizedStaticAsset,
): AuthorizedStaticManifestIssue | null {
  if (!asset.assetId.trim()) return { assetId: asset.assetId, reason: "assetId required" };
  if (!asset.staticPublicPath.startsWith("/")) {
    return { assetId: asset.assetId, reason: "staticPublicPath must start with /" };
  }
  if (asset.staticPublicPath.includes("..")) {
    return { assetId: asset.assetId, reason: "path traversal blocked" };
  }
  if (
    asset.kind === "claim_pdf" &&
    !asset.staticPublicPath.startsWith(AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX)
  ) {
    return { assetId: asset.assetId, reason: "claim pdf path prefix mismatch" };
  }
  if (
    asset.kind === "insurer_logo" &&
    !asset.staticPublicPath.startsWith(AUTHORIZED_LOGO_PUBLIC_PREFIX)
  ) {
    return { assetId: asset.assetId, reason: "logo path prefix mismatch" };
  }
  if (!asset.firebaseObjectPath.startsWith("plannerdesk/authorized-assets/")) {
    return { assetId: asset.assetId, reason: "firebase path prefix mismatch" };
  }
  return null;
}

export function validateAuthorizedStaticAssetsManifest(
  assets: AuthorizedStaticAsset[],
): AuthorizedStaticManifestIssue[] {
  const issues: AuthorizedStaticManifestIssue[] = [];
  const assetIds = new Set<string>();
  const staticPaths = new Set<string>();
  const firebasePaths = new Set<string>();

  for (const asset of assets) {
    const issue = validateAuthorizedStaticAsset(asset);
    if (issue) issues.push(issue);

    if (assetIds.has(asset.assetId)) {
      issues.push({ assetId: asset.assetId, reason: "duplicate assetId" });
    }
    assetIds.add(asset.assetId);

    if (staticPaths.has(asset.staticPublicPath)) {
      issues.push({ assetId: asset.assetId, reason: "duplicate staticPublicPath" });
    }
    staticPaths.add(asset.staticPublicPath);

    if (firebasePaths.has(asset.firebaseObjectPath)) {
      issues.push({ assetId: asset.assetId, reason: "duplicate firebaseObjectPath" });
    }
    firebasePaths.add(asset.firebaseObjectPath);
  }

  return issues;
}

let cachedManifest: AuthorizedStaticAsset[] | null = null;

export function getAuthorizedStaticAssetsManifest(
  rootDir = process.cwd(),
): AuthorizedStaticAsset[] {
  if (!cachedManifest) {
    cachedManifest = buildAuthorizedStaticAssetsManifest(rootDir);
  }
  return cachedManifest;
}

export function findAuthorizedStaticAssetById(
  assetId: string,
  rootDir = process.cwd(),
): AuthorizedStaticAsset | undefined {
  return getAuthorizedStaticAssetsManifest(rootDir).find(
    (asset) => asset.assetId === assetId && asset.enabled,
  );
}

export function findAuthorizedStaticLogoByInsurerId(
  insurerId: string,
  rootDir = process.cwd(),
): AuthorizedStaticAsset | undefined {
  return getAuthorizedStaticAssetsManifest(rootDir).find(
    (asset) =>
      asset.kind === "insurer_logo" &&
      asset.enabled &&
      asset.insurerId === insurerId,
  );
}

export function resetAuthorizedStaticAssetsManifestCache(): void {
  cachedManifest = null;
}

export function readStaticAssetBytes(
  rootDir: string,
  asset: AuthorizedStaticAsset,
): Buffer {
  return readFileSync(resolveStaticDiskPath(rootDir, asset.staticPublicPath));
}

export function resolveStaticDiskPathForAsset(
  rootDir: string,
  staticPublicPath: string,
): string {
  return resolveStaticDiskPath(rootDir, staticPublicPath);
}
