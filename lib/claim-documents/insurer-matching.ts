import type { ClaimLibraryItem } from "./library-items";

/** Directory insurer id → claim-form-files insurerSlug aliases */
export const INSURER_ID_TO_CLAIM_SLUGS: Readonly<Record<string, readonly string[]>> =
  {
    "lotte-general": ["lotte-fire", "lotte-general"],
    "db-general": ["db-insurance", "db-general"],
    "kb-general": ["kb-insurance", "kb-general"],
    "chubb-general": ["chubb-life", "chubb-general"],
    "yebyeol-general": ["yebyeol-insurance", "yebyeol-general"],
    "lina-life": ["lina-life", "lina-general"],
  };

export function getClaimSlugsForInsurerId(insurerId: string): readonly string[] {
  const aliases = INSURER_ID_TO_CLAIM_SLUGS[insurerId];
  if (aliases) return aliases;
  return [insurerId];
}

export function normalizeInsurerName(name: string): string {
  return name.replace(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

export function matchesInsurerClaimItem(
  item: ClaimLibraryItem,
  insurer: { id: string; name: string },
): boolean {
  if (item.kind === "guide") {
    if (!item.document.insurerId) return false;
    return item.document.insurerId === insurer.id;
  }

  const slugs = getClaimSlugsForInsurerId(insurer.id);
  if (slugs.includes(item.insurerSlug)) return true;

  return (
    normalizeInsurerName(item.insurerName) ===
    normalizeInsurerName(insurer.name)
  );
}
