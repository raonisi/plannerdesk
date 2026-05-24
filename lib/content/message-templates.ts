import type { CustomerMessageTemplate } from "./types";

export const customerMessageTemplates = [
  {
    id: "claim-documents-request-neutral",
    title: "청구 서류 확인 안내",
    situation: "고객에게 보험금 청구 전 필요 서류 확인을 안내할 때",
    tone: "professional",
    body:
      "고객님, 청구 진행 전 가입하신 보험사의 최신 안내 기준으로 필요 서류를 먼저 확인해 보겠습니다. 서류명과 제출 방법은 보험사별로 다를 수 있어 공식 안내를 기준으로 다시 확인한 뒤 전달드리겠습니다.",
    safetyNote:
      "보험금 지급 가능 여부나 예상 금액을 단정하지 않습니다. 고객 의료 문서 업로드를 요청하지 않습니다.",
    lastUpdatedAt: "2026-05-24"
  },
  {
    id: "policy-review-meeting-reminder",
    title: "보장 점검 미팅 리마인드",
    situation: "보장 점검 미팅 전 고객에게 일정을 상기할 때",
    tone: "warm",
    body:
      "고객님, 예정된 보장 점검 미팅을 한 번 더 안내드립니다. 현재 가입 내용과 궁금하신 부분을 차분히 확인하는 시간으로 준비하겠습니다.",
    safetyNote:
      "특정 상품 가입, 보험금 지급, 보장 결과를 보장하는 표현을 사용하지 않습니다.",
    lastUpdatedAt: "2026-05-24"
  }
] satisfies CustomerMessageTemplate[];
