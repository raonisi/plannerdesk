import { claimFormFiles } from "@/lib/content/claim-form-files";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import {
  claimFormToLibraryItem,
  COMMON_INSURER_KEY,
  documentToLibraryItem,
  getItemCategory,
  getItemInsurerName,
  getItemSearchText,
  getItemVerificationStatus,
  insurerGroupKey,
  type ClaimLibraryItem,
} from "./library-items";
import { categoryLabels, categoryOrder } from "./category-labels";
import {
  getClaimSlugsForInsurerId,
  INSURER_ID_TO_CLAIM_SLUGS,
  matchesInsurerClaimItem,
} from "./insurer-matching";
import { groupClaimItemsByInsurer } from "./group-by-insurer";

export type ClaimLibraryFilters = {
  query: string;
  category: string;
  status: string;
  documentNature: string;
  selectedInsurerKey: string;
};

export function buildClaimLibraryItems(
  guideDocuments: PublicClaimDocument[],
): ClaimLibraryItem[] {
  return [
    ...claimFormFiles.map(claimFormToLibraryItem),
    ...guideDocuments.map(documentToLibraryItem),
  ];
}

export function getClaimItemsForInsurer(
  insurer: { id: string; name: string },
  allItems: ClaimLibraryItem[],
): ClaimLibraryItem[] {
  return allItems.filter((item) => matchesInsurerClaimItem(item, insurer));
}

export function filterClaimLibraryItems(
  items: ClaimLibraryItem[],
  filters: ClaimLibraryFilters,
): ClaimLibraryItem[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      getItemSearchText(item).toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      filters.category === "all" || getItemCategory(item) === filters.category;
    const matchesStatus =
      filters.status === "all" ||
      getItemVerificationStatus(item) === filters.status;
    const matchesNature =
      filters.documentNature === "all" ||
      matchesDocumentNature(item, filters.documentNature);

    const itemInsurerKey = insurerGroupKey(getItemInsurerName(item));
    const matchesInsurer =
      filters.selectedInsurerKey === "all" ||
      (filters.selectedInsurerKey === "common" &&
        itemInsurerKey === COMMON_INSURER_KEY) ||
      matchesInsurerFilterKey(item, filters.selectedInsurerKey);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesStatus &&
      matchesNature &&
      matchesInsurer
    );
  });
}

function matchesDocumentNature(
  item: ClaimLibraryItem,
  nature: string,
): boolean {
  if (nature === "required") {
    if (item.kind === "pdf") return true;
    return Boolean(item.document.requiredDocuments?.trim());
  }
  if (nature === "optional") {
    if (item.kind === "pdf") return false;
    return Boolean(item.document.optionalDocuments?.trim());
  }
  return true;
}

export function buildCategoryFilterOptions(items: ClaimLibraryItem[]) {
  const present = new Set(items.map((item) => getItemCategory(item)));
  return [
    { label: "전체", value: "all" },
    ...categoryOrder
      .filter((cat) => present.has(cat))
      .map((cat) => ({ label: categoryLabels[cat], value: cat })),
  ];
}

function matchesInsurerFilterKey(
  item: ClaimLibraryItem,
  selectedKey: string,
): boolean {
  if (item.kind === "guide") {
    return item.document.insurerId === selectedKey;
  }

  if (item.insurerSlug === selectedKey) return true;

  return getClaimSlugsForInsurerId(selectedKey).includes(item.insurerSlug);
}

export function buildInsurerFilterOptions(items: ClaimLibraryItem[]) {
  const options = new Map<string, string>();

  for (const item of items) {
    if (item.kind === "guide" && item.document.insurerId) {
      options.set(
        item.document.insurerId,
        item.document.insurerName ?? item.document.insurerId,
      );
      continue;
    }

    if (item.kind === "pdf") {
      options.set(
        resolveInsurerFilterKey(item.insurerSlug),
        item.insurerName,
      );
    }
  }

  return Array.from(options.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "ko-KR"));
}

export function groupFilteredClaimItems(items: ClaimLibraryItem[]) {
  return groupClaimItemsByInsurer(items);
}

function resolveInsurerFilterKey(insurerSlug: string): string {
  for (const [insurerId, slugs] of Object.entries(INSURER_ID_TO_CLAIM_SLUGS)) {
    if (slugs.includes(insurerSlug)) {
      return insurerId;
    }
  }
  return insurerSlug;
}
