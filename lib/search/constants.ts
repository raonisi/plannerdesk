// Public global search limits and copy (PR-83).

export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 50;
export const SEARCH_MAX_TOTAL_RESULTS = 25;
export const SEARCH_MAX_PER_DOMAIN = 8;

/** Max cards per domain group on combined (all) search view (PR-132). */
export const SEARCH_GROUP_PREVIEW_LIMIT = 4;

export const SENSITIVE_SEARCH_MESSAGE =
  "개인정보, 의료정보, 계약정보, 보험금 지급 판단과 관련된 검색은 제공하지 않습니다. 공개된 정보 탐색용 키워드로 다시 검색해주세요.";

export const SEARCH_VALIDATION_MESSAGES = {
  tooShort: `검색어는 ${SEARCH_QUERY_MIN_LENGTH}자 이상 입력해주세요.`,
  tooLong: `검색어는 ${SEARCH_QUERY_MAX_LENGTH}자 이하로 입력해주세요.`,
  invalid: "검색어를 확인해주세요.",
} as const;

export const SEARCH_EMPTY_MESSAGE =
  "조건에 맞는 공개 정보가 없습니다.";

export const SEARCH_EMPTY_TIPS = [
  "검색어를 조금 더 짧게 입력해 보세요.",
  "보험사명, 청구서류, 공시자료, 업무 키워드로 검색할 수 있습니다.",
  "정보가 확인되지 않으면 공식 출처를 먼저 확인해 주세요.",
] as const;

export const SEARCH_EMPTY_CORRECTION_HINT =
  "필요한 정보가 없으면 오류 제보 또는 수정 요청을 이용할 수 있습니다.";

export const SEARCH_EMPTY_FILTER_HINT =
  "검색어를 줄이거나 필터를 변경해 다시 확인해 주세요.";

export const SEARCH_EMPTY_VISIBILITY_NOTE =
  "공개 전 검수 중인 항목은 검색 결과에 표시되지 않습니다.";

export const SEARCH_EMPTY_WORK_LINK_NOTE =
  "업무 링크는 공식 출처 확인 후 표시됩니다. 링크 접근에 로그인이 필요할 수 있습니다.";

export const SEARCH_ERROR_MESSAGE =
  "검색 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";

export const SEARCH_LOADING_HINT =
  "검색 중입니다. 잠시만 기다려 주세요.";

export const SEARCH_IDLE_HINT =
  "보험사명, 청구서류, 공시자료, 업무 키워드를 검색해 보세요.";

export const SEARCH_IDLE_PII_NOTICE =
  "고객 개인정보나 상담 원문은 입력하지 마세요.";

export const SEARCH_IDLE_EXAMPLES = [
  "삼성화재",
  "실손 청구",
  "전산",
  "약관",
] as const;

export const SEARCH_FORBIDDEN_PHRASES = [
  "모든 보험 정보를 검색할 수 있습니다",
  "최신 정보가 100% 보장됩니다",
  "최신 정보 100% 보장",
  "이 정보만 보면 됩니다",
  "청구 가능 여부를 바로 확인",
  "보험금 지급 여부를 확인할 수 있습니다",
  "보험금 지급 확정",
] as const;

export const SEARCH_GROUP_MORE_LABEL = "이 영역 더 보기";
