import type { GlobalSearchResultType } from "./types";

export const SEARCH_DOMAIN_LABEL: Record<GlobalSearchResultType, string> = {
  insurer: "보험사",
  claim_document: "청구서류",
  knowledge_article: "지식 아카이브",
  message_template: "고객문구",
  disclosure_link: "공시·약관",
  work_link: "업무 링크",
};

/** Contextual action labels on global search result cards (PR-127). */
export const SEARCH_RESULT_ACTION_LABEL: Record<GlobalSearchResultType, string> = {
  insurer: "보험사 보기",
  claim_document: "필요서류 확인",
  knowledge_article: "지식 보기",
  disclosure_link: "공시·약관 보기",
  message_template: "문구 보기",
  work_link: "링크 열기",
};

export const SEARCH_RESULT_SECONDARY_ACTION: Partial<
  Record<GlobalSearchResultType, string>
> = {
  insurer: "청구안내 보기",
};

export const SEARCH_DOMAIN_DISPLAY_ORDER: GlobalSearchResultType[] = [
  "insurer",
  "claim_document",
  "knowledge_article",
  "disclosure_link",
  "message_template",
  "work_link",
];

/** Distinct badge styles per public search domain (PR-BS-03). */
export const SEARCH_DOMAIN_BADGE_CLASS: Record<GlobalSearchResultType, string> = {
  insurer: "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]",
  claim_document: "border-indigo-100 bg-indigo-50 text-indigo-800",
  knowledge_article: "border-emerald-100 bg-emerald-50 text-emerald-900",
  disclosure_link: "border-violet-100 bg-violet-50 text-violet-900",
  message_template: "border-rose-100 bg-rose-50 text-rose-900",
  work_link: "border-amber-200 bg-amber-50 text-amber-950",
};

export const PUBLIC_SEARCH_FILTER_OPTIONS: {
  param: string;
  domain: import("./types").PublicSearchDomain;
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
  { param: "workLink", domain: "work_link", label: "업무 링크" },
];
