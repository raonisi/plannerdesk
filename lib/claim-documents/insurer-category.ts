import { insurerDirectoryEntries } from "@/lib/content/insurers";
import type { InsurerCategory } from "@/lib/content/types";
import {
  COMMON_INSURER_KEY,
  type ClaimLibraryItem,
} from "./library-items";
import {
  getClaimSlugsForInsurerId,
  INSURER_ID_TO_CLAIM_SLUGS,
  normalizeInsurerName,
} from "./insurer-matching";

export type InsurerMarketSegment = InsurerCategory | "other";

const insurerById = new Map(
  insurerDirectoryEntries.map((entry) => [entry.id, entry]),
);

const insurerByNormalizedName = new Map(
  insurerDirectoryEntries.map((entry) => [
    normalizeInsurerName(entry.name),
    entry,
  ]),
);

export const INSURER_MARKET_SEGMENT_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "생명보험", value: "life" },
  { label: "손해보험", value: "non_life" },
  { label: "기타", value: "other" },
] as const;

export function resolveInsurerMarketSegmentForItem(
  item: ClaimLibraryItem,
): InsurerMarketSegment {
  if (item.kind === "guide") {
    if (!item.document.insurerId) return "other";
    return insurerById.get(item.document.insurerId)?.category ?? "other";
  }

  for (const [insurerId, slugs] of Object.entries(INSURER_ID_TO_CLAIM_SLUGS)) {
    if (slugs.includes(item.insurerSlug)) {
      return insurerById.get(insurerId)?.category ?? "other";
    }
  }

  const directSlugEntry = insurerById.get(item.insurerSlug);
  if (directSlugEntry) return directSlugEntry.category;

  const byName = insurerByNormalizedName.get(
    normalizeInsurerName(item.insurerName),
  );
  if (byName) return byName.category;

  for (const entry of insurerDirectoryEntries) {
    if (getClaimSlugsForInsurerId(entry.id).includes(item.insurerSlug)) {
      return entry.category;
    }
  }

  return "other";
}

export function resolveInsurerMarketSegmentForGroup(input: {
  key: string;
  items: ClaimLibraryItem[];
  directoryInsurerId: string | null;
}): InsurerMarketSegment {
  if (input.key === COMMON_INSURER_KEY) return "other";

  if (input.directoryInsurerId) {
    const entry = insurerById.get(input.directoryInsurerId);
    if (entry) return entry.category;
  }

  const segments = new Set(
    input.items.map((item) => resolveInsurerMarketSegmentForItem(item)),
  );
  if (segments.size === 1) {
    return segments.values().next().value ?? "other";
  }

  if (segments.has("life") && !segments.has("non_life")) return "life";
  if (segments.has("non_life") && !segments.has("life")) return "non_life";
  return "other";
}

export function insurerMarketSegmentLabel(
  segment: InsurerMarketSegment,
): string {
  if (segment === "life") return "생명보험";
  if (segment === "non_life") return "손해보험";
  return "기타";
}
