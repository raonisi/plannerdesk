// Customer message template safety constants (PR-74).

export const MESSAGE_TEMPLATE_PROHIBITED_PHRASES = [
  "무조건 지급됩니다",
  "반드시 보장됩니다",
  "100% 가능합니다",
  "확정입니다",
  "가입해야 합니다",
  "지금 안 하면 손해입니다",
  "해지하면 큰일 납니다",
  "병력 있어도 문제 없습니다",
  "보험금 받을 수 있습니다",
  "이 상품이 제일 좋습니다",
  "무조건 보장",
  "지급 확정",
  "받을 수 있습니다",
  "청구하면 나옵니다",
  "보험금 지급됩니다",
] as const;

export type MessageTemplateProhibitedPhrase =
  (typeof MESSAGE_TEMPLATE_PROHIBITED_PHRASES)[number];

export const SENSITIVE_VARIABLE_MARKERS = [
  "{주민등록번호}",
  "{병명}",
  "{진단명}",
  "{보험금액}",
  "{계약번호}",
  "{계좌번호}",
  "{진료기록}",
  "{처방내용}",
  "{병원명}",
  "{수술명}",
  "{입원일}",
  "{청구금액}",
] as const;

export const ALLOWED_TEMPLATE_VARIABLES = [
  "{고객명}",
  "{담당자명}",
  "{상담일}",
  "{보험사명}",
  "{점검항목}",
  "{연락처}",
] as const;

export type AllowedTemplateVariable = (typeof ALLOWED_TEMPLATE_VARIABLES)[number];

const ALLOWED_VARIABLE_SET = new Set<string>(ALLOWED_TEMPLATE_VARIABLES);

function normalizeInput(value: string): string {
  return value.normalize("NFKC");
}

export function findProhibitedPhrase(
  value: string | null | undefined,
): MessageTemplateProhibitedPhrase | null {
  if (!value) return null;
  const text = normalizeInput(value);
  for (const phrase of MESSAGE_TEMPLATE_PROHIBITED_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

export function scanFieldsForProhibitedPhrases(
  fields: Record<string, string | null | undefined>,
): { field: string; phrase: MessageTemplateProhibitedPhrase } | null {
  for (const [field, value] of Object.entries(fields)) {
    const phrase = findProhibitedPhrase(value);
    if (phrase) return { field, phrase };
  }
  return null;
}

export function findSensitiveVariable(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const text = normalizeInput(value);
  for (const marker of SENSITIVE_VARIABLE_MARKERS) {
    if (text.includes(marker)) return marker;
  }
  return null;
}

export function scanFieldsForSensitiveVariables(
  fields: Record<string, string | null | undefined>,
): { field: string; marker: string } | null {
  for (const [field, value] of Object.entries(fields)) {
    const marker = findSensitiveVariable(value);
    if (marker) return { field, marker };
  }
  return null;
}

export function validateAllowedVariablesList(variables: string[]): string | null {
  for (const variable of variables) {
    const normalized = normalizeInput(variable);
    if (!ALLOWED_VARIABLE_SET.has(normalized)) {
      return normalized;
    }
  }
  return null;
}
