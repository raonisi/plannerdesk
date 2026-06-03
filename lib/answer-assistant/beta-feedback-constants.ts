// Beta safety feedback limits (PR-101).

export const BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH = 120;
export const BETA_FEEDBACK_ADMIN_MEMO_MAX_LENGTH = 500;
export const BETA_FEEDBACK_MAX_PER_USER_PER_DAY = 10;

export const BETA_FEEDBACK_FORBIDDEN_STORED_FIELDS = [
  "query",
  "draft",
  "rawOutput",
  "rawPrompt",
  "prompt",
  "generatedAnswer",
  "phone",
  "email",
  "contractNumber",
  "medicalInfo",
  "ocrText",
  "fileUrl",
  "customerMessage",
] as const;
