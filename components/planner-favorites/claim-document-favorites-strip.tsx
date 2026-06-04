"use client";

import Link from "next/link";
import { useMemo } from "react";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import {
  CLAIM_FAVORITES_SECTION_TITLE,
  LOCAL_FAVORITES_DEVICE_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  buildAllowedIdSet,
  filterFavoriteIdsToCatalog,
} from "@/lib/planner-favorites/filter-ids";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { sectionEyebrow, textStyles } from "@/lib/design-system";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";

export function ClaimDocumentFavoritesStrip({
  items,
}: {
  items: ClaimLibraryItem[];
}) {
  const { favorites, count } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
  );

  const metaById = useMemo(() => {
    const map = new Map<string, { label: string; href: string }>();
    for (const item of items) {
      const favId = claimLibraryFavoriteId(item);
      if (item.kind === "pdf") {
        map.set(favId, { label: item.title, href: item.href });
      } else {
        const doc = item.document;
        const href = doc.claimFormUrl ?? doc.officialSourceUrl ?? "/claim-documents";
        map.set(favId, { label: doc.title, href });
      }
    }
    return map;
  }, [items]);

  const chips = useMemo(() => {
    const allowed = buildAllowedIdSet(metaById.keys());
    return filterFavoriteIdsToCatalog(favorites, allowed)
      .map((id) => ({ id, ...metaById.get(id)! }))
      .filter((row) => row.label);
  }, [favorites, metaById]);

  if (count === 0) return null;

  return (
    <section
      aria-label={CLAIM_FAVORITES_SECTION_TITLE}
      className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE] px-4 py-4"
    >
      <p className={sectionEyebrow}>{CLAIM_FAVORITES_SECTION_TITLE}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.id}>
            <Link
              href={chip.href}
              className="inline-flex min-h-9 max-w-full items-center rounded-lg border border-[#E3DED4] bg-white px-3 text-xs font-bold text-[#0F1D2E] hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
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
