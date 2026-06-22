"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { EmptyStatePanel } from "@/components/launcher/empty-state-panel";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import {
  HOME_FAVORITES_EMPTY_DESCRIPTION,
  HOME_FAVORITES_EMPTY_TITLE,
  LOCAL_FAVORITES_DEVICE_NOTICE,
  LOCAL_FAVORITES_PUBLISHED_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  buildAllowedIdSet,
  filterFavoriteIdsToCatalog,
} from "@/lib/planner-favorites/filter-ids";
import {
  HOME_FAVORITES_DISPLAY_LIMIT,
  publicWorkspaceKindLabel,
  type PublicWorkspaceKind,
} from "@/lib/planner-favorites/recent-work";
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

type FavoriteChipKind =
  | "directory"
  | "work-tool"
  | "claim-document"
  | "knowledge"
  | "message-template";

type FavoriteChip = {
  key: string;
  label: string;
  href: string;
  kind: FavoriteChipKind;
  removeId: string;
};

interface PlannerWorkFavoritesPanelProps {
  insurers: Array<{ id: string; name: string }>;
  claimDocuments: PublicClaimDocument[];
  knowledgeArticles: PublicKnowledgeArticleListItem[];
  messageTemplates: Array<{ id: string; title: string }>;
}

function readStringArrayFromStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeStringArrayToStorage(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // ignore quota / private mode
  }
}

export function PlannerWorkFavoritesPanel({
  insurers,
  claimDocuments,
  knowledgeArticles,
  messageTemplates,
}: PlannerWorkFavoritesPanelProps) {
  const { favorites: insurerFavoriteIds, toggle: toggleInsurerFavorite } =
    useFavorites();
  const claimFavorites = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
  );
  const knowledgeFavorites = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
  );

  const [workToolIds, setWorkToolIds] = useState<string[]>([]);
  const [messageTemplateIds, setMessageTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncWorkTools = () => {
      setWorkToolIds(
        readStringArrayFromStorage(PLANNER_FAVORITE_STORAGE_KEYS.workTools),
      );
    };
    const syncMessageTemplates = () => {
      setMessageTemplateIds(
        readStringArrayFromStorage(PLANNER_FAVORITE_STORAGE_KEYS.messageTemplates),
      );
    };

    syncWorkTools();
    syncMessageTemplates();

    const onStorage = (event: StorageEvent) => {
      if (event.key === PLANNER_FAVORITE_STORAGE_KEYS.workTools) syncWorkTools();
      if (event.key === PLANNER_FAVORITE_STORAGE_KEYS.messageTemplates) {
        syncMessageTemplates();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("plannerdesk.workTools.favorites:update", syncWorkTools);
    window.addEventListener(
      "plannerdesk.messages.favorites:update",
      syncMessageTemplates,
    );

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "plannerdesk.workTools.favorites:update",
        syncWorkTools,
      );
      window.removeEventListener(
        "plannerdesk.messages.favorites:update",
        syncMessageTemplates,
      );
    };
  }, []);

  const removeWorkToolFavorite = useCallback((toolId: string) => {
    const next = readStringArrayFromStorage(
      PLANNER_FAVORITE_STORAGE_KEYS.workTools,
    ).filter((id) => id !== toolId);
    writeStringArrayToStorage(PLANNER_FAVORITE_STORAGE_KEYS.workTools, next);
    setWorkToolIds(next);
    try {
      window.dispatchEvent(new Event("plannerdesk.workTools.favorites:update"));
    } catch {
      // defensive
    }
  }, []);

  const removeMessageTemplateFavorite = useCallback((templateId: string) => {
    const next = readStringArrayFromStorage(
      PLANNER_FAVORITE_STORAGE_KEYS.messageTemplates,
    ).filter((id) => id !== templateId);
    writeStringArrayToStorage(
      PLANNER_FAVORITE_STORAGE_KEYS.messageTemplates,
      next,
    );
    setMessageTemplateIds(next);
    try {
      window.dispatchEvent(new Event("plannerdesk.messages.favorites:update"));
    } catch {
      // defensive
    }
  }, []);

  const insurerById = useMemo(() => {
    const map = new Map<string, string>();
    for (const ins of insurers) map.set(ins.id, ins.name);
    return map;
  }, [insurers]);

  const messageTemplateById = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of messageTemplates) map.set(template.id, template.title);
    return map;
  }, [messageTemplates]);

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
        key: `directory-${id}`,
        label: name,
        href: `/directory?search=${encodeURIComponent(name)}`,
        kind: "directory",
        removeId: id,
      });
    }

    for (const toolId of workToolIds) {
      if (!WORK_TOOL_LABELS[toolId]) continue;
      list.push({
        key: `work-tool-${toolId}`,
        label: WORK_TOOL_LABELS[toolId],
        href: `/work-tools?tool=${toolId}`,
        kind: "work-tool",
        removeId: toolId,
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
        key: `claim-document-${favId}`,
        label: meta.label,
        href: meta.href,
        kind: "claim-document",
        removeId: favId,
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
        removeId: id,
      });
    }

    const allowedMessageIds = buildAllowedIdSet(messageTemplateById.keys());
    for (const id of filterFavoriteIdsToCatalog(messageTemplateIds, allowedMessageIds)) {
      const title = messageTemplateById.get(id);
      if (!title) continue;
      list.push({
        key: `message-template-${id}`,
        label: title,
        href: "/message-templates",
        kind: "message-template",
        removeId: id,
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
    messageTemplateIds,
    messageTemplateById,
  ]);

  const visibleChips = chips.slice(0, HOME_FAVORITES_DISPLAY_LIMIT);

  const handleRemove = (chip: FavoriteChip) => {
    switch (chip.kind) {
      case "directory":
        toggleInsurerFavorite(chip.removeId);
        break;
      case "work-tool":
        removeWorkToolFavorite(chip.removeId);
        break;
      case "claim-document":
        claimFavorites.toggle(chip.removeId);
        break;
      case "knowledge":
        knowledgeFavorites.toggle(chip.removeId);
        break;
      case "message-template":
        removeMessageTemplateFavorite(chip.removeId);
        break;
      default:
        break;
    }
  };

  const chipKindLabel = (kind: FavoriteChipKind): string =>
    publicWorkspaceKindLabel(kind as PublicWorkspaceKind);

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

      {visibleChips.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {visibleChips.map((chip) => (
            <li
              key={chip.key}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-[#E3DED4] bg-white px-2 py-1.5"
            >
              <Link
                href={chip.href}
                className="min-w-0 flex-1 rounded-md px-1 py-1 text-xs font-bold text-[#0F1D2E] transition hover:text-[#16382C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
              >
                <span className="line-clamp-2 break-keep">{chip.label}</span>
                <span className="mt-0.5 block text-[10px] font-semibold text-[#4A5565]">
                  {chipKindLabel(chip.kind)}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`${chip.label} 즐겨찾기에서 제거`}
                aria-pressed={true}
                onClick={() => handleRemove(chip)}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[#B9975B] transition hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
              >
                <Star className="h-4 w-4 fill-[#B9975B]" aria-hidden />
              </button>
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
