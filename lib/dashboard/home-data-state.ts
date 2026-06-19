/** PR-FEATURE-GAP-01: Home public stats — aligned with public-surface-resolvers SSOT. */

export type HomeDataDomain =
  | "insurers"
  | "claimDocuments"
  | "disclosureLinks"
  | "messageTemplates"
  | "workTools"
  | "knowledge";

export type HomeDomainFetchStatus = "ok" | "error";

export type HomeLoadState =
  | "success"
  | "empty"
  | "error"
  | "partial-error";

export type HomePublicStatValue =
  | { kind: "count"; value: number }
  | { kind: "unavailable" };

export type HomePublicStats = {
  insurers: HomePublicStatValue;
  claimDocuments: HomePublicStatValue;
  disclosureLinks: HomePublicStatValue;
  messageTemplates: HomePublicStatValue;
  workTools: HomePublicStatValue;
  knowledge: HomePublicStatValue;
};

export type HomeDataFetchSnapshot = {
  insurers: HomeDomainFetchStatus;
  claimDocuments: HomeDomainFetchStatus;
  disclosureLinks: HomeDomainFetchStatus;
  messageTemplates: HomeDomainFetchStatus;
  workTools: HomeDomainFetchStatus;
  knowledge: HomeDomainFetchStatus;
};

export const HOME_DATA_STATUS_COPY = {
  errorTitle: "현재 홈 현황을 불러오지 못했습니다",
  errorDescription:
    "잠시 후 다시 시도하거나, 상단 메뉴에서 필요한 업무를 바로 확인해 주세요.",
  partialTitle: "일부 현황을 불러오지 못했습니다",
  partialDescription:
    "전산 바로가기, 청구서류, 공시·약관 메뉴는 계속 이용할 수 있습니다.",
  emptyTitle: "아직 표시할 현황이 없습니다",
  emptyDescription:
    "필요한 업무는 상단 메뉴에서 바로 확인할 수 있습니다.",
  statUnavailable: "불러오지 못함",
} as const;

export const HOME_DATA_STATUS_FORBIDDEN_PHRASES = [
  "fetch failed",
  "database",
  "prisma",
  "supabase",
  "railway",
  "stack trace",
  "server error",
  "API 실패",
  "DB 오류",
  "관리자 검수",
  "needs_review",
  "unknown",
] as const;

export function resolveHomeDomainFetchStatus(
  surfaceStatus: "ok" | "error",
): HomeDomainFetchStatus {
  return surfaceStatus === "ok" ? "ok" : "error";
}

function statFromDomain(
  fetchStatus: HomeDomainFetchStatus,
  count: number,
): HomePublicStatValue {
  return fetchStatus === "ok"
    ? { kind: "count", value: count }
    : { kind: "unavailable" };
}

export function buildHomePublicStats(input: {
  fetch: HomeDataFetchSnapshot;
  insurerCount: number;
  claimDocumentCount: number;
  disclosureLinkCount: number;
  messageTemplateCount: number;
  workToolCount: number;
  knowledgeArticleCount: number;
}): HomePublicStats {
  return {
    insurers: statFromDomain(input.fetch.insurers, input.insurerCount),
    claimDocuments: statFromDomain(
      input.fetch.claimDocuments,
      input.claimDocumentCount,
    ),
    disclosureLinks: statFromDomain(
      input.fetch.disclosureLinks,
      input.disclosureLinkCount,
    ),
    messageTemplates: statFromDomain(
      input.fetch.messageTemplates,
      input.messageTemplateCount,
    ),
    workTools: statFromDomain(input.fetch.workTools, input.workToolCount),
    knowledge: statFromDomain(input.fetch.knowledge, input.knowledgeArticleCount),
  };
}

export function resolveHomeLoadState(input: {
  fetch: HomeDataFetchSnapshot;
  insurerCount: number;
  claimDocumentCount: number;
  disclosureLinkCount: number;
  messageTemplateCount: number;
  workToolCount: number;
  knowledgeArticleCount: number;
}): HomeLoadState {
  const statuses = Object.values(input.fetch);
  const errorCount = statuses.filter((s) => s === "error").length;

  if (errorCount === statuses.length) return "error";
  if (errorCount > 0) return "partial-error";

  const total =
    input.insurerCount +
    input.claimDocumentCount +
    input.disclosureLinkCount +
    input.messageTemplateCount +
    input.workToolCount +
    input.knowledgeArticleCount;
  if (total === 0) return "empty";
  return "success";
}
