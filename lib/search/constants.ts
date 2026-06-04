// Public global search limits and copy (PR-83).

export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 50;
export const SEARCH_MAX_TOTAL_RESULTS = 25;
export const SEARCH_MAX_PER_DOMAIN = 8;

export const SENSITIVE_SEARCH_MESSAGE =
  "개인정보, 의료정보, 계약정보, 보험금 지급 판단과 관련된 검색은 제공하지 않습니다. 공개된 정보 탐색용 키워드로 다시 검색해주세요.";

export const SEARCH_VALIDATION_MESSAGES = {
  tooShort: `검색어는 ${SEARCH_QUERY_MIN_LENGTH}자 이상 입력해주세요.`,
  tooLong: `검색어는 ${SEARCH_QUERY_MAX_LENGTH}자 이하로 입력해주세요.`,
  invalid: "검색어를 확인해주세요.",
} as const;

export const SEARCH_EMPTY_MESSAGE =
  "검색 결과가 없습니다. 보험사명·서류명·지식 키워드를 다르게 입력하거나 검색어를 줄여 보세요.";

export const SEARCH_EMPTY_VISIBILITY_NOTE =
  "검수 전·비공개 항목은 통합 검색에 표시되지 않습니다.";

export const SEARCH_ERROR_MESSAGE =
  "정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";

export const SEARCH_IDLE_HINT =
  "보험사, 청구서류, 공시·약관, 고객문구, 지식 아카이브의 공개 정보를 검색할 수 있습니다.";
