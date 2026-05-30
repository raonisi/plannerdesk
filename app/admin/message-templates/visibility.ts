import type { VerificationStatus } from "@/lib/content";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import {
  inferMessageTemplateIsPublished,
  inferMessageTemplateVerificationStatus,
} from "@/lib/admin/static-message-template-admin";
import type { CustomerMessageTemplate } from "@/lib/content";

export const ADMIN_MESSAGE_TEMPLATE_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "고객 발송 문구는 보험금 지급 여부를 단정하지 않아야 합니다. public 화면은 현재 정적 데이터를 사용합니다.",
  pageTitle: "고객 안내 문구 관리",
  pageDescription:
    "상황별·어조별 고객 안내 문구를 검수하고 금지 표현을 점검합니다. 저장·일괄 변경은 MessageTemplate DB PR 이후 제공됩니다.",
  notFound: "고객 안내 문구를 찾을 수 없습니다.",
  prohibitedPhraseTitle: "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "지급 확정, 개인정보·의료자료 요청, 과도한 가입 유도 표현은 검토 전 제거해 주세요.",
} as const;

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  verified: "검수 완료",
};

export const PUBLICATION_LABEL = {
  published: "게시 가능(편집)",
  unpublished: "비게시(편집)",
} as const;

export const VISIBILITY_LABEL = {
  visible: "정적 화면 노출",
  hidden: "초안·비게시",
} as const;

export const MESSAGE_TEMPLATE_FORBIDDEN_PHRASES = [
  "지급됩니다",
  "받을 수 있습니다",
  "청구하면 나옵니다",
  "이 서류면 충분합니다",
  "고지 안 해도 됩니다",
  "진단서를 보내주세요",
  "주민등록번호를 입력하세요",
  "고객 자료를 업로드하세요",
  "무조건 보장됩니다",
] as const;

export function isMessageTemplateAdminVisible(
  template: CustomerMessageTemplate,
): boolean {
  return inferMessageTemplateIsPublished(template);
}

export function getMessageTemplateVerificationStatus(
  template: CustomerMessageTemplate,
): VerificationStatus {
  return inferMessageTemplateVerificationStatus(template);
}

export function wouldPublishBlockedMessageTemplate(
  verificationStatus: VerificationStatus,
  targetPublished: boolean,
): boolean {
  return targetPublished && verificationStatus === "draft";
}
