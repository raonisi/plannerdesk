// Answer Assistant admin draft MVP constants (PR-94).

import { VERIFIED_ANSWER_ASSIST_RATE_LIMIT } from "./rate-limit-config";

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
    "답변 생성 provider가 구성되어 있지 않아 초안 생성을 실행하지 않았습니다. 입력 안전성 검사와 근거 후보 확인까지만 완료되었습니다.",
} as const;

export const ADMIN_REVIEW_CHECKLIST = [
  "공식 약관 또는 보험사 안내 기준을 확인했는가",
  "보험금 지급 가능성을 단정하지 않았는가",
  "의료정보를 해석하지 않았는가",
  "손해사정성 판단을 하지 않았는가",
  "특정 상품 가입을 강권하지 않았는가",
  "고객 개인정보가 포함되지 않았는가",
  "출처 없는 사실 단정이 없는가",
  "고객 발송 전 문구를 다시 검토했는가",
] as const;

export const INSUFFICIENT_EVIDENCE_MESSAGE =
  "근거 자료가 부족하여 초안을 생성하지 않았습니다. 공식 약관, 보험사 안내, 검수 완료 지식 문서를 먼저 확인해 주세요.";

export const OUTPUT_SAFETY_BLOCKED_MESSAGE =
  "생성된 초안에 금지 표현이 포함되어 차단했습니다. 보험금·의료·손해사정·상품 강권 표현 없이 다시 요청해 주세요.";

export const VERIFIED_ANSWER_ASSIST_PAGE_NOTICES = {
  toolPurpose:
    "이 기능은 검증 설계사의 업무 참고용 초안 보조 도구입니다. 생성된 문구는 고객에게 바로 발송하거나 커뮤니티에 자동 게시할 수 없습니다.",
  sensitiveInput:
    "고객명, 연락처, 계약번호, 병명, 진단명, 진단서 내용, 청구자료는 입력하지 마세요.",
  prohibitedScope:
    "보험금 지급 가능 여부, 손해사정성 판단, 의료정보 해석, 특정 상품 추천은 제공하지 않습니다.",
  customerReview:
    "생성된 초안은 고객에게 바로 발송하지 말고, 공식 약관과 보험사 안내 기준을 확인한 뒤 사용해야 합니다.",
  footerDisclaimer:
    "이 초안은 공개·검수 완료된 자료를 기반으로 작성된 업무 참고용 문안입니다. 고객 발송 전 사실관계, 공식 약관, 보험사 안내 기준을 반드시 확인하세요.",
  draftLabel: "검증 설계사 검수 전 초안",
  previewDisabled:
    "현재 검증 설계사 제한 공개는 비활성화되어 있습니다. 입력·초안 생성은 실행되지 않습니다.",
  allowlistBetaActive:
    "제한 beta 운영 중입니다. allowlist에 포함된 검증 설계사만 초안 생성이 가능하며, 전체 검증 설계사·일반 회원·비로그인 공개가 아닙니다. 운영 중단 시 별도 공지 없이 접근이 차단될 수 있습니다.",
  allowlistBetaPilot:
    "파일럿 allowlist에 등록된 계정만 사용할 수 있습니다. 고객·카카오·이메일 자동 발송, 커뮤니티 자동 댓글, 답변 자동 게시는 제공하지 않습니다.",
} as const;

export const VERIFIED_REVIEW_CHECKLIST = [
  "공식 약관 또는 보험사 안내 기준을 확인했는가",
  "보험금 지급 가능성을 단정하지 않았는가",
  "의료정보를 해석하지 않았는가",
  "손해사정성 판단을 하지 않았는가",
  "특정 상품 가입을 강권하지 않았는가",
  "고객 개인정보가 포함되지 않았는가",
  "출처 없는 사실 단정이 없는가",
  "고객 발송 전 문구를 다시 검토했는가",
] as const;

export const VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES = {
  FEATURE_DISABLED:
    "현재 검증 설계사 제한 공개는 비활성화되어 있습니다. 입력 안전성 검사와 초안 생성은 실행되지 않습니다.",
  RATE_LIMIT_MINUTE: (seconds: number) =>
    `요청이 너무 많습니다. ${seconds}초 후 다시 시도해 주세요. (분당 ${VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perMinute}회 제한)`,
  RATE_LIMIT_DAY: (seconds: number) =>
    `일일 사용 한도에 도달했습니다. ${Math.ceil(seconds / 3600)}시간 후 다시 시도해 주세요. (일 ${VERIFIED_ANSWER_ASSIST_RATE_LIMIT.perDay}회 제한)`,
  RATE_LIMIT_ABUSE: (seconds: number) =>
    `반복 차단 요청으로 일시 제한되었습니다. ${Math.ceil(seconds / 3600)}시간 후 다시 시도해 주세요.`,
  UNAUTHORIZED: "검증 설계사 권한이 필요합니다.",
  NOT_ALLOWLISTED: "현재 제한 beta 대상이 아닙니다.",
  BETA_NOT_CONFIGURED:
    "beta gate가 켜져 있으나 allowlist가 비어 있어 초안 생성을 실행하지 않습니다.",
} as const;
