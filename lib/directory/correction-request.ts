// Pure helpers and copy constants for the public correction request MVP.
//
// PR-35 ships a no-DB MVP: the user fills the form, the helpers below build a
// structured plain-text payload, and the dialog copies it to the clipboard.
// Nothing is sent to the server, nothing is persisted, and no Insurer record
// is updated automatically. See docs/CORRECTION_REQUEST_PLAN.md for the
// future DB-backed workflow (PR-35+).

export const CORRECTION_REQUEST_TYPES = [
  { value: "incorrect_link", label: "\ub9c1\ud06c \uc624\ub958" },
  { value: "outdated_phone", label: "\uc804\ud654\ubc88\ud638 \ubcc0\uacbd" },
  { value: "outdated_fax", label: "\ud329\uc2a4\ubc88\ud638 \ubcc0\uacbd" },
  { value: "mailing_address", label: "\ub4f1\uae30\uc6b0\ud3b8 \uc8fc\uc18c \ubcc0\uacbd" },
  { value: "claim_form_link", label: "\uccad\uad6c\uc591\uc2dd \ub9c1\ud06c \ubcc0\uacbd" },
  { value: "terms_link", label: "\uc57d\uad00 \ub9c1\ud06c \ubcc0\uacbd" },
  { value: "card_payment_info", label: "\uce74\ub4dc\ub0a9 \uc815\ubcf4 \ubcc0\uacbd" },
  { value: "insurer_category", label: "\ubcf4\ud5d8\uc0ac \ubd84\ub958 \uc624\ub958" },
  { value: "other", label: "\uae30\ud0c0" },
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
  triggerLabel: "\uc815\ubcf4 \uc218\uc815 \uc694\uccad",
  triggerHint:
    "\ubcf4\ud5d8\uc0ac \ub9c1\ud06c\ub098 \uc5f0\ub77d\ucc98\uac00 \ub2ec\ub77c\uc84c\ub2e4\uba74 \uc218\uc815 \uc694\uccad\uc744 \ub0a8\uaca8\uc8fc\uc138\uc694.",
  cardTriggerLabel: "\uc218\uc815 \uc694\uccad",
  cardTriggerAria: "\uc774 \ubcf4\ud5d8\uc0ac \uc815\ubcf4\uc758 \uc218\uc815 \uc694\uccad",
  dialogTitle: "\uc815\ubcf4 \uc218\uc815 \uc694\uccad",
  dialogDescription:
    "\uc694\uccad \ub0b4\uc6a9\uc740 \uad00\ub9ac\uc790 \uac80\ud1a0 \ud6c4 \ubc18\uc601\ub429\ub2c8\ub2e4.",
  sensitiveWarningTitle: "\uac1c\uc778\uc815\ubcf4 \uc785\ub825 \uae08\uc9c0",
  sensitiveWarningBody:
    "\uac1c\uc778\uc815\ubcf4, \uc8fc\ubbfc\ub4f1\ub85d\ubc88\ud638, \uc99d\uad8c\ubc88\ud638, \uc9c4\ub8cc\uae30\ub85d, \ubcf4\ud5d8\uae08 \uccad\uad6c\uc11c\ub958\ub294 \uc785\ub825\ud558\uc9c0 \ub9c8\uc138\uc694.",
  reviewNoticeBody:
    "\uc218\uc815 \uc694\uccad\uc740 \uc989\uc2dc \ubc18\uc601\ub418\uc9c0 \uc54a\uc73c\uba70, \uad00\ub9ac\uc790 \uac80\ud1a0 \ud6c4 \ubc18\uc601\ub429\ub2c8\ub2e4.",
  insurerLabel: "\ub300\uc0c1 \ubcf4\ud5d8\uc0ac",
  insurerPlaceholder: "\ubcf4\ud5d8\uc0ac\ub97c \uc120\ud0dd\ud558\uc138\uc694",
  requestTypeLabel: "\uc694\uccad \uc885\ub958",
  requestTypePlaceholder: "\uc694\uccad \uc885\ub958\ub97c \uc120\ud0dd\ud558\uc138\uc694",
  messageLabel: "\uc218\uc815 \ub0b4\uc6a9",
  messagePlaceholder:
    "\ud604\uc7ac \ud45c\uc2dc\ub418\ub294 \uc815\ubcf4\uc640 \uc81c\uc548\ud558\ub294 \uc218\uc815 \uc0ac\ud56d\uc744 \uad6c\uccb4\uc801\uc73c\ub85c \uc801\uc5b4\uc8fc\uc138\uc694.",
  sourceUrlLabel: "\uacf5\uc2dd \uc790\ub8cc \ub9c1\ud06c (\uc120\ud0dd)",
  sourceUrlPlaceholder: "https://",
  sourceUrlHint:
    "\uadfc\uac70 \uacf5\uc2dd \uc790\ub8cc\uc758 URL\uc744 \ud568\uaed8 \uc801\uc5b4\uc8fc\uc2dc\uba74 \uac80\ud1a0\uac00 \ube68\ub77c\uc9d1\ub2c8\ub2e4.",
  requesterNameLabel: "\uc774\ub984 (\uc120\ud0dd)",
  requesterEmailLabel: "\uc774\uba54\uc77c (\uc120\ud0dd)",
  optionalIdentityHint:
    "\ud544\uc694 \uc5c6\uc73c\uba74 \ube44\uc6cc\ub450\uc154\ub3c4 \ub429\ub2c8\ub2e4. \ud68c\uc2e0\uc774 \ud544\uc694\ud55c \uacbd\uc6b0\uc5d0\ub9cc \uc774\uba54\uc77c\uc744 \ub0a8\uaca8\uc8fc\uc138\uc694.",
  copyAction: "\uc694\uccad \ub0b4\uc6a9 \ubcf5\uc0ac\ud558\uae30",
  cancelAction: "\ub2eb\uae30",
  copySuccess: "\uc694\uccad \ub0b4\uc6a9\uc774 \ud074\ub9bd\ubcf4\ub4dc\uc5d0 \ubcf5\uc0ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
  copyManualHint:
    "\uc790\ub3d9 \ubcf5\uc0ac\uac00 \ub418\uc9c0 \uc54a\ub294 \uacbd\uc6b0 \uc544\ub798 \ub0b4\uc6a9\uc744 \uc9c1\uc811 \uc120\ud0dd\ud574 \ubcf5\uc0ac\ud574 \uc8fc\uc138\uc694.",
  submissionChannelNote:
    "\uad00\ub9ac\uc790 \uc81c\ucd9c \ucc44\ub110\uc740 \ucd94\ud6c4 \uc548\ub0b4 \uc608\uc815\uc785\ub2c8\ub2e4. \ud604\uc7ac\ub294 \uc900\ube44\ub41c \ub0b4\uc6a9\uc744 \ubcf5\uc0ac\ud574 \ubcf4\uad00\ud574\uc8fc\uc138\uc694.",
  validationRequired: "\ud544\uc218 \ud56d\ubaa9\uc785\ub2c8\ub2e4.",
  validationMessageRange: `\uc218\uc815 \ub0b4\uc6a9\uc740 ${MESSAGE_MIN_LENGTH}\uc790 \uc774\uc0c1 ${MESSAGE_MAX_LENGTH}\uc790 \uc774\ud558\ub85c \uc785\ub825\ud574 \uc8fc\uc138\uc694.`,
  validationUrlInvalid: "http:// \ub610\ub294 https://\ub85c \uc2dc\uc791\ud558\ub294 URL\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
  validationEmailInvalid: "\uc774\uba54\uc77c \ud615\uc2dd\uc774 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
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
    "[PlannerDesk] \uc815\ubcf4 \uc218\uc815 \uc694\uccad",
    `\uc791\uc131\uc77c: ${now}`,
    "",
    `\ub300\uc0c1 \ubcf4\ud5d8\uc0ac: ${input.insurerName} (id: ${input.insurerId})`,
    `\uc694\uccad \uc885\ub958: ${correctionRequestTypeLabel(input.requestType)}`,
    "",
    "\uc218\uc815 \ub0b4\uc6a9:",
    input.message.trim(),
  ];

  const trimmedSourceUrl = input.sourceUrl?.trim();
  if (trimmedSourceUrl) {
    lines.push("", `\uacf5\uc2dd \uc790\ub8cc \ub9c1\ud06c: ${trimmedSourceUrl}`);
  }

  const trimmedName = input.requesterName?.trim();
  const trimmedEmail = input.requesterEmail?.trim();
  if (trimmedName || trimmedEmail) {
    lines.push("");
    lines.push("\uc694\uccad\uc790:");
    if (trimmedName) lines.push(`- \uc774\ub984: ${trimmedName}`);
    if (trimmedEmail) lines.push(`- \uc774\uba54\uc77c: ${trimmedEmail}`);
  }

  lines.push(
    "",
    "[\uc548\ub0b4]",
    "- \uac1c\uc778\uc815\ubcf4, \uc8fc\ubbfc\ub4f1\ub85d\ubc88\ud638, \uc99d\uad8c\ubc88\ud638, \uc9c4\ub8cc\uae30\ub85d, \ubcf4\ud5d8\uae08 \uccad\uad6c\uc11c\ub958\ub294 \ud3ec\ud568\ub418\uc9c0 \uc54a\uc544\uc57c \ud569\ub2c8\ub2e4.",
    "- \uc774 \uc694\uccad\uc740 \uad00\ub9ac\uc790 \uac80\ud1a0 \ud6c4 \ubc18\uc601\ub429\ub2c8\ub2e4. \uc790\ub3d9 \ubc18\uc601\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  );

  return lines.join("\n");
}
