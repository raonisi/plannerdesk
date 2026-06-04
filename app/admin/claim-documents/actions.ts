"use server";

import {
  ClaimDocumentCategory,
  Prisma,
  VerificationStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  handleAdminUnauthorized,
  redirectWithError,
  revalidatePublicContentPaths,
} from "@/lib/admin/actions";
import {
  SLUG_MAX_LENGTH,
  isValidSlug,
  scanFieldsForProhibitedPhrases,
} from "@/lib/validators/claim-document";
import {
  getSessionUserId,
  requireClaimDocumentContentManager,
  requireClaimDocumentPublisher,
} from "./access";
import { ADMIN_CLAIM_DOC_COPY, wouldPublishDraft } from "./visibility";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import {
  getBulkActionPolicy,
  validateServerBulkAction,
} from "@/lib/admin/bulk-policies";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import { bulkRunError } from "@/lib/admin/bulk-run";
import { runClaimDocumentBulkByAction } from "@/lib/admin/bulk-verification-actions";

const CATEGORY_VALUES = new Set<string>(
  Object.values(ClaimDocumentCategory) as string[],
);

// The admin form only offers draft / needs_review / verified for editorial
// content. unverified / pending exist on the shared VerificationStatus enum
// because of the User model and are deliberately excluded from the writable
// set here, mirroring the Insurer admin behavior added in PR-26 / PR-33.
const VERIFICATION_STATUS_VALUES = new Set<string>([
  VerificationStatus.draft,
  VerificationStatus.needs_review,
  VerificationStatus.verified,
]);

// Conservative bounds. PlannerDesk does not need extreme ordering values
// for the admin-managed claim document library. The clamp protects the
// column and the UI from accidental scientific-notation pastes.
const SORT_ORDER_MIN = -10_000;
const SORT_ORDER_MAX = 10_000;

// Hard text caps so a paste-from-PDF accident cannot create a row that
// will not fit on the admin page or the public surface. These caps are also
// the contract that PR-39 will rely on when rendering the public surface.
const TITLE_MAX_LENGTH = 200;
const SUMMARY_MAX_LENGTH = 1_000;
const LIST_MAX_LENGTH = 4_000;
const TEMPLATE_MAX_LENGTH = 2_000;
const NOTE_MAX_LENGTH = 1_000;

type FormError = { ok: false; message: string };
type ParsedClaimDocument = {
  title: string;
  slug: string;
  category: ClaimDocumentCategory;
  insurerId: string | null;
  summary: string | null;
  requiredDocuments: string | null;
  optionalDocuments: string | null;
  claimFormUrl: string | null;
  officialSourceUrl: string | null;
  customerMessageTemplate: string | null;
  cautionNote: string | null;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: Date | null;
  isPublished: boolean;
  sortOrder: number;
};
type ParseResult = { ok: true; data: ParsedClaimDocument } | FormError;

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
    return { ok: false, message: `${label} is required.` };
  }
  if (value.length > max) {
    return {
      ok: false,
      message: `${label} must be ${max} characters or fewer.`,
    };
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
    return {
      ok: false,
      message: `${label} must be ${max} characters or fewer.`,
    };
  }
  return value;
}

function optionalUrl(
  formData: FormData,
  key: string,
): FormError | string | null {
  const value = textValue(formData, key);
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        ok: false,
        message: "URLs must start with http:// or https://.",
      };
    }
    return url.toString();
  } catch {
    return { ok: false, message: "Please enter a valid URL." };
  }
}

function optionalDate(
  formData: FormData,
  key: string,
): FormError | Date | null {
  const value = textValue(formData, key);
  if (!value) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return {
      ok: false,
      message: "Last verified date must use YYYY-MM-DD format.",
    };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "Last verified date is invalid." };
  }

  return date;
}

function optionalSortOrder(
  formData: FormData,
  key: string,
): FormError | number {
  const value = textValue(formData, key);
  if (!value) return 0;

  const parsed = Number.parseInt(value, 10);
  if (
    !Number.isInteger(parsed) ||
    !Number.isSafeInteger(parsed) ||
    parsed < SORT_ORDER_MIN ||
    parsed > SORT_ORDER_MAX
  ) {
    return {
      ok: false,
      message: `정렬 순서(sortOrder)는 ${SORT_ORDER_MIN}~${SORT_ORDER_MAX} 범위의 정수여야 합니다.`,
    };
  }

  return parsed;
}

async function parseClaimDocumentForm(
  formData: FormData,
): Promise<ParseResult> {
  const title = requiredText(formData, "title", "Title", TITLE_MAX_LENGTH);
  if (typeof title !== "string") return title;

  const slugRaw = textValue(formData, "slug");
  if (!slugRaw) {
    return { ok: false, message: "Slug is required." };
  }
  const slug = slugRaw.toLowerCase();
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      message: `슬러그는 소문자, 숫자, 하이픈(-) 만 사용하고 ${SLUG_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  const category = textValue(formData, "category");
  if (!category || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "Category is required." };
  }

  const insurerIdRaw = textValue(formData, "insurerId");
  let insurerId: string | null = null;
  if (insurerIdRaw && insurerIdRaw !== "none") {
    // The Insurer relation is optional. When provided, confirm the record
    // exists so we cannot orphan the FK at write time. PR-37 declared
    // ON DELETE SET NULL so a later delete of the Insurer will not break
    // ClaimDocument rows; we still verify on create/update to surface a
    // clear error to the operator.
    let existing: { id: string } | null = null;
    try {
      existing = await prisma.insurer.findUnique({
        where: { id: insurerIdRaw },
        select: { id: true },
      });
    } catch {
      return { ok: false, message: ADMIN_CLAIM_DOC_COPY.insurerNotFound };
    }
    if (!existing) {
      return { ok: false, message: ADMIN_CLAIM_DOC_COPY.insurerNotFound };
    }
    insurerId = existing.id;
  }

  const summary = optionalText(formData, "summary", "Summary", SUMMARY_MAX_LENGTH);
  if (summary && typeof summary !== "string") return summary;

  const requiredDocuments = optionalText(
    formData,
    "requiredDocuments",
    "Required documents",
    LIST_MAX_LENGTH,
  );
  if (requiredDocuments && typeof requiredDocuments !== "string") {
    return requiredDocuments;
  }

  const optionalDocuments = optionalText(
    formData,
    "optionalDocuments",
    "Optional documents",
    LIST_MAX_LENGTH,
  );
  if (optionalDocuments && typeof optionalDocuments !== "string") {
    return optionalDocuments;
  }

  const claimFormUrl = optionalUrl(formData, "claimFormUrl");
  if (claimFormUrl && typeof claimFormUrl !== "string") return claimFormUrl;

  const officialSourceUrl = optionalUrl(formData, "officialSourceUrl");
  if (officialSourceUrl && typeof officialSourceUrl !== "string") {
    return officialSourceUrl;
  }

  const customerMessageTemplate = optionalText(
    formData,
    "customerMessageTemplate",
    "Customer message template",
    TEMPLATE_MAX_LENGTH,
  );
  if (customerMessageTemplate && typeof customerMessageTemplate !== "string") {
    return customerMessageTemplate;
  }

  const cautionNote = optionalText(
    formData,
    "cautionNote",
    "Caution note",
    NOTE_MAX_LENGTH,
  );
  if (cautionNote && typeof cautionNote !== "string") return cautionNote;

  // Deny-list scan. The set of fields below is the public-facing payload;
  // admin-only governance fields (createdById, updatedById, lastVerifiedAt,
  // sortOrder) are intentionally not scanned because they cannot be used to
  // smuggle claim-outcome copy.
  const prohibited = scanFieldsForProhibitedPhrases({
    title,
    summary,
    requiredDocuments,
    optionalDocuments,
    customerMessageTemplate,
    cautionNote,
  });
  if (prohibited) {
    return {
      ok: false,
      message: `${ADMIN_CLAIM_DOC_COPY.prohibitedPhraseTitle} "${prohibited.phrase}" ${ADMIN_CLAIM_DOC_COPY.prohibitedPhraseDetail}`,
    };
  }

  const verificationStatusRaw =
    textValue(formData, "verificationStatus") ?? VerificationStatus.draft;
  if (!VERIFICATION_STATUS_VALUES.has(verificationStatusRaw)) {
    return { ok: false, message: "Verification status is invalid." };
  }
  const verificationStatus = verificationStatusRaw as VerificationStatus;

  const lastVerifiedAt = optionalDate(formData, "lastVerifiedAt");
  if (lastVerifiedAt && !(lastVerifiedAt instanceof Date)) {
    return lastVerifiedAt;
  }

  const sortOrder = optionalSortOrder(formData, "sortOrder");
  if (typeof sortOrder !== "number") return sortOrder;

  const isPublished = formData.get("isPublished") === "on";

  // Draft + published is forbidden. Reject before touching the DB so an
  // operator cannot accidentally surface unreviewed claim guidance, even if
  // the client UI was somehow bypassed.
  if (wouldPublishDraft({ isPublished, verificationStatus })) {
    return { ok: false, message: ADMIN_CLAIM_DOC_COPY.draftPublishBlocked };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      category: category as ClaimDocumentCategory,
      insurerId,
      summary,
      requiredDocuments,
      optionalDocuments,
      claimFormUrl,
      officialSourceUrl,
      customerMessageTemplate,
      cautionNote,
      verificationStatus,
      lastVerifiedAt,
      isPublished,
      sortOrder,
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
    redirectWithError(redirectPath, ADMIN_CLAIM_DOC_COPY.duplicateSlug);
  }
  redirectWithError(redirectPath, fallbackMessage);
}

export async function createClaimDocument(formData: FormData) {
  let session: Awaited<ReturnType<typeof requireClaimDocumentContentManager>>;

  try {
    session = await requireClaimDocumentContentManager();
  } catch (error) {
    handleUnauthorized("/admin/claim-documents/new", error);
  }

  const parsed = await parseClaimDocumentForm(formData);
  if (!parsed.ok) {
    redirectWithError("/admin/claim-documents/new", parsed.message);
  }

  const userId = getSessionUserId(session);

  try {
    await prisma.claimDocument.create({
      data: {
        ...parsed.data,
        createdById: userId,
        updatedById: userId,
      },
    });
  } catch (error) {
    handleKnownPrismaError(
      error,
      "/admin/claim-documents/new",
      "Unable to create claim document record.",
    );
  }

  revalidatePath("/admin/claim-documents");
  revalidatePublicContentPaths();
  redirect("/admin/claim-documents");
}

export async function updateClaimDocument(id: string, formData: FormData) {
  let session: Awaited<ReturnType<typeof requireClaimDocumentContentManager>>;
  const editPath = `/admin/claim-documents/${id}/edit`;

  try {
    session = await requireClaimDocumentContentManager();
  } catch (error) {
    handleUnauthorized(editPath, error);
  }

  const parsed = await parseClaimDocumentForm(formData);
  if (!parsed.ok) {
    redirectWithError(editPath, parsed.message);
  }

  const userId = getSessionUserId(session);

  try {
    await prisma.claimDocument.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedById: userId,
      },
    });
  } catch (error) {
    handleKnownPrismaError(
      error,
      editPath,
      "Unable to update claim document record.",
    );
  }

  revalidatePath("/admin/claim-documents");
  revalidatePublicContentPaths();
  redirect("/admin/claim-documents");
}

// publish / unpublish is a one-shot toggle. We re-read the current
// verificationStatus before allowing the publish direction so an outdated
// list page (or a hand-crafted POST) cannot smuggle a draft record to the
// public surface. This is the authoritative server-side guard; the list UI
// also disables the affordance early.
export async function setClaimDocumentPublished(
  id: string,
  isPublished: boolean,
) {
  let session: Awaited<ReturnType<typeof requireClaimDocumentPublisher>>;

  try {
    session = await requireClaimDocumentPublisher();
  } catch (error) {
    handleUnauthorized("/admin/claim-documents", error);
  }

  if (isPublished) {
    let existing: { verificationStatus: VerificationStatus } | null;
    try {
      existing = await prisma.claimDocument.findUnique({
        where: { id },
        select: { verificationStatus: true },
      });
    } catch {
      redirectWithError(
        "/admin/claim-documents",
        "Unable to update publication state.",
      );
    }

    if (!existing) {
      redirectWithError("/admin/claim-documents", ADMIN_CLAIM_DOC_COPY.notFound);
    }

    if (existing.verificationStatus === VerificationStatus.draft) {
      redirectWithError(
        "/admin/claim-documents",
        ADMIN_CLAIM_DOC_COPY.draftPublishBlocked,
      );
    }
  }

  try {
    await prisma.claimDocument.update({
      where: { id },
      data: {
        isPublished,
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError(
      "/admin/claim-documents",
      "Unable to update publication state.",
    );
  }

  revalidatePath("/admin/claim-documents");
  revalidatePublicContentPaths();
}

async function runClaimDocumentBulk(
  actionId: AdminBulkActionId,
  ids: unknown,
  requirePublisher: boolean,
): Promise<BulkRunResponse> {
  let session: Awaited<ReturnType<typeof requireClaimDocumentContentManager>>;

  try {
    session = requirePublisher
      ? await requireClaimDocumentPublisher()
      : await requireClaimDocumentContentManager();
  } catch (error) {
    handleUnauthorized("/admin/claim-documents", error);
  }

  const blocked = validateServerBulkAction("claimDocuments", actionId);
  if (blocked) return blocked;

  const policy = getBulkActionPolicy(actionId);
  const result = await runClaimDocumentBulkByAction(
    actionId,
    ids,
    getSessionUserId(session),
  );

  if (result.ok && (result.succeeded > 0 || result.skipped > 0)) {
    revalidatePath("/admin/claim-documents");
    revalidatePublicContentPaths();
  }

  if (!result.ok) return result;
  return { ...result, actionLabel: policy.resultSummaryLabel };
}

export async function bulkMarkClaimDocumentsNeedsReview(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runClaimDocumentBulk("markNeedsReview", ids, false);
}

export async function bulkMarkClaimDocumentsVerified(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runClaimDocumentBulk("markVerified", ids, false);
}

export async function bulkSetClaimDocumentsPublished(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runClaimDocumentBulk("setPublishedTrue", ids, true);
}

export async function bulkSetClaimDocumentsUnpublished(
  ids: unknown,
): Promise<BulkRunResponse> {
  return runClaimDocumentBulk("setPublishedFalse", ids, false);
}

/** Archive is not on ClaimDocument schema; maps to bulk unpublish (공개 제외). */
export async function bulkArchiveClaimDocuments(
  ids: unknown,
): Promise<BulkRunResponse> {
  return bulkSetClaimDocumentsUnpublished(ids);
}

export async function executeClaimDocumentBulkAction(
  actionId: AdminBulkActionId,
  ids: unknown,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return bulkMarkClaimDocumentsNeedsReview(ids);
  }
  if (actionId === "markVerified") {
    return bulkMarkClaimDocumentsVerified(ids);
  }
  if (actionId === "setPublishedTrue") {
    return bulkSetClaimDocumentsPublished(ids);
  }
  if (actionId === "setPublishedFalse" || actionId === "archive") {
    return bulkSetClaimDocumentsUnpublished(ids);
  }
  return bulkRunError("이 청구서류 목록에서 지원하지 않는 일괄 작업입니다.");
}
