"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { EmptyStatePanel } from "@/components/launcher/empty-state-panel";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import {
  HOME_FAVORITES_EMPTY_DESCRIPTION,
  HOME_FAVORITES_EMPTY_TITLE,
  LOCAL_FAVORITES_DEVICE_NOTICE,
  LOCAL_FAVORITES_PUBLISHED_NOTICE,
  PLANNER_FAVORITES_PII_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  buildAllowedIdSet,
  filterFavoriteIdsToCatalog,
} from "@/lib/planner-favorites/filter-ids";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import { buildClaimLibraryItems } from "@/lib/claim-documents/claim-library";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { PublicKnowledgeArticleListItem } from "@/lib/public/knowledge-articles";
import { sectionEyebrow, shadows, textStyles } from "@/lib/design-system";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";

const WORK_TOOL_LABELS: Record<string, string> = {
  "planner-stats": "통계실",
  "disease-search": "인수예외질환",
  "surgery-code": "수술분류표",
  "disease-code": "상병코드",
  "silbi-calculator": "실손보험금",
  "insurance-age": "보험나이",
  "bmi-calculator": "BMI",
  "hidden-insurance": "숨은보험금",
};

type FavoriteChip = {
  key: string;
  label: string;
  href: string;
  kind: "insurer" | "tool" | "claim" | "knowledge";
};

interface PlannerWorkFavoritesPanelProps {
  insurers: Array<{ id: string; name: string }>;
  claimDocuments: PublicClaimDocument[];
  knowledgeArticles: PublicKnowledgeArticleListItem[];
}

export function PlannerWorkFavoritesPanel({
  insurers,
  claimDocuments,
  knowledgeArticles,
}: PlannerWorkFavoritesPanelProps) {
  const { favorites: insurerFavoriteIds } = useFavorites();
  const claimFavorites = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
  );
  const knowledgeFavorites = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
  );

  const [workToolIds, setWorkToolIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncWorkTools = () => {
      try {
        const raw = window.localStorage.getItem(
          PLANNER_FAVORITE_STORAGE_KEYS.workTools,
        );
        if (!raw) {
          setWorkToolIds([]);
          return;
        }
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
          setWorkToolIds([]);
          return;
        }
        setWorkToolIds(parsed.filter((s): s is string => typeof s === "string"));
      } catch {
        setWorkToolIds([]);
      }
    };

    syncWorkTools();
    const onStorage = (event: StorageEvent) => {
      if (event.key === PLANNER_FAVORITE_STORAGE_KEYS.workTools) syncWorkTools();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("plannerdesk.workTools.favorites:update", syncWorkTools);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "plannerdesk.workTools.favorites:update",
        syncWorkTools,
      );
    };
  }, []);

  const insurerById = useMemo(() => {
    const map = new Map<string, string>();
    for (const ins of insurers) map.set(ins.id, ins.name);
    return map;
  }, [insurers]);

  const claimItems = useMemo(
    () => buildClaimLibraryItems(claimDocuments),
    [claimDocuments],
  );

  const claimMetaByFavoriteId = useMemo(() => {
    const map = new Map<string, { label: string; href: string }>();
    for (const item of claimItems) {
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
  }, [claimItems]);

  const knowledgeMetaById = useMemo(() => {
    const map = new Map<string, { label: string; href: string }>();
    for (const article of knowledgeArticles) {
      map.set(article.id, {
        label: article.title,
        href: `/knowledge/${article.slug}`,
      });
    }
    return map;
  }, [knowledgeArticles]);

  const chips = useMemo(() => {
    const list: FavoriteChip[] = [];

    const allowedInsurerIds = buildAllowedIdSet(insurers.map((i) => i.id));
    for (const id of filterFavoriteIdsToCatalog(insurerFavoriteIds, allowedInsurerIds)) {
      const name = insurerById.get(id);
      if (!name) continue;
      list.push({
        key: `insurer-${id}`,
        label: name,
        href: `/directory?search=${encodeURIComponent(name)}`,
        kind: "insurer",
      });
    }

    for (const toolId of workToolIds) {
      if (!WORK_TOOL_LABELS[toolId]) continue;
      list.push({
        key: `tool-${toolId}`,
        label: WORK_TOOL_LABELS[toolId],
        href: `/work-tools?tool=${toolId}`,
        kind: "tool",
      });
    }

    const allowedClaimIds = buildAllowedIdSet(claimMetaByFavoriteId.keys());
    for (const favId of filterFavoriteIdsToCatalog(
      claimFavorites.favorites,
      allowedClaimIds,
    )) {
      const meta = claimMetaByFavoriteId.get(favId);
      if (!meta) continue;
      list.push({
        key: `claim-${favId}`,
        label: meta.label,
        href: meta.href,
        kind: "claim",
      });
    }

    const allowedKnowledgeIds = buildAllowedIdSet(knowledgeMetaById.keys());
    for (const id of filterFavoriteIdsToCatalog(
      knowledgeFavorites.favorites,
      allowedKnowledgeIds,
    )) {
      const meta = knowledgeMetaById.get(id);
      if (!meta) continue;
      list.push({
        key: `knowledge-${id}`,
        label: meta.label,
        href: meta.href,
        kind: "knowledge",
      });
    }

    return list;
  }, [
    insurerFavoriteIds,
    insurerById,
    insurers,
    workToolIds,
    claimFavorites.favorites,
    claimMetaByFavoriteId,
    knowledgeFavorites.favorites,
    knowledgeMetaById,
  ]);

  const kindLabel: Record<FavoriteChip["kind"], string> = {
    insurer: "보험사",
    tool: "도구",
    claim: "청구",
    knowledge: "지식",
  };

  return (
    <section
      className={`rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5 ${shadows.card}`}
    >
      <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
        <Star className="h-3.5 w-3.5 fill-[#B9975B] text-[#B9975B]" />
        즐겨찾기
      </h2>
      <p className={`mt-2 break-keep ${textStyles.small}`}>
        {LOCAL_FAVORITES_PUBLISHED_NOTICE}
      </p>
      <p className={`mt-2 break-keep ${textStyles.small}`}>
        {PLANNER_FAVORITES_PII_NOTICE}
      </p>

      {chips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.href}
                className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg border border-[#E3DED4] bg-white px-3 py-1.5 text-xs font-bold text-[#0F1D2E] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
              >
                <span className="truncate">{chip.label}</span>
                <span className="shrink-0 rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#5B6470]">
                  {kindLabel[chip.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3">
          <EmptyStatePanel
            actions={[
              { href: "/directory", label: "보험사 둘러보기", variant: "outline" },
              { href: "/work-tools", label: "업무 도구 보기", variant: "primary" },
            ]}
            description={HOME_FAVORITES_EMPTY_DESCRIPTION}
            title={HOME_FAVORITES_EMPTY_TITLE}
          />
        </div>
      )}

      <p className={`mt-3 break-keep ${textStyles.small}`}>{LOCAL_FAVORITES_DEVICE_NOTICE}</p>
    </section>
  );
}
