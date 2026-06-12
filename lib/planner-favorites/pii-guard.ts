/**
 * PR-BS-06 / PR-BS-13: Planner favorites / recent-work PII guard (static rules only; no input logging).
 */

export const PLANNER_FAVORITES_PII_NOTICE =
  "자주 쓰는 업무를 즐겨찾기에 추가해 빠르게 다시 열 수 있습니다. 고객정보, 상담 원문, 계약번호는 즐겨찾기에 저장하지 않습니다.";

export const PLANNER_FAVORITES_FORBIDDEN_UI_PHRASES = [
  "고객별로 즐겨찾기하세요",
  "고객별 상담을 저장하세요",
  "상담 내용을 저장하세요",
  "상담 내용을 즐겨찾기에 보관하세요",
  "Answer Assistant 답변을 저장하세요",
  "계약번호로 빠르게 다시 조회하세요",
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
