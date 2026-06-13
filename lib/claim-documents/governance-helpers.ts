import type { ClaimFormFile } from "@/lib/content/claim-form-files";
import { insurerDirectoryEntries } from "@/lib/content/insurers";
import {
  extractClaimPdfFileName,
  resolveOfficialSourceUrlForInsurerSlug,
} from "./claim-pdf-governance";
import {
  DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_CAUTION,
  DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS,
} from "./governance-defaults";
import { CLAIM_DOCUMENT_GOVERNANCE_REGISTRY } from "./governance-registry";
import type {
  ClaimDocumentGovernance,
  ClaimDocumentGovernanceFilters,
  ClaimDocumentGovernanceRegistryEntry,
  ClaimDocumentGovernanceSummary,
  ClaimDocumentGovernancePriorityCounts,
  ClaimDocumentWithGovernance,
} from "./governance-types";
import { INSURER_ID_TO_CLAIM_SLUGS } from "./insurer-matching";
import { claimFormFiles } from "@/lib/content/claim-form-files";

function resolveInsurerIdForSlug(insurerSlug: string): string | undefined {
  for (const [insurerId, slugs] of Object.entries(INSURER_ID_TO_CLAIM_SLUGS)) {
    if (slugs.includes(insurerSlug)) {
      return insurerId;
    }
  }

  if (insurerDirectoryEntries.some((entry) => entry.id === insurerSlug)) {
    return insurerSlug;
  }

  return undefined;
}

function findRegistryEntry(
  form: ClaimFormFile,
): ClaimDocumentGovernanceRegistryEntry | undefined {
  const fileName = extractClaimPdfFileName(form.href);

  return CLAIM_DOCUMENT_GOVERNANCE_REGISTRY.find((entry) => {
    if (entry.filePath && entry.filePath === form.href) {
      return true;
    }

    if (
      entry.fileName &&
      entry.insurerName &&
      entry.fileName === fileName &&
      entry.insurerName === form.insurerName
    ) {
      return true;
    }

    if (
      entry.documentTitle &&
      entry.insurerName &&
      entry.documentTitle === form.label &&
      entry.insurerName === form.insurerName
    ) {
      return true;
    }

    return false;
  });
}

function buildBaseGovernance(form: ClaimFormFile): ClaimDocumentGovernance {
  const filePath = form.href;
  const fileName = extractClaimPdfFileName(filePath);
  const registryEntry = findRegistryEntry(form);
  const insurerId = resolveInsurerIdForSlug(form.insurerSlug);
  const officialSourceUrl =
    registryEntry?.officialSourceUrl ??
    resolveOfficialSourceUrlForInsurerSlug(form.insurerSlug) ??
    undefined;

  return {
    id: registryEntry?.id ?? form.id,
    insurerId: registryEntry?.insurerId ?? insurerId,
    insurerName: registryEntry?.insurerName ?? form.insurerName,
    documentId: registryEntry?.documentId ?? form.id,
    documentTitle: registryEntry?.documentTitle ?? form.label,
    fileName: registryEntry?.fileName ?? fileName,
    filePath: registryEntry?.filePath ?? filePath,
    fileType: "pdf",
    officialSourceUrl: officialSourceUrl || undefined,
    officialSourceLabel: registryEntry?.officialSourceLabel,
    lastVerifiedAt: registryEntry?.lastVerifiedAt,
    nextReviewDueAt: registryEntry?.nextReviewDueAt,
    reviewStatus:
      registryEntry?.reviewStatus ?? DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS,
    isVisible: registryEntry?.isVisible ?? true,
    isDownloadEnabled: registryEntry?.isDownloadEnabled ?? true,
    cautionText:
      registryEntry?.cautionText ??
      form.cautionText ??
      DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_CAUTION,
    adminMemo: registryEntry?.adminMemo,
    createdAt: registryEntry?.createdAt,
    updatedAt: registryEntry?.updatedAt,
    updatedBy: registryEntry?.updatedBy,
  };
}

export function mergeClaimFormWithGovernance(
  form: ClaimFormFile,
): ClaimDocumentWithGovernance {
  return {
    href: form.href,
    governance: buildBaseGovernance(form),
  };
}

export function buildClaimDocumentGovernanceList(): ClaimDocumentWithGovernance[] {
  return claimFormFiles.map(mergeClaimFormWithGovernance);
}

export function isGovernanceVerifiedComplete(
  governance: ClaimDocumentGovernance,
): boolean {
  return (
    governance.reviewStatus === "verified" &&
    Boolean(governance.lastVerifiedAt) &&
    Boolean(governance.officialSourceUrl)
  );
}

export function isGovernanceNeedsReviewAttention(
  governance: ClaimDocumentGovernance,
): boolean {
  return (
    governance.reviewStatus === "needs_review" ||
    governance.reviewStatus === "unknown" ||
    governance.reviewStatus === "outdated"
  );
}

export function computeClaimDocumentGovernanceSummary(
  items: ClaimDocumentWithGovernance[],
): ClaimDocumentGovernanceSummary {
  return {
    total: items.length,
    missingOfficialUrl: items.filter(
      (item) => !item.governance.officialSourceUrl,
    ).length,
    missingLastVerified: items.filter(
      (item) => !item.governance.lastVerifiedAt,
    ).length,
    needsReview: items.filter((item) =>
      isGovernanceNeedsReviewAttention(item.governance),
    ).length,
  };
}

export function computeClaimDocumentGovernancePriorityCounts(
  items: ClaimDocumentWithGovernance[],
): ClaimDocumentGovernancePriorityCounts {
  return {
    missingOfficialUrl: items.filter(
      (item) => !item.governance.officialSourceUrl,
    ).length,
    missingLastVerified: items.filter(
      (item) => !item.governance.lastVerifiedAt,
    ).length,
    needsReview: items.filter((item) =>
      isGovernanceNeedsReviewAttention(item.governance),
    ).length,
    hiddenOrRestricted: items.filter(
      (item) =>
        !item.governance.isVisible ||
        !item.governance.isDownloadEnabled ||
        item.governance.reviewStatus === "hidden",
    ).length,
  };
}

export type ClaimDocumentGovernancePriorityFilter =
  | "needsReview"
  | "hiddenOrRestricted";

export function applyClaimDocumentGovernancePriorityFilter(
  items: ClaimDocumentWithGovernance[],
  priorityFilter: ClaimDocumentGovernancePriorityFilter | null,
): ClaimDocumentWithGovernance[] {
  if (priorityFilter === "needsReview") {
    return items.filter((item) =>
      isGovernanceNeedsReviewAttention(item.governance),
    );
  }

  if (priorityFilter === "hiddenOrRestricted") {
    return items.filter(
      (item) =>
        !item.governance.isVisible ||
        !item.governance.isDownloadEnabled ||
        item.governance.reviewStatus === "hidden",
    );
  }

  return items;
}

export function filterClaimDocumentsForPublicUser(
  items: ClaimDocumentWithGovernance[],
): ClaimDocumentWithGovernance[] {
  return items.filter(
    (item) =>
      item.governance.isVisible !== false &&
      item.governance.reviewStatus !== "hidden",
  );
}

export function isClaimDocumentDownloadEnabled(
  governance: ClaimDocumentGovernance,
): boolean {
  return governance.isDownloadEnabled !== false;
}

export function filterClaimDocumentGovernanceItems(
  items: ClaimDocumentWithGovernance[],
  filters: ClaimDocumentGovernanceFilters,
): ClaimDocumentWithGovernance[] {
  const insurerQuery = filters.insurerQuery.trim().toLowerCase();
  const documentQuery = filters.documentQuery.trim().toLowerCase();

  return items.filter(({ governance }) => {
    const matchesInsurer =
      insurerQuery.length === 0 ||
      governance.insurerName.toLowerCase().includes(insurerQuery);
    const matchesDocument =
      documentQuery.length === 0 ||
      governance.documentTitle.toLowerCase().includes(documentQuery) ||
      governance.fileName.toLowerCase().includes(documentQuery);

    const matchesStatus =
      filters.reviewStatus === "all" ||
      governance.reviewStatus === filters.reviewStatus;

    const matchesOfficialUrl =
      filters.officialUrl === "all" ||
      (filters.officialUrl === "present" && Boolean(governance.officialSourceUrl)) ||
      (filters.officialUrl === "missing" && !governance.officialSourceUrl);

    const matchesLastVerified =
      filters.lastVerified === "all" ||
      (filters.lastVerified === "present" && Boolean(governance.lastVerifiedAt)) ||
      (filters.lastVerified === "missing" && !governance.lastVerifiedAt);

    const matchesVisibility =
      filters.visibility === "all" ||
      (filters.visibility === "visible" && governance.isVisible) ||
      (filters.visibility === "hidden" && !governance.isVisible);

    const matchesDownload =
      filters.download === "all" ||
      (filters.download === "enabled" && governance.isDownloadEnabled) ||
      (filters.download === "disabled" && !governance.isDownloadEnabled);

    return (
      matchesInsurer &&
      matchesDocument &&
      matchesStatus &&
      matchesOfficialUrl &&
      matchesLastVerified &&
      matchesVisibility &&
      matchesDownload
    );
  });
}

export const EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS: ClaimDocumentGovernanceFilters =
  {
    insurerQuery: "",
    documentQuery: "",
    reviewStatus: "all",
    officialUrl: "all",
    lastVerified: "all",
    visibility: "all",
    download: "all",
  };

export const DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE = 25;
export const MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE = 10;
export const CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export type ClaimDocumentGovernancePaginationMeta = {
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
};

export function paginateClaimDocumentGovernanceItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  if (items.length === 0) {
    return [];
  }

  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function computeClaimDocumentGovernancePaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number,
): ClaimDocumentGovernancePaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart =
    totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd =
    totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return {
    totalItems,
    totalPages,
    page: safePage,
    pageSize,
    rangeStart,
    rangeEnd,
  };
}
