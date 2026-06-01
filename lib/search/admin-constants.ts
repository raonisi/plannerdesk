// Admin unified search limits and copy (PR-85).

export const ADMIN_SEARCH_QUERY_MIN_LENGTH = 2;
export const ADMIN_SEARCH_QUERY_MAX_LENGTH = 50;
export const ADMIN_SEARCH_MAX_PER_DOMAIN = 10;
export const ADMIN_SEARCH_MAX_TOTAL_RESULTS = 40;

export const ADMIN_SEARCH_EMPTY_MESSAGE =
  "조건에 맞는 관리자 데이터가 없습니다. 검색어를 줄이거나 도메인·상태 필터를 초기화해 다시 확인해 주세요.";

export const ADMIN_SEARCH_IDLE_HINT =
  "운영 데이터명, 문서 제목, 링크명, 제보 제목 등으로 검색하세요. 검색어 없이 전체 목록은 제공하지 않습니다.";

export const ADMIN_SENSITIVE_SEARCH_MESSAGE =
  "개인정보·의료정보·보험금 판단성 검색어는 관리자 검색에서도 제한됩니다. 운영 데이터명, 문서 제목, 링크명 등으로 검색해 주세요.";

export const ADMIN_CORRECTION_SEARCH_WARNING =
  "민감정보가 포함되었을 가능성이 있는 제보는 상세 화면에서 최소한으로 확인하고, 외부로 복사하지 마세요.";
