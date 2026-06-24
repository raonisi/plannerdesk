/** Public-facing copy for client-only work favorites (PR-135). */

export const LOCAL_FAVORITES_DEVICE_NOTICE =
  "즐겨찾기는 이 기기·브라우저에만 저장됩니다. 계정 연동·다른 기기 동기화는 제공하지 않습니다.";

export const LOCAL_FAVORITES_PUBLISHED_NOTICE =
  "공개된 항목만 목록에서 선택할 수 있습니다. 저장된 항목이 비공개로 바뀌면 즐겨찾기에서 자동으로 숨겨집니다.";

export const FAVORITE_TOGGLE_ADD_LABEL = "자주 쓰는 항목으로 저장";
export const FAVORITE_TOGGLE_REMOVE_LABEL = "즐겨찾기 해제";

export const HOME_FAVORITES_EMPTY_TITLE = "즐겨찾기한 업무가 없습니다.";
export const HOME_FAVORITES_EMPTY_DESCRIPTION =
  "자주 쓰는 공개 업무를 즐겨찾기에 추가해보세요. 고객정보는 저장하지 않습니다.";

export const HOME_RECENTS_EMPTY_TITLE = "아직 최근 사용한 업무가 없습니다.";
export const HOME_RECENTS_EMPTY_DESCRIPTION =
  "업무도구나 자료를 열면 이곳에 바로가기가 표시됩니다.";

export const HOME_RECENTS_FAVORITES_UNIFIED_NOTICE =
  "최근 사용·즐겨찾기는 이 브라우저의 공개 업무 바로가기만 저장합니다.";

export const CLAIM_FAVORITES_SECTION_TITLE = "자주 보는 청구서류";
export const KNOWLEDGE_FAVORITES_SECTION_TITLE = "자주 보는 지식";

/** Search-query favorites are deferred (PII input risk). */
export const SEARCH_QUERY_FAVORITES_DEFERRED_REASON =
  "검색어 즐겨찾기는 고객정보 입력 위험으로 이번 단계에서 제공하지 않습니다.";

/** PR-BS-06 / PR-UX-24: planner-session gate copy (public pages show login prompt only). */
export const PLANNER_FAVORITES_LOGIN_TITLE_AVAILABLE =
  "즐겨찾기는 로그인 후 저장할 수 있습니다";

export const PLANNER_FAVORITES_LOGIN_BODY_AVAILABLE =
  "설계사 계정으로 로그인하면 자주 쓰는 전산, 청구서류, 업무 도구를 개인 목록에 저장할 수 있습니다.";

export const PLANNER_FAVORITES_LOGIN_CTA = "설계사 로그인";

export const PLANNER_FAVORITES_LOGIN_RETURN_NOTE =
  "로그인 후 현재 화면으로 돌아옵니다.";

export const PLANNER_FAVORITES_UNAVAILABLE_TITLE =
  "개인 즐겨찾기 로그인 연결 확인 필요";

export const PLANNER_FAVORITES_UNAVAILABLE_BODY =
  "개인 즐겨찾기는 설계사 계정 로그인 후 사용할 수 있습니다. 현재 이 환경에서는 설계사 로그인 연결을 확인할 수 없습니다.";

export const PLANNER_FAVORITES_COMPACT_UNAVAILABLE_LABEL = "로그인 연결 확인 필요";

/** @deprecated Use PLANNER_FAVORITES_LOGIN_BODY_AVAILABLE */
export const PLANNER_FAVORITES_LOGIN_PROMPT =
  "즐겨찾기와 최근 사용 업무는 로그인 후 이 기기에서만 이용할 수 있습니다. 고객정보는 저장하지 않습니다.";

export const RECENT_WORK_PII_NOTICE = HOME_RECENTS_FAVORITES_UNIFIED_NOTICE;

export { PLANNER_FAVORITES_PII_NOTICE } from "./pii-guard";
