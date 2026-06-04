// Public knowledge archive filter + sort (PR-84). Visibility unchanged from PUBLIC_KNOWLEDGE_WHERE.

import {
  KnowledgeArticleCategory,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
} from "@prisma/client";
import type { PublicKnowledgeStatus } from "@/lib/public/knowledge-display";
import type { PublicKnowledgeArticleListItem } from "@/lib/public/knowledge-articles";
import { validatePublicSearchQuery } from "@/lib/search/query-validation";

export type KnowledgeArchiveSort = "latest" | "updated" | "risk";

export type KnowledgeArchiveFilterState = {
  q: string;
  category: KnowledgeArticleCategory | "all";
  type: KnowledgeArticleType | "all";
  risk: KnowledgeRiskLevel | "all";
  review: PublicKnowledgeStatus | "all";
  sort: KnowledgeArchiveSort;
};

export const KNOWLEDGE_ARCHIVE_EMPTY_MESSAGE =
  "검색어를 줄이거나 카테고리·유형 필터를 변경해 보세요. 검수 전·비공개 문서는 목록에 표시되지 않습니다.";

/** Neutral public copy for risk level (PR-84). */
export const PUBLIC_RISK_GUIDANCE_LABEL: Record<KnowledgeRiskLevel, string> = {
  [KnowledgeRiskLevel.low]: "일반 참고",
  [KnowledgeRiskLevel.medium]: "상담 전 확인",
  [KnowledgeRiskLevel.high]: "공식 기준 확인 필요",
  [KnowledgeRiskLevel.blocked]: "안전 경계 문서",
};

const CATEGORY_SET = new Set<string>(Object.values(KnowledgeArticleCategory));
const TYPE_SET = new Set<string>(Object.values(KnowledgeArticleType));
const RISK_SET = new Set<string>(Object.values(KnowledgeRiskLevel));
const REVIEW_SET = new Set<string>(["needs_review", "verified"]);
const SORT_SET = new Set<string>(["latest", "updated", "risk"]);

const RISK_SORT_ORDER: Record<KnowledgeRiskLevel, number> = {
  [KnowledgeRiskLevel.low]: 0,
  [KnowledgeRiskLevel.medium]: 1,
  [KnowledgeRiskLevel.high]: 2,
  [KnowledgeRiskLevel.blocked]: 3,
};

export function defaultKnowledgeArchiveFilterState(): KnowledgeArchiveFilterState {
  return {
    q: "",
    category: "all",
    type: "all",
    risk: "all",
    review: "all",
    sort: "latest",
  };
}

export function parseKnowledgeArchiveParams(
  params: Record<string, string | string[] | undefined>,
): KnowledgeArchiveFilterState {
  const raw = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };

  const category = raw("category");
  const type = raw("type");
  const risk = raw("risk");
  const review = raw("review");
  const sort = raw("sort");

  return {
    q: raw("q").trim(),
    category: CATEGORY_SET.has(category)
      ? (category as KnowledgeArticleCategory)
      : "all",
    type: TYPE_SET.has(type) ? (type as KnowledgeArticleType) : "all",
    risk: RISK_SET.has(risk) ? (risk as KnowledgeRiskLevel) : "all",
    review: REVIEW_SET.has(review)
      ? (review as PublicKnowledgeStatus)
      : "all",
    sort: SORT_SET.has(sort) ? (sort as KnowledgeArchiveSort) : "latest",
  };
}

export function buildKnowledgeArchiveQuery(
  state: KnowledgeArchiveFilterState,
): string {
  const parts = new URLSearchParams();
  if (state.q) parts.set("q", state.q);
  if (state.category !== "all") parts.set("category", state.category);
  if (state.type !== "all") parts.set("type", state.type);
  if (state.risk !== "all") parts.set("risk", state.risk);
  if (state.review !== "all") parts.set("review", state.review);
  if (state.sort !== "latest") parts.set("sort", state.sort);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

export function buildKnowledgeArchiveHref(
  state: KnowledgeArchiveFilterState,
): string {
  return `/knowledge${buildKnowledgeArchiveQuery(state)}`;
}

export type KnowledgeArchiveFilterResult = {
  items: PublicKnowledgeArticleListItem[];
  blockedMessage: string | null;
};

export function filterAndSortKnowledgeArchive(
  items: PublicKnowledgeArticleListItem[],
  state: KnowledgeArchiveFilterState,
): KnowledgeArchiveFilterResult {
  if (state.q) {
    const validation = validatePublicSearchQuery(state.q);
    if (!validation.ok) {
      return { items: [], blockedMessage: validation.message };
    }
  }

  const normalizedQuery = state.q.trim().toLocaleLowerCase("ko-KR");

  const filtered = items.filter((item) => {
    if (state.category !== "all" && item.category !== state.category) {
      return false;
    }
    if (state.type !== "all" && item.type !== state.type) {
      return false;
    }
    if (state.risk !== "all" && item.riskLevel !== state.risk) {
      return false;
    }
    if (state.review !== "all" && item.status !== state.review) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchTarget = [
      item.title,
      item.summary,
      item.categoryLabel,
      item.typeLabel,
      ...(item.tags ?? []),
      item.workflowLabel ?? "",
      item.sourceTitle ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("ko-KR");

    return searchTarget.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => compareKnowledgeArchive(a, b, state.sort));

  return { items: sorted, blockedMessage: null };
}

function compareKnowledgeArchive(
  a: PublicKnowledgeArticleListItem,
  b: PublicKnowledgeArticleListItem,
  sort: KnowledgeArchiveSort,
): number {
  if (sort === "risk") {
    const riskDiff =
      RISK_SORT_ORDER[b.riskLevel] - RISK_SORT_ORDER[a.riskLevel];
    if (riskDiff !== 0) return riskDiff;
  }

  if (sort === "updated") {
    const updatedDiff = b.updatedAt.localeCompare(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;
  } else {
    const publishedA = a.publishedAt ?? "";
    const publishedB = b.publishedAt ?? "";
    const publishedDiff = publishedB.localeCompare(publishedA);
    if (publishedDiff !== 0) return publishedDiff;
  }

  return a.title.localeCompare(b.title, "ko-KR");
}

export function hasActiveKnowledgeFilters(
  state: KnowledgeArchiveFilterState,
): boolean {
  return (
    state.q.length > 0 ||
    state.category !== "all" ||
    state.type !== "all" ||
    state.risk !== "all" ||
    state.review !== "all" ||
    state.sort !== "latest"
  );
}
