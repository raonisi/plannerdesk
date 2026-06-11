// Server-side validation for public CorrectionRequest submit (PR-78 / PR-80).

import type {
  CorrectionRequestType,
  CorrectionTargetType,
} from "@prisma/client";
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  isCorrectionRequestType,
  isCorrectionTargetType,
} from "./constants";
import { sanitizeCorrectionPlainText } from "./sanitize";

export type CorrectionSubmitBlockReason =
  | "validation"
  | "personal_info"
  | "medical_info"
  | "payout_judgment"
  | "file_upload"
  | "html_injection"
  | "url_spam"
  | "spam";

export interface CorrectionSubmitPayload {
  targetType: string;
  targetId: string | null;
  requestType: string;
  title: string;
  message: string;
  honeypot: string;
  sourceUrl?: string | null;
}

export interface CorrectionSubmitValidationResult {
  ok: boolean;
  reason?: CorrectionSubmitBlockReason;
  message: string;
  data?: {
    targetType: CorrectionTargetType;
    targetId: string | null;
    requestType: CorrectionRequestType;
    title: string;
    message: string;
  };
}

export const CORRECTION_ERROR_MESSAGES = {
  validation:
    "제보 제목과 내용을 기준에 맞게 입력해주세요.",
  personal_info:
    "개인정보 또는 민감정보로 보일 수 있는 내용이 포함되어 저장되지 않았습니다. 해당 내용을 제외하고 다시 작성해주세요.",
  medical_info:
    "개인정보 또는 민감정보로 보일 수 있는 내용이 포함되어 저장되지 않았습니다. 해당 내용을 제외하고 다시 작성해주세요.",
  payout_judgment:
    "보험금 지급 가능 여부나 의료 판단에 관한 내용은 이 제보 기능으로 접수할 수 없습니다.",
  file_upload: "파일이나 이미지는 첨부할 수 없습니다.",
  html_injection:
    "제보 제목과 내용을 기준에 맞게 입력해주세요.",
  url_spam:
    "제보 내용에 포함된 링크가 너무 많습니다. 필요한 공식 링크만 남기고 다시 작성해주세요.",
  spam: "제보를 접수할 수 없습니다. 잠시 후 다시 시도해주세요.",
} as const;

const CUID_PATTERN = /^c[a-z0-9]{20,30}$/i;

const BLOCKED_URL_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:"];

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
  "계약번호",
  "증권번호",
  "고객번호",
  "신분증",
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

const PAYOUT_JUDGMENT_KEYWORDS = [
  "보험금 받을 수 있나요",
  "보험금 가능",
  "지급 가능",
  "지급되나요",
  "청구 가능",
  "보상 가능",
  "얼마 받을 수",
  "지급 판단",
  "손해사정",
  "면책인가요",
  "부지급인가요",
  "보장되나요",
  "진단비 받을 수",
  "수술비 받을 수",
  "입원비 받을 수",
  "보험금 지급 가능",
  "보험금 얼마",
  "지급될까요",
  "청구 가능성",
] as const;

const FILE_UPLOAD_KEYWORDS = [
  "파일을 올려",
  "파일을 업로드",
  "진단서를 첨부",
  "영수증을 첨부",
  "청구서류를 업로드",
  "캡처본을 첨부",
  "이미지를 첨부",
  "사진을 첨부",
] as const;

const SECRET_KEYWORDS = [
  "api key",
  "apikey",
  "api_key",
  "bearer ",
  "auth_secret",
  "secret key",
  "private key",
  ".env",
  "process.env",
] as const;

const CONSULTATION_KEYWORDS = [
  "상담원문",
  "상담 원문",
  "상담내용",
  "상담 내용 전체",
  "카카오톡 대화",
] as const;

const CARD_KEYWORDS = ["카드번호", "카드 번호", "cvc", "cvv"] as const;

const RESIDENT_ID_PATTERN = /\b\d{6}-\d{7}\b/;
const PHONE_PATTERN = /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const LONG_DIGITS_PATTERN = /\b\d{10,}\b/;
const CONTRACT_CONTEXT_PATTERN =
  /(계약번호|증권번호|계좌번호|고객번호)[^0-9]{0,16}\d{4,}/i;

const URL_IN_TEXT_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"']+/gi;

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

function scanSensitivePatterns(title: string, message: string): CorrectionSubmitBlockReason | null {
  const combined = `${title}\n${message}`;
  if (
    RESIDENT_ID_PATTERN.test(combined) ||
    PHONE_PATTERN.test(combined) ||
    EMAIL_PATTERN.test(combined) ||
    LONG_DIGITS_PATTERN.test(combined) ||
    CONTRACT_CONTEXT_PATTERN.test(combined)
  ) {
    return "personal_info";
  }
  if (containsKeyword(combined, PERSONAL_INFO_KEYWORDS)) {
    return "personal_info";
  }
  if (containsKeyword(combined, MEDICAL_INFO_KEYWORDS)) {
    return "medical_info";
  }
  if (containsKeyword(combined, PAYOUT_JUDGMENT_KEYWORDS)) {
    return "payout_judgment";
  }
  if (containsKeyword(combined, FILE_UPLOAD_KEYWORDS)) {
    return "file_upload";
  }
  if (
    containsKeyword(combined, SECRET_KEYWORDS) ||
    containsKeyword(combined, CARD_KEYWORDS) ||
    containsKeyword(combined, CONSULTATION_KEYWORDS)
  ) {
    return "personal_info";
  }
  return null;
}

function isValidOptionalTargetId(
  targetType: CorrectionTargetType,
  targetId: string | null,
): boolean {
  if (!targetId) {
    return targetType === "general";
  }
  if (targetType === "general") {
    return false;
  }
  return CUID_PATTERN.test(targetId);
}

function isValidSourceUrl(value: string | null | undefined): boolean {
  if (!value || value.trim().length === 0) return true;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  for (const blocked of BLOCKED_URL_PROTOCOLS) {
    if (lower.startsWith(blocked)) return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function appendSourceUrlToMessage(
  message: string,
  sourceUrl: string | null | undefined,
): string {
  const trimmed = sourceUrl?.trim();
  if (!trimmed) return message;
  return `${message}\n\n[공식 자료 링크]\n${trimmed}`;
}

export function validateCorrectionSubmit(
  input: CorrectionSubmitPayload,
): CorrectionSubmitValidationResult {
  if (input.honeypot.trim().length > 0) {
    return {
      ok: false,
      reason: "spam",
      message: CORRECTION_ERROR_MESSAGES.spam,
    };
  }

  if (!isCorrectionTargetType(input.targetType)) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  if (!isCorrectionRequestType(input.requestType)) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  const titleSanitized = sanitizeCorrectionPlainText(input.title);
  const messageSanitized = sanitizeCorrectionPlainText(input.message);

  if (titleSanitized.blocked || messageSanitized.blocked) {
    return {
      ok: false,
      reason: "html_injection",
      message: CORRECTION_ERROR_MESSAGES.html_injection,
    };
  }

  const title = titleSanitized.text;
  const baseMessage = messageSanitized.text;

  if (
    title.length < TITLE_MIN_LENGTH ||
    title.length > TITLE_MAX_LENGTH
  ) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  if (input.sourceUrl && !isValidSourceUrl(input.sourceUrl)) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  const message = appendSourceUrlToMessage(baseMessage, input.sourceUrl);

  if (
    baseMessage.length < MESSAGE_MIN_LENGTH ||
    baseMessage.length > MESSAGE_MAX_LENGTH
  ) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  const targetId = input.targetId?.trim() || null;

  if (input.targetType === "insurer" && !targetId) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  if (!isValidOptionalTargetId(input.targetType, targetId)) {
    return {
      ok: false,
      reason: "validation",
      message: CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  const sensitiveReason = scanSensitivePatterns(title, message);
  if (sensitiveReason) {
    return {
      ok: false,
      reason: sensitiveReason,
      message: CORRECTION_ERROR_MESSAGES[sensitiveReason],
    };
  }

  const urlCount = countSafeUrls(message);
  const maxUrls =
    input.requestType === "broken_link" ||
    input.requestType === "disclosure_update"
      ? 2
      : 1;
  if (urlCount > maxUrls) {
    return {
      ok: false,
      reason: "url_spam",
      message: CORRECTION_ERROR_MESSAGES.url_spam,
    };
  }

  return {
    ok: true,
    message: "",
    data: {
      targetType: input.targetType,
      targetId,
      requestType: input.requestType,
      title,
      message,
    },
  };
}

/** Client-side lightweight check (does not replace server validation). */
export function hasClientSensitiveSignal(text: string): boolean {
  const combined = text.trim();
  if (!combined) return false;
  return (
    RESIDENT_ID_PATTERN.test(combined) ||
    PHONE_PATTERN.test(combined) ||
    EMAIL_PATTERN.test(combined) ||
    CONTRACT_CONTEXT_PATTERN.test(combined) ||
    containsKeyword(combined, PERSONAL_INFO_KEYWORDS) ||
    containsKeyword(combined, MEDICAL_INFO_KEYWORDS) ||
    containsKeyword(combined, PAYOUT_JUDGMENT_KEYWORDS) ||
    containsKeyword(combined, FILE_UPLOAD_KEYWORDS) ||
    containsKeyword(combined, SECRET_KEYWORDS) ||
    containsKeyword(combined, CARD_KEYWORDS) ||
    containsKeyword(combined, CONSULTATION_KEYWORDS)
  );
}
