import type { GlobalSearchResult } from "./types";

export function rankSearchResults(
  results: GlobalSearchResult[],
  query: string,
): GlobalSearchResult[] {
  const q = query.normalize("NFKC").toLowerCase();

  const scored = results.map((result) => {
    const title = result.title.normalize("NFKC").toLowerCase();
    const summary = (result.summary ?? "").normalize("NFKC").toLowerCase();
    const category = (result.categoryLabel ?? "").normalize("NFKC").toLowerCase();

    let score = 0;
    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 85;
    else if (title.includes(q)) score += 70;
    if (category.includes(q)) score += 40;
    if (summary.includes(q)) score += 25;

    const updated = result.updatedAt ?? result.publishedAt ?? "";
    return { result, score, updated };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.updated.localeCompare(a.updated);
  });

  return scored.map((entry) => entry.result);
}
