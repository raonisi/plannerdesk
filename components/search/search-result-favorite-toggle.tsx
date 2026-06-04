"use client";

import { FavoriteButton } from "@/components/launcher/favorite-button";
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
}: {
  resultType: GlobalSearchResultType;
  resultId: string;
  title: string;
}) {
  if (!FAVORITABLE_TYPES.has(resultType)) return null;

  if (resultType === "insurer") {
    return <InsurerSearchFavoriteToggle insurerId={resultId} title={title} />;
  }

  if (resultType === "claim_document") {
    return (
      <ClaimSearchFavoriteToggle
        favoriteId={`doc:${resultId}`}
        title={title}
      />
    );
  }

  return (
    <KnowledgeSearchFavoriteToggle articleId={resultId} title={title} />
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
    <FavoriteButton
      active={isFavorite(insurerId)}
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
    <FavoriteButton
      active={isFavorite(favoriteId)}
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
    <FavoriteButton
      active={isFavorite(articleId)}
      label={title}
      onToggle={() => toggle(articleId)}
    />
  );
}
