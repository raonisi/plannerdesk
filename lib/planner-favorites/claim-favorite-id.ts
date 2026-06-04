import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";

/** Stable client-only favorite key for a public claim library row. */
export function claimLibraryFavoriteId(item: ClaimLibraryItem): string {
  if (item.kind === "pdf") return `pdf:${item.id}`;
  return `doc:${item.document.id}`;
}
