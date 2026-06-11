/**
 * PR-BS-07: Home-screen / PWA install guidance copy (informational only; no install prompt API).
 */

export const PWA_INSTALL_NOTICE_TITLE = "홈화면에 추가해 빠르게 다시 열기";

export const PWA_INSTALL_NOTICE_BODY =
  "PlannerDesk를 자주 사용한다면 브라우저의 홈화면 추가 기능을 사용할 수 있습니다. 설치 여부와 표시 방식은 사용 중인 브라우저와 기기에 따라 다를 수 있습니다.";

export const PWA_INSTALL_AUTH_NOTICE =
  "홈화면에 추가해도 로그인과 권한 기준은 그대로 유지됩니다.";

export const PWA_INSTALL_PII_NOTICE =
  "고객정보나 상담 원문은 저장하지 않습니다.";

export const PWA_INSTALL_HOW_TO_HINT =
  "브라우저 메뉴에서 「홈 화면에 추가」 또는 「바로가기 추가」를 선택하세요. 자동 설치 창은 표시하지 않습니다.";

export const PWA_INSTALL_PLANNER_REPEAT_HINT =
  "로그인 후 즐겨찾기·최근 사용 업무는 이 기기에서만 저장되며, 홈화면 바로가기와 함께 쓰면 반복 업무를 빠르게 이어갈 수 있습니다.";

export const PWA_INSTALL_NO_OFFLINE_NOTICE =
  "오프라인 전용 캐시나 푸시 알림은 제공하지 않습니다. 최신 정보는 접속 후 각 화면에서 다시 확인하세요.";

/** Must not appear in install guidance UI (permission bypass / overclaim). */
export const PWA_INSTALL_FORBIDDEN_PHRASES = [
  "앱 설치가 완료됩니다",
  "모든 기능을 앱처럼 사용할 수 있습니다",
  "오프라인에서도 모든 정보가 최신으로 제공됩니다",
  "로그인 없이 설계사 기능을 사용할 수 있습니다",
  "홈화면 추가 시 Answer Assistant를 바로 사용할 수 있습니다",
  "Work Tools를 누구나 사용할 수 있습니다",
  "고객정보를 저장해두세요",
  "beforeinstallprompt",
  "serviceWorker.register",
] as const;
