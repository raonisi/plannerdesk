/**
 * PR-BS-06: Planner favorites / recent-work PII guard (static rules only; no input logging).
 */

export const PLANNER_FAVORITES_PII_NOTICE =
  "즐겨찾기는 설계사 업무 바로가기 용도입니다. 고객명, 주민번호, 계약번호, 병력, 상담 원문 등 고객정보는 저장하지 마세요. 공식 출처와 최신성은 각 정보 화면에서 다시 확인하세요.";

export const PLANNER_FAVORITES_FORBIDDEN_UI_PHRASES = [
  "고객별로 즐겨찾기하세요",
  "상담 내용을 저장하세요",
  "고객 정보를 저장하면 더 정확합니다",
  "보험금 지급 여부를 저장하세요",
  "청구 가능 여부를 저장하세요",
] as const;

/** Favorite target kinds that must never be stored (client or server). */
export const PLANNER_FAVORITES_PROHIBITED_TYPES = [
  "answer_assistant_prompt",
  "answer_assistant_response",
  "usage_audit",
  "admin_memo",
  "customer_memo",
  "consultation",
  "raw_search_query",
] as const;

const PII_LABEL_KEYWORDS = [
  "주민등록번호",
  "주민번호",
  "연락처",
  "휴대폰",
  "휴대전화",
  "전화번호",
  "이메일",
  "주소",
  "계좌번호",
  "계약번호",
  "증권번호",
  "고객번호",
  "신분증",
  "병명",
  "진단명",
  "진단서",
  "상담 원문",
  "상담내용",
  "보험증권",
  "카드번호",
  "가족관계",
  "prompt",
  "response",
  "api key",
  "secret",
  "token",
] as const;

const CUSTOMER_NAME_PATTERN =
  /(?:고객|피보험자|계약자)\s*[:\s]\s*[\uac00-\ud7a3]{2,4}/;

export function containsProhibitedFavoriteText(text: string): boolean {
  const normalized = text.trim().toLocaleLowerCase("ko-KR");
  if (!normalized) return false;

  if (CUSTOMER_NAME_PATTERN.test(text)) return true;

  return PII_LABEL_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLocaleLowerCase("ko-KR")),
  );
}

export function isProhibitedFavoriteType(type: string): boolean {
  return (PLANNER_FAVORITES_PROHIBITED_TYPES as readonly string[]).includes(
    type,
  );
}
