"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  KNOWLEDGE_FAVORITES_SECTION_TITLE,
  LOCAL_FAVORITES_DEVICE_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  buildAllowedIdSet,
  filterFavoriteIdsToCatalog,
} from "@/lib/planner-favorites/filter-ids";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import type { PublicKnowledgeArticleListItem } from "@/lib/public/knowledge-articles";
import { sectionEyebrow, textStyles } from "@/lib/design-system";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";

export function KnowledgeFavoritesStrip({
  articles,
}: {
  articles: PublicKnowledgeArticleListItem[];
}) {
  const { favorites, count } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
  );

  const metaById = useMemo(() => {
    const map = new Map<string, { label: string; href: string }>();
    for (const article of articles) {
      map.set(article.id, {
        label: article.title,
        href: `/knowledge/${article.slug}`,
      });
    }
    return map;
  }, [articles]);

  const chips = useMemo(() => {
    const allowed = buildAllowedIdSet(metaById.keys());
    return filterFavoriteIdsToCatalog(favorites, allowed)
      .map((id) => ({ id, ...metaById.get(id)! }))
      .filter((row) => row.label);
  }, [favorites, metaById]);

  if (count === 0) return null;

  return (
    <section
      aria-label={KNOWLEDGE_FAVORITES_SECTION_TITLE}
      className="rounded-xl border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-4"
    >
      <p className={sectionEyebrow}>{KNOWLEDGE_FAVORITES_SECTION_TITLE}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.id}>
            <Link
              href={chip.href}
              className="inline-flex min-h-9 max-w-full items-center rounded-lg border border-[#d9c9a8] bg-white px-3 text-xs font-bold text-[#102235] hover:border-[#aa8137] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40"
            >
              <span className="truncate">{chip.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={`mt-2 ${textStyles.small}`}>{LOCAL_FAVORITES_DEVICE_NOTICE}</p>
    </section>
  );
}
