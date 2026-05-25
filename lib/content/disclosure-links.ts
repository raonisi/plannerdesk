import type { DisclosureLinkEntry } from "./types";

export const disclosureLinkEntries = [
  {
    id: "product-disclosure-placeholder",
    title: "상품공시 공식 링크 예시",
    category: "product_disclosure",
    sourceUrl: null,
    description:
      "보험사 또는 공식 공시 채널의 상품공시 링크를 정리하기 위한 샘플 항목입니다.",
    notes:
      "상품명, 판매 시기, 특약 구성에 따라 확인 경로와 기준이 달라질 수 있습니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "policy-terms-placeholder",
    title: "약관 확인 링크 예시",
    category: "policy_terms",
    sourceUrl: null,
    description:
      "보장 범위, 면책, 감액 기준을 상담 전 참고하기 위한 약관 링크 자리입니다.",
    notes:
      "최종 해석은 해당 약관 원문과 보험사의 심사 기준을 함께 확인해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "needs_review"
  },
  {
    id: "association-reference-placeholder",
    title: "보험협회 기준 자료 예시",
    category: "insurance_association",
    sourceUrl: null,
    description:
      "보험협회 또는 공신력 있는 외부 기준 자료를 연결하기 위한 검수 전 항목입니다.",
    notes:
      "공개 전 공식 출처, 게시일, 적용 범위를 확인해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "insurer-material-placeholder",
    title: "보험사 공식자료 링크 예시",
    category: "insurer_official_materials",
    sourceUrl: null,
    description:
      "보험사별 상품 안내, 고객 안내, 공지 자료 경로를 정리하기 위한 자리입니다.",
    notes: "보험사별 안내 문구와 자료 제공 방식이 다를 수 있습니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "claim-compensation-reference-placeholder",
    title: "청구·보상 참고 링크 예시",
    category: "claim_compensation_reference",
    sourceUrl: null,
    description:
      "청구 절차와 보상 안내를 상담 전 참고 기준으로 정리하기 위한 샘플입니다.",
    notes: "PlannerDesk는 보험금 지급 여부나 지급 금액을 판단하지 않습니다.",
    lastVerifiedAt: null,
    verificationStatus: "needs_review"
  },
  {
    id: "education-practice-reference-placeholder",
    title: "교육·실무 참고 자료 예시",
    category: "education_practice_reference",
    sourceUrl: null,
    description:
      "설계사 실무 교육과 고객 설명 준비에 참고할 자료를 모아두기 위한 항목입니다.",
    notes: "자료 활용 전 최신 공시와 공식 안내를 다시 확인해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  }
] satisfies DisclosureLinkEntry[];
