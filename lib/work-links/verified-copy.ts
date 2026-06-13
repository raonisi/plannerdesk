/** PR-BS-15: Public/planner verified work-link display copy (no certainty claims). */

export const VERIFIED_WORK_LINK_PUBLIC_SECTION_TITLE = "확인된 업무 링크";
export const VERIFIED_WORK_LINK_PLANNER_SECTION_TITLE = "업무 참고 링크";

export const VERIFIED_WORK_LINK_PUBLIC_NOTICE =
  "공식 출처와 최근 확인일을 함께 확인하세요. 보험사 정책과 안내는 변경될 수 있습니다.";

export const VERIFIED_WORK_LINK_PUBLIC_DETAIL_NOTICE =
  "청구서류와 업무 절차는 보험사 공식 안내를 기준으로 확인하세요.";

export const VERIFIED_WORK_LINK_PLANNER_NOTICE =
  "설계사 업무 참고용 링크입니다. 고객 안내 전 보험사 공식 출처와 최근 확인일을 다시 확인하세요.";

export const VERIFIED_WORK_LINK_PLANNER_PII_NOTICE =
  "고객정보, 계약번호, 상담 원문은 입력하지 마세요.";

export const VERIFIED_WORK_LINK_HIGH_RISK_NOTICE =
  "고객센터·팩스·전산·납입 정보는 변경될 수 있습니다. 공식 출처에서 다시 확인하세요.";

export const VERIFIED_WORK_LINK_OFFICIAL_SOURCE_LABEL = "공식 출처 확인";

export const VERIFIED_WORK_LINK_FORBIDDEN_UI_PHRASES = [
  "mock 공개",
  "검수 완료 업무 링크",
  "이 링크만 쓰면 됩니다",
  "이 번호로 보내면 됩니다",
  "카드납 가능합니다",
  "청구 가능합니다",
  "보험금 지급 가능",
  "항상 최신입니다",
  "공식 확정입니다",
  "고객정보를 입력하면 정확합니다",
  "상담 내용을 붙여넣으세요",
  "이 방법으로 처리하면 됩니다",
] as const;
