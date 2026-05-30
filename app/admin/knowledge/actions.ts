"use server";

import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
  Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  handleAdminUnauthorized,
  redirectWithError,
} from "@/lib/admin/actions";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import { getBulkActionPolicy } from "@/lib/admin/bulk-policies";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import { bulkRunError } from "@/lib/admin/bulk-run";
import { runKnowledgeBulkByAction } from "@/lib/admin/knowledge-bulk-actions";
import {
  importKnowledgeStarterDrafts,
  previewKnowledgeStarterDrafts,
  type StarterImportApplyResult,
  type StarterImportPreviewResult,
} from "@/lib/admin/knowledge-starter-import";
import {
  isValidSlug,
  parseCommaSeparatedList,
  scanFieldsForProhibitedPhrases,
  SLUG_MAX_LENGTH,
} from "@/lib/validators/knowledge-article";
import {
  getSessionUserId,
  requireKnowledgeContentManager,
  requireKnowledgePublisher,
} from "./access";
import { ADMIN_KNOWLEDGE_COPY, wouldPublishBlocked, WRITABLE_STATUSES } from "./visibility";

const CATEGORY_VALUES = new Set<string>(
  Object.values(KnowledgeArticleCategory) as string[],
);
const TYPE_VALUES = new Set<string>(Object.values(KnowledgeArticleType) as string[]);
const STATUS_VALUES = new Set<string>(WRITABLE_STATUSES as unknown as string[]);
const RISK_VALUES = new Set<string>(Object.values(KnowledgeRiskLevel) as string[]);
const SOURCE_TYPE_VALUES = new Set<string>(
  Object.values(KnowledgeSourceType) as string[],
);

const TITLE_MAX = 200;
const SUMMARY_MAX = 1_000;
const CONTENT_MAX = 50_000;
const SAFE_COPY_MAX = 10_000;
const WORKFLOW_LABEL_MAX = 120;
const SOURCE_TITLE_MAX = 200;

type FormError = { ok: false; message: string };
type ParsedArticle = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: KnowledgeArticleCategory;
  type: KnowledgeArticleType;
  riskLevel: KnowledgeRiskLevel;
  status: KnowledgeArticleStatus;
  isPublished: boolean;
  aiUsable: boolean;
  sourceType: KnowledgeSourceType;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceCheckedAt: Date | null;
  workflowLabel: string | null;
  tags: string[];
  safeCopy: string | null;
  forbiddenClaims: string[];
};

type ParseResult = { ok: true; data: ParsedArticle } | FormError;

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
  maxLength: number,
): FormError | string {
  const value = textValue(formData, key);
  if (!value) {
    return { ok: false, message: `${label}은(는) 필수입니다.` };
  }
  if (value.length > maxLength) {
    return { ok: false, message: `${label}은(는) ${maxLength}자 이하로 입력해 주세요.` };
  }
  return value;
}

function optionalText(
  formData: FormData,
  key: string,
  label: string,
  maxLength: number,
): FormError | string | null {
  const value = textValue(formData, key);
  if (!value) return null;
  if (value.length > maxLength) {
    return { ok: false, message: `${label}은(는) ${maxLength}자 이하로 입력해 주세요.` };
  }
  return value;
}

function optionalUrl(formData: FormData, key: string): FormError | string | null {
  const value = textValue(formData, key);
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, message: "출처 URL은 http 또는 https로 시작해야 합니다." };
    }
    return value;
  } catch {
    return { ok: false, message: "출처 URL 형식이 올바르지 않습니다." };
  }
}

function optionalDate(formData: FormData, key: string): FormError | Date | null {
  const value = textValue(formData, key);
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "출처 확인일 형식이 올바르지 않습니다." };
  }
  return date;
}

async function parseKnowledgeArticleForm(
  formData: FormData,
): Promise<ParseResult> {
  const title = requiredText(formData, "title", "제목", TITLE_MAX);
  if (typeof title !== "string") return title;

  const slug = requiredText(formData, "slug", "슬러그", SLUG_MAX_LENGTH);
  if (typeof slug !== "string") return slug;
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      message: `슬러그는 소문자, 숫자, 하이픈(-)만 사용하고 ${SLUG_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  const summary = requiredText(formData, "summary", "요약", SUMMARY_MAX);
  if (typeof summary !== "string") return summary;

  const content = requiredText(formData, "content", "본문", CONTENT_MAX);
  if (typeof content !== "string") return content;

  const category = textValue(formData, "category");
  if (!category || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "카테고리를 선택해 주세요." };
  }

  const type = textValue(formData, "type");
  if (!type || !TYPE_VALUES.has(type)) {
    return { ok: false, message: "문서 유형을 선택해 주세요." };
  }

  const riskLevelRaw = textValue(formData, "riskLevel") ?? KnowledgeRiskLevel.medium;
  if (!RISK_VALUES.has(riskLevelRaw)) {
    return { ok: false, message: "위험도가 올바르지 않습니다." };
  }

  const statusRaw = textValue(formData, "status") ?? KnowledgeArticleStatus.draft;
  if (!STATUS_VALUES.has(statusRaw)) {
    return { ok: false, message: "상태 값이 올바르지 않습니다." };
  }
  const status = statusRaw as KnowledgeArticleStatus;

  const sourceTypeRaw =
    textValue(formData, "sourceType") ?? KnowledgeSourceType.internal;
  if (!SOURCE_TYPE_VALUES.has(sourceTypeRaw)) {
    return { ok: false, message: "출처 유형이 올바르지 않습니다." };
  }

  const sourceTitle = optionalText(
    formData,
    "sourceTitle",
    "출처 제목",
    SOURCE_TITLE_MAX,
  );
  if (sourceTitle && typeof sourceTitle !== "string") return sourceTitle;

  const sourceUrl = optionalUrl(formData, "sourceUrl");
  if (sourceUrl && typeof sourceUrl !== "string") return sourceUrl;

  const sourceCheckedAt = optionalDate(formData, "sourceCheckedAt");
  if (sourceCheckedAt && !(sourceCheckedAt instanceof Date)) {
    return sourceCheckedAt;
  }

  const workflowLabel = optionalText(
    formData,
    "workflowLabel",
    "워크플로 라벨",
    WORKFLOW_LABEL_MAX,
  );
  if (workflowLabel && typeof workflowLabel !== "string") return workflowLabel;

  const safeCopy = optionalText(formData, "safeCopy", "안전 문구", SAFE_COPY_MAX);
  if (safeCopy && typeof safeCopy !== "string") return safeCopy;

  const tags = parseCommaSeparatedList(textValue(formData, "tags"));
  const forbiddenClaims = parseCommaSeparatedList(
    textValue(formData, "forbiddenClaims"),
  );

  const prohibited = scanFieldsForProhibitedPhrases({
    title,
    summary,
    content,
    safeCopy,
    workflowLabel,
    sourceTitle,
    tags: tags.join(" "),
    forbiddenClaims: forbiddenClaims.join(" "),
  });
  if (prohibited) {
    return {
      ok: false,
      message: `${ADMIN_KNOWLEDGE_COPY.prohibitedPhraseTitle} "${prohibited.phrase}" ${ADMIN_KNOWLEDGE_COPY.prohibitedPhraseDetail}`,
    };
  }

  const isPublished = formData.get("isPublished") === "on";
  const aiUsable = formData.get("aiUsable") === "on";

  if (wouldPublishBlocked({ isPublished, status })) {
    return { ok: false, message: ADMIN_KNOWLEDGE_COPY.draftPublishBlocked };
  }

  if (aiUsable && status !== KnowledgeArticleStatus.verified) {
    return { ok: false, message: ADMIN_KNOWLEDGE_COPY.aiUsableBlocked };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      summary,
      content,
      category: category as KnowledgeArticleCategory,
      type: type as KnowledgeArticleType,
      riskLevel: riskLevelRaw as KnowledgeRiskLevel,
      status,
      isPublished,
      aiUsable,
      sourceType: sourceTypeRaw as KnowledgeSourceType,
      sourceTitle,
      sourceUrl,
      sourceCheckedAt,
      workflowLabel,
      tags,
      safeCopy,
      forbiddenClaims,
    },
  };
}

function handleUnauthorized(path: string, error: unknown): never {
  handleAdminUnauthorized(path, error);
}

function handleKnownPrismaError(
  error: unknown,
  redirectPath: string,
  fallbackMessage: string,
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    redirectWithError(redirectPath, ADMIN_KNOWLEDGE_COPY.duplicateSlug);
  }
  redirectWithError(redirectPath, fallbackMessage);
}

function publishTimestamp(
  isPublished: boolean,
  existingPublishedAt: Date | null,
): Date | null | undefined {
  if (!isPublished) return null;
  if (existingPublishedAt) return undefined;
  return new Date();
}

export async function createKnowledgeArticle(formData: FormData) {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;

  try {
    session = await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge/new", error);
  }

  const parsed = await parseKnowledgeArticleForm(formData);
  if (!parsed.ok) {
    redirectWithError("/admin/knowledge/new", parsed.message);
  }

  const userId = getSessionUserId(session);
  const { data } = parsed;

  try {
    await prisma.knowledgeArticle.create({
      data: {
        ...data,
        publishedAt: data.isPublished ? new Date() : null,
        createdById: userId,
        updatedById: userId,
        reviewedById:
          data.status === KnowledgeArticleStatus.verified ? userId : null,
      },
    });
  } catch (error) {
    handleKnownPrismaError(
      error,
      "/admin/knowledge/new",
      "지식 문서를 생성할 수 없습니다.",
    );
  }

  revalidatePath("/admin/knowledge");
  redirect("/admin/knowledge");
}

export async function updateKnowledgeArticle(id: string, formData: FormData) {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;
  const editPath = `/admin/knowledge/${id}/edit`;

  try {
    session = await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized(editPath, error);
  }

  const parsed = await parseKnowledgeArticleForm(formData);
  if (!parsed.ok) {
    redirectWithError(editPath, parsed.message);
  }

  const userId = getSessionUserId(session);
  const { data } = parsed;

  let existing: { publishedAt: Date | null } | null;
  try {
    existing = await prisma.knowledgeArticle.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
  } catch {
    redirectWithError(editPath, ADMIN_KNOWLEDGE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError(editPath, ADMIN_KNOWLEDGE_COPY.notFound);
  }

  const publishedAt = publishTimestamp(data.isPublished, existing.publishedAt);

  try {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        updatedById: userId,
        reviewedById:
          data.status === KnowledgeArticleStatus.verified ? userId : null,
      },
    });
  } catch (error) {
    handleKnownPrismaError(error, editPath, "지식 문서를 수정할 수 없습니다.");
  }

  revalidatePath("/admin/knowledge");
  redirect("/admin/knowledge");
}

export async function setKnowledgeArticleStatus(
  id: string,
  status: KnowledgeArticleStatus,
) {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;

  try {
    session = await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  if (!STATUS_VALUES.has(status)) {
    redirectWithError("/admin/knowledge", "상태 값이 올바르지 않습니다.");
  }

  let existing: {
    isPublished: boolean;
    status: KnowledgeArticleStatus;
  } | null;

  try {
    existing = await prisma.knowledgeArticle.findUnique({
      where: { id },
      select: { isPublished: true, status: true },
    });
  } catch {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.notFound);
  }

  if (wouldPublishBlocked({ isPublished: existing.isPublished, status })) {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.draftPublishBlocked);
  }

  const userId = getSessionUserId(session);

  try {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        status,
        updatedById: userId,
        reviewedById:
          status === KnowledgeArticleStatus.verified ? userId : null,
        ...(status !== KnowledgeArticleStatus.verified
          ? { aiUsable: false }
          : {}),
      },
    });
  } catch {
    redirectWithError("/admin/knowledge", "상태를 변경할 수 없습니다.");
  }

  revalidatePath("/admin/knowledge");
}

export async function setKnowledgeArticlePublished(
  id: string,
  isPublished: boolean,
) {
  let session: Awaited<ReturnType<typeof requireKnowledgePublisher>>;

  try {
    session = await requireKnowledgePublisher();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  let existing: {
    status: KnowledgeArticleStatus;
    publishedAt: Date | null;
  } | null;

  try {
    existing = await prisma.knowledgeArticle.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });
  } catch {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.notFound);
  }

  if (!existing) {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.notFound);
  }

  if (wouldPublishBlocked({ isPublished, status: existing.status })) {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.draftPublishBlocked);
  }

  const publishedAt = publishTimestamp(isPublished, existing.publishedAt);

  try {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        isPublished,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError("/admin/knowledge", "게시 상태를 변경할 수 없습니다.");
  }

  revalidatePath("/admin/knowledge");
}

export async function archiveKnowledgeArticle(id: string) {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;

  try {
    session = await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  try {
    await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        status: KnowledgeArticleStatus.archived,
        isPublished: false,
        aiUsable: false,
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError("/admin/knowledge", ADMIN_KNOWLEDGE_COPY.notFound);
  }

  revalidatePath("/admin/knowledge");
}

function revalidateKnowledgePaths(): void {
  revalidatePath("/admin/knowledge");
  revalidatePath("/knowledge");
}

export async function previewKnowledgeStarterDraftsAction(): Promise<
  StarterImportPreviewResult | { ok: false; message: string }
> {
  try {
    await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  return previewKnowledgeStarterDrafts();
}

export async function importKnowledgeStarterDraftsAction(): Promise<
  StarterImportApplyResult | { ok: false; message: string }
> {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;

  try {
    session = await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  const result = await importKnowledgeStarterDrafts(getSessionUserId(session));

  if (result.ok && result.created > 0) {
    revalidateKnowledgePaths();
  }

  return result;
}

async function runKnowledgeBulk(
  actionId: AdminBulkActionId,
  ids: unknown,
  requirePublisher: boolean,
): Promise<BulkRunResponse> {
  let session: Awaited<ReturnType<typeof requireKnowledgeContentManager>>;

  try {
    session = requirePublisher
      ? await requireKnowledgePublisher()
      : await requireKnowledgeContentManager();
  } catch (error) {
    handleUnauthorized("/admin/knowledge", error);
  }

  const policy = getBulkActionPolicy(actionId);
  const result = await runKnowledgeBulkByAction(
    actionId,
    ids,
    getSessionUserId(session),
  );

  if (result.ok && (result.succeeded > 0 || result.skipped > 0)) {
    revalidateKnowledgePaths();
  }

  if (!result.ok) return result;
  return { ...result, actionLabel: policy.resultSummaryLabel };
}

export async function bulkMarkKnowledgeNeedsReview(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runKnowledgeBulk("markNeedsReview", ids, false);
}

export async function bulkMarkKnowledgeVerified(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runKnowledgeBulk("markVerified", ids, false);
}

export async function bulkSetKnowledgePublished(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runKnowledgeBulk("setPublishedTrue", ids, true);
}

export async function bulkSetKnowledgeUnpublished(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runKnowledgeBulk("setPublishedFalse", ids, false);
}

export async function bulkArchiveKnowledgeArticles(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runKnowledgeBulk("archive", ids, false);
}

export async function executeKnowledgeBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return bulkMarkKnowledgeNeedsReview(ids);
  }
  if (actionId === "markVerified") {
    return bulkMarkKnowledgeVerified(ids);
  }
  if (actionId === "setPublishedTrue") {
    return bulkSetKnowledgePublished(ids);
  }
  if (actionId === "setPublishedFalse") {
    return bulkSetKnowledgeUnpublished(ids);
  }
  if (actionId === "archive") {
    return bulkArchiveKnowledgeArticles(ids);
  }
  return bulkRunError("이 지식 아카이브 목록에서 지원하지 않는 일괄 작업입니다.");
}
