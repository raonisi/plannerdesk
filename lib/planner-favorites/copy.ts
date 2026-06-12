/** Public-facing copy for client-only work favorites (PR-135). */

export const LOCAL_FAVORITES_DEVICE_NOTICE =
  "즐겨찾기는 이 기기·브라우저에만 저장됩니다. 계정 연동·다른 기기 동기화는 제공하지 않습니다.";

export const LOCAL_FAVORITES_PUBLISHED_NOTICE =
  "공개·검수 완료된 항목만 목록에서 선택할 수 있습니다. 저장된 항목이 비공개로 바뀌면 즐겨찾기에서 자동으로 숨겨집니다.";

export const FAVORITE_TOGGLE_ADD_LABEL = "자주 쓰는 항목으로 저장";
export const FAVORITE_TOGGLE_REMOVE_LABEL = "즐겨찾기 해제";

export const HOME_FAVORITES_EMPTY_TITLE = "아직 즐겨찾기가 없습니다.";
export const HOME_FAVORITES_EMPTY_DESCRIPTION =
  "자주 쓰는 보험사, 청구서류, 업무 링크를 추가해두면 빠르게 다시 열 수 있습니다. 고객정보가 포함된 화면은 저장하지 마세요.";

export const CLAIM_FAVORITES_SECTION_TITLE = "자주 보는 청구서류";
export const KNOWLEDGE_FAVORITES_SECTION_TITLE = "자주 보는 지식";

/** Search-query favorites are deferred (PII input risk). */
export const SEARCH_QUERY_FAVORITES_DEFERRED_REASON =
  "검색어 즐겨찾기는 고객정보 입력 위험으로 이번 단계에서 제공하지 않습니다.";

/** PR-BS-06: planner-session gate copy (public pages show login prompt only). */
export const PLANNER_FAVORITES_LOGIN_PROMPT =
  "즐겨찾기와 최근 사용 업무는 검증 설계사 로그인 후 이 기기에서만 이용할 수 있습니다. 고객정보는 저장하지 않습니다.";

export const RECENT_WORK_PII_NOTICE =
  "최근 사용에는 업무 페이지 바로가기만 기록됩니다. 고객명·계약번호·상담 원문 등은 저장되지 않습니다.";

export { PLANNER_FAVORITES_PII_NOTICE } from "./pii-guard";
