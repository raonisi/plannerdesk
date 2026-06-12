/**
 * PR-BS-07 / PR-BS-16: Home-screen / install guidance copy (informational only; no install prompt API).
 */

export const PWA_INSTALL_NOTICE_TITLE = "홈화면에 추가 안내";

export const PWA_INSTALL_NOTICE_TITLE_COMPACT = "빠르게 다시 열기";

export const PWA_INSTALL_NOTICE_BODY =
  "PlannerDesk를 자주 사용한다면 브라우저의 홈화면 추가 기능을 사용할 수 있습니다. 표시 방식은 사용 중인 브라우저와 기기에 따라 다를 수 있습니다.";

export const PWA_INSTALL_PLANNER_BODY =
  "자주 쓰는 설계사 업무 화면은 홈화면에 추가해 빠르게 다시 열 수 있습니다. 홈화면 추가는 바로가기 기능입니다.";

export const PWA_INSTALL_AUTH_NOTICE =
  "홈화면에 추가해도 로그인과 권한 기준은 그대로 유지됩니다.";

export const PWA_INSTALL_PLANNER_ACCESS_NOTICE =
  "Work Tools와 Answer Assistant의 접근 권한은 기존 기준을 그대로 따릅니다.";

export const PWA_INSTALL_PII_NOTICE =
  "고객정보, 계약번호, 상담 원문은 저장하지 마세요.";

export const PWA_INSTALL_PLANNER_PII_NOTICE =
  "고객정보, 계약번호, 상담 원문은 브라우저나 바로가기에 저장하지 마세요.";

export const PWA_INSTALL_HOW_TO_HINT =
  "브라우저 메뉴에서 「홈 화면에 추가」 또는 「바로가기 추가」를 선택하세요. 자동 설치 창은 표시하지 않습니다.";

export const PWA_INSTALL_PLANNER_REPEAT_HINT =
  "로그인 후 즐겨찾기·최근 사용 업무는 이 기기에서만 저장되며, 홈화면 바로가기와 함께 쓰면 반복 업무를 빠르게 이어갈 수 있습니다.";

export const PWA_INSTALL_NO_OFFLINE_NOTICE =
  "오프라인 전용 캐시나 푸시 알림은 제공하지 않습니다. 최신 정보는 접속 후 각 화면에서 다시 확인하세요.";

export const PWA_INSTALL_MOBILE_HINT =
  "모바일에서 자주 쓰는 방법: 브라우저 공유·메뉴에서 홈화면 추가를 찾을 수 있습니다. 메뉴 이름은 기기마다 다를 수 있습니다.";

/** Must not appear in install guidance UI (permission bypass / overclaim). */
export const PWA_INSTALL_FORBIDDEN_PHRASES = [
  "앱 설치가 완료됩니다",
  "모든 기능을 앱처럼 사용할 수 있습니다",
  "오프라인에서도 모든 정보가 최신으로 제공됩니다",
  "로그인 없이 설계사 기능을 사용할 수 있습니다",
  "홈화면 추가 시 Work Tools를 바로 사용할 수 있습니다",
  "홈화면 추가 시 Answer Assistant를 바로 사용할 수 있습니다",
  "Work Tools를 누구나 사용할 수 있습니다",
  "관리자 기능도 바로 사용할 수 있습니다",
  "고객정보를 저장해두세요",
  "계약번호를 저장해두세요",
  "상담 내용을 저장해두세요",
  "자동 알림을 받을 수 있습니다",
  "beforeinstallprompt",
  "serviceWorker.register",
] as const;

export function getInstallGuideBody(variant: "public" | "planner"): string {
  return variant === "planner" ? PWA_INSTALL_PLANNER_BODY : PWA_INSTALL_NOTICE_BODY;
}

export function getInstallGuidePiiNotice(variant: "public" | "planner"): string {
  return variant === "planner" ? PWA_INSTALL_PLANNER_PII_NOTICE : PWA_INSTALL_PII_NOTICE;
}
