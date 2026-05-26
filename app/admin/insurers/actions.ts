"use server";

import {
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

type FormResult =
  | { ok: true; data: Prisma.InsurerUncheckedCreateInput }
  | { ok: false; message: string };

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredText(formData: FormData, key: string, label: string): FormResult | string {
  const value = textValue(formData, key);
  if (!value) {
    return { ok: false, message: `${label} is required.` };
  }
  return value;
}

function optionalUrl(formData: FormData, key: string): FormResult | string | null {
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

function optionalDate(formData: FormData, key: string): FormResult | Date | null {
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

function parseInsurerForm(formData: FormData): FormResult {
  const name = requiredText(formData, "name", "Name");
  if (typeof name !== "string") return name;

  const category = textValue(formData, "category");
  if (!category || !CATEGORY_VALUES.has(category)) {
    return { ok: false, message: "Category is required." };
  }

  const verificationStatus = textValue(formData, "verificationStatus") ?? VerificationStatus.draft;
  if (!VERIFICATION_STATUS_VALUES.has(verificationStatus)) {
    return { ok: false, message: "Verification status is invalid." };
  }

  const officialWebsiteUrl = optionalUrl(formData, "officialWebsiteUrl");
  if (officialWebsiteUrl && typeof officialWebsiteUrl !== "string") return officialWebsiteUrl;

  const plannerPortalUrl = optionalUrl(formData, "plannerPortalUrl");
  if (plannerPortalUrl && typeof plannerPortalUrl !== "string") return plannerPortalUrl;

  const claimPageUrl = optionalUrl(formData, "claimPageUrl");
  if (claimPageUrl && typeof claimPageUrl !== "string") return claimPageUrl;

  const lastVerifiedAt = optionalDate(formData, "lastVerifiedAt");
  if (lastVerifiedAt && !(lastVerifiedAt instanceof Date)) return lastVerifiedAt;

  return {
    ok: true,
    data: {
      name,
      category: category as InsurerCategory,
      officialWebsiteUrl,
      plannerPortalUrl,
      claimPageUrl,
      customerCenterPhone: textValue(formData, "customerCenterPhone"),
      faxNumber: textValue(formData, "faxNumber"),
      mailingAddress: textValue(formData, "mailingAddress"),
      notes: textValue(formData, "notes"),
      verificationStatus: verificationStatus as VerificationStatus,
      lastVerifiedAt,
      isPublished: formData.get("isPublished") === "on",
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
