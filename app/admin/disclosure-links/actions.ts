"use server";

import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
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
import { runDisclosureLinkBulkByAction } from "@/lib/admin/disclosure-link-bulk-actions";
import {
  ADMIN_MEMO_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  SOURCE_NAME_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  clampSortOrder,
  isValidAdminUrl,
  scanFieldsForProhibitedPhrases,
} from "@/lib/validators/disclosure-link";
import {
  getSessionUserId,
  requireDisclosureLinkContentManager,
  requireDisclosureLinkPublisher,
} from "./access";
import {
  ADMIN_DISCLOSURE_COPY,
  WRITABLE_STATUSES,
  wouldPublishBlocked,
} from "./visibility";

const ADMIN_PATH = "/admin/disclosure-links";

const CATEGORY_VALUES = new Set<string>(
  Object.values(DisclosureLinkCategory) as string[],
);
const TARGET_TYPE_VALUES = new Set<string>(
  Object.values(DisclosureLinkTargetType) as string[],
);
const STATUS_VALUES = new Set<string>(WRITABLE_STATUSES as unknown as string[]);

type FormError = { ok: false; message: string };
type ParsedDisclosureLink = {
  title: string;
  description: string;
  url: string;
  category: DisclosureLinkCategory;
  targetType: DisclosureLinkTargetType;
  insurerId: string | null;
  status: DisclosureLinkStatus;
  isPublished: boolean;
  sourceName: string | null;
  isOfficialSource: boolean;
  lastVerifiedAt: Date | null;
  sortOrder: number;
  adminMemo: string | null;
};

type ParseResult = { ok: true; data: ParsedDisclosureLink } | FormError;

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

function optionalDate(formData: FormData, key: string): FormError | Date | null {
  const value = textValue(formData, key);
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "날짜 형식이 올바르지 않습니다." };
  }
  return date;
}

function parseSortOrder(formData: FormData): FormError | number {
  const raw = textValue(formData, "sortOrder") ?? "0";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return { ok: false, message: "정렬 순서는 숫자여야 합니다." };
  }
  return clampSortOrder(parsed);
}

async function parseDisclosureLinkForm(
  formData: FormData,
): Promise<ParseResult> {
  const title = requiredText(formData, "title", "제목", TITLE_MAX_LENGTH);
  if (typeof title !== "string") return title;

  const description = requiredText(
    formData,
    "description",
    "설명",
    DESCRIPTION_MAX_LENGTH,
  );
  if (typeof description !== "string") return description;

  const urlRaw = requiredText(formData, "url", "URL", 2_048);
  if (typeof urlRaw !== "string") return urlRaw;
  if (!isValidAdminUrl(urlRaw)) {
    return {
      ok: false,
      message: "URL은 http:// 또는 https://로 시작해야 하며, 안전하지 않은 프로토콜은 사용할 수 없습니다.",
    };
  }

  const category = textValue(formData, "category");
  if (!category || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "카테고리를 선택해 주세요." };
  }

  const targetType = textValue(formData, "targetType");
  if (!targetType || !TARGET_TYPE_VALUES.has(targetType)) {
    return { ok: false, message: "대상 유형을 선택해 주세요." };
  }

  const statusRaw = textValue(formData, "status") ?? DisclosureLinkStatus.draft;
  if (!STATUS_VALUES.has(statusRaw)) {
    return { ok: false, message: "상태 값이 올바르지 않습니다." };
  }
  const status = statusRaw as DisclosureLinkStatus;

  const insurerId = textValue(formData, "insurerId");
  if (targetType === DisclosureLinkTargetType.insurer && !insurerId) {
    return { ok: false, message: ADMIN_DISCLOSURE_COPY.insurerRequired };
  }

  const sourceName = optionalText(
    formData,
    "sourceName",
    "출처명",
    SOURCE_NAME_MAX_LENGTH,
  );
  if (sourceName && typeof sourceName !== "string") return sourceName;

  const adminMemo = optionalText(
    formData,
    "adminMemo",
    "관리자 메모",
    ADMIN_MEMO_MAX_LENGTH,
  );
  if (adminMemo && typeof adminMemo !== "string") return adminMemo;

  const lastVerifiedAt = optionalDate(formData, "lastVerifiedAt");
  if (lastVerifiedAt && !(lastVerifiedAt instanceof Date)) {
    return lastVerifiedAt;
  }

  const sortOrder = parseSortOrder(formData);
  if (typeof sortOrder !== "number") return sortOrder;

  const isPublished = formData.get("isPublished") === "on";
  const isOfficialSource = formData.get("isOfficialSource") === "on";

  if (wouldPublishBlocked({ isPublished, status })) {
    return { ok: false, message: ADMIN_DISCLOSURE_COPY.publishBlocked };
  }

  const prohibited = scanFieldsForProhibitedPhrases({
    title,
    description,
    sourceName,
    adminMemo,
  });
  if (prohibited) {
    return {
      ok: false,
      message: `${ADMIN_DISCLOSURE_COPY.prohibitedPhraseTitle} "${prohibited.phrase}" ${ADMIN_DISCLOSURE_COPY.prohibitedPhraseDetail}`,
    };
  }

  return {
    ok: true,
    data: {
      title,
      description,
      url: urlRaw,
      category: category as DisclosureLinkCategory,
      targetType: targetType as DisclosureLinkTargetType,
      insurerId:
        targetType === DisclosureLinkTargetType.insurer ? insurerId : null,
      status,
      isPublished,
      sourceName,
      isOfficialSource,
      lastVerifiedAt,
      sortOrder,
      adminMemo,
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
  status: DisclosureLinkStatus,
  userId: string | null,
  existingReviewedAt: Date | null,
): { reviewedAt?: Date | null; reviewedById?: string | null } {
  if (status === DisclosureLinkStatus.published) {
    return {
      reviewedAt: existingReviewedAt ?? new Date(),
      reviewedById: userId,
    };
  }
  if (
    status === DisclosureLinkStatus.draft ||
    status === DisclosureLinkStatus.needs_review
  ) {
    return { reviewedAt: null, reviewedById: null };
  }
  return {};
}

export async function createDisclosureLink(formData: FormData) {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkContentManager>>;

  try {
    session = await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(`${ADMIN_PATH}/new`, error);
  }

  const parsed = await parseDisclosureLinkForm(formData);
  if (!parsed.ok) {
    redirectWithError(`${ADMIN_PATH}/new`, parsed.message);
  }

  const userId = getSessionUserId(session);
  const { data } = parsed;
  const publishedAt = data.isPublished ? new Date() : null;
  const review = reviewFields(data.status, userId, null);

  try {
    await prisma.disclosureLink.create({
      data: {
        ...data,
        publishedAt,
        ...review,
        createdById: userId,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(`${ADMIN_PATH}/new`, "공시·약관 링크를 등록할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
  redirect(ADMIN_PATH);
}

export async function updateDisclosureLink(id: string, formData: FormData) {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkContentManager>>;
  const editPath = `${ADMIN_PATH}/${id}/edit`;

  try {
    session = await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(editPath, error);
  }

  const parsed = await parseDisclosureLinkForm(formData);
  if (!parsed.ok) {
    redirectWithError(editPath, parsed.message);
  }

  const userId = getSessionUserId(session);
  const { data } = parsed;

  let existing: {
    publishedAt: Date | null;
    reviewedAt: Date | null;
  } | null;

  try {
    existing = await prisma.disclosureLink.findUnique({
      where: { id },
      select: { publishedAt: true, reviewedAt: true },
    });
  } catch {
    redirectWithError(editPath, ADMIN_DISCLOSURE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(editPath, ADMIN_DISCLOSURE_COPY.notFound);
  }

  const publishedAt = publishTimestamp(data.isPublished, existing.publishedAt);
  const review = reviewFields(data.status, userId, existing.reviewedAt);

  try {
    await prisma.disclosureLink.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        ...review,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(editPath, "공시·약관 링크를 수정할 수 없습니다.");
  }

  revalidatePath(ADMIN_PATH);
  redirect(ADMIN_PATH);
}

export async function setDisclosureLinkStatus(
  id: string,
  status: DisclosureLinkStatus,
) {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkContentManager>>;

  try {
    session = await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  if (!STATUS_VALUES.has(status)) {
    redirectWithError(ADMIN_PATH, "상태 값이 올바르지 않습니다.");
  }

  let existing: {
    isPublished: boolean;
    reviewedAt: Date | null;
  } | null;

  try {
    existing = await prisma.disclosureLink.findUnique({
      where: { id },
      select: { isPublished: true, reviewedAt: true },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.notFound);
  }

  if (wouldPublishBlocked({ isPublished: existing.isPublished, status })) {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.publishBlocked);
  }

  const userId = getSessionUserId(session);
  const review = reviewFields(status, userId, existing.reviewedAt);

  try {
    await prisma.disclosureLink.update({
      where: { id },
      data: {
        status,
        ...review,
        ...(status === DisclosureLinkStatus.archived
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

export async function setDisclosureLinkPublished(
  id: string,
  isPublished: boolean,
) {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkPublisher>>;

  try {
    session = await requireDisclosureLinkPublisher();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  let existing: {
    status: DisclosureLinkStatus;
    publishedAt: Date | null;
  } | null;

  try {
    existing = await prisma.disclosureLink.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.notFound);
  }

  if (wouldPublishBlocked({ isPublished, status: existing.status })) {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.publishBlocked);
  }

  const publishedAt = publishTimestamp(isPublished, existing.publishedAt);

  try {
    await prisma.disclosureLink.update({
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

export async function archiveDisclosureLink(id: string) {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkContentManager>>;

  try {
    session = await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  try {
    await prisma.disclosureLink.update({
      where: { id },
      data: {
        status: DisclosureLinkStatus.archived,
        isPublished: false,
        publishedAt: null,
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError(ADMIN_PATH, ADMIN_DISCLOSURE_COPY.notFound);
  }

  revalidatePath(ADMIN_PATH);
}

function revalidateDisclosurePaths(): void {
  revalidatePath(ADMIN_PATH);
  revalidatePublicContentPaths();
}

async function runDisclosureLinkBulk(
  actionId: AdminBulkActionId,
  ids: unknown,
  requirePublisher: boolean,
): Promise<BulkRunResponse> {
  let session: Awaited<ReturnType<typeof requireDisclosureLinkContentManager>>;

  try {
    session = requirePublisher
      ? await requireDisclosureLinkPublisher()
      : await requireDisclosureLinkContentManager();
  } catch (error) {
    handleAdminUnauthorized(ADMIN_PATH, error);
  }

  const policy = getBulkActionPolicy(actionId);
  const result = await runDisclosureLinkBulkByAction(
    actionId,
    ids,
    getSessionUserId(session),
  );

  if (result.ok && result.succeeded > 0) {
    revalidateDisclosurePaths();
  }

  if (!result.ok) return result;
  return { ...result, actionLabel: policy.resultSummaryLabel };
}

export async function executeDisclosureLinkBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  if (actionId === "setPublishedTrue") {
    return runDisclosureLinkBulk(actionId, ids, true);
  }
  if (
    actionId === "markNeedsReview" ||
    actionId === "markVerified" ||
    actionId === "setStatusDraft" ||
    actionId === "setPublishedFalse" ||
    actionId === "archive"
  ) {
    return runDisclosureLinkBulk(actionId, ids, false);
  }
  return bulkRunError("이 공시·약관 목록에서 지원하지 않는 일괄 작업입니다.");
}
