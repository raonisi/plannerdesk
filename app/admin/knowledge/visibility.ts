import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import {
  isKnowledgeArticlePubliclyVisible,
  PUBLIC_KNOWLEDGE_ARTICLE_STATUSES,
} from "@/lib/public/knowledge-articles";

export const ADMIN_KNOWLEDGE_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공개 조건: 게시 중이며, 검수 필요 또는 검수 완료 상태인 지식 문서만 공개 화면에 표시됩니다.",
  draftPublishBlocked:
    "초안·보관·반려 상태의 문서는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요.",
  aiUsableBlocked:
    "AI 참조 가능은 검수 완료(verified) 상태에서만 설정할 수 있습니다.",
  notFound: "지식 문서 관리 레코드를 찾을 수 없습니다.",
  duplicateSlug: "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해 주세요.",
  prohibitedPhraseTitle: "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "지급 확정, 업로드 유도, 개인정보 요청 표현은 검토 전 제거해 주세요.",
  pageTitle: "지식 아카이브 관리",
  pageDescription:
    "청구, 고지, 해지, 약관, 고객응대 기준을 작성하고 검수 상태를 관리합니다. 공개 전 공식 출처와 금지 표현을 반드시 확인하세요.",
  aiGuidance:
    "AI 참조 가능 문서는 검수 완료 후 별도 기준에 따라 제한적으로 설정합니다. AI API는 아직 연결되지 않았습니다.",
} as const;

export const STATUS_LABEL: Record<KnowledgeArticleStatus, string> = {
  [KnowledgeArticleStatus.draft]: "초안",
  [KnowledgeArticleStatus.needs_review]: "검수 필요",
  [KnowledgeArticleStatus.verified]: "검수 완료",
  [KnowledgeArticleStatus.archived]: "보관",
  [KnowledgeArticleStatus.rejected]: "반려",
};

export const CATEGORY_LABEL: Record<KnowledgeArticleCategory, string> = {
  [KnowledgeArticleCategory.claim]: "청구·접수",
  [KnowledgeArticleCategory.underwriting]: "고지·심사",
  [KnowledgeArticleCategory.cancellation]: "계약·해지",
  [KnowledgeArticleCategory.disclosure]: "공시·약관",
  [KnowledgeArticleCategory.customer_message]: "고객 안내문",
  [KnowledgeArticleCategory.operation_safety]: "운영 안전",
  [KnowledgeArticleCategory.plannerdesk_usage]: "PlannerDesk 사용",
};

export const TYPE_LABEL: Record<KnowledgeArticleType, string> = {
  [KnowledgeArticleType.faq]: "FAQ",
  [KnowledgeArticleType.practical_standard]: "실무 기준",
  [KnowledgeArticleType.checklist]: "체크리스트",
  [KnowledgeArticleType.message_sample]: "안내문 샘플",
  [KnowledgeArticleType.link_guide]: "링크 가이드",
  [KnowledgeArticleType.safety_boundary]: "안전 경계",
};

export const RISK_LABEL: Record<KnowledgeRiskLevel, string> = {
  [KnowledgeRiskLevel.low]: "낮음",
  [KnowledgeRiskLevel.medium]: "보통",
  [KnowledgeRiskLevel.high]: "높음",
  [KnowledgeRiskLevel.blocked]: "차단",
};

export const SOURCE_TYPE_LABEL: Record<KnowledgeSourceType, string> = {
  [KnowledgeSourceType.internal]: "내부",
  [KnowledgeSourceType.official]: "공식",
  [KnowledgeSourceType.insurer]: "보험사",
  [KnowledgeSourceType.regulator]: "감독기관",
  [KnowledgeSourceType.mixed]: "복합",
};

export const PUBLICATION_LABEL = {
  published: "게시 중",
  unpublished: "비게시",
} as const;

export const VISIBILITY_LABEL = {
  visible: "공개 화면 표시",
  hidden: "공개 조건 미충족",
} as const;

export const WRITABLE_STATUSES = [
  KnowledgeArticleStatus.draft,
  KnowledgeArticleStatus.needs_review,
  KnowledgeArticleStatus.verified,
  KnowledgeArticleStatus.archived,
  KnowledgeArticleStatus.rejected,
] as const;

export function wouldPublishBlocked(flags: {
  isPublished: boolean;
  status: KnowledgeArticleStatus;
}): boolean {
  return flags.isPublished && !isKnowledgeArticlePubliclyVisible(flags);
}

export {
  PUBLIC_KNOWLEDGE_ARTICLE_STATUSES,
  isKnowledgeArticlePubliclyVisible,
};

export const CATEGORY_OPTIONS = Object.values(KnowledgeArticleCategory).map(
  (value) => ({ value, label: CATEGORY_LABEL[value] }),
);

export const TYPE_OPTIONS = Object.values(KnowledgeArticleType).map((value) => ({
  value,
  label: TYPE_LABEL[value],
}));
