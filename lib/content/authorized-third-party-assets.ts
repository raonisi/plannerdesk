/**
 * PR-ASSET-02: Authorized third-party asset manifest SSOT.
 * Only assets listed here with valid permissionReference may be served locally.
 */

import { claimFormFiles } from "@/lib/content/claim-form-files";
import { INSURER_LOGO_SOURCES } from "@/lib/directory/insurer-logo-sources";

export type AuthorizedThirdPartyAssetKind =
  | "claim_pdf"
  | "insurer_logo"
  | "download_resource";

export type AuthorizedThirdPartyAsset = {
  assetId: string;
  kind: AuthorizedThirdPartyAssetKind;
  insurerId?: string;
  title: string;
  sourceUrl: string;
  sourceHost: string;
  permissionStatus: "authorized";
  permissionReference: string;
  permissionScope: "download_and_redistribute";
  reviewedAt: string;
  checksumSha256?: string;
  publicPath: string;
  enabled: boolean;
  /** Internal import hint — legacy private-review relative path (claim PDF only). */
  legacyReviewPath?: string;
};

/** Internal permission record id — not the license document itself. */
export const PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE =
  "PD-ASSET-PERM-2026-06-22";

export const AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX = "/claim-forms/authorized/";
export const AUTHORIZED_LOGO_PUBLIC_PREFIX = "/insurer-logos/authorized/";

const ALLOWED_LOGO_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

function hostnameFromUrl(url: string): string {
  return new URL(url.trim()).hostname.toLowerCase();
}

function extensionFromUrl(url: string): string {
  const pathname = new URL(url.trim()).pathname;
  const segment = pathname.split("/").pop() ?? "";
  const dot = segment.lastIndexOf(".");
  if (dot < 0) return "png";
  const ext = segment.slice(dot + 1).split("?")[0]?.toLowerCase() ?? "png";
  return ALLOWED_LOGO_EXTENSIONS.has(ext) ? ext : "png";
}

function buildClaimPdfAssets(): AuthorizedThirdPartyAsset[] {
  return claimFormFiles.map((form) => ({
    assetId: form.id,
    kind: "claim_pdf" as const,
    insurerId: form.insurerSlug,
    title: form.label,
    sourceUrl: form.sourceUrl,
    sourceHost: hostnameFromUrl(form.sourceUrl),
    permissionStatus: "authorized" as const,
    permissionReference: PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
    permissionScope: "download_and_redistribute" as const,
    reviewedAt: "2026-06-22",
    publicPath: `${AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX}${form.insurerSlug}/${form.id}.pdf`,
    enabled: true,
    legacyReviewPath: form.href.replace(/^\//, ""),
  }));
}

function buildInsurerLogoAssets(): AuthorizedThirdPartyAsset[] {
  return INSURER_LOGO_SOURCES.map((entry) => {
    const insurerId = entry.tokens[0]!;
    const ext = extensionFromUrl(entry.src);
    return {
      assetId: `logo-${insurerId}`,
      kind: "insurer_logo" as const,
      insurerId,
      title: `${insurerId} logo`,
      sourceUrl: entry.src,
      sourceHost: hostnameFromUrl(entry.src),
      permissionStatus: "authorized" as const,
      permissionReference: PLANNERDESK_BOHUMSCHOOL_PERMISSION_REFERENCE,
      permissionScope: "download_and_redistribute" as const,
      reviewedAt: "2026-06-22",
      publicPath: `${AUTHORIZED_LOGO_PUBLIC_PREFIX}${insurerId}.${ext}`,
      enabled: true,
    };
  });
}

export const authorizedThirdPartyAssets: AuthorizedThirdPartyAsset[] = [
  ...buildClaimPdfAssets(),
  ...buildInsurerLogoAssets(),
];

export type AuthorizedAssetManifestIssue = {
  assetId: string;
  reason: string;
};

export function isAuthorizedPublicPath(path: string): boolean {
  const normalized = path.trim();
  return (
    normalized.startsWith(AUTHORIZED_CLAIM_PDF_PUBLIC_PREFIX) ||
    normalized.startsWith(AUTHORIZED_LOGO_PUBLIC_PREFIX)
  );
}

export function isPathTraversalPublicPath(path: string): boolean {
  const normalized = path.trim();
  return (
    normalized.includes("..") ||
    normalized.includes("\\") ||
    !normalized.startsWith("/")
  );
}

export function validateAuthorizedAsset(
  asset: AuthorizedThirdPartyAsset,
): AuthorizedAssetManifestIssue | null {
  if (!asset.assetId.trim()) {
    return { assetId: asset.assetId, reason: "assetId required" };
  }
  if (!asset.permissionReference.trim()) {
    return { assetId: asset.assetId, reason: "permissionReference required" };
  }
  if (asset.permissionStatus !== "authorized") {
    return { assetId: asset.assetId, reason: "permissionStatus must be authorized" };
  }
  if (isPathTraversalPublicPath(asset.publicPath)) {
    return { assetId: asset.assetId, reason: "invalid publicPath" };
  }
  if (!isAuthorizedPublicPath(asset.publicPath)) {
    return { assetId: asset.assetId, reason: "publicPath outside authorized prefixes" };
  }
  if (asset.kind === "claim_pdf" && !asset.publicPath.endsWith(".pdf")) {
    return { assetId: asset.assetId, reason: "claim_pdf publicPath must end with .pdf" };
  }
  if (asset.kind === "insurer_logo") {
    const ext = asset.publicPath.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_LOGO_EXTENSIONS.has(ext)) {
      return { assetId: asset.assetId, reason: "logo extension not allowed" };
    }
  }
  let host: string;
  try {
    host = hostnameFromUrl(asset.sourceUrl);
  } catch {
    return { assetId: asset.assetId, reason: "invalid sourceUrl" };
  }
  if (host !== asset.sourceHost.toLowerCase()) {
    return { assetId: asset.assetId, reason: "sourceHost mismatch" };
  }
  return null;
}

export function validateAuthorizedAssetManifest(): AuthorizedAssetManifestIssue[] {
  const issues: AuthorizedAssetManifestIssue[] = [];
  const assetIds = new Set<string>();
  const publicPaths = new Set<string>();

  for (const asset of authorizedThirdPartyAssets) {
    const issue = validateAuthorizedAsset(asset);
    if (issue) issues.push(issue);

    if (assetIds.has(asset.assetId)) {
      issues.push({ assetId: asset.assetId, reason: "duplicate assetId" });
    }
    assetIds.add(asset.assetId);

    if (publicPaths.has(asset.publicPath)) {
      issues.push({ assetId: asset.assetId, reason: "duplicate publicPath" });
    }
    publicPaths.add(asset.publicPath);
  }

  return issues;
}

export function getEnabledAuthorizedAssets(): AuthorizedThirdPartyAsset[] {
  return authorizedThirdPartyAssets.filter(
    (asset) =>
      asset.enabled &&
      asset.permissionStatus === "authorized" &&
      Boolean(asset.permissionReference.trim()),
  );
}

export function findAuthorizedClaimPdf(
  claimFormId: string,
): AuthorizedThirdPartyAsset | undefined {
  return getEnabledAuthorizedAssets().find(
    (asset) => asset.kind === "claim_pdf" && asset.assetId === claimFormId,
  );
}

export function findAuthorizedInsurerLogo(
  insurerId: string,
): AuthorizedThirdPartyAsset | undefined {
  return getEnabledAuthorizedAssets().find(
    (asset) => asset.kind === "insurer_logo" && asset.insurerId === insurerId,
  );
}

export function countEnabledAuthorizedClaimPdfs(): number {
  return getEnabledAuthorizedAssets().filter((a) => a.kind === "claim_pdf").length;
}

export function countEnabledAuthorizedLogos(): number {
  return getEnabledAuthorizedAssets().filter((a) => a.kind === "insurer_logo")
    .length;
}
