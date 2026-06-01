import type { GlobalSearchResultType } from "./types";

export const SEARCH_DOMAIN_LABEL: Record<GlobalSearchResultType, string> = {
  insurer: "보험사",
  claim_document: "청구서류",
  knowledge_article: "지식",
  disclosure_link: "공시·약관",
  message_template: "고객문구",
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
];
