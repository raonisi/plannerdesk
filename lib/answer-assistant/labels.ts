// Answer Assistant UI labels (PR-94).

import type {
  AnswerAssistantDomainFilter,
  AnswerAssistantPurpose,
  AnswerAssistantTone,
} from "./types";
import type { RetrievalSourceType } from "./retrieval-types";

export const ANSWER_ASSIST_PURPOSE_OPTIONS: {
  value: AnswerAssistantPurpose;
  label: string;
  description: string;
}[] = [
  {
    value: "GENERAL_EXPLANATION",
    label: "일반 설명 초안",
    description: "공개 자료 기반 일반 기준 설명",
  },
  {
    value: "CUSTOMER_SAFE_MESSAGE",
    label: "고객 안내 문구",
    description: "중립적 고객 안내 문구 초안",
  },
  {
    value: "KNOWLEDGE_SUMMARY",
    label: "지식 아카이브 요약",
    description: "검수 완료 지식 문서 요약 초안",
  },
  {
    value: "DISCLOSURE_GUIDE",
    label: "공시·약관 확인 경로",
    description: "공식 공시·약관 확인 경로 안내",
  },
  {
    value: "CLAIM_DOCUMENT_GUIDE",
    label: "청구서류 안내",
    description: "청구서류 안내 페이지 확인 항목 정리",
  },
  {
    value: "COMMUNITY_REPLY_DRAFT",
    label: "커뮤니티 답글 초안",
    description: "관리자 검수용 답글 초안 (자동 게시 없음)",
  },
];

export const ANSWER_ASSIST_TONE_OPTIONS: {
  value: AnswerAssistantTone;
  label: string;
}[] = [
  { value: "neutral", label: "중립" },
  { value: "formal", label: "격식" },
  { value: "concise", label: "간결" },
  { value: "consultative", label: "상담형" },
];

export const ANSWER_ASSIST_DOMAIN_OPTIONS: {
  value: AnswerAssistantDomainFilter;
  label: string;
}[] = [
  { value: "all", label: "전체 (허용 도메인)" },
  { value: "knowledge_article", label: "지식 아카이브" },
  { value: "disclosure_link", label: "공시·약관" },
  { value: "message_template", label: "고객 안내 문구 (safeCopy)" },
  { value: "insurer", label: "보험사 디렉토리" },
  { value: "claim_document", label: "청구서류 안내" },
];

export const RETRIEVAL_SOURCE_TYPE_LABEL: Record<RetrievalSourceType, string> =
  {
    knowledge_article: "지식 아카이브",
    disclosure_link: "공시·약관",
    message_template: "고객 안내 문구",
    insurer: "보험사",
    claim_document: "청구서류",
  };

export function purposeRequiresOfficialCheck(
  purpose: AnswerAssistantPurpose,
): boolean {
  return (
    purpose === "DISCLOSURE_GUIDE" || purpose === "CLAIM_DOCUMENT_GUIDE"
  );
}
