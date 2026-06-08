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
  "조건에 맞는 공개 정보가 없습니다. 검색어를 줄이거나 보험사명, 서류명, 업무 키워드로 다시 확인해 주세요.";

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
  "보험사, 청구서류, 지식 아카이브, 업무 링크, 공시·약관, 고객문구의 공개 정보를 검색할 수 있습니다.";

export const SEARCH_GROUP_MORE_LABEL = "이 영역 더 보기";
