/** Drop favorite ids that are not in the current public catalog snapshot. */
export function filterFavoriteIdsToCatalog(
  favoriteIds: Iterable<string>,
  allowedIds: ReadonlySet<string>,
): string[] {
  const out: string[] = [];
  for (const id of favoriteIds) {
    if (typeof id === "string" && id.length > 0 && allowedIds.has(id)) {
      out.push(id);
    }
  }
  return out;
}

export function buildAllowedIdSet(ids: Iterable<string>): ReadonlySet<string> {
  const set = new Set<string>();
  for (const id of ids) {
    if (typeof id === "string" && id.length > 0) set.add(id);
  }
  return set;
}
