import type { DisclosureLinkEntry } from "./types";
import { disclosureLinkEntries } from "./disclosure-links";

/**
 * Matches disclosure-link entries to an insurer by ID.
 *
 * The convention in `disclosure-links.ts` uses IDs like:
 *   - `disclosure-product-samsung-fire`   → insurer ID `samsung-fire`
 *   - `disclosure-terms-samsung-fire`     → insurer ID `samsung-fire`
 *   - `disclosure-product-db-general`     → insurer ID `db-general`
 *
 * We also match duplicates that use alternative slug suffixes such as
 * `disclosure-product-db-insurance` → insurer ID `db-general` by keeping a
 * small alias table.  Quick-link entries (id starting with `quick-link-`) are
 * excluded from per-insurer matching.
 */

/** Alias slugs that map to the canonical insurer ID. */
const SLUG_ALIASES: Record<string, string> = {
  "db-insurance": "db-general",
  "kb-insurance": "kb-general",
  "lotte-fire": "lotte-general",
  "lina-general": "chubb-general",
  "yebyeol-insurance": "yebyeol-general",
};

function extractInsurerSlug(entryId: string): string | null {
  // Only match `disclosure-product-*` and `disclosure-terms-*` patterns
  const productMatch = entryId.match(/^disclosure-product-(.+)$/);
  if (productMatch) return productMatch[1];

  const termsMatch = entryId.match(/^disclosure-terms-(.+)$/);
  if (termsMatch) return termsMatch[1];

  return null;
}

export interface InsurerDisclosureLinks {
  /** Product disclosure link entry, if available. */
  productDisclosure: DisclosureLinkEntry | null;
  /** Policy terms link entry, if available. */
  policyTerms: DisclosureLinkEntry | null;
}

/**
 * Returns the disclosure-link entries matched to the given insurer ID.
 *
 * This is an O(n) scan, but the dataset is ~130 entries so cost is negligible.
 * If performance matters later, pre-index with a Map.
 */
export function getDisclosureLinksForInsurer(
  insurerId: string,
): InsurerDisclosureLinks {
  let productDisclosure: DisclosureLinkEntry | null = null;
  let policyTerms: DisclosureLinkEntry | null = null;

  for (const entry of disclosureLinkEntries) {
    const slug = extractInsurerSlug(entry.id);
    if (!slug) continue;

    const canonicalSlug = SLUG_ALIASES[slug] ?? slug;
    if (canonicalSlug !== insurerId) continue;

    if (entry.category === "product_disclosure" && !productDisclosure) {
      productDisclosure = entry;
    } else if (entry.category === "policy_terms" && !policyTerms) {
      policyTerms = entry;
    }

    if (productDisclosure && policyTerms) break;
  }

  return { productDisclosure, policyTerms };
}

/**
 * Pre-built index for all insurer disclosure links.
 * Useful when rendering the full directory at once.
 */
export function buildDisclosureLinkIndex(): Map<string, InsurerDisclosureLinks> {
  const index = new Map<string, InsurerDisclosureLinks>();

  for (const entry of disclosureLinkEntries) {
    const slug = extractInsurerSlug(entry.id);
    if (!slug) continue;

    const canonicalId = SLUG_ALIASES[slug] ?? slug;

    if (!index.has(canonicalId)) {
      index.set(canonicalId, { productDisclosure: null, policyTerms: null });
    }
    const links = index.get(canonicalId)!;

    if (entry.category === "product_disclosure" && !links.productDisclosure) {
      links.productDisclosure = entry;
    } else if (entry.category === "policy_terms" && !links.policyTerms) {
      links.policyTerms = entry;
    }
  }

  return index;
}
