"use server";

import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  handleAdminUnauthorized,
  redirectWithError,
  revalidatePublicContentPaths,
} from "@/lib/admin/actions";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import { getBulkActionPolicy } from "@/lib/admin/bulk-policies";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import { bulkRunError } from "@/lib/admin/bulk-run";
import { runMessageTemplateBulkByAction } from "@/lib/admin/message-template-bulk-actions";
import {
  BODY_MAX_LENGTH,
  clampSortOrder,
  COMPLIANCE_NOTE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  parseCommaSeparatedList,
  SAFE_COPY_MAX_LENGTH,
  scanFieldsForProhibitedPhrases,
  scanFieldsForSensitiveVariables,
  TITLE_MAX_LENGTH,
  USE_CASE_MAX_LENGTH,
  validateAllowedVariablesList,
  validatePublishRules,
  wouldPublishBlocked,
} from "@/lib/validators/message-template";
import {
  getSessionUserId,
  requireMessageTemplateContentManager,
  requireMessageTemplatePublisher,
} from "./access";
import { ADMIN_MESSAGE_TEMPLATE_COPY, WRITABLE_STATUSES } from "./visibility";

const ADMIN_PATH = "/admin/message-templates";

const CATEGORY_VALUES = new Set<string>(
  Object.values(MessageTemplateCategory) as string[],
);
const CHANNEL_VALUES = new Set<string>(
  Object.values(MessageTemplateChannel) as string[],
);
const AUDIENCE_VALUES = new Set<string>(
  Object.values(MessageTemplateAudienceType) as string[],
);
const TONE_VALUES = new Set<string>(Object.values(MessageTemplateTone) as string[]);
const RISK_VALUES = new Set<string>(
  Object.values(MessageTemplateRiskLevel) as string[],
);
const STATUS_VALUES = new Set<string>(WRITABLE_STATUSES as unknown as string[]);

type FormError = { ok: false; message: string };
type ParsedMessageTemplate = {
  title: string;
  description: string;
  body: string;
  category: MessageTemplateCategory;
  channel: MessageTemplateChannel;
  audienceType: MessageTemplateAudienceType;
  useCase: string;
  tone: MessageTemplateTone;
  status: MessageTemplateStatus;
  isPublished: boolean;
  isInternalOnly: boolean;
  riskLevel: MessageTemplateRiskLevel;
  safeCopy: string | null;
  forbiddenClaims: string[];
  complianceNote: string | null;
  allowedVariables: string[];
  sortOrder: number;
};

type ParseResult = { ok: true; data: ParsedMessageTemplate } | FormError;

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredText(
  formData: FormData,
  key: string,
  label: string,
  max: number,
): FormError | string {
  const value = textValue(formData, key);
  if (!value) {
    return { ok: false, message: `${label}은(는) 필수입니다.` };
  }
  if (value.length > max) {
    return { ok: false, message: `${label}은(는) ${max}자 이하로 입력해 주세요.` };
  }
  return value;
}

function optionalText(
  formData: FormData,
  key: string,
  label: string,
  max: number,
): FormError | string | null {
  const value = textValue(formData, key);
  if (!value) return null;
  if (value.length > max) {
    return { ok: false, message: `${label}은(는) ${max}자 이하로 입력해 주세요.` };
  }
  return value;
}

function optionalMultiline(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseSortOrder(formData: FormData): FormError | number {
  const raw = textValue(formData, "sortOrder") ?? "0";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return { ok: false, message: "정렬 순서는 숫자여야 합니다." };
  }
  return clampSortOrder(parsed);
}

function enumField(
  formData: FormData,
  key: string,
  label: string,
  allowed: Set<string>,
): FormError | string {
  const value = textValue(formData, key);
  if (!value || !allowed.has(value)) {
    return { ok: false, message: `${label}을(를) 선택해 주세요.` };
  }
  return value;
}

async function parseMessageTemplateForm(
  formData: FormData,
): Promise<ParseResult> {
  const title = requiredText(formData, "title", "제목", TITLE_MAX_LENGTH);
  if (typeof title !== "string") return title;

  const descriptionRaw = optionalMultiline(formData, "description");
  if (descriptionRaw.length > DESCRIPTION_MAX_LENGTH) {
    return {
      ok: false,
      message: `설명은 ${DESCRIPTION_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  const body = requiredText(formData, "body", "본문", BODY_MAX_LENGTH);
  if (typeof body !== "string") return body;

  const useCase = requiredText(formData, "useCase", "사용 상황", USE_CASE_MAX_LENGTH);
  if (typeof useCase !== "string") return useCase;

  const category = enumField(formData, "category", "카테고리", CATEGORY_VALUES);
  if (typeof category !== "string") return category;

  const channel = enumField(formData, "channel", "채널", CHANNEL_VALUES);
  if (typeof channel !== "string") return channel;

  const audienceType = enumField(
    formData,
    "audienceType",
    "대상 고객 유형",
    AUDIENCE_VALUES,
  );
  if (typeof audienceType !== "string") return audienceType;

  const tone = enumField(formData, "tone", "톤", TONE_VALUES);
  if (typeof tone !== "string") return tone;

  const riskLevel = enumField(formData, "riskLevel", "위험도", RISK_VALUES);
  if (typeof riskLevel !== "string") return riskLevel;

  const statusRaw = textValue(formData, "status") ?? MessageTemplateStatus.draft;
  if (!STATUS_VALUES.has(statusRaw)) {
    return { ok: false, message: "상태 값이 올바르지 않습니다." };
  }
  const status = statusRaw as MessageTemplateStatus;

  const safeCopy = optionalText(formData, "safeCopy", "안전 문구", SAFE_COPY_MAX_LENGTH);
  if (safeCopy && typeof safeCopy !== "string") return safeCopy;

  const complianceNote = optionalText(
    formData,
    "complianceNote",
    "컴플라이언스 메모",
    COMPLIANCE_NOTE_MAX_LENGTH,
  );
  if (complianceNote && typeof complianceNote !== "string") return complianceNote;

  const sortOrder = parseSortOrder(formData);
  if (typeof sortOrder !== "number") return sortOrder;

  const isPublished = formData.get("isPublished") === "on";
  const isInternalOnly = formData.get("isInternalOnly") === "on";

  const forbiddenClaims = parseCommaSeparatedList(
    textValue(formData, "forbiddenClaims"),
  );
  const allowedVariables = parseCommaSeparatedList(
    textValue(formData, "allowedVariables"),
  );

  const invalidVariable = validateAllowedVariablesList(allowedVariables);
  if (invalidVariable) {
    return {
      ok: false,
      message: `${ADMIN_MESSAGE_TEMPLATE_COPY.invalidAllowedVariable}: ${invalidVariable}`,
    };
  }

  const publishError = validatePublishRules({
    isPublished,
    status,
    isInternalOnly,
    safeCopy,
    riskLevel: riskLevel as MessageTemplateRiskLevel,
  });
  if (publishError) {
    return { ok: false, message: publishError };
  }

  if (wouldPublishBlocked({ isPublished, status })) {
    return { ok: false, message: ADMIN_MESSAGE_TEMPLATE_COPY.publishBlocked };
  }

  const scanTexts = {
    title,
    description: descriptionRaw,
    body,
    safeCopy,
    useCase,
    complianceNote,
    forbiddenClaims: forbiddenClaims.join(" "),
    allowedVariables: allowedVariables.join(" "),
  };

  const prohibited = scanFieldsForProhibitedPhrases(scanTexts);
  if (prohibited) {
    if (isPublished) {
      return {
        ok: false,
        message: `${ADMIN_MESSAGE_TEMPLATE_COPY.prohibitedPhraseTitle} "${prohibited.phrase}" ${ADMIN_MESSAGE_TEMPLATE_COPY.prohibitedPhraseDetail}`,
      };
    }
    return {
      ok: false,
      message: `${ADMIN_MESSAGE_TEMPLATE_COPY.prohibitedPhraseTitle} "${prohibited.phrase}" — 저장 전 표현을 수정하거나 검수 필요 상태로만 유지하세요.`,
    };
  }

  const sensitive = scanFieldsForSensitiveVariables(scanTexts);
  if (sensitive) {
    return {
      ok: false,
      message: `${ADMIN_MESSAGE_TEMPLATE_COPY.sensitiveVariableTitle} (${sensitive.marker}) ${ADMIN_MESSAGE_TEMPLATE_COPY.sensitiveVariableDetail}`,
    };
  }

  return {
    ok: true,
    data: {
      title,
      description: descriptionRaw,
      body,
      category: category as MessageTemplateCategory,
      channel: channel as MessageTemplateChannel,
      audienceType: audienceType as MessageTemplateAudienceType,
      useCase,
      tone: tone as MessageTemplateTone,
      status,
      isPublished,
      isInternalOnly,
      riskLevel: riskLevel as MessageTemplateRiskLevel,
      safeCopy,
      forbiddenClaims,
      complianceNote,
      allowedVariables,
      sortOrder,
    },
  };
}

function publishTimestamp(
  isPublished: boolean,
  existingPublishedAt: Date | null,
): Date | null | undefined {
  if (!isPublished) return null;
  if (existingPublishedAt) return undefined;
  return new Date();
}

function reviewFields(
  status: MessageTemplateStatus,
  userId: string | null,
  existingReviewedAt: Date | null,
): { reviewedAt?: Date | null; reviewedById?: string | null } {
  if (status === MessageTemplateStatus.published) {
    return {
      reviewedAt: existingReviewedAt ?? new Date(),
      reviewedById: userId,
    };
  }
  if (
    status === MessageTemplateStatus.draft ||
    status === MessageTemplateStatus.needs_review
  ) {
    return { reviewedAt: null, reviewedById: null };
  }
  return {};
}

function applyContentChangeReviewPolicy(
  existing: {
    body: string;
    safeCopy: string | null;
    status: MessageTemplateStatus;
    isPublished: boolean;
  },
  data: ParsedMessageTemplate,
): ParsedMessageTemplate {
  const bodyChanged = data.body !== existing.body;
  const safeCopyChanged =
    (data.safeCopy ?? "") !== (existing.safeCopy ?? "");

  if (
    existing.isPublished &&
    existing.status === MessageTemplateStatus.published &&
    (bodyChanged || safeCopyChanged)
  ) {
    return {
      ...data,
      status: MessageTemplateStatus.needs_review,
      isPublished: false,
    };
  }

  return data;
}

export async function createMessageTemplate(formData: FormData) {
  let session: Awaited<ReturnType<typeof requireMessageTemplateContentManager>>;

  try {
    session = await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(`${ADMIN_PATH}/new`, error);
  }

  const parsed = await parseMessageTemplateForm(formData);
  if (!parsed.ok) {
    redirectWithError(`${ADMIN_PATH}/new`, parsed.message);
  }

  const userId = getSessionUserId(session);
  const { data } = parsed;
  const publishedAt = data.isPublished ? new Date() : null;
  const review = reviewFields(data.status, userId, null);

  try {
    await prisma.messageTemplate.create({
      data: {
        ...data,
        publishedAt,
        ...review,
        createdById: userId,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(`${ADMIN_PATH}/new`, "고객 안내 문구를 등록할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
  redirect(ADMIN_PATH);
}

export async function updateMessageTemplate(id: string, formData: FormData) {
  let session: Awaited<ReturnType<typeof requireMessageTemplateContentManager>>;
  const editPath = `${ADMIN_PATH}/${id}/edit`;

  try {
    session = await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(editPath, error);
  }

  const parsed = await parseMessageTemplateForm(formData);
  if (!parsed.ok) {
    redirectWithError(editPath, parsed.message);
  }

  const userId = getSessionUserId(session);
  let data = parsed.data;

  let existing: {
    body: string;
    safeCopy: string | null;
    status: MessageTemplateStatus;
    isPublished: boolean;
    publishedAt: Date | null;
    reviewedAt: Date | null;
  } | null;

  try {
    existing = await prisma.messageTemplate.findUnique({
      where: { id },
      select: {
        body: true,
        safeCopy: true,
        status: true,
        isPublished: true,
        publishedAt: true,
        reviewedAt: true,
      },
    });
  } catch {
    redirectWithError(editPath, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(editPath, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  data = applyContentChangeReviewPolicy(existing, data);

  const publishedAt = publishTimestamp(data.isPublished, existing.publishedAt);
  const review = reviewFields(data.status, userId, existing.reviewedAt);

  try {
    await prisma.messageTemplate.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        ...review,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(editPath, "고객 안내 문구를 수정할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
  redirect(ADMIN_PATH);
}

export async function setMessageTemplateStatus(
  id: string,
  status: MessageTemplateStatus,
) {
  let session: Awaited<ReturnType<typeof requireMessageTemplateContentManager>>;

  try {
    session = await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  if (!STATUS_VALUES.has(status)) {
    redirectWithError(ADMIN_PATH, "상태 값이 올바르지 않습니다.");
  }

  let existing: {
    isPublished: boolean;
    isInternalOnly: boolean;
    safeCopy: string | null;
    riskLevel: MessageTemplateRiskLevel;
    reviewedAt: Date | null;
  } | null;

  try {
    existing = await prisma.messageTemplate.findUnique({
      where: { id },
      select: {
        isPublished: true,
        isInternalOnly: true,
        safeCopy: true,
        riskLevel: true,
        reviewedAt: true,
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  if (wouldPublishBlocked({ isPublished: existing.isPublished, status })) {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.publishBlocked);
  }

  const publishError = validatePublishRules({
    isPublished: existing.isPublished,
    status,
    isInternalOnly: existing.isInternalOnly,
    safeCopy: existing.safeCopy,
    riskLevel: existing.riskLevel,
  });
  if (publishError) {
    redirectWithError(ADMIN_PATH, publishError);
  }

  const userId = getSessionUserId(session);
  const review = reviewFields(status, userId, existing.reviewedAt);

  try {
    await prisma.messageTemplate.update({
      where: { id },
      data: {
        status,
        ...review,
        ...(status === MessageTemplateStatus.archived
          ? { isPublished: false, publishedAt: null }
          : {}),
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, "상태를 변경할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
}

export async function setMessageTemplatePublished(
  id: string,
  isPublished: boolean,
) {
  let session: Awaited<ReturnType<typeof requireMessageTemplatePublisher>>;

  try {
    session = await requireMessageTemplatePublisher();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  let existing: {
    status: MessageTemplateStatus;
    isInternalOnly: boolean;
    safeCopy: string | null;
    riskLevel: MessageTemplateRiskLevel;
    publishedAt: Date | null;
    body: string;
    title: string;
    description: string;
  } | null;

  try {
    existing = await prisma.messageTemplate.findUnique({
      where: { id },
      select: {
        status: true,
        isInternalOnly: true,
        safeCopy: true,
        riskLevel: true,
        publishedAt: true,
        body: true,
        title: true,
        description: true,
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  const publishError = validatePublishRules({
    isPublished,
    status: existing.status,
    isInternalOnly: existing.isInternalOnly,
    safeCopy: existing.safeCopy,
    riskLevel: existing.riskLevel,
  });
  if (publishError) {
    redirectWithError(ADMIN_PATH, publishError);
  }

  if (isPublished) {
    const prohibited = scanFieldsForProhibitedPhrases({
      title: existing.title,
      description: existing.description,
      body: existing.body,
      safeCopy: existing.safeCopy,
    });
    if (prohibited) {
      redirectWithError(
        ADMIN_PATH,
        `${ADMIN_MESSAGE_TEMPLATE_COPY.prohibitedPhraseTitle} "${prohibited.phrase}"`,
      );
    }
  }

  const publishedAt = publishTimestamp(isPublished, existing.publishedAt);

  try {
    await prisma.messageTemplate.update({
      where: { id },
      data: {
        isPublished,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, "게시 상태를 변경할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
}

export async function archiveMessageTemplate(id: string) {
  let session: Awaited<ReturnType<typeof requireMessageTemplateContentManager>>;

  try {
    session = await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  try {
    await prisma.messageTemplate.update({
      where: { id },
      data: {
        status: MessageTemplateStatus.archived,
        isPublished: false,
        publishedAt: null,
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_MESSAGE_TEMPLATE_COPY.notFound);
  }

  revalidatePath(ADMIN_PATH);
}

function revalidateMessageTemplatePaths(): void {
  revalidatePath(ADMIN_PATH);
  revalidatePublicContentPaths();
}

async function runMessageTemplateBulk(
  actionId: AdminBulkActionId,
  ids: unknown,
  requirePublisher: boolean,
): Promise<BulkRunResponse> {
  let session: Awaited<ReturnType<typeof requireMessageTemplateContentManager>>;

  try {
    session = requirePublisher
      ? await requireMessageTemplatePublisher()
      : await requireMessageTemplateContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  const policy = getBulkActionPolicy(actionId);
  const result = await runMessageTemplateBulkByAction(
    actionId,
    ids,
    getSessionUserId(session),
  );

  if (result.ok && result.succeeded > 0) {
    revalidateMessageTemplatePaths();
  }

  if (!result.ok) return result;
  return { ...result, actionLabel: policy.resultSummaryLabel };
}

export async function executeMessageTemplateBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  if (actionId === "setPublishedTrue") {
    return runMessageTemplateBulk(actionId, ids, true);
  }
  if (
    actionId === "markNeedsReview" ||
    actionId === "markVerified" ||
    actionId === "setStatusDraft" ||
    actionId === "setPublishedFalse" ||
    actionId === "setInternalOnlyTrue" ||
    actionId === "setInternalOnlyFalse" ||
    actionId === "archive"
  ) {
    return runMessageTemplateBulk(actionId, ids, false);
  }
  return bulkRunError("이 고객문구 목록에서 지원하지 않는 일괄 작업입니다.");
}
