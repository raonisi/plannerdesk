"use server";

import {
  PlannerVerificationStatus,
  type PlannerVerification,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { handleAdminUnauthorized, redirectWithError } from "@/lib/admin/actions";
import {
  getSessionUserId,
  requirePlannerVerificationContentManager,
} from "./access";
import { isReviewedStatus } from "./visibility";

const ADMIN_LIST_PATH = "/admin/planner-verifications";
const TEXT_MAX_LENGTH = 2_000;

const STATUS_VALUES = new Set<string>(
  Object.values(PlannerVerificationStatus) as string[],
);

export type PlannerVerificationAdminActionResult =
  | { ok: true }
  | { ok: false; message: string };

function revalidatePlannerVerificationPaths(id: string) {
  revalidatePath(ADMIN_LIST_PATH);
  revalidatePath(`${ADMIN_LIST_PATH}/${id}`);
}

function parseStatus(value: string): PlannerVerificationStatus | null {
  return STATUS_VALUES.has(value) ? (value as PlannerVerificationStatus) : null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > TEXT_MAX_LENGTH) {
    return trimmed.slice(0, TEXT_MAX_LENGTH);
  }
  return trimmed;
}

function parseBooleanField(value: FormDataEntryValue | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

async function loadVerificationOrRedirect(id: string) {
  const row = await prisma.plannerVerification.findUnique({ where: { id } });
  if (!row) {
    redirectWithError(ADMIN_LIST_PATH, "검증 신청을 찾을 수 없습니다.");
  }
  return row;
}

function buildStatusUpdateData(
  status: PlannerVerificationStatus,
  userId: string | null,
  existing: PlannerVerification,
): Prisma.PlannerVerificationUpdateInput {
  const now = new Date();
  const data: Prisma.PlannerVerificationUpdateInput = { status };

  if (
    status === PlannerVerificationStatus.under_review &&
    userId
  ) {
    data.reviewedBy = { connect: { id: userId } };
  }

  if (isReviewedStatus(status)) {
    data.reviewedAt = now;
    if (userId) {
      data.reviewedBy = { connect: { id: userId } };
    }
  }

  if (status === PlannerVerificationStatus.approved) {
    data.suspendedAt = null;
    data.rejectionReason = null;
    data.userFacingRejectionSummary = null;
  }

  if (status === PlannerVerificationStatus.suspended) {
    data.suspendedAt = now;
  }

  if (
    status !== PlannerVerificationStatus.suspended &&
    status !== PlannerVerificationStatus.deleted &&
    existing.status === PlannerVerificationStatus.suspended &&
    status === PlannerVerificationStatus.approved
  ) {
    data.suspendedAt = null;
  }

  if (status === PlannerVerificationStatus.deleted) {
    data.deletedAt = now;
  } else if (existing.deletedAt) {
    data.deletedAt = existing.deletedAt;
  }

  return data;
}

export async function updatePlannerVerificationStatus(
  id: string,
  formData: FormData,
): Promise<PlannerVerificationAdminActionResult> {
  try {
    const session = await requirePlannerVerificationContentManager();
    const status = parseStatus(String(formData.get("status") ?? ""));
    if (!status) {
      return { ok: false, message: "유효하지 않은 상태입니다." };
    }

    const userId = getSessionUserId(session);
    const existing = await loadVerificationOrRedirect(id);
    const data = buildStatusUpdateData(status, userId, existing);

    await prisma.plannerVerification.update({
      where: { id },
      data,
    });

    revalidatePlannerVerificationPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "상태 변경에 실패했습니다." };
  }
}

export async function updatePlannerVerificationAdminMemo(
  id: string,
  formData: FormData,
): Promise<PlannerVerificationAdminActionResult> {
  try {
    await requirePlannerVerificationContentManager();
    const adminMemo = optionalText(formData.get("adminMemo"));

    await prisma.plannerVerification.update({
      where: { id },
      data: { adminMemo },
    });

    revalidatePlannerVerificationPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "관리자 메모 저장에 실패했습니다." };
  }
}

export async function updatePlannerVerificationRejectionFields(
  id: string,
  formData: FormData,
): Promise<PlannerVerificationAdminActionResult> {
  try {
    await requirePlannerVerificationContentManager();
    const rejectionReason = optionalText(formData.get("rejectionReason"));
    const userFacingRejectionSummary = optionalText(
      formData.get("userFacingRejectionSummary"),
    );

    await prisma.plannerVerification.update({
      where: { id },
      data: {
        rejectionReason,
        userFacingRejectionSummary,
      },
    });

    revalidatePlannerVerificationPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "거절 사유 저장에 실패했습니다." };
  }
}

export async function updatePlannerVerificationSensitiveFlag(
  id: string,
  formData: FormData,
): Promise<PlannerVerificationAdminActionResult> {
  try {
    await requirePlannerVerificationContentManager();
    const containsSensitiveData = parseBooleanField(
      formData.get("containsSensitiveData"),
    );

    if (containsSensitiveData === null) {
      return { ok: false, message: "민감정보 플래그 값이 올바르지 않습니다." };
    }

    await prisma.plannerVerification.update({
      where: { id },
      data: { containsSensitiveData },
    });

    revalidatePlannerVerificationPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "민감정보 플래그 저장에 실패했습니다." };
  }
}
