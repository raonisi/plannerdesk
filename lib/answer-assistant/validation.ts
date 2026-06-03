// Answer Assistant input validation and blocked-question classification (PR-94).

import { sanitizeCorrectionPlainText } from "@/lib/correction-request/sanitize";
import {
  ANSWER_ASSIST_MAX_URLS,
  ANSWER_ASSIST_QUERY_MAX_LENGTH,
  ANSWER_ASSIST_QUERY_MIN_LENGTH,
  ANSWER_ASSIST_VALIDATION_MESSAGES,
} from "./constants";
import type {
  AnswerAssistantBlockedReason,
  AnswerAssistantInput,
  AnswerAssistantValidationResult,
} from "./types";

const BLOCKED_URL_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:"];

const URL_IN_TEXT_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;

const RESIDENT_ID_PATTERN = /\b\d{6}-\d{7}\b/;
const PHONE_PATTERN = /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const LONG_DIGITS_PATTERN = /\b\d{10,}\b/;
const CONTRACT_CONTEXT_PATTERN =
  /(계약번호|증권번호|계좌번호|고객번호)[^0-9]{0,16}\d{4,}/i;
const REPEATED_SPECIAL_PATTERN = /([!@#$%^&*()_+=\[\]{}|\\;:'",.<>/?`~])\1{5,}/;

const PERSONAL_INFO_KEYWORDS = [
  "주민등록번호",
  "주민번호",
  "연락처",
  "휴대폰",
  "휴대전화",
  "전화번호",
  "이메일",
  "주소",
  "계좌번호",
  "고객명",
  "신분증",
] as const;

const CONTRACT_INFO_KEYWORDS = [
  "계약번호",
  "증권번호",
  "고객번호",
  "증권",
  "계약자",
] as const;

const MEDICAL_INFO_KEYWORDS = [
  "병명",
  "진단명",
  "진단서",
  "소견서",
  "진료기록",
  "처방",
  "처방전",
  "수술명",
  "입원일",
  "퇴원일",
  "병원명",
  "검사결과",
  "장애",
  "투약",
  "약제비",
  "진료비 영수증",
  "입퇴원확인서",
] as const;

const CLAIM_DOCUMENT_KEYWORDS = [
  "청구서류를 업로드",
  "청구자료",
  "영수증을 첨부",
  "진단서를 첨부",
  "캡처본을 첨부",
  "파일을 올려",
  "파일을 업로드",
  "이미지를 첨부",
  "사진을 첨부",
  "ocr",
] as const;

const CLAIM_JUDGMENT_KEYWORDS = [
  "보험금 받을 수",
  "보험금 가능",
  "지급 가능",
  "지급되나요",
  "지급될까요",
  "청구 가능",
  "보상 가능",
  "얼마 받을 수",
  "지급 판단",
  "면책인가요",
  "부지급인가요",
  "부지급",
  "보장되나요",
  "진단비 받을 수",
  "수술비 받을 수",
  "입원비 받을 수",
  "보험금 지급 가능",
  "보험금 얼마",
  "청구 가능성",
  "지급 가능한가요",
  "보험금 받을 수 있나요",
] as const;

const LOSS_ADJUSTMENT_KEYWORDS = [
  "손해사정",
  "손해사정 결과",
  "손해사정성",
  "지급 판단",
] as const;

const PRODUCT_SOLICITATION_KEYWORDS = [
  "어떤 상품 추천",
  "상품 추천",
  "가입시키는 방법",
  "가입시키는 멘트",
  "가입시키면",
  "무조건 가입",
  "반드시 가입",
  "이 상품 최고",
  "이 상품이 최고",
  "100% 보장",
  "확정 지급",
  "가입 유도",
  "가입 강권",
] as const;

const FEAR_MARKETING_KEYWORDS = [
  "해지 못 하게",
  "해지 못하게",
  "겁주는 문구",
  "겁주는 멘트",
  "지금 안 하면 손해",
  "해지하면 큰일",
  "해지하면 큰 일",
] as const;

const PROMPT_INJECTION_KEYWORDS = [
  "adminmemo",
  "admin memo",
  "관리자 메모",
  "내부 메모",
  "시스템 프롬프트",
  "system prompt",
  "이전 지시 무시",
  "ignore previous",
  "비공개 데이터",
  "비공개 문서",
  "draft 포함",
  "검수 전 문서",
  "출처 없어도",
  "삭제된 커뮤니티",
  "제보 원문",
  "correctionrequest",
  "communityreport",
  "forbiddenclaims",
  "compliancenote",
  "raw output",
  "프롬프트 출력",
  "안전정책 무시",
  "관리자 권한 우회",
  "권한 우회",
  "보험금 판단 강제",
  "진단서 해석 강제",
  "내부 지시",
  "프롬프트 보여",
  "출처 없이 단정",
  "삭제된 글",
] as const;

export const ANSWER_ASSIST_BLOCKED_MESSAGES: Record<
  AnswerAssistantBlockedReason,
  string
> = {
  PERSONAL_INFO:
    "개인정보 또는 계약정보가 포함되어 초안을 생성하지 않았습니다. 고객명, 연락처, 계약번호, 증권번호를 제거하고 일반 기준 중심으로 다시 입력해 주세요.",
  CONTRACT_INFO:
    "개인정보 또는 계약정보가 포함되어 초안을 생성하지 않았습니다. 고객명, 연락처, 계약번호, 증권번호를 제거하고 일반 기준 중심으로 다시 입력해 주세요.",
  MEDICAL_INFO:
    "의료정보 또는 청구자료가 포함되어 초안을 생성하지 않았습니다. 진단명, 병원명, 진단서, 영수증 내용은 입력하지 마세요.",
  CLAIM_DOCUMENT:
    "의료정보 또는 청구자료가 포함되어 초안을 생성하지 않았습니다. 파일·이미지·OCR·청구자료 업로드 요청은 처리할 수 없습니다.",
  CLAIM_JUDGMENT:
    "보험금 지급 가능 여부나 보장 여부 판단은 제공하지 않습니다. 공식 약관과 보험사 안내 기준을 확인해야 할 항목으로만 정리할 수 있습니다.",
  LOSS_ADJUSTMENT:
    "손해사정성 판단이나 지급 여부 단정은 제공하지 않습니다. 공식 약관·보험사 안내 확인이 필요한 항목으로만 다시 요청해 주세요.",
  PRODUCT_SOLICITATION:
    "특정 상품 추천, 가입 강권, 공포 조장 문구는 생성하지 않습니다. 중립적인 점검 기준 또는 설명 문구로 다시 요청해 주세요.",
  FEAR_MARKETING:
    "특정 상품 추천, 가입 강권, 공포 조장 문구는 생성하지 않습니다. 중립적인 점검 기준 또는 설명 문구로 다시 요청해 주세요.",
  PROMPT_INJECTION:
    "내부 문서, 비공개 필드, 검수 전 자료, 권한 우회 요청은 처리할 수 없습니다. 공개·검수 완료 자료 기반의 일반 설명 요청으로 다시 입력해 주세요.",
  VALIDATION: ANSWER_ASSIST_VALIDATION_MESSAGES.invalid,
  INSUFFICIENT_EVIDENCE:
    "근거 자료가 부족하여 초안을 생성하지 않았습니다. 공식 약관, 보험사 안내, 검수 완료 지식 문서를 먼저 확인해 주세요.",
  PROVIDER_NOT_CONFIGURED:
    "답변 생성 provider가 구성되어 있지 않아 초안 생성을 실행하지 않았습니다. 입력 안전성 검사와 근거 후보 확인까지만 완료되었습니다.",
  PROVIDER_ERROR:
    "초안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 근거 자료를 직접 확인해 주세요.",
  OUTPUT_SAFETY_BLOCKED:
    "생성된 초안에 금지 표현이 포함되어 차단했습니다. 보험금·의료·손해사정·상품 강권 표현 없이 다시 요청해 주세요.",
  FEATURE_DISABLED:
    "현재 검증 설계사 제한 공개는 비활성화되어 있습니다. 입력 안전성 검사와 초안 생성은 실행되지 않습니다.",
  RATE_LIMIT_EXCEEDED:
    "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  UNAUTHORIZED: "검증 설계사 권한이 필요합니다.",
  NOT_ALLOWLISTED:
    "현재 제한 공개 대상이 아닙니다. 단계적 공개 대상에 포함되면 별도 안내됩니다.",
};

const VALID_PURPOSES = new Set<string>([
  "GENERAL_EXPLANATION",
  "CUSTOMER_SAFE_MESSAGE",
  "KNOWLEDGE_SUMMARY",
  "DISCLOSURE_GUIDE",
  "CLAIM_DOCUMENT_GUIDE",
  "COMMUNITY_REPLY_DRAFT",
]);

const VALID_TONES = new Set<string>([
  "neutral",
  "formal",
  "concise",
  "consultative",
]);

function normalizeForScan(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

function containsKeyword(
  text: string,
  keywords: readonly string[],
): boolean {
  const normalized = normalizeForScan(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function countSafeUrls(text: string): number {
  const matches = text.match(URL_IN_TEXT_PATTERN);
  if (!matches) return 0;
  let count = 0;
  for (const raw of matches) {
    const candidate = raw.startsWith("www.") ? `https://${raw}` : raw;
    const lower = candidate.toLowerCase();
    if (BLOCKED_URL_PROTOCOLS.some((p) => lower.startsWith(p))) {
      return 99;
    }
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        count += 1;
      }
    } catch {
      // ignore malformed URL fragments
    }
  }
  return count;
}

export function classifyBlockedQuestion(
  query: string,
): AnswerAssistantBlockedReason | null {
  const combined = query.trim();
  if (!combined) return "VALIDATION";

  if (
    RESIDENT_ID_PATTERN.test(combined) ||
    PHONE_PATTERN.test(combined) ||
    EMAIL_PATTERN.test(combined) ||
    LONG_DIGITS_PATTERN.test(combined) ||
    CONTRACT_CONTEXT_PATTERN.test(combined)
  ) {
    return "PERSONAL_INFO";
  }

  if (containsKeyword(combined, PERSONAL_INFO_KEYWORDS)) {
    return "PERSONAL_INFO";
  }

  if (containsKeyword(combined, CONTRACT_INFO_KEYWORDS)) {
    return "CONTRACT_INFO";
  }

  if (containsKeyword(combined, MEDICAL_INFO_KEYWORDS)) {
    return "MEDICAL_INFO";
  }

  if (containsKeyword(combined, CLAIM_DOCUMENT_KEYWORDS)) {
    return "CLAIM_DOCUMENT";
  }

  if (containsKeyword(combined, LOSS_ADJUSTMENT_KEYWORDS)) {
    return "LOSS_ADJUSTMENT";
  }

  if (containsKeyword(combined, CLAIM_JUDGMENT_KEYWORDS)) {
    return "CLAIM_JUDGMENT";
  }

  if (containsKeyword(combined, FEAR_MARKETING_KEYWORDS)) {
    return "FEAR_MARKETING";
  }

  if (containsKeyword(combined, PRODUCT_SOLICITATION_KEYWORDS)) {
    return "PRODUCT_SOLICITATION";
  }

  if (containsKeyword(combined, PROMPT_INJECTION_KEYWORDS)) {
    return "PROMPT_INJECTION";
  }

  return null;
}

export function validateAnswerAssistantInput(
  input: AnswerAssistantInput,
): AnswerAssistantValidationResult {
  if (!VALID_PURPOSES.has(input.purpose)) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.invalid,
    };
  }

  if (!VALID_TONES.has(input.tone)) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.invalid,
    };
  }

  const sanitized = sanitizeCorrectionPlainText(input.query);
  if (sanitized.blocked) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.invalid,
    };
  }

  const normalizedQuery = sanitized.text.replace(/\s+/g, " ").trim();
  if (!normalizedQuery) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.empty,
    };
  }

  if (normalizedQuery.length < ANSWER_ASSIST_QUERY_MIN_LENGTH) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.tooShort,
    };
  }

  if (normalizedQuery.length > ANSWER_ASSIST_QUERY_MAX_LENGTH) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.tooLong,
    };
  }

  if (REPEATED_SPECIAL_PATTERN.test(normalizedQuery)) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.invalid,
    };
  }

  const urlCount = countSafeUrls(normalizedQuery);
  if (urlCount >= 99 || urlCount > ANSWER_ASSIST_MAX_URLS) {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: ANSWER_ASSIST_VALIDATION_MESSAGES.urlSpam,
    };
  }

  const blocked = classifyBlockedQuestion(normalizedQuery);
  if (blocked) {
    return {
      ok: false,
      blockedReason: blocked,
      message: ANSWER_ASSIST_BLOCKED_MESSAGES[blocked],
    };
  }

  return { ok: true, message: "", normalizedQuery };
}

export function parseAnswerAssistantFormData(
  formData: FormData,
): AnswerAssistantInput {
  const purpose = String(formData.get("purpose") ?? "GENERAL_EXPLANATION");
  const tone = String(formData.get("tone") ?? "neutral");
  const domain = String(formData.get("domain") ?? "all");
  const query = String(formData.get("query") ?? "");
  const requiresOfficialCheck =
    formData.get("requiresOfficialCheck") === "on" ||
    formData.get("requiresOfficialCheck") === "true";

  return {
    purpose: purpose as AnswerAssistantInput["purpose"],
    tone: tone as AnswerAssistantInput["tone"],
    domain: domain as AnswerAssistantInput["domain"],
    query,
    requiresOfficialCheck,
  };
}
