import type { MessageSituation, MessageTone } from "@/lib/content";

export const messageSituationLabels: Record<MessageSituation, string> = {
  claim_documents_request: "청구서류 요청",
  claim_received_notice: "접수 완료 안내",
  supplement_request: "보완 요청",
  claim_completed_notice: "지급 완료 안내",
  consultation_schedule: "상담 일정 조율",
  coverage_review: "보장점검 안내",
  cancellation_concern: "해지 고민 고객",
  referral_response: "소개 고객 응대",
  long_time_no_contact: "장기 미연락 고객",
};

export const messageToneLabels: Record<MessageTone, string> = {
  professional: "전문적인",
  warm: "친근한",
  concise: "짧은 안내형",
  careful: "정중한",
  formal: "신뢰형",
  calm: "차분한",
  trustworthy: "신뢰형",
};

export const messageSituationOrder: MessageSituation[] = [
  "claim_documents_request",
  "claim_received_notice",
  "supplement_request",
  "claim_completed_notice",
  "consultation_schedule",
  "coverage_review",
  "cancellation_concern",
  "referral_response",
  "long_time_no_contact",
];
