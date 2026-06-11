// CorrectionRequest public submit constants (PR-80). Aligns with Prisma enums in schema.prisma.

import type {
  CorrectionRequestType,
  CorrectionTargetType,
} from "@prisma/client";

export const TITLE_MIN_LENGTH = 5;
export const TITLE_MAX_LENGTH = 100;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 1_000;

export const CORRECTION_TARGET_TYPES = [
  "insurer",
  "claim_document",
  "disclosure_link",
  "message_template",
  "knowledge_article",
  "general",
] as const satisfies readonly CorrectionTargetType[];

export const CORRECTION_REQUEST_TYPES = [
  "broken_link",
  "outdated_info",
  "typo",
  "wrong_category",
  "document_requirement_update",
  "disclosure_update",
  "message_template_feedback",
  "knowledge_article_feedback",
  "other",
] as const satisfies readonly CorrectionRequestType[];

const TARGET_TYPE_SET = new Set<string>(CORRECTION_TARGET_TYPES);
const REQUEST_TYPE_SET = new Set<string>(CORRECTION_REQUEST_TYPES);

export function isCorrectionTargetType(
  value: string,
): value is CorrectionTargetType {
  return TARGET_TYPE_SET.has(value);
}

export function isCorrectionRequestType(
  value: string,
): value is CorrectionRequestType {
  return REQUEST_TYPE_SET.has(value);
}

export const TARGET_TYPE_LABELS: Record<CorrectionTargetType, string> = {
  insurer: "보험사 디렉토리",
  claim_document: "청구서류 안내",
  disclosure_link: "공시·약관 링크",
  message_template: "고객 안내 문구",
  knowledge_article: "지식 아카이브",
  general: "일반",
};

export const REQUEST_TYPE_LABELS: Record<CorrectionRequestType, string> = {
  broken_link: "링크 오류",
  outdated_info: "정보 구식·변경",
  typo: "오탈자·문장",
  wrong_category: "분류 오류",
  document_requirement_update: "청구서류 안내 변경",
  disclosure_update: "공시·약관 링크 변경",
  message_template_feedback: "고객문구 피드백",
  knowledge_article_feedback: "지식 아카이브 피드백",
  other: "기타",
};

/** Insurer directory dialog: operational correction types only. */
export const DIRECTORY_REQUEST_TYPE_OPTIONS: {
  value: CorrectionRequestType;
  label: string;
}[] = [
  { value: "broken_link", label: REQUEST_TYPE_LABELS.broken_link },
  { value: "outdated_info", label: REQUEST_TYPE_LABELS.outdated_info },
  { value: "typo", label: REQUEST_TYPE_LABELS.typo },
  { value: "wrong_category", label: REQUEST_TYPE_LABELS.wrong_category },
  { value: "disclosure_update", label: REQUEST_TYPE_LABELS.disclosure_update },
  { value: "document_requirement_update", label: REQUEST_TYPE_LABELS.document_requirement_update },
  { value: "other", label: REQUEST_TYPE_LABELS.other },
];

export const CORRECTION_SUBMIT_COPY = {
  triggerLabel: "정보 수정 요청",
  triggerHint:
    "보험사 링크나 연락처가 달라졌다면 수정 요청을 남겨주세요.",
  cardTriggerLabel: "수정 요청",
  cardTriggerAria: "이 보험사 정보의 수정 요청",
  dialogTitle: "정보 수정 요청",
  dialogDescription:
    "잘못된 링크, 연락처, 안내 문구를 발견했다면 제보해주세요. 접수된 내용은 관리자 검수 후 반영 여부가 결정됩니다.",
  sensitiveWarningTitle: "입력 전 확인해주세요",
  sensitiveWarningBody:
    "고객 개인정보, 주민번호, 연락처, 계약번호, 병력, 진단명, 상담 원문은 입력하지 마세요.",
  officialSourceReminder:
    "공식 출처 URL이 있다면 함께 남겨 주세요.",
  reviewNoticeBody:
    "제보된 내용은 관리자가 확인한 뒤 반영 여부를 검토합니다. 보험금 지급 여부나 청구 가능 여부를 확정하는 기능이 아닙니다.",
  noAutoApplyNotice:
    "제보 내용은 즉시 public 화면에 반영되지 않습니다.",
  insurerLabel: "대상 보험사",
  insurerPlaceholder: "보험사를 선택하세요",
  titleLabel: "제보 제목",
  titlePlaceholder: "예: 공시 링크가 열리지 않습니다",
  requestTypeLabel: "요청 종류",
  requestTypePlaceholder: "요청 종류를 선택하세요",
  messageLabel: "제보 내용",
  messagePlaceholder:
    "예: 해당 링크 접속 시 404 화면이 표시됩니다. 고객 개인정보, 의료자료, 계약번호, 청구서류 원본은 입력하지 마세요.",
  sourceUrlLabel: "공식 자료 링크 (선택)",
  sourceUrlPlaceholder: "https://",
  sourceUrlHint:
    "공식 출처 URL만 입력해 주세요. 파일·이미지는 첨부할 수 없습니다.",
  piiBlockedMessage:
    "개인정보 또는 민감정보로 보일 수 있는 내용이 포함되어 있습니다. 해당 내용을 제외하고 다시 작성해 주세요.",
  submitAction: "제보 접수",
  cancelAction: "닫기",
  submitSuccess:
    "제보가 접수되었습니다. 관리자 검수 전에는 공개 정보에 반영되지 않습니다.",
  declarationLabel:
    "고객 개인정보·민감정보·상담 원문·보험금 지급 판단 요청을 포함하지 않았습니다.",
  declarationRequired: "안전 확인 체크 후 제보를 접수할 수 있습니다.",
  validationRequired: "필수 항목입니다.",
  validationTitleRange: `제목은 ${TITLE_MIN_LENGTH}자 이상 ${TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`,
  validationMessageRange: `제보 내용은 ${MESSAGE_MIN_LENGTH}자 이상 ${MESSAGE_MAX_LENGTH}자 이하로 입력해 주세요.`,
  validationUrlInvalid: "http:// 또는 https://로 시작하는 URL을 입력해 주세요.",
  genericFailure: "제보 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  spamFailure: "제보를 접수할 수 없습니다. 잠시 후 다시 시도해 주세요.",
} as const;
