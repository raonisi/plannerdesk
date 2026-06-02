"use server";

import {
  CommunityPostStatus,
  CommunityReportReason,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { handleAdminUnauthorized, redirectWithError } from "@/lib/admin/actions";
import {
  getSessionUserId,
  requireCommunityContentManager,
} from "./access";
import { parseReason, parseStatus } from "./visibility";

const ADMIN_LIST_PATH = "/admin/community-posts";

function revalidateCommunityAdminPaths(id: string) {
  revalidatePath(ADMIN_LIST_PATH);
  revalidatePath(`${ADMIN_LIST_PATH}/${id}`);
  revalidatePath("/community");
  revalidatePath(`/community/${id}`);
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 2000) : null;
}

async function loadPostOrRedirect(id: string) {
  const row = await prisma.communityPost.findUnique({ where: { id } });
  if (!row) {
    redirectWithError(ADMIN_LIST_PATH, "게시글을 찾을 수 없습니다.");
  }
  return row;
}

export async function updateCommunityPostModeration(
  id: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const session = await requireCommunityContentManager();
    const actorId = getSessionUserId(session);
    if (!actorId) {
      return { ok: false, message: "관리자 세션을 확인할 수 없습니다." };
    }

    const status = parseStatus(String(formData.get("status") ?? ""));
    if (!status) {
      return { ok: false, message: "유효하지 않은 상태입니다." };
    }

    const reason = parseReason(String(formData.get("blindReason") ?? ""));
    const blindReasonText = optionalText(formData.get("blindReasonText"));
    const adminMemo = optionalText(formData.get("adminMemo"));

    const existing = await loadPostOrRedirect(id);
    const now = new Date();
    const data: Prisma.CommunityPostUpdateInput = {
      status,
      reviewedAt: now,
      reviewedBy: { connect: { id: actorId } },
      adminMemo,
    };

    if (status === CommunityPostStatus.blinded) {
      data.isBlind = true;
      data.blindReason = reason ?? CommunityReportReason.other;
      data.blindReasonText = blindReasonText;
      data.blindedAt = now;
      data.blindedBy = { connect: { id: actorId } };
    }

    if (status === CommunityPostStatus.published) {
      data.isBlind = false;
      data.blindReason = null;
      data.blindReasonText = null;
      data.blindedAt = null;
      data.blindedBy = { disconnect: true };
    }

    if (status === CommunityPostStatus.deleted) {
      data.deletedAt = now;
      data.deletedBy = { connect: { id: actorId } };
    } else if (existing.deletedAt) {
      data.deletedAt = existing.deletedAt;
    }

    await prisma.communityPost.update({ where: { id }, data });
    revalidateCommunityAdminPaths(id);
    return { ok: true };
  } catch (error) {
    handleAdminUnauthorized(ADMIN_LIST_PATH, error);
    return { ok: false, message: "상태 저장에 실패했습니다." };
  }
}

