import {
  COMMON_INSURER_KEY,
  getItemInsurerName,
  insurerGroupKey,
  insurerGroupLabel,
  type ClaimLibraryItem,
} from "./library-items";

export type InsurerClaimGroup = {
  key: string;
  label: string;
  items: ClaimLibraryItem[];
  /** Public directory deep-link when a guide row carries insurerId. */
  directoryInsurerId: string | null;
};

export function groupClaimItemsByInsurer(
  items: ClaimLibraryItem[],
): InsurerClaimGroup[] {
  const groups = new Map<string, ClaimLibraryItem[]>();

  for (const item of items) {
    const key = insurerGroupKey(getItemInsurerName(item));
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return Array.from(groups.entries())
    .map(([key, groupItems]) => ({
      key,
      label: insurerGroupLabel(key),
      items: groupItems.sort((a, b) => compareItems(a, b)),
      directoryInsurerId: resolveDirectoryInsurerId(groupItems),
    }))
    .sort((a, b) => compareGroupKeys(a.key, b.key));
}

function resolveDirectoryInsurerId(items: ClaimLibraryItem[]): string | null {
  for (const item of items) {
    if (item.kind === "guide" && item.document.insurerId) {
      return item.document.insurerId;
    }
  }
  return null;
}

function compareGroupKeys(a: string, b: string): number {
  if (a === COMMON_INSURER_KEY) return 1;
  if (b === COMMON_INSURER_KEY) return -1;
  return a.localeCompare(b, "ko-KR");
}

function compareItems(a: ClaimLibraryItem, b: ClaimLibraryItem): number {
  const titleA = a.kind === "pdf" ? a.title : a.document.title;
  const titleB = b.kind === "pdf" ? b.title : b.document.title;
  return titleA.localeCompare(titleB, "ko-KR");
}
