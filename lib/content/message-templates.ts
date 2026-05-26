import type { CustomerMessageTemplate } from "./types";

export const customerMessageTemplates = [
  {
    id: "claim-documents-request-neutral",
    title: "청구서류 확인 안내",
    situationCategory: "claim_documents_request",
    situation: "고객에게 보험금 청구 전 필요한 서류 확인을 안내하는 상황",
    tone: "professional",
    body:
      "고객님, 청구 진행 전에 가입하신 상품과 보험사 기준에 맞는 필요 서류를 먼저 확인해 보겠습니다. 서류명과 제출 방법은 보험사별로 다를 수 있어 공식 안내 기준으로 다시 확인한 뒤 안내드리겠습니다.",
    safetyNote:
      "보험금 지급 가능 여부나 예상 금액을 단정하지 않습니다. 고객 의료문서 업로드를 요청하지 않습니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "claim-received-notice-draft",
    title: "접수 완료 안내",
    situationCategory: "claim_received_notice",
    situation: "청구 또는 상담 요청이 접수되었음을 차분하게 안내하는 상황",
    tone: "calm",
    body:
      "고객님, 요청해 주신 내용은 접수되었습니다. 확인이 필요한 부분을 순서대로 살펴본 뒤, 상품별 기준과 보험사 안내에 맞춰 추가로 필요한 사항이 있으면 다시 안내드리겠습니다.",
    safetyNote:
      "접수 완료는 심사 결과나 지급 결과를 의미하지 않습니다. 최종 기준은 보험사 심사와 공식 안내를 확인해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "supplement-request-careful",
    title: "보완 요청 안내",
    situationCategory: "supplement_request",
    situation: "청구 또는 상담 진행 중 추가 확인 자료가 필요한 상황",
    tone: "careful",
    body:
      "고객님, 안내드린 내용 중 추가 확인이 필요한 부분이 있어 정중히 요청드립니다. 보험사별 기준과 상품 조건에 따라 필요한 항목이 달라질 수 있으니, 공식 안내 기준을 확인한 뒤 필요한 범위만 다시 말씀드리겠습니다.",
    safetyNote:
      "필요 이상의 민감한 정보를 요청하지 않습니다. 발송 전 고객 상황과 상품 기준에 맞게 표현을 조정해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "claim-completed-notice-concise",
    title: "처리 완료 참고 안내",
    situationCategory: "claim_completed_notice",
    situation: "보험사 안내 또는 처리 완료 사실을 고객에게 전달하는 상황",
    tone: "concise",
    body:
      "고객님, 확인 가능한 처리 단계가 완료되어 안내드립니다. 세부 내용은 보험사 공식 안내와 약관 기준에 따라 달라질 수 있으니, 필요하시면 함께 다시 확인해 드리겠습니다.",
    safetyNote:
      "지급 결과, 지급 금액, 향후 심사 결과를 보장하는 표현을 사용하지 않습니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "consultation-schedule-warm",
    title: "상담 일정 조율 안내",
    situationCategory: "consultation_schedule",
    situation: "고객과 상담 가능 시간을 조율하는 상황",
    tone: "warm",
    body:
      "고객님, 편하신 시간에 맞춰 차분히 상담드리겠습니다. 가능한 일정 몇 가지를 알려주시면, 보장 내용과 궁금하신 부분을 미리 확인해 준비하겠습니다.",
    safetyNote:
      "상담 전 상품별 세부 기준을 확인하고, 과도한 압박이나 불안 조성 표현을 피해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "policy-review-meeting-reminder",
    title: "보장점검 미팅 리마인드",
    situationCategory: "coverage_review",
    situation: "보장점검 미팅 전 고객에게 일정을 상기하는 상황",
    tone: "trustworthy",
    body:
      "고객님, 예정된 보장점검 미팅을 안내드립니다. 현재 가입 내용과 궁금하신 부분을 차분히 확인하는 시간으로 준비하겠습니다. 상품별 기준은 공식 자료를 함께 확인해 안내드리겠습니다.",
    safetyNote:
      "특정 상품 가입, 보험금 지급, 보장 결과를 단정하는 표현을 사용하지 않습니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "cancellation-concern-careful",
    title: "해지 고민 고객 안내",
    situationCategory: "cancellation_concern",
    situation: "고객이 해지를 고민할 때 확인할 기준을 차분히 안내하는 상황",
    tone: "careful",
    body:
      "고객님, 해지 여부를 결정하시기 전 현재 보장 내용, 납입 상황, 해지 시 달라지는 부분을 먼저 확인해 보시는 것이 좋습니다. 상품별로 기준이 다를 수 있어 공식 자료를 기준으로 함께 살펴보겠습니다.",
    safetyNote:
      "해지 또는 유지 결정을 대신하지 않습니다. 고객 상황과 상품 조건을 확인한 뒤 신중하게 안내해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "referral-response-formal",
    title: "소개 고객 첫 응대",
    situationCategory: "referral_response",
    situation: "소개받은 고객에게 첫 안내를 보내는 상황",
    tone: "formal",
    body:
      "안녕하세요, 고객님. 소개로 연락드리게 되었습니다. 필요한 내용을 먼저 편하게 말씀해 주시면, 확인 가능한 범위에서 차분히 안내드리겠습니다. 상담 전 상품별 기준과 공식 자료를 확인해 준비하겠습니다.",
    safetyNote:
      "과장된 성과 표현이나 압박성 문구를 사용하지 않습니다. 개인정보와 민감정보 요청은 필요한 범위로 제한해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "long-time-no-contact-warm",
    title: "장기 미연락 고객 안부 안내",
    situationCategory: "long_time_no_contact",
    situation: "오랜 기간 연락이 없던 고객에게 부담 없이 안부를 묻는 상황",
    tone: "warm",
    body:
      "고객님, 그동안 잘 지내셨는지 안부 인사드립니다. 가입하신 보장이나 궁금하신 점을 다시 확인하고 싶으실 때 편하게 말씀해 주세요. 필요한 경우 공식 자료 기준으로 차분히 확인해 드리겠습니다.",
    safetyNote:
      "불안감을 유발하거나 즉시 행동을 압박하는 표현을 피해야 합니다.",
    lastUpdatedAt: "2026-05-24"
  }
] satisfies CustomerMessageTemplate[];
