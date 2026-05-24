import type { InsurerDirectoryEntry } from "./types";

export const insurerDirectoryEntries = [
  {
    id: "sample-life-insurer",
    name: "생명보험사 예시",
    category: "life",
    officialWebsiteUrl: null,
    plannerPortalUrl: null,
    claimPageUrl: null,
    customerCenterPhone: null,
    faxNumber: null,
    mailingAddress: null,
    notes:
      "정식 보험사 정보 입력 전 구조 검증용 예시입니다. 모든 공식 링크와 연락처는 공개 전 원문 기준으로 확인해야 합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  },
  {
    id: "sample-non-life-insurer",
    name: "손해보험사 예시",
    category: "non_life",
    officialWebsiteUrl: null,
    plannerPortalUrl: null,
    claimPageUrl: null,
    customerCenterPhone: null,
    faxNumber: null,
    mailingAddress: null,
    notes:
      "정식 손해보험사 데이터가 아닙니다. 고객 안내에 사용하기 전 공식 홈페이지와 공시 자료 확인이 필요합니다.",
    lastVerifiedAt: null,
    verificationStatus: "draft"
  }
] satisfies InsurerDirectoryEntry[];
