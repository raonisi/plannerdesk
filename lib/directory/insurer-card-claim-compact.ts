import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { getItemSearchText } from "@/lib/claim-documents/library-items";

export const INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT = 5;

export const INSURER_CARD_CLAIM_SEARCH_THRESHOLD = 8;

export function shouldCompactInsurerCardClaimList(count: number): boolean {
  return count > INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT;
}

export function shouldShowInsurerCardClaimSearch(count: number): boolean {
  return count >= INSURER_CARD_CLAIM_SEARCH_THRESHOLD;
}

export function filterInsurerCardClaimItems(
  items: ClaimLibraryItem[],
  query: string,
): ClaimLibraryItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    getItemSearchText(item).toLowerCase().includes(normalizedQuery),
  );
}

export function resolveInsurerCardVisibleClaimItems(
  items: ClaimLibraryItem[],
  options: { showAll: boolean; query: string },
): {
  visibleItems: ClaimLibraryItem[];
  totalCount: number;
  isCompacted: boolean;
} {
  const filteredItems = filterInsurerCardClaimItems(items, options.query);
  const totalCount = filteredItems.length;
  const isCompacted =
    shouldCompactInsurerCardClaimList(totalCount) && !options.showAll;
  const visibleItems = isCompacted
    ? filteredItems.slice(0, INSURER_CARD_CLAIM_COMPACT_VISIBLE_COUNT)
    : filteredItems;

  return { visibleItems, totalCount, isCompacted };
}
