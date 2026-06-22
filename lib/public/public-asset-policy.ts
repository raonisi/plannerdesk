/**
 * PR-ASSET-01/02: Public asset rights and disposition SSOT.
 * UI and resolvers must use these helpers — do not hardcode asset exposure per screen.
 */

import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import {
  findAuthorizedClaimPdf,
  findAuthorizedInsurerLogo,
  isAuthorizedPublicPath,
} from "@/lib/content/authorized-third-party-assets";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { resolveOfficialSourceUrlForInsurerSlug } from "@/lib/claim-documents/claim-pdf-governance";
import {
  PUBLIC_CTA_OFFICIAL_CLAIM_GUIDE_OPEN,
  PUBLIC_CTA_OFFICIAL_GUIDE_OPEN,
  PUBLIC_CTA_PDF_DOWNLOAD,
} from "@/lib/public/public-cta-labels";

export type AssetRightsStatus =
  | "official_external_verified"
  | "permission_verified"
  | "pending_evidence"
  | "restricted";

export type PublicAssetDisposition =
  | "approved_local_file"
  | "official_link_only"
  | "needs_confirmation"
  | "hidden";

export type AssetEvidenceRef = {
  status: AssetRightsStatus;
  sourceClass?: "legacy_third_party_archive";
  referenceId?: string;
  reviewedAt?: string;
};

export type PublicAssetView =
  | {
      kind: "approved_local_with_official";
      title: string;
      localHref: string;
      downloadFileName: string;
      localLabel: string;
      officialHref: string;
      officialLabel: string;
    }
  | {
      kind: "approved_local";
      title: string;
      href: string;
      downloadFileName: string;
      label: string;
    }
  | {
      kind: "official_external";
      title: string;
      href: string;
      external: true;
      label: string;
    }
  | {
      kind: "needs_confirmation";
      title: string;
      label: string;
      message: string;
    };

/** @deprecated Use needs_confirmation */
export type PendingAssetView = Extract<
  PublicAssetView,
  { kind: "needs_confirmation" }
>;

export const PUBLIC_ASSET_PENDING_LABEL = "공식 자료 확인 필요";
export const PUBLIC_ASSET_PENDING_MESSAGE =
  "자료는 보험사 공식 홈페이지에서 다시 확인해 주세요.";
export const PUBLIC_ASSET_NO_OFFICIAL_MESSAGE =
  "현재 공개 가능한 공식 자료가 없습니다.";
export const PUBLIC_ASSET_LOGO_TEXT_NOTICE = "보험사명 텍스트로 표시됩니다.";

const BLOCKED_URL_PATTERNS = [
  /^#$/,
  /^$/,
  /bohumschool/i,
  /onrender\.com/i,
  /supabase\.co\/storage/i,
  /claim-docs\//i,
] as const;

/** Non-public review storage — never served as Next static assets. */
export const PRIVATE_ASSET_REVIEW_PREFIX = "private-asset-review/";

const officialInsurerHostnames = buildOfficialInsurerHostnames();

function buildOfficialInsurerHostnames(): Set<string> {
  const hosts = new Set<string>();
  for (const entry of insurerDirectoryEntries) {
    for (const raw of [
      entry.officialWebsiteUrl,
      entry.claimPageUrl,
      entry.claimFormUrl,
      entry.termsUrl,
    ]) {
      const host = hostnameFromUrl(raw);
      if (host) hosts.add(host);
    }
  }
  return hosts;
}

function hostnameFromUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    return new URL(url.trim()).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isBlockedPublicAssetUrl(url: string | null | undefined): boolean {
  const normalized = url?.trim() ?? "";
  if (!normalized) return true;
  if (normalized.startsWith("/")) {
    if (isAuthorizedPublicPath(normalized)) return false;
    if (isLegacyThirdPartyAssetReference(normalized)) return true;
    return false;
  }
  if (BLOCKED_URL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }
  try {
    const parsed = new URL(normalized, "https://plannerdesk.local");
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return true;
    if (parsed.protocol !== "https:" && !normalized.startsWith("/")) return true;
  } catch {
    return true;
  }
  return false;
}

export function isLegacyThirdPartyAssetReference(
  ...values: Array<string | null | undefined>
): boolean {
  return values.some((value) => {
    const normalized = value?.trim().toLowerCase() ?? "";
    if (!normalized) return false;
    if (normalized.includes("/claim-forms/authorized/")) return false;
    return (
      normalized.includes("bohumschool") ||
      normalized.includes("claim-docs/") ||
      normalized.includes("bohumschool-archive")
    );
  });
}

export function isVerifiedOfficialInsurerUrl(
  url: string | null | undefined,
): boolean {
  if (isBlockedPublicAssetUrl(url)) return false;
  const host = hostnameFromUrl(url);
  if (!host) return false;
  return officialInsurerHostnames.has(host);
}

export function isApprovedLocalPublicPath(path: string | null | undefined): boolean {
  const normalized = path?.trim() ?? "";
  if (!isAuthorizedPublicPath(normalized)) return false;
  if (isLegacyThirdPartyAssetReference(normalized)) return false;
  return normalized.endsWith(".pdf") || /\.(png|jpe?g|webp|svg)$/i.test(normalized);
}

export function buildClaimPdfDownloadFileName(title: string): string {
  const safe = title.replace(/[\\/:*?"<>|]/g, "_").trim() || "claim-form";
  return safe.endsWith(".pdf") ? safe : `${safe}.pdf`;
}

function resolveAuthorizedLocalClaimPdf(
  form: ClaimFormFile,
): { href: string; downloadFileName: string } | null {
  const authorized = findAuthorizedClaimPdf(form.id);
  if (!authorized?.permissionReference.trim()) return null;
  if (!isApprovedLocalPublicPath(authorized.publicPath)) return null;
  return {
    href: authorized.publicPath,
    downloadFileName: buildClaimPdfDownloadFileName(form.label),
  };
}

export function resolveClaimFormPublicAssetView(
  form: ClaimFormFile,
  officialSourceUrl: string | null,
): PublicAssetView | null {
  const local = resolveAuthorizedLocalClaimPdf(form);
  const official =
    officialSourceUrl && isVerifiedOfficialInsurerUrl(officialSourceUrl)
      ? officialSourceUrl
      : null;

  if (local && official) {
    return {
      kind: "approved_local_with_official",
      title: form.label,
      localHref: local.href,
      downloadFileName: local.downloadFileName,
      localLabel: PUBLIC_CTA_PDF_DOWNLOAD,
      officialHref: official,
      officialLabel: PUBLIC_CTA_OFFICIAL_CLAIM_GUIDE_OPEN,
    };
  }

  if (local) {
    return {
      kind: "approved_local",
      title: form.label,
      href: local.href,
      downloadFileName: local.downloadFileName,
      label: PUBLIC_CTA_PDF_DOWNLOAD,
    };
  }

  if (official) {
    return {
      kind: "official_external",
      title: form.label,
      href: official,
      external: true,
      label: PUBLIC_CTA_OFFICIAL_GUIDE_OPEN,
    };
  }

  if (isLegacyThirdPartyAssetReference(form.id, form.href, form.sourceUrl)) {
    return {
      kind: "needs_confirmation",
      title: form.label,
      label: PUBLIC_ASSET_PENDING_LABEL,
      message: PUBLIC_ASSET_PENDING_MESSAGE,
    };
  }

  return null;
}

export function resolveInsurerLogoPublicSrc(insurerId: string): string | null {
  const authorized = findAuthorizedInsurerLogo(insurerId);
  if (!authorized?.permissionReference.trim()) return null;
  if (!isApprovedLocalPublicPath(authorized.publicPath)) return null;
  if (isBlockedPublicAssetUrl(authorized.publicPath)) return null;
  return authorized.publicPath;
}

export type ClaimGuideCounts = {
  publicGuideCount: number;
  downloadablePdfCount: number;
  officialGuideLinkCount: number;
  needsConfirmationCount: number;
};

/** @deprecated Use ClaimGuideCounts */
export type ClaimLibraryCounts = {
  publicGuideCount: number;
  downloadableAssetCount: number;
};

export function countClaimGuideDispositions(
  items: ClaimLibraryItem[],
): ClaimGuideCounts {
  let downloadablePdfCount = 0;
  let officialGuideLinkCount = 0;
  let needsConfirmationCount = 0;

  for (const item of items) {
    if (item.kind !== "pdf") continue;
    const view = item.publicAssetView;
    if (!view) continue;

    const hasLocal =
      view.kind === "approved_local" || view.kind === "approved_local_with_official";
    const hasOfficial =
      view.kind === "official_external" ||
      view.kind === "approved_local_with_official";

    if (hasLocal) downloadablePdfCount += 1;
    if (hasOfficial) officialGuideLinkCount += 1;
    if (view.kind === "needs_confirmation") needsConfirmationCount += 1;
  }

  return {
    publicGuideCount: items.length,
    downloadablePdfCount,
    officialGuideLinkCount,
    needsConfirmationCount,
  };
}

export function countClaimLibraryDispositions(
  items: ClaimLibraryItem[],
): ClaimLibraryCounts {
  const counts = countClaimGuideDispositions(items);
  return {
    publicGuideCount: counts.publicGuideCount,
    downloadableAssetCount: counts.downloadablePdfCount,
  };
}

export function resolveClaimFormOfficialUrl(form: ClaimFormFile): string | null {
  const official =
    resolveOfficialSourceUrlForInsurerSlug(form.insurerSlug)?.trim() ?? null;
  return isVerifiedOfficialInsurerUrl(official) ? official : null;
}

export function getPublicAssetDisposition(
  view: PublicAssetView | null,
): PublicAssetDisposition {
  if (!view) return "hidden";
  switch (view.kind) {
    case "approved_local":
    case "approved_local_with_official":
      return "approved_local_file";
    case "official_external":
      return "official_link_only";
    case "needs_confirmation":
      return "needs_confirmation";
    default:
      return "hidden";
  }
}
