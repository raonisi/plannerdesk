import { VerificationStatus, type ClaimDocumentCategory } from "@prisma/client";
import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import { buildClaimDocumentKey } from "./document-key";
import {
  enrichStoredClaimPdfMetadata,
  type StoredClaimPdfMetadata,
} from "./claim-pdf-governance";
import {
  resolveClaimFormOfficialUrl,
  resolveClaimFormPublicAssetView,
  type PublicAssetView,
} from "@/lib/public/public-asset-policy";

export type ClaimLibraryPdfItem = {
  kind: "pdf";
  id: string;
  insurerSlug: string;
  insurerName: string;
  title: string;
  category: ClaimDocumentCategory;
  categoryLabel: string;
  href: string;
  verificationStatus: typeof VerificationStatus.verified;
  /** When false, download button is disabled. Defaults to enabled for approved local only. */
  downloadEnabled?: boolean;
  publicAssetView: PublicAssetView;
  /** Stable DB/admin overlay key from catalog identity, not public href. */
  governanceDocumentKey: string;
} & Omit<StoredClaimPdfMetadata, "filePath" | "fileName"> & {
  filePath: string;
  fileName: string;
};
export type ClaimLibraryGuideItem = {
  kind: "guide";
  document: PublicClaimDocument;
};

export type ClaimLibraryItem = ClaimLibraryPdfItem | ClaimLibraryGuideItem;

export const COMMON_INSURER_KEY = "__common__";

export function insurerGroupKey(insurerName: string | null | undefined): string {
  return insurerName?.trim() ? insurerName.trim() : COMMON_INSURER_KEY;
}

export function insurerGroupLabel(key: string): string {
  return key === COMMON_INSURER_KEY ? "공통 기준" : key;
}

export function claimFormToLibraryItem(
  form: ClaimFormFile,
): ClaimLibraryPdfItem | null {
  const officialSourceUrl = resolveClaimFormOfficialUrl(form);
  const publicAssetView = resolveClaimFormPublicAssetView(form, officialSourceUrl);
  if (!publicAssetView) {
    return null;
  }

  const metadata = enrichStoredClaimPdfMetadata(form);
  const exposeLocalFile =
    publicAssetView.kind === "approved_local" ||
    publicAssetView.kind === "approved_local_with_official";
  const localHref =
    publicAssetView.kind === "approved_local"
      ? publicAssetView.href
      : publicAssetView.kind === "approved_local_with_official"
        ? publicAssetView.localHref
        : "";
  const downloadFileName =
    publicAssetView.kind === "approved_local" ||
    publicAssetView.kind === "approved_local_with_official"
      ? publicAssetView.downloadFileName
      : form.label;
  const governanceDocumentKey = buildClaimDocumentKey({
    filePath: metadata.filePath,
    fileName: metadata.fileName,
    insurerName: metadata.insurerName,
    documentTitle: metadata.documentTitle,
  });

  return {
    kind: "pdf",
    ...metadata,
    governanceDocumentKey,
    id: form.id,
    insurerSlug: form.insurerSlug,
    insurerName: form.insurerName,
    title: form.label,
    category: form.category,
    categoryLabel: form.categoryLabel,
    href: exposeLocalFile ? localHref : "",
    verificationStatus: VerificationStatus.verified,
    publicAssetView,
    downloadEnabled: exposeLocalFile,
    officialSourceUrl: officialSourceUrl ?? metadata.officialSourceUrl,
    filePath: exposeLocalFile ? localHref : "",
    fileName: exposeLocalFile ? downloadFileName : form.label,
  };
}
export function documentToLibraryItem(
  document: PublicClaimDocument,
): ClaimLibraryGuideItem {
  return { kind: "guide", document };
}

export function getItemInsurerName(item: ClaimLibraryItem): string | null {
  if (item.kind === "pdf") {
    return item.insurerName;
  }
  return item.document.insurerName;
}

export function getItemCategory(item: ClaimLibraryItem): ClaimDocumentCategory {
  return item.kind === "pdf" ? item.category : item.document.category;
}

export function getItemVerificationStatus(
  item: ClaimLibraryItem,
): VerificationStatus {
  if (item.kind === "pdf") {
    if (item.reviewStatus === "needs_review") {
      return VerificationStatus.needs_review;
    }
    return item.verificationStatus;
  }
  return item.document.verificationStatus;
}

export function getItemLastVerifiedAt(item: ClaimLibraryItem): string | null {
  if (item.kind === "pdf") {
    return item.lastVerifiedAt ?? null;
  }
  return item.document.lastVerifiedAt ?? null;
}

export function getItemSearchText(item: ClaimLibraryItem): string {
  if (item.kind === "pdf") {
    return [item.title, item.insurerName, item.categoryLabel].join(" ");
  }

  const doc = item.document;
  return [
    doc.title,
    doc.summary,
    doc.requiredDocuments,
    doc.optionalDocuments,
    doc.insurerName ?? "공통",
    doc.cautionNote,
    doc.officialSourceUrl,
    doc.customerMessageTemplate,
    doc.claimFormUrl,
  ]
    .filter(Boolean)
    .join(" ");
}
