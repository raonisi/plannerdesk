export interface SearchResultLinkIdentity {
  insurerKey: string;
  action: string;
  url: string;
}

function compareQueryEntries(
  left: readonly [string, string],
  right: readonly [string, string],
): number {
  if (left[0] !== right[0]) return left[0] < right[0] ? -1 : 1;
  if (left[1] !== right[1]) return left[1] < right[1] ? -1 : 1;
  return 0;
}

/**
 * Produces a conservative URL identity for public search dedupe.
 * Query values are preserved; malformed URLs fall back to their trimmed source.
 */
export function canonicalizeSearchResultUrl(url: string): string {
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = "";

    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    }

    const queryEntries = Array.from(parsed.searchParams.entries()).sort(
      compareQueryEntries,
    );
    parsed.search = "";
    for (const [key, value] of queryEntries) {
      parsed.searchParams.append(key, value);
    }

    return `url:${parsed.toString()}`;
  } catch {
    return `raw:${trimmed}`;
  }
}

export function buildSearchResultLinkDedupeKey(
  identity: SearchResultLinkIdentity,
): string {
  return JSON.stringify([
    identity.insurerKey.trim(),
    identity.action.trim(),
    canonicalizeSearchResultUrl(identity.url),
  ]);
}

/** Keeps the first result from the caller's established order. */
export function dedupeSearchResultsByLinkIdentity<T>(
  results: readonly T[],
  getIdentity: (result: T) => SearchResultLinkIdentity,
): T[] {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const result of results) {
    const key = buildSearchResultLinkDedupeKey(getIdentity(result));
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}
