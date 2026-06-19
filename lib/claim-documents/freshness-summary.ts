import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import {
  getItemLastVerifiedAt,
  getItemVerificationStatus,
} from "@/lib/claim-documents/library-items";
import {
  formatVerifiedDateShort,
} from "@/lib/public/data-freshness";
import {
  getFreshnessPresentation,
  getFreshnessStatus,
  pickLatestVerifiedIso,
  pickWorstFreshnessStatus,
  type FreshnessInput,
  type FreshnessPresentation,
} from "@/lib/public/freshness";

export function getClaimItemFreshnessInput(
  item: ClaimLibraryItem,
): FreshnessInput {
  if (item.kind === "guide") {
    return {
      lastVerifiedAt: item.document.lastVerifiedAt,
      verificationStatus: item.document.verificationStatus,
      hasOfficialSource: Boolean(
        item.document.officialSourceUrl?.trim() ||
          item.document.claimFormUrl?.trim(),
      ),
    };
  }

  return {
    lastVerifiedAt: item.lastVerifiedAt,
    verificationStatus:
      item.reviewStatus === "needs_review"
        ? "needs_review"
        : item.verificationStatus,
    hasOfficialSource: Boolean(item.officialSourceUrl?.trim()),
  };
}

function pickOldestVerifiedIso(
  values: Array<string | Date | null | undefined>,
): string | null {
  let oldest: string | null = null;
  let oldestTime = Number.POSITIVE_INFINITY;

  for (const value of values) {
    const formatted = formatVerifiedDateShort(value);
    if (!formatted) continue;
    const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(formatted);
    if (!match) continue;
    const iso = `${match[1]}-${match[2]}-${match[3]}`;
    const time = Date.parse(`${iso}T00:00:00.000Z`);
    if (time < oldestTime) {
      oldestTime = time;
      oldest = iso;
    }
  }

  return oldest;
}

export function summarizeClaimItemsFreshness(
  items: ClaimLibraryItem[],
): FreshnessPresentation {
  if (items.length === 0) {
    return getFreshnessPresentation({ lastVerifiedAt: null });
  }

  const inputs = items.map(getClaimItemFreshnessInput);
  const worstStatus = pickWorstFreshnessStatus(
    inputs.map((input) => getFreshnessStatus(input)),
  );
  const hasOfficialSource = inputs.some((input) => input.hasOfficialSource);
  const latestIso = pickLatestVerifiedIso(items.map(getItemLastVerifiedAt));

  if (worstStatus === "needs_review") {
    return getFreshnessPresentation({
      verificationStatus: "needs_review",
      lastVerifiedAt: latestIso,
      hasOfficialSource,
    });
  }

  if (worstStatus === "missing_date") {
    return getFreshnessPresentation({
      lastVerifiedAt: null,
      hasOfficialSource,
    });
  }

  const dateSource =
    worstStatus === "stale"
      ? pickOldestVerifiedIso(items.map(getItemLastVerifiedAt)) ?? latestIso
      : latestIso;

  return getFreshnessPresentation({
    lastVerifiedAt: dateSource,
    hasOfficialSource,
  });
}

export function hasClaimItemsNeedingReview(items: ClaimLibraryItem[]): boolean {
  return items.some(
    (item) => getItemVerificationStatus(item) === "needs_review",
  );
}
