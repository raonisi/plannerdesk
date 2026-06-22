/**
 * PR-ASSET-01: Public asset rights and disposition SSOT.
 * UI and resolvers must use these helpers — do not hardcode asset exposure per screen.
 */

import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { resolveOfficialSourceUrlForInsurerSlug } from "@/lib/claim-documents/claim-pdf-governance";
import type { PublicInsurer } from "@/lib/public/insurers";
import { PUBLIC_CTA_OFFICIAL_GUIDE_OPEN } from "@/lib/public/public-cta-labels";

export type AssetRightsStatus =
  | "official_external_verified"
  | "permission_verified"
  | "pending_evidence"
  | "restricted";

export type PublicAssetDisposition =
  | "official_link_only"
  | "approved_local_file"
  | "hidden";

export type AssetEvidenceRef = {
  status: AssetRightsStatus;
  sourceClass?: "legacy_third_party_archive";
  referenceId?: string;
  reviewedAt?: string;
};

export type PublicAssetView =
  | {
      kind: "official_external";
      title: string;
      href: string;
      external: true;
      label: string;
    }
  | {
      kind: "approved_local";
      title: string;
      href: string;
      external: false;
      label: string;
    }
  | {
      kind: "pending";
      title: string;
      label: string;
      message: string;
    };

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

const APPROVED_LOCAL_PATH_PREFIX = "/approved-claim-forms/";

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
  if (!normalized.startsWith(APPROVED_LOCAL_PATH_PREFIX)) return false;
  if (isLegacyThirdPartyAssetReference(normalized)) return false;
  return normalized.endsWith(".pdf");
}

export function classifyClaimFormAssetEvidence(
  form: ClaimFormFile,
  officialSourceUrl: string | null,
): AssetEvidenceRef {
  if (
    isLegacyThirdPartyAssetReference(form.id, form.href, form.sourceUrl)
  ) {
    if (isVerifiedOfficialInsurerUrl(officialSourceUrl)) {
      return {
        status: "official_external_verified",
        sourceClass: "legacy_third_party_archive",
        referenceId: `ASSET-LEGACY-${form.id}`,
      };
    }
    return {
      status: "restricted",
      sourceClass: "legacy_third_party_archive",
      referenceId: `ASSET-LEGACY-${form.id}`,
    };
  }

  if (isApprovedLocalPublicPath(form.href)) {
    return {
      status: "permission_verified",
      referenceId: `ASSET-LOCAL-${form.id}`,
    };
  }

  return { status: "pending_evidence" };
}

export function resolveClaimFormPublicAssetView(
  form: ClaimFormFile,
  officialSourceUrl: string | null,
): PublicAssetView | null {
  const evidence = classifyClaimFormAssetEvidence(form, officialSourceUrl);

  if (evidence.status === "official_external_verified" && officialSourceUrl) {
    return {
      kind: "official_external",
      title: form.label,
      href: officialSourceUrl,
      external: true,
      label: PUBLIC_CTA_OFFICIAL_GUIDE_OPEN,
    };
  }

  if (
    evidence.status === "permission_verified" &&
    isApprovedLocalPublicPath(form.href)
  ) {
    return {
      kind: "approved_local",
      title: form.label,
      href: form.href,
      external: false,
      label: "자료 열기",
    };
  }

  if (evidence.status === "pending_evidence") {
    return {
      kind: "pending",
      title: form.label,
      label: PUBLIC_ASSET_PENDING_LABEL,
      message: PUBLIC_ASSET_PENDING_MESSAGE,
    };
  }

  return null;
}

/** Logo images require explicit permission evidence — default deny. */
const INSURER_LOGO_PERMISSION_EVIDENCE: Readonly<
  Record<string, AssetEvidenceRef>
> = {};

export function resolveInsurerLogoPublicSrc(
  insurer: PublicInsurer,
  candidateSrc: string | null,
): string | null {
  const evidence = INSURER_LOGO_PERMISSION_EVIDENCE[insurer.id];
  if (!evidence || evidence.status !== "permission_verified") {
    return null;
  }
  if (!evidence.referenceId || isBlockedPublicAssetUrl(candidateSrc)) {
    return null;
  }
  return candidateSrc;
}

export type ClaimLibraryCounts = {
  publicGuideCount: number;
  downloadableAssetCount: number;
};

export function countClaimLibraryDispositions(
  items: ClaimLibraryItem[],
): ClaimLibraryCounts {
  let downloadableAssetCount = 0;

  for (const item of items) {
    if (item.kind !== "pdf") continue;
    const view = item.publicAssetView;
    if (view?.kind === "approved_local" || view?.kind === "official_external") {
      downloadableAssetCount += 1;
    }
  }

  return {
    publicGuideCount: items.length,
    downloadableAssetCount,
  };
}

export function resolveClaimFormOfficialUrl(form: ClaimFormFile): string | null {
  const official =
    resolveOfficialSourceUrlForInsurerSlug(form.insurerSlug)?.trim() ?? null;
  return isVerifiedOfficialInsurerUrl(official) ? official : null;
}
