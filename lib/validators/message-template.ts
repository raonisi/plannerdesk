// Validation helpers for MessageTemplate admin writes (PR-74).

import {
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
} from "@prisma/client";
export {
  MESSAGE_TEMPLATE_PROHIBITED_PHRASES,
  SENSITIVE_VARIABLE_MARKERS,
  ALLOWED_TEMPLATE_VARIABLES,
  findProhibitedPhrase,
  scanFieldsForProhibitedPhrases,
  findSensitiveVariable,
  scanFieldsForSensitiveVariables,
  validateAllowedVariablesList,
} from "@/lib/message-template/safety";

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 4_000;
export const BODY_MAX_LENGTH = 20_000;
export const SAFE_COPY_MAX_LENGTH = 20_000;
export const USE_CASE_MAX_LENGTH = 2_000;
export const COMPLIANCE_NOTE_MAX_LENGTH = 4_000;
export const SORT_ORDER_MIN = -10_000;
export const SORT_ORDER_MAX = 10_000;

export function clampSortOrder(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(SORT_ORDER_MAX, Math.max(SORT_ORDER_MIN, Math.trunc(value)));
}

export function parseCommaSeparatedList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function wouldPublishBlocked(flags: {
  isPublished: boolean;
  status: MessageTemplateStatus;
}): boolean {
  return flags.isPublished && flags.status !== MessageTemplateStatus.published;
}

export function isMessageTemplatePubliclyVisible(flags: {
  isPublished: boolean;
  status: MessageTemplateStatus;
  isInternalOnly: boolean;
}): boolean {
  return (
    flags.isPublished &&
    flags.status === MessageTemplateStatus.published &&
    !flags.isInternalOnly
  );
}

export type PublishValidationInput = {
  isPublished: boolean;
  status: MessageTemplateStatus;
  isInternalOnly: boolean;
  safeCopy: string | null;
  riskLevel: MessageTemplateRiskLevel;
};

export function validatePublishRules(
  input: PublishValidationInput,
): string | null {
  if (!input.isPublished) return null;

  if (wouldPublishBlocked(input)) {
    return "공개(게시)는 검수 완료(published) 상태에서만 가능합니다.";
  }

  if (input.isInternalOnly) {
    return "내부 전용 문구는 public에 게시할 수 없습니다.";
  }

  if (!input.safeCopy?.trim()) {
    return "public 공개 전 안전 문구(safeCopy)를 작성해 주세요.";
  }

  if (
    input.riskLevel === MessageTemplateRiskLevel.high &&
    input.status !== MessageTemplateStatus.published
  ) {
    return "위험도 HIGH 문구는 검수 완료 후에만 공개할 수 있습니다.";
  }

  return null;
}
