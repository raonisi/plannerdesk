// Answer Assistant admin draft MVP constants (PR-94).

export const ANSWER_ASSIST_QUERY_MIN_LENGTH = 20;
export const ANSWER_ASSIST_QUERY_MAX_LENGTH = 2000;
export const ANSWER_ASSIST_MAX_URLS = 3;
export const ANSWER_ASSIST_MAX_CANDIDATES = 8;
export const ANSWER_ASSIST_MAX_PER_DOMAIN = 3;

export const ANSWER_ASSIST_VALIDATION_MESSAGES = {
  tooShort: `요청문은 ${ANSWER_ASSIST_QUERY_MIN_LENGTH}자 이상 입력해 주세요.`,
  tooLong: `요청문은 ${ANSWER_ASSIST_QUERY_MAX_LENGTH}자 이하로 입력해 주세요.`,
  empty: "요청문을 입력해 주세요.",
  invalid: "요청문 형식을 확인해 주세요.",
  urlSpam: "요청문에 포함된 링크가 너무 많습니다. 필요한 공식 링크만 남기고 다시 입력해 주세요.",
} as const;

export const ANSWER_ASSIST_PAGE_NOTICES = {
  toolPurpose:
    "이 기능은 관리자 검수용 초안 생성 도구입니다. 생성된 문구는 고객에게 바로 발송하거나 커뮤니티에 자동 게시할 수 없습니다.",
  sensitiveInput:
    "고객명, 연락처, 계약번호, 병명, 진단명, 진단서 내용, 청구자료는 입력하지 마세요.",
  prohibitedScope:
    "보험금 지급 가능 여부, 손해사정성 판단, 의료정보 해석, 특정 상품 추천은 제공하지 않습니다.",
  footerDisclaimer:
    "이 초안은 공개·검수 완료된 자료를 기반으로 작성된 관리자 검토용 문안입니다. 고객 발송 전 사실관계, 공식 약관, 보험사 안내 기준을 반드시 확인하세요.",
  draftLabel: "관리자 검수 전 초안",
  providerNotConfigured:
    "LLM provider가 구성되지 않았습니다. 검색된 근거를 바탕으로 규칙 기반 초안을 조립했습니다.",
} as const;

export const INSUFFICIENT_EVIDENCE_MESSAGE =
  "근거 자료가 부족하여 초안을 생성하지 않았습니다. 공식 약관, 보험사 안내, 검수 완료 지식 문서를 먼저 확인해 주세요.";

export const OUTPUT_SAFETY_BLOCKED_MESSAGE =
  "생성된 초안에 금지 표현이 포함되어 차단했습니다.";
