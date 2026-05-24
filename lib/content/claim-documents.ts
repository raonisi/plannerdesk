import type { ClaimDocumentEntry } from "./types";

export const claimDocumentEntries = [
  {
    id: "common-claim-form-placeholder",
    title: "공통 보험금 청구서 확인 항목",
    insurerId: null,
    claimType: "common",
    documentName: "보험금 청구서",
    sourceUrl: null,
    description:
      "보험사별 청구서 양식과 작성 기준을 정리하기 위한 공통 플레이스홀더입니다.",
    cautionNote:
      "보험금 지급 가능 여부, 지급 금액, 지급 시점은 안내하지 않습니다. 고객에게는 반드시 해당 보험사의 최신 공식 양식을 확인하도록 안내해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "actual-medical-placeholder",
    title: "실손의료비 청구 서류 확인 항목",
    insurerId: null,
    claimType: "actual_medical",
    documentName: "진료비 계산서 및 세부내역서",
    sourceUrl: null,
    description:
      "실손의료비 청구에서 자주 언급되는 서류 유형을 구조화하기 위한 예시입니다.",
    cautionNote:
      "고객 의료 문서를 업로드하거나 수집하지 않습니다. 서류명과 제출 채널은 보험사 공식 안내를 기준으로 검증해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  }
] satisfies ClaimDocumentEntry[];
