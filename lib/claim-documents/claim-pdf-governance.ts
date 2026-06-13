import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import { INSURER_ID_TO_CLAIM_SLUGS } from "./insurer-matching";

export type ClaimPdfReviewStatus = "verified" | "needs_review" | "draft";

export type StoredClaimPdfMetadata = {
  insurerName: string;
  documentTitle: string;
  filePath: string;
  fileName: string;
  fileType: "pdf";
  sourceType: "stored_pdf";
  officialSourceUrl: string | null;
  lastVerifiedAt: string | null;
  reviewStatus: ClaimPdfReviewStatus;
  cautionText: string;
};

export const CLAIM_PDF_CAUTION_TEXT =
  "청구서류 양식은 보험사 기준에 따라 변경될 수 있으므로, 제출 전 보험사 공식 홈페이지 또는 고객센터에서 최신 양식을 확인해 주세요.";

export const CLAIM_PDF_GOVERNANCE_NOTICE =
  "이 자료는 설계사 업무 편의를 위한 청구서류 모음입니다. 보험사별 양식은 수시로 변경될 수 있으므로 실제 제출 전에는 보험사 공식 안내를 함께 확인해 주세요.";

export const CLAIM_PDF_ACCORDION_NOTICE =
  "청구서류 양식은 보험사 기준에 따라 변경될 수 있습니다. 업무 편의를 위해 PDF 다운로드를 제공하되, 실제 제출 전에는 보험사 공식 안내를 함께 확인해 주세요.";

export const CLAIM_INSURER_CARD_NOTICE =
  "업무 편의를 위해 청구서류 PDF 다운로드를 제공합니다. 실제 제출 전에는 보험사 공식 안내를 함께 확인해 주세요.";

export const CLAIM_INSURER_CARD_EMPTY_MESSAGE =
  "등록된 청구서류 PDF가 없습니다. 보험사 공식 안내를 확인해 주세요.";

const insurerById = new Map(
  insurerDirectoryEntries.map((entry) => [entry.id, entry]),
);

function pickOfficialInsurerUrl(
  entry: (typeof insurerDirectoryEntries)[number] | undefined,
): string | null {
  if (!entry) return null;
  return (
    entry.claimPageUrl?.trim() ||
    entry.claimFormUrl?.trim() ||
    entry.termsUrl?.trim() ||
    entry.officialWebsiteUrl?.trim() ||
    null
  );
}

export function resolveOfficialSourceUrlForInsurerSlug(
  insurerSlug: string,
): string | null {
  for (const [insurerId, slugs] of Object.entries(INSURER_ID_TO_CLAIM_SLUGS)) {
    if (slugs.includes(insurerSlug)) {
      return pickOfficialInsurerUrl(insurerById.get(insurerId));
    }
  }
  return pickOfficialInsurerUrl(insurerById.get(insurerSlug));
}

export function extractClaimPdfFileName(filePath: string): string {
  const segments = filePath.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? filePath;
}

export function enrichStoredClaimPdfMetadata(
  form: ClaimFormFile,
): StoredClaimPdfMetadata {
  const filePath = form.href;
  return {
    insurerName: form.insurerName,
    documentTitle: form.label,
    filePath,
    fileName: extractClaimPdfFileName(filePath),
    fileType: "pdf",
    sourceType: "stored_pdf",
    officialSourceUrl: resolveOfficialSourceUrlForInsurerSlug(form.insurerSlug),
    lastVerifiedAt: form.lastVerifiedAt ?? null,
    reviewStatus: form.reviewStatus ?? "verified",
    cautionText: form.cautionText ?? CLAIM_PDF_CAUTION_TEXT,
  };
}

export function isStoredClaimPdfPath(href: string): boolean {
  return href.startsWith("/claim-forms/bohumschool/") && href.endsWith(".pdf");
}
