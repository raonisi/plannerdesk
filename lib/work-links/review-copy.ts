/** PR-BS-14: Admin work-link review UI copy (no certainty claims). */

export const WORK_LINK_REVIEW_SCOPE_NOTICE =
  "이 화면은 업무 링크 검수 초안 UI입니다. mock/draft 후보만 표시하며 public/planner에 자동 노출되지 않습니다.";

export const WORK_LINK_REVIEW_POLICY_LINES = [
  "검수 전 데이터는 public/planner에 노출되지 않습니다.",
  "공식 출처 URL과 최근 확인일을 확인한 뒤 공개 범위를 결정하세요.",
  "고객정보·민감정보·상담 원문은 입력하지 마세요.",
  "고객센터·팩스·카드납 정보는 변경 가능성이 있어 최근 확인일이 필요합니다.",
] as const;

export const WORK_LINK_REVIEW_EMPTY_TITLE = "등록된 업무 링크 후보가 없습니다.";
export const WORK_LINK_REVIEW_EMPTY_DESCRIPTION =
  "공식 출처가 확인된 정보부터 후보로 등록하세요. 이번 단계에서는 mock 후보만 표시합니다.";

export const WORK_LINK_REVIEW_FORBIDDEN_UI_PHRASES = [
  "이 번호로 보내면 됩니다",
  "이 링크만 쓰면 됩니다",
  "카드납 가능합니다",
  "항상 최신입니다",
  "공식 확정입니다",
  "고객정보를 입력하세요",
  "상담 원문을 붙여넣으세요",
] as const;

export const WORK_LINK_INFO_TYPE_LABELS: Record<
  import("./review-types").WorkLinkInfoType,
  string
> = {
  insurerSystem: "보험사 전산",
  claimGuide: "청구 안내",
  claimDocument: "청구서류 안내",
  customerCenter: "고객센터",
  fax: "팩스",
  paymentInfo: "납입·카드납",
  disclosure: "공시·약관",
  officialNotice: "공식 공지",
  otherOfficial: "기타 공식 출처",
};

export const WORK_LINK_REVIEW_STATUS_LABELS: Record<
  import("./review-types").WorkLinkReviewStatus,
  string
> = {
  draft: "초안",
  needs_review: "검수 필요",
  verified: "검수 완료",
  published: "공개 가능",
  stale: "재확인 필요",
  retired: "사용 중단",
  rejected: "반려",
};

export const WORK_LINK_VISIBILITY_SCOPE_LABELS: Record<
  import("./review-types").WorkLinkVisibilityScope,
  string
> = {
  admin: "Admin 검수용",
  planner: "설계사 참고",
  public: "공개 후보",
};

export const WORK_LINK_RISK_LEVEL_LABELS: Record<
  import("./review-types").WorkLinkRiskLevel,
  string
> = {
  medium: "Medium",
  high: "High",
};

export const WORK_LINK_REVIEW_FILTER_LABELS: Record<
  import("./review-types").WorkLinkReviewFilter,
  string
> = {
  all: "전체",
  needs_review: "검수 필요",
  verified: "검수 완료",
  stale: "재확인 필요",
  public_candidate: "공개 후보",
  high_risk: "High-risk",
};
