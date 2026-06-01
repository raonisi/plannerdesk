import type { AdminSearchResultType } from "./types";

export const ADMIN_SEARCH_DOMAIN_LABEL: Record<AdminSearchResultType, string> = {
  insurer: "보험사",
  claim_document: "청구서류",
  knowledge_article: "지식",
  disclosure_link: "공시·약관",
  message_template: "고객문구",
  correction_request: "제보 큐",
};

export const ADMIN_SEARCH_FILTER_OPTIONS: {
  param: string;
  domain: import("./types").AdminSearchDomain;
  label: string;
}[] = [
  { param: "all", domain: "all", label: "전체" },
  { param: "insurer", domain: "insurer", label: "보험사" },
  { param: "claimDocument", domain: "claim_document", label: "청구서류" },
  {
    param: "knowledgeArticle",
    domain: "knowledge_article",
    label: "지식",
  },
  {
    param: "disclosureLink",
    domain: "disclosure_link",
    label: "공시·약관",
  },
  {
    param: "messageTemplate",
    domain: "message_template",
    label: "고객문구",
  },
  {
    param: "correctionRequest",
    domain: "correction_request",
    label: "제보 큐",
  },
];

export const ADMIN_STATUS_FILTER_OPTIONS: {
  value: import("./types").AdminSearchStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "상태 전체" },
  { value: "draft", label: "초안" },
  { value: "review", label: "검수 필요" },
  { value: "published", label: "게시/검수 완료" },
  { value: "archived", label: "보관" },
  { value: "new", label: "신규 제보" },
  { value: "needsRedaction", label: "마스킹 필요" },
];

export const ADMIN_PUBLISHED_FILTER_OPTIONS: {
  value: import("./types").AdminSearchPublishedFilter;
  label: string;
}[] = [
  { value: "all", label: "공개 여부 전체" },
  { value: "published", label: "공개" },
  { value: "unpublished", label: "비공개" },
];

export const ADMIN_INTERNAL_FILTER_OPTIONS: {
  value: import("./types").AdminSearchInternalFilter;
  label: string;
}[] = [
  { value: "all", label: "내부 전용 전체" },
  { value: "external", label: "외부 공개 가능" },
  { value: "internal", label: "내부 전용" },
];

export const ADMIN_SENSITIVE_FILTER_OPTIONS: {
  value: import("./types").AdminSearchSensitiveFilter;
  label: string;
}[] = [
  { value: "all", label: "민감 플래그 전체" },
  { value: "flagged", label: "민감·마스킹 플래그" },
];
