// Pure helpers and copy constants for the public correction request MVP.
//
// PR-35 ships a no-DB MVP: the user fills the form, the helpers below build a
// structured plain-text payload, and the dialog copies it to the clipboard.
// Nothing is sent to the server, nothing is persisted, and no Insurer record
// is updated automatically. See docs/CORRECTION_REQUEST_PLAN.md for the
// future DB-backed workflow (PR-35+).

export const CORRECTION_REQUEST_TYPES = [
  { value: "incorrect_link", label: "링크 오류" },
  { value: "outdated_phone", label: "전화번호 변경" },
  { value: "outdated_fax", label: "팩스번호 변경" },
  { value: "mailing_address", label: "등기우편 주소 변경" },
  { value: "claim_form_link", label: "청구양식 링크 변경" },
  { value: "terms_link", label: "약관 링크 변경" },
  { value: "card_payment_info", label: "카드납 정보 변경" },
  { value: "insurer_category", label: "보험사 분류 오류" },
  { value: "other", label: "기타" },
] as const;

export type CorrectionRequestType = (typeof CORRECTION_REQUEST_TYPES)[number]["value"];

const CORRECTION_REQUEST_TYPE_SET = new Set<string>(
  CORRECTION_REQUEST_TYPES.map((t) => t.value),
);

export function isCorrectionRequestType(
  value: string,
): value is CorrectionRequestType {
  return CORRECTION_REQUEST_TYPE_SET.has(value);
}

export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 1000;

export const CORRECTION_REQUEST_COPY = {
  triggerLabel: "정보 수정 요청",
  triggerHint:
    "보험사 링크나 연락처가 달라졌다면 수정 요청을 남겨주세요.",
  cardTriggerLabel: "수정 요청",
  cardTriggerAria: "이 보험사 정보의 수정 요청",
  dialogTitle: "정보 수정 요청",
  dialogDescription:
    "잘못된 링크, 연락처, 팩스, 서류 정보를 발견했다면 제보해주세요. 제보 내용은 관리자 검수 후 반영됩니다.",
  sensitiveWarningTitle: "입력 전 확인해주세요",
  sensitiveWarningBody:
    "고객 이름, 주민등록번호, 병명, 진단서, 청구서류 원본, 보험금 지급 가능 여부 판단 요청은 입력하지 마세요.",
  reviewNoticeBody:
    "플래너데스크는 보험금 지급 여부를 판단하지 않으며, 보험금 지급 금액을 산정하지 않습니다.",
  insurerLabel: "대상 보험사",
  insurerPlaceholder: "보험사를 선택하세요",
  requestTypeLabel: "요청 종류",
  requestTypePlaceholder: "요청 종류를 선택하세요",
  messageLabel: "수정 요청 내용",
  messagePlaceholder:
    "예: ○○보험 청구 팩스 번호가 변경되었습니다. 공식 홈페이지 기준 새 번호는 000-0000-0000입니다.\n고객 개인정보, 의료자료, 진단서, 청구서류 원본 내용은 입력하지 마세요.",
  sourceUrlLabel: "공식 자료 링크 (선택)",
  sourceUrlPlaceholder: "https://",
  sourceUrlHint:
    "공식 출처를 함께 남기면 검수에 도움이 됩니다.",
  copyAction: "제보 내용 복사",
  cancelAction: "닫기",
  copySuccess:
    "제보 내용이 복사되었습니다. 관리자 검수 전에는 공개 정보에 반영되지 않습니다.",
  copySuccessSubcopy: "공식 출처 확인 후 업데이트됩니다.",
  copyManualHint:
    "자동 복사가 되지 않는 경우 아래 내용을 직접 선택해 복사해 주세요.",
  declarationLabel:
    "고객 개인정보, 의료자료, 보험금 지급 판단 요청을 포함하지 않았습니다.",
  declarationRequired:
    "안전 확인 체크 후 제보 내용을 복사할 수 있습니다.",
  sensitiveSignalWarning:
    "제보 내용에 고객 개인정보, 의료자료 또는 보험금 판단 요청으로 보일 수 있는 표현이 포함되어 있습니다. 해당 내용을 제거한 뒤 다시 진행해주세요.",
  submissionChannelNote:
    "관리자 제출 채널은 추후 안내 예정입니다. 현재는 준비된 내용을 복사해 보관해 주세요.",
  validationRequired: "필수 항목입니다.",
  validationMessageRange: `수정 내용은 ${MESSAGE_MIN_LENGTH}자 이상 ${MESSAGE_MAX_LENGTH}자 이하로 입력해 주세요.`,
  validationUrlInvalid: "http:// 또는 https://로 시작하는 URL을 입력해 주세요.",
  validationEmailInvalid: "이메일 형식이 올바르지 않습니다.",
} as const;

export interface CorrectionRequestInput {
  insurerId: string;
  insurerName: string;
  requestType: string;
  message: string;
  sourceUrl?: string;
  requesterName?: string;
  requesterEmail?: string;
}

export type CorrectionRequestFieldError =
  | "insurerId"
  | "requestType"
  | "message"
  | "sourceUrl"
  | "requesterEmail";

export interface CorrectionRequestValidation {
  ok: boolean;
  errors: Partial<Record<CorrectionRequestFieldError, string>>;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Conservative email check. The pattern matches a "looks like an email"
// shape rather than fully implementing RFC 5322; the form is optional and the
// admin reviewer is the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function validateCorrectionRequest(
  input: CorrectionRequestInput,
): CorrectionRequestValidation {
  const errors: CorrectionRequestValidation["errors"] = {};

  if (!input.insurerId.trim()) {
    errors.insurerId = CORRECTION_REQUEST_COPY.validationRequired;
  }

  if (!input.requestType.trim() || !isCorrectionRequestType(input.requestType)) {
    errors.requestType = CORRECTION_REQUEST_COPY.validationRequired;
  }

  const messageLength = input.message.trim().length;
  if (
    messageLength < MESSAGE_MIN_LENGTH ||
    messageLength > MESSAGE_MAX_LENGTH
  ) {
    errors.message = CORRECTION_REQUEST_COPY.validationMessageRange;
  }

  if (input.sourceUrl && input.sourceUrl.trim().length > 0) {
    if (!isValidHttpUrl(input.sourceUrl.trim())) {
      errors.sourceUrl = CORRECTION_REQUEST_COPY.validationUrlInvalid;
    }
  }

  if (input.requesterEmail && input.requesterEmail.trim().length > 0) {
    if (!isValidEmail(input.requesterEmail.trim())) {
      errors.requesterEmail = CORRECTION_REQUEST_COPY.validationEmailInvalid;
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function correctionRequestTypeLabel(value: string): string {
  const match = CORRECTION_REQUEST_TYPES.find((t) => t.value === value);
  return match ? match.label : value;
}

// Formats the user-provided fields into a calm Korean plain-text payload. The
// payload is meant to be copied to the clipboard by the user; this function
// never sends data anywhere on its own.
export function formatCorrectionRequest(
  input: CorrectionRequestInput,
  options: { generatedAtIso?: string } = {},
): string {
  const now = options.generatedAtIso ?? new Date().toISOString();
  const lines = [
    "[PlannerDesk] 정보 수정 요청",
    `작성일: ${now}`,
    "",
    `대상 보험사: ${input.insurerName} (id: ${input.insurerId})`,
    `요청 종류: ${correctionRequestTypeLabel(input.requestType)}`,
    "",
    "수정 내용:",
    input.message.trim(),
  ];

  const trimmedSourceUrl = input.sourceUrl?.trim();
  if (trimmedSourceUrl) {
    lines.push("", `공식 자료 링크: ${trimmedSourceUrl}`);
  }

  const trimmedName = input.requesterName?.trim();
  const trimmedEmail = input.requesterEmail?.trim();
  if (trimmedName || trimmedEmail) {
    lines.push("");
    lines.push("요청자:");
    if (trimmedName) lines.push(`- 이름: ${trimmedName}`);
    if (trimmedEmail) lines.push(`- 이메일: ${trimmedEmail}`);
  }

  lines.push(
    "",
    "[안내]",
    "- 개인정보, 주민등록번호, 증권번호, 진료기록, 보험금 청구서류는 포함되지 않아야 합니다.",
    "- 이 요청은 관리자 검토 후 반영됩니다. 자동 반영되지 않습니다.",
  );

  return lines.join("\n");
}
