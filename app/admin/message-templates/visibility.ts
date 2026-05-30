import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
} from "@prisma/client";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import {
  isMessageTemplatePubliclyVisible,
  wouldPublishBlocked,
} from "@/lib/validators/message-template";

export {
  isMessageTemplatePubliclyVisible,
  wouldPublishBlocked,
};

export const ADMIN_MESSAGE_TEMPLATE_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공개 조건: 게시 중이며, 검수 완료(published) 상태이고, 내부 전용이 아닌 문구만 향후 public 화면에 표시됩니다. public 공개 시 안전 문구(safeCopy)가 필수입니다.",
  publishBlocked:
    "공개(게시)는 검수 완료(published) 상태에서만 가능합니다. 내부 전용·초안·검수 필요·보관 상태는 public에 게시할 수 없습니다.",
  internalPublishBlocked: "내부 전용 문구는 public에 게시할 수 없습니다.",
  safeCopyRequired: "public 공개 전 안전 문구(safeCopy)를 작성해 주세요.",
  notFound: "고객 안내 문구를 찾을 수 없습니다.",
  prohibitedPhraseTitle: "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "지급 확정·보장 단정·과도한 가입 유도·공포 조장 표현은 검토 전 제거해 주세요.",
  sensitiveVariableTitle: "허용되지 않는 변수가 포함되어 있습니다.",
  sensitiveVariableDetail:
    "민감정보 변수는 사용할 수 없습니다. 허용 변수 목록만 사용해 주세요.",
  invalidAllowedVariable: "허용 변수 목록에 등록되지 않은 변수가 있습니다.",
  pageTitle: "고객 안내 문구 관리",
  pageDescription:
    "상담·안내·후속 연락 문구를 검수 기준에 맞춰 관리합니다. 보험금 지급 판단·상품 권유 문구가 아닙니다.",
  contentChangedReview:
    "공개 중이던 본문·안전 문구가 변경되어 검수 필요 상태로 전환되었습니다. 다시 검수 후 게시하세요.",
} as const;

export const CATEGORY_LABEL: Record<MessageTemplateCategory, string> = {
  [MessageTemplateCategory.greeting]: "인사",
  [MessageTemplateCategory.follow_up]: "후속 연락",
  [MessageTemplateCategory.appointment]: "상담 예약",
  [MessageTemplateCategory.policy_review]: "보장 점검",
  [MessageTemplateCategory.claim_guide]: "청구 안내",
  [MessageTemplateCategory.contract_maintenance]: "계약 유지",
  [MessageTemplateCategory.cancellation_defense]: "해지 전 확인",
  [MessageTemplateCategory.rebalancing]: "리밸런싱",
  [MessageTemplateCategory.customer_care]: "고객 케어",
  [MessageTemplateCategory.notice]: "공지",
  [MessageTemplateCategory.other]: "기타",
};

export const CHANNEL_LABEL: Record<MessageTemplateChannel, string> = {
  [MessageTemplateChannel.kakao]: "카카오톡",
  [MessageTemplateChannel.sms]: "문자",
  [MessageTemplateChannel.phone_script]: "전화 스크립트",
  [MessageTemplateChannel.email]: "이메일",
  [MessageTemplateChannel.blog]: "블로그",
  [MessageTemplateChannel.threads]: "스레드",
  [MessageTemplateChannel.instagram]: "인스타그램",
  [MessageTemplateChannel.general]: "일반",
};

export const AUDIENCE_LABEL: Record<MessageTemplateAudienceType, string> = {
  [MessageTemplateAudienceType.new_customer]: "신규 고객",
  [MessageTemplateAudienceType.existing_customer]: "기존 고객",
  [MessageTemplateAudienceType.dormant_customer]: "휴면 고객",
  [MessageTemplateAudienceType.claim_customer]: "청구 고객",
  [MessageTemplateAudienceType.cancellation_risk]: "해지 고민",
  [MessageTemplateAudienceType.referral]: "소개 고객",
  [MessageTemplateAudienceType.general]: "일반",
};

export const TONE_LABEL: Record<MessageTemplateTone, string> = {
  [MessageTemplateTone.formal]: "격식",
  [MessageTemplateTone.warm]: "친근",
  [MessageTemplateTone.concise]: "간결",
  [MessageTemplateTone.consultative]: "상담형",
  [MessageTemplateTone.reassuring]: "안심",
  [MessageTemplateTone.neutral]: "중립",
  [MessageTemplateTone.professional]: "전문",
  [MessageTemplateTone.careful]: "정중",
  [MessageTemplateTone.calm]: "차분",
};

export const RISK_LABEL: Record<MessageTemplateRiskLevel, string> = {
  [MessageTemplateRiskLevel.low]: "낮음",
  [MessageTemplateRiskLevel.medium]: "보통",
  [MessageTemplateRiskLevel.high]: "높음",
};

export const STATUS_LABEL: Record<MessageTemplateStatus, string> = {
  [MessageTemplateStatus.draft]: "초안",
  [MessageTemplateStatus.needs_review]: "검수 필요",
  [MessageTemplateStatus.published]: "검수 완료",
  [MessageTemplateStatus.archived]: "보관",
};

export const PUBLICATION_LABEL = {
  published: "게시 중",
  unpublished: "비게시",
} as const;

export const INTERNAL_LABEL = {
  internal: "내부 전용",
  external: "외부 안내",
} as const;

export const VISIBILITY_LABEL = {
  visible: "public 노출 가능",
  hidden: "public 미노출",
} as const;

export const WRITABLE_STATUSES = [
  MessageTemplateStatus.draft,
  MessageTemplateStatus.needs_review,
  MessageTemplateStatus.published,
  MessageTemplateStatus.archived,
] as const;

export { ALLOWED_TEMPLATE_VARIABLES } from "@/lib/message-template/safety";
