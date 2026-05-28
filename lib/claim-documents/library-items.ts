import { VerificationStatus, type ClaimDocumentCategory } from "@prisma/client";
import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";

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

export function claimFormToLibraryItem(form: ClaimFormFile): ClaimLibraryPdfItem {
  return {
    kind: "pdf",
    id: form.id,
    insurerSlug: form.insurerSlug,
    insurerName: form.insurerName,
    title: form.label,
    category: form.category,
    categoryLabel: form.categoryLabel,
    href: form.href,
    verificationStatus: VerificationStatus.verified,
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
  return item.kind === "pdf"
    ? item.verificationStatus
    : item.document.verificationStatus;
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
  ]
    .filter(Boolean)
    .join(" ");
}
