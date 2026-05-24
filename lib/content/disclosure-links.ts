import type { DisclosureLinkEntry } from "./types";

export const disclosureLinkEntries = [
  {
    id: "product-disclosure-placeholder",
    title: "상품공시 링크 예시",
    category: "product_disclosure",
    sourceUrl: null,
    description:
      "보험사 또는 공식 공시 채널의 상품공시 링크를 정리하기 위한 자리입니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "claim-guidance-placeholder",
    title: "보험금 청구 안내 링크 예시",
    category: "claim_guidance",
    sourceUrl: null,
    description:
      "보험사별 보험금 청구 절차 안내 페이지를 연결하기 위한 자리입니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  }
] satisfies DisclosureLinkEntry[];
