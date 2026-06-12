import type { DisclosureLinkEntry } from "./types";

export const DISCLOSURE_ROOM_CATEGORY_LABEL = "공시실";

export const DISCLOSURE_ROOM_SEARCH_ALIASES = [
  "공시실",
  "공시",
  "상품공시",
  "약관",
  "상품설명서",
  "사업방법서",
] as const;

const MOJIBAKE_PATTERN = /\?{2,}|�|\?\?\s+\?\?/;

export function hasMojibakeText(text: string | null | undefined): boolean {
  if (!text?.trim()) return false;
  return MOJIBAKE_PATTERN.test(text);
}

export function extractInsurerNameFromDisclosureTitle(title: string): string {
  const trimmed = title.trim();
  const brokenSuffix = trimmed.match(/^(.+?)\s+[\?�]+/);
  if (brokenSuffix?.[1]) return brokenSuffix[1].trim();

  const firstToken = trimmed.split(/\s+/)[0];
  if (firstToken && !hasMojibakeText(firstToken)) return firstToken;

  return trimmed.replace(/\s+[\?�].*$/, "").trim() || trimmed;
}

export function extractInsurerSlugFromDisclosureId(id: string): string | null {
  const productMatch = id.match(/^disclosure-(?:product|terms|room)-(.+)$/);
  return productMatch?.[1] ?? null;
}

export function buildDisclosureRoomCopy(insurerName: string) {
  return {
    title: `${insurerName} 공시실`,
    sourceLabel: `${insurerName} 공식 공시실`,
    description: `${insurerName} 공식 공시실에서 상품공시, 약관, 사업방법서 등 보험 상품 관련 공식 자료를 확인할 수 있습니다.`,
    categoryLabel: DISCLOSURE_ROOM_CATEGORY_LABEL,
  };
}

export function isInsurerDisclosureRoomCategory(category: string): boolean {
  return category === "product_disclosure" || category === "policy_terms";
}

export function disclosureRoomDedupeKey(
  insurerName: string,
  sourceUrl: string | null | undefined,
): string {
  return `${insurerName.trim().toLocaleLowerCase("ko-KR")}::${(sourceUrl ?? "").trim()}`;
}

export function unifyStaticDisclosureRoomEntries(
  entries: DisclosureLinkEntry[],
): DisclosureLinkEntry[] {
  const roomMap = new Map<string, DisclosureLinkEntry>();
  const passthrough: DisclosureLinkEntry[] = [];

  for (const entry of entries) {
    if (!isInsurerDisclosureRoomCategory(entry.category)) {
      passthrough.push(entry);
      continue;
    }

    const sourceUrl = entry.sourceUrl?.trim();
    if (!sourceUrl) continue;

    const insurerName = extractInsurerNameFromDisclosureTitle(entry.title);
    const key = disclosureRoomDedupeKey(insurerName, sourceUrl);
    const copy = buildDisclosureRoomCopy(insurerName);
    const slug =
      extractInsurerSlugFromDisclosureId(entry.id) ??
      insurerName.replace(/\s+/g, "-").toLocaleLowerCase("ko-KR");

    const unified: DisclosureLinkEntry = {
      id: `disclosure-room-${slug}`,
      title: copy.title,
      category: "product_disclosure",
      sourceUrl,
      description: copy.description,
      lastVerifiedAt: entry.lastVerifiedAt,
      verificationStatus: entry.verificationStatus,
    };

    const existing = roomMap.get(key);
    if (!existing) {
      roomMap.set(key, unified);
      continue;
    }

    if (
      entry.lastVerifiedAt &&
      (!existing.lastVerifiedAt || entry.lastVerifiedAt > existing.lastVerifiedAt)
    ) {
      roomMap.set(key, {
        ...unified,
        lastVerifiedAt: entry.lastVerifiedAt,
      });
    }
  }

  return [
    ...passthrough,
    ...Array.from(roomMap.values()).sort((a, b) =>
      a.title.localeCompare(b.title, "ko-KR"),
    ),
  ];
}

export function matchesDisclosureRoomSearchQuery(
  query: string,
  insurerName: string,
  fields: string[],
): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  if (!normalizedQuery) return true;

  const searchTarget = [...fields, ...DISCLOSURE_ROOM_SEARCH_ALIASES]
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchTarget.includes(normalizedQuery);
}
