"use server";

import {
  CorrectionRequestPriority,
  CorrectionRequestStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { handleAdminUnauthorized, redirectWithError } from "@/lib/admin/actions";
import {
  getSessionUserId,
  requireCorrectionContentManager,
} from "./access";
import { isTerminalStatus } from "./visibility";

const ADMIN_LIST_PATH = "/admin/corrections";
const ADMIN_MEMO_MAX_LENGTH = 2_000;

const STATUS_VALUES = new Set<string>(
  Object.values(CorrectionRequestStatus) as string[],
);
const PRIORITY_VALUES = new Set<string>(
  Object.values(CorrectionRequestPriority) as string[],
);

export type CorrectionAdminActionResult =
  | { ok: true }
  | { ok: false; message: string };

function revalidateCorrectionPaths(id: string) {
  revalidatePath(ADMIN_LIST_PATH);
  revalidatePath(`${ADMIN_LIST_PATH}/${id}`);
}

function parseStatus(value: string): CorrectionRequestStatus | null {
  return STATUS_VALUES.has(value) ? (value as CorrectionRequestStatus) : null;
}

function parsePriority(value: string): CorrectionRequestPriority | null {
  return PRIORITY_VALUES.has(value)
    ? (value as CorrectionRequestPriority)
    : null;
}

function parseBooleanField(value: FormDataEntryValue | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function optionalMemo(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > ADMIN_MEMO_MAX_LENGTH) {
    return trimmed.slice(0, ADMIN_MEMO_MAX_LENGTH);
  }
  return trimmed;
}

async function loadCorrectionOrRedirect(id: string) {
  const row = await prisma.correctionRequest.findUnique({ where: { id } });
  if (!row) {
    redirectWithError(ADMIN_LIST_PATH, "제보를 찾을 수 없습니다.");
  }
  return row;
}

function buildResolvedFields(
  status: CorrectionRequestStatus,
  userId: string | null,
): {
  resolvedAt: Date | null;
  resolvedById: string | null;
  deletedAt: Date | null;
  redactionRequired: boolean | undefined;
} {
  const terminal = isTerminalStatus(status);
  const resolvedAt = terminal ? new Date() : null;
  const resolvedById = terminal && userId ? userId : null;
  const deletedAt =
    status === CorrectionRequestStatus.deleted ? new Date() : null;

  const redactionRequired =
    status === CorrectionRequestStatus.needs_redaction ? true : undefined;

  return { resolvedAt, resolvedById, deletedAt, redactionRequired };
}

export async function updateCorrectionRequestStatus(
  id: string,
  formData: FormData,
): Promise<CorrectionAdminActionResult> {
  try {
    await requireCorrectionContentManager();
    const status = parseStatus(String(formData.get("status") ?? ""));
    if (!status) {
      return { ok: false, message: "유효하지 않은 상태입니다." };
    }

    const session = await requireCorrectionContentManager();
    const userId = getSessionUserId(session);
    const existing = await loadCorrectionOrRedirect(id);
    const resolved = buildResolvedFields(status, userId);

    await prisma.correctionRequest.update({
      where: { id },
      data: {
        status,
        resolvedAt: resolved.resolvedAt,
        resolvedById: resolved.resolvedById,
        deletedAt:
          status === CorrectionRequestStatus.deleted
            ? resolved.deletedAt
            : existing.deletedAt,
        ...(resolved.redactionRequired !== undefined
          ? { redactionRequired: true }
          : {}),
      },
    });

    revalidateCorrectionPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "상태 변경에 실패했습니다." };
  }
}

export async function updateCorrectionRequestPriority(
  id: string,
  formData: FormData,
): Promise<CorrectionAdminActionResult> {
  try {
    await requireCorrectionContentManager();
    const priority = parsePriority(String(formData.get("priority") ?? ""));
    if (!priority) {
      return { ok: false, message: "유효하지 않은 우선순위입니다." };
    }

    await prisma.correctionRequest.update({
      where: { id },
      data: { priority },
    });

    revalidateCorrectionPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "우선순위 변경에 실패했습니다." };
  }
}

export async function updateCorrectionRequestFlags(
  id: string,
  formData: FormData,
): Promise<CorrectionAdminActionResult> {
  try {
    await requireCorrectionContentManager();
    const containsSensitiveData = parseBooleanField(
      formData.get("containsSensitiveData"),
    );
    const redactionRequired = parseBooleanField(
      formData.get("redactionRequired"),
    );

    if (
      containsSensitiveData === null ||
      redactionRequired === null
    ) {
      return { ok: false, message: "플래그 값이 올바르지 않습니다." };
    }

    const nextRedaction =
      containsSensitiveData && !redactionRequired
        ? true
        : redactionRequired;

    await prisma.correctionRequest.update({
      where: { id },
      data: {
        containsSensitiveData,
        redactionRequired: nextRedaction,
      },
    });

    revalidateCorrectionPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "민감정보 플래그 저장에 실패했습니다." };
  }
}

export async function updateCorrectionRequestAdminMemo(
  id: string,
  formData: FormData,
): Promise<CorrectionAdminActionResult> {
  try {
    await requireCorrectionContentManager();
    const adminMemo = optionalMemo(formData.get("adminMemo"));

    await prisma.correctionRequest.update({
      where: { id },
      data: { adminMemo },
    });

    revalidateCorrectionPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "관리자 메모 저장에 실패했습니다." };
  }
}

export async function markCorrectionRequestRedacted(
  id: string,
): Promise<CorrectionAdminActionResult> {
  try {
    await requireCorrectionContentManager();
    await prisma.correctionRequest.update({
      where: { id },
      data: { redactedAt: new Date() },
    });
    revalidateCorrectionPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "마스킹 완료 기록에 실패했습니다." };
  }
}
