import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateTone,
} from "@prisma/client";

export const publicMessageCategoryLabels: Record<MessageTemplateCategory, string> =
  {
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

export const publicMessageCategoryOrder: MessageTemplateCategory[] = [
  MessageTemplateCategory.greeting,
  MessageTemplateCategory.follow_up,
  MessageTemplateCategory.appointment,
  MessageTemplateCategory.policy_review,
  MessageTemplateCategory.claim_guide,
  MessageTemplateCategory.contract_maintenance,
  MessageTemplateCategory.cancellation_defense,
  MessageTemplateCategory.rebalancing,
  MessageTemplateCategory.customer_care,
  MessageTemplateCategory.notice,
  MessageTemplateCategory.other,
];

export const publicMessageChannelLabels: Record<MessageTemplateChannel, string> =
  {
    [MessageTemplateChannel.kakao]: "카카오톡",
    [MessageTemplateChannel.sms]: "문자",
    [MessageTemplateChannel.phone_script]: "전화",
    [MessageTemplateChannel.email]: "이메일",
    [MessageTemplateChannel.blog]: "블로그",
    [MessageTemplateChannel.threads]: "스레드",
    [MessageTemplateChannel.instagram]: "인스타",
    [MessageTemplateChannel.general]: "일반",
  };

export const publicMessageAudienceLabels: Record<
  MessageTemplateAudienceType,
  string
> = {
  [MessageTemplateAudienceType.new_customer]: "신규 고객",
  [MessageTemplateAudienceType.existing_customer]: "기존 고객",
  [MessageTemplateAudienceType.dormant_customer]: "휴면 고객",
  [MessageTemplateAudienceType.claim_customer]: "청구 고객",
  [MessageTemplateAudienceType.cancellation_risk]: "해지 고민",
  [MessageTemplateAudienceType.referral]: "소개 고객",
  [MessageTemplateAudienceType.general]: "일반",
};

export const publicMessageToneLabels: Record<MessageTemplateTone, string> = {
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

export const publicMessageRiskLabels: Record<MessageTemplateRiskLevel, string> =
  {
    [MessageTemplateRiskLevel.low]: "낮음",
    [MessageTemplateRiskLevel.medium]: "보통",
    [MessageTemplateRiskLevel.high]: "높음",
  };

export const publicMessageCategoryFilterTabs = [
  { id: "all", label: "전체" },
  ...publicMessageCategoryOrder.map((value) => ({
    id: value,
    label: publicMessageCategoryLabels[value],
  })),
] as const;

export type PublicMessageCategoryFilterId =
  (typeof publicMessageCategoryFilterTabs)[number]["id"];

export type PublicMessageChannelFilter = "all" | MessageTemplateChannel;
export type PublicMessageAudienceFilter = "all" | MessageTemplateAudienceType;
export type PublicMessageToneFilter = "all" | MessageTemplateTone;
export type PublicMessageRiskFilter = "all" | MessageTemplateRiskLevel;

export function matchesPublicMessageCategory(
  category: MessageTemplateCategory,
  filterId: PublicMessageCategoryFilterId,
): boolean {
  if (filterId === "all") return true;
  return category === filterId;
}

export function matchesEnumFilter<T extends string>(
  value: T,
  filter: "all" | T,
): boolean {
  if (filter === "all") return true;
  return value === filter;
}

/** Optional local placeholder swap for {고객명} / {담당자명} only — not persisted. */
export function applySafeCopyPlaceholders(
  text: string,
  customerName: string,
  plannerName: string,
): string {
  let result = text;
  if (customerName.trim()) {
    result = result.replace(/\{고객명\}/g, customerName.trim());
  }
  if (plannerName.trim()) {
    result = result.replace(/\{담당자명\}/g, plannerName.trim());
  }
  return result;
}
