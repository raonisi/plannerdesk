"use server";

import {
  CardPaymentStatus,
  ClaimFaxHandlingType,
  InsurerCategory,
  VerificationStatus,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getSessionUserId,
  requireInsurerContentManager,
  requireInsurerPublisher,
} from "./access";

const CATEGORY_VALUES = new Set<string>([
  InsurerCategory.life,
  InsurerCategory.non_life,
]);

const VERIFICATION_STATUS_VALUES = new Set<string>([
  VerificationStatus.draft,
  VerificationStatus.needs_review,
  VerificationStatus.verified,
]);

const CARD_PAYMENT_STATUS_VALUES = new Set<string>([
  CardPaymentStatus.available,
  CardPaymentStatus.unavailable,
  CardPaymentStatus.conditional,
  CardPaymentStatus.unknown,
]);

const CLAIM_FAX_HANDLING_TYPE_VALUES = new Set<string>([
  ClaimFaxHandlingType.fax,
  ClaimFaxHandlingType.call_center_individual,
  ClaimFaxHandlingType.unavailable,
  ClaimFaxHandlingType.unknown,
]);

// Conservative bounds: PlannerDesk does not need extreme ordering values for the
// admin-managed insurer directory. The clamp protects the DB column and the UI
// from accidental scientific-notation pastes.
const SORT_ORDER_MIN = -10_000;
const SORT_ORDER_MAX = 10_000;

type FormError = { ok: false; message: string };
type FormResult =
  | { ok: true; data: Prisma.InsurerUncheckedCreateInput }
  | FormError;

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
): FormError | string {
  const value = textValue(formData, key);
  if (!value) {
    return { ok: false, message: `${label} is required.` };
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
      return { ok: false, message: "URLs must start with http:// or https://." };
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
    return { ok: false, message: "Last verified date must use YYYY-MM-DD format." };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "Last verified date is invalid." };
  }

  return date;
}

// Nullable booleans render as a three-state select (확인 필요 / 가능 / 해당사항 없음).
// Anything outside the known string set is treated as "unknown" (null) so an
// invalid value cannot accidentally publish a definitive yes/no.
function tristateBoolean(formData: FormData, key: string): boolean | null {
  const raw = formData.get(key);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
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
      message: `\uc815\ub82c \uc21c\uc11c(sortOrder)\ub294 ${SORT_ORDER_MIN}~${SORT_ORDER_MAX} \ubc94\uc704\uc758 \uc815\uc218\uc5ec\uc57c \ud569\ub2c8\ub2e4.`,
    };
  }

  return parsed;
}

function parseInsurerForm(formData: FormData): FormResult {
  const name = requiredText(formData, "name", "Name");
  if (typeof name !== "string") return name;

  const category = textValue(formData, "category");
  if (!category || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "Category is required." };
  }

  const verificationStatus =
    textValue(formData, "verificationStatus") ?? VerificationStatus.draft;
  if (!VERIFICATION_STATUS_VALUES.has(verificationStatus)) {
    return { ok: false, message: "Verification status is invalid." };
  }

  const officialWebsiteUrl = optionalUrl(formData, "officialWebsiteUrl");
  if (officialWebsiteUrl && typeof officialWebsiteUrl !== "string") return officialWebsiteUrl;

  const plannerPortalUrl = optionalUrl(formData, "plannerPortalUrl");
  if (plannerPortalUrl && typeof plannerPortalUrl !== "string") return plannerPortalUrl;

  const systemUrl = optionalUrl(formData, "systemUrl");
  if (systemUrl && typeof systemUrl !== "string") return systemUrl;

  const claimPageUrl = optionalUrl(formData, "claimPageUrl");
  if (claimPageUrl && typeof claimPageUrl !== "string") return claimPageUrl;

  const claimFormUrl = optionalUrl(formData, "claimFormUrl");
  if (claimFormUrl && typeof claimFormUrl !== "string") return claimFormUrl;

  const termsUrl = optionalUrl(formData, "termsUrl");
  if (termsUrl && typeof termsUrl !== "string") return termsUrl;

  const lastVerifiedAt = optionalDate(formData, "lastVerifiedAt");
  if (lastVerifiedAt && !(lastVerifiedAt instanceof Date)) return lastVerifiedAt;

  const cardPaymentStatusRaw =
    textValue(formData, "cardPaymentStatus") ?? CardPaymentStatus.unknown;
  if (!CARD_PAYMENT_STATUS_VALUES.has(cardPaymentStatusRaw)) {
    return { ok: false, message: "Card payment status is invalid." };
  }

  const claimFaxHandlingTypeRaw =
    textValue(formData, "claimFaxHandlingType") ?? ClaimFaxHandlingType.unknown;
  if (!CLAIM_FAX_HANDLING_TYPE_VALUES.has(claimFaxHandlingTypeRaw)) {
    return { ok: false, message: "Claim fax handling type is invalid." };
  }

  const sortOrder = optionalSortOrder(formData, "sortOrder");
  if (typeof sortOrder !== "number") return sortOrder;

  return {
    ok: true,
    data: {
      name,
      category: category as InsurerCategory,
      officialWebsiteUrl,
      plannerPortalUrl,
      systemUrl,
      claimPageUrl,
      customerCenterPhone: textValue(formData, "customerCenterPhone"),
      callMonitoringPhone: textValue(formData, "callMonitoringPhone"),
      helpdeskPhone: textValue(formData, "helpdeskPhone"),
      faxNumber: textValue(formData, "faxNumber"),
      mailingAddress: textValue(formData, "mailingAddress"),
      cardPaymentInitialAvailable: tristateBoolean(formData, "cardPaymentInitialAvailable"),
      cardPaymentRecurringAvailable: tristateBoolean(formData, "cardPaymentRecurringAvailable"),
      cardPaymentStatus: cardPaymentStatusRaw as CardPaymentStatus,
      cardPaymentNote: textValue(formData, "cardPaymentNote"),
      claimFaxNumber: textValue(formData, "claimFaxNumber"),
      claimFaxHandlingType: claimFaxHandlingTypeRaw as ClaimFaxHandlingType,
      registeredMailAddress: textValue(formData, "registeredMailAddress"),
      claimFormUrl,
      termsUrl,
      sourceNote: textValue(formData, "sourceNote"),
      notes: textValue(formData, "notes"),
      verificationStatus: verificationStatus as VerificationStatus,
      lastVerifiedAt,
      isPublished: formData.get("isPublished") === "on",
      sortOrder,
      isFeatured: formData.get("isFeatured") === "on",
    },
  };
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function handleUnauthorized(path: string, error: unknown): never {
  if (error instanceof Error && error.message.includes("ACCESS_DENIED")) {
    redirectWithError(path, "Admin permission is required.");
  }
  throw error;
}

export async function createInsurer(formData: FormData) {
  let session: Awaited<ReturnType<typeof requireInsurerContentManager>>;

  try {
    session = await requireInsurerContentManager();
  } catch (error) {
    handleUnauthorized("/admin/insurers/new", error);
  }

  const parsed = parseInsurerForm(formData);
  if (!parsed.ok) {
    redirectWithError("/admin/insurers/new", parsed.message);
  }

  const userId = getSessionUserId(session);

  try {
    await prisma.insurer.create({
      data: {
        ...parsed.data,
        createdById: userId,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError("/admin/insurers/new", "Unable to create insurer record.");
  }

  revalidatePath("/admin/insurers");
  redirect("/admin/insurers");
}

export async function updateInsurer(id: string, formData: FormData) {
  let session: Awaited<ReturnType<typeof requireInsurerContentManager>>;
  const editPath = `/admin/insurers/${id}/edit`;

  try {
    session = await requireInsurerContentManager();
  } catch (error) {
    handleUnauthorized(editPath, error);
  }

  const parsed = parseInsurerForm(formData);
  if (!parsed.ok) {
    redirectWithError(editPath, parsed.message);
  }

  const userId = getSessionUserId(session);

  try {
    await prisma.insurer.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedById: userId,
      },
    });
  } catch {
    redirectWithError(editPath, "Unable to update insurer record.");
  }

  revalidatePath("/admin/insurers");
  redirect("/admin/insurers");
}

export async function setInsurerPublished(id: string, isPublished: boolean) {
  let session: Awaited<ReturnType<typeof requireInsurerPublisher>>;

  try {
    session = await requireInsurerPublisher();
  } catch (error) {
    handleUnauthorized("/admin/insurers", error);
  }

  try {
    await prisma.insurer.update({
      where: { id },
      data: {
        isPublished,
        updatedById: getSessionUserId(session),
      },
    });
  } catch {
    redirectWithError("/admin/insurers", "Unable to update publication state.");
  }

  revalidatePath("/admin/insurers");
}
