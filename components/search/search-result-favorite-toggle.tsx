"use client";

import { GatedFavoriteButton } from "@/components/planner-favorites/gated-favorite-button";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import type { GlobalSearchResultType } from "@/lib/search/types";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";

const FAVORITABLE_TYPES = new Set<GlobalSearchResultType>([
  "insurer",
  "claim_document",
  "knowledge_article",
]);

export function SearchResultFavoriteToggle({
  resultType,
  resultId,
  title,
  plannerFavoritesEnabled = false,
}: {
  resultType: GlobalSearchResultType;
  resultId: string;
  title: string;
  plannerFavoritesEnabled?: boolean;
}) {
  if (!FAVORITABLE_TYPES.has(resultType)) return null;

  return (
    <PlannerFavoritesScope enabled={plannerFavoritesEnabled}>
      {resultType === "insurer" ? (
        <InsurerSearchFavoriteToggle insurerId={resultId} title={title} />
      ) : resultType === "claim_document" ? (
        <ClaimSearchFavoriteToggle
          favoriteId={`doc:${resultId}`}
          title={title}
        />
      ) : (
        <KnowledgeSearchFavoriteToggle articleId={resultId} title={title} />
      )}
    </PlannerFavoritesScope>
  );
}

function InsurerSearchFavoriteToggle({
  insurerId,
  title,
}: {
  insurerId: string;
  title: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  return (
    <GatedFavoriteButton
      active={isFavorite(insurerId)}
      callbackPath="/search"
      label={title}
      onToggle={() => toggle(insurerId)}
    />
  );
}

function ClaimSearchFavoriteToggle({
  favoriteId,
  title,
}: {
  favoriteId: string;
  title: string;
}) {
  const { isFavorite, toggle } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
  );
  return (
    <GatedFavoriteButton
      active={isFavorite(favoriteId)}
      callbackPath="/search"
      label={title}
      onToggle={() => toggle(favoriteId)}
    />
  );
}

function KnowledgeSearchFavoriteToggle({
  articleId,
  title,
}: {
  articleId: string;
  title: string;
}) {
  const { isFavorite, toggle } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
  );
  return (
    <GatedFavoriteButton
      active={isFavorite(articleId)}
      callbackPath="/search"
      label={title}
      onToggle={() => toggle(articleId)}
    />
  );
}
