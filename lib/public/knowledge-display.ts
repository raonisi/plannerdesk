import {
  KnowledgeArticleCategory,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";

export const PUBLIC_CATEGORY_LABEL: Record<KnowledgeArticleCategory, string> = {
  [KnowledgeArticleCategory.claim]: "청구서류·접수 기준",
  [KnowledgeArticleCategory.underwriting]: "고지·심사 전 확인",
  [KnowledgeArticleCategory.cancellation]: "계약관리·유지 실무",
  [KnowledgeArticleCategory.disclosure]: "공시·약관·공식 링크",
  [KnowledgeArticleCategory.customer_message]: "고객 안내문·응대 문구",
  [KnowledgeArticleCategory.operation_safety]: "운영 안전·금지 영역",
  [KnowledgeArticleCategory.plannerdesk_usage]: "PlannerDesk 사용법",
};

export const PUBLIC_TYPE_LABEL: Record<KnowledgeArticleType, string> = {
  [KnowledgeArticleType.faq]: "FAQ",
  [KnowledgeArticleType.practical_standard]: "실무 기준",
  [KnowledgeArticleType.checklist]: "체크리스트",
  [KnowledgeArticleType.message_sample]: "안내문 샘플",
  [KnowledgeArticleType.link_guide]: "링크 가이드",
  [KnowledgeArticleType.safety_boundary]: "안전 경계",
};

export type PublicKnowledgeStatus = "needs_review" | "verified";

export const PUBLIC_STATUS_LABEL: Record<PublicKnowledgeStatus, string> = {
  needs_review: "공식 확인 진행 중",
  verified: "공식 확인 완료",
};

export const PUBLIC_RISK_LABEL: Record<KnowledgeRiskLevel, string> = {
  [KnowledgeRiskLevel.low]: "낮음",
  [KnowledgeRiskLevel.medium]: "주의",
  [KnowledgeRiskLevel.high]: "높음",
  [KnowledgeRiskLevel.blocked]: "차단",
};

export const PUBLIC_SOURCE_TYPE_LABEL: Record<KnowledgeSourceType, string> = {
  [KnowledgeSourceType.internal]: "내부",
  [KnowledgeSourceType.official]: "공식",
  [KnowledgeSourceType.insurer]: "보험사",
  [KnowledgeSourceType.regulator]: "감독기관",
  [KnowledgeSourceType.mixed]: "복합",
};
