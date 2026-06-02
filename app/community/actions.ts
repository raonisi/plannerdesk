"use server";

import {
  CommunityPostCategory,
  CommunityPostStatus,
  CommunityPostVisibility,
  CommunityReportReason,
  CommunityReportStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCommunityAdmin, requireCommunityWriter } from "./access";
import {
  COMMUNITY_VALIDATION,
  communityBlockedMessage,
  hasBlockedContent,
  hasTooManyUrls,
  hasUnsafeHtml,
  sanitizeText,
} from "./validation";

const COMMUNITY_PATH = "/community";
const COMMUNITY_ADMIN_PATH = "/admin/community-posts";

function qs(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function success(path: string, message: string): never {
  redirect(`${path}?success=${encodeURIComponent(message)}`);
}

function parseCategory(value: string): CommunityPostCategory | null {
  return (Object.values(CommunityPostCategory) as string[]).includes(value)
    ? (value as CommunityPostCategory)
    : null;
}

function parseVisibility(value: string): CommunityPostVisibility | null {
  return (Object.values(CommunityPostVisibility) as string[]).includes(value)
    ? (value as CommunityPostVisibility)
    : null;
}

function parseReason(value: string): CommunityReportReason | null {
  return (Object.values(CommunityReportReason) as string[]).includes(value)
    ? (value as CommunityReportReason)
    : null;
}

function parseStatus(value: string): CommunityPostStatus | null {
  return (Object.values(CommunityPostStatus) as string[]).includes(value)
    ? (value as CommunityPostStatus)
    : null;
}

function validatePostPayload(title: string, content: string): string | null {
  if (title.length < COMMUNITY_VALIDATION.titleMin || title.length > COMMUNITY_VALIDATION.titleMax) {
    return `제목은 ${COMMUNITY_VALIDATION.titleMin}자 이상 ${COMMUNITY_VALIDATION.titleMax}자 이하로 작성해 주세요.`;
  }
  if (content.length < COMMUNITY_VALIDATION.contentMin || content.length > COMMUNITY_VALIDATION.contentMax) {
    return `본문은 ${COMMUNITY_VALIDATION.contentMin}자 이상 ${COMMUNITY_VALIDATION.contentMax}자 이하로 작성해 주세요.`;
  }
  if (hasUnsafeHtml(title) || hasUnsafeHtml(content)) {
    return "HTML 또는 스크립트 형식은 입력할 수 없습니다.";
  }
  if (hasTooManyUrls(content)) {
    return "외부 링크가 너무 많습니다. 핵심 링크만 남겨 주세요.";
  }
  const merged = `${title}\n${content}`;
  if (hasBlockedContent(merged)) {
    return communityBlockedMessage();
  }
  return null;
}

function revalidateCommunity(id?: string) {
  revalidatePath(COMMUNITY_PATH);
  if (id) revalidatePath(`${COMMUNITY_PATH}/${id}`);
  revalidatePath(COMMUNITY_ADMIN_PATH);
  if (id) revalidatePath(`${COMMUNITY_ADMIN_PATH}/${id}`);
}

export async function createCommunityPost(formData: FormData): Promise<void> {
  const viewer = await requireCommunityWriter();

  const category = parseCategory(String(formData.get("category") ?? ""));
  if (!category) {
    qs("/community/new", "카테고리를 선택해 주세요.");
  }

  const title = sanitizeText(formData.get("title"));
  const content = sanitizeText(formData.get("content"));
  const payloadError = validatePostPayload(title, content);
  if (payloadError) {
    qs("/community/new", payloadError);
  }

  let visibility: CommunityPostVisibility = CommunityPostVisibility.verified_only;
  let isPinned = false;
  if (viewer.isAdmin) {
    visibility =
      parseVisibility(String(formData.get("visibility") ?? "")) ??
      CommunityPostVisibility.verified_only;
    isPinned = String(formData.get("isPinned") ?? "") === "true";
  }

  const row = await prisma.communityPost.create({
    data: {
      authorId: viewer.userId,
      category,
      title,
      content,
      status: CommunityPostStatus.published,
      visibility,
      isPinned,
      isBlind: false,
    },
    select: { id: true },
  });

  revalidateCommunity(row.id);
  success(`/community/${row.id}`, "게시글이 등록되었습니다.");
}

export async function updateCommunityPost(id: string, formData: FormData): Promise<void> {
  const viewer = await requireCommunityWriter();

  const existing = await prisma.communityPost.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      isBlind: true,
      deletedAt: true,
    },
  });

  if (!existing || existing.deletedAt) {
    qs(COMMUNITY_PATH, "게시글을 찾을 수 없습니다.");
  }

  if (!viewer.isAdmin && existing.authorId !== viewer.userId) {
    qs(`/community/${id}`, "본인 글만 수정할 수 있습니다.");
  }

  if (!viewer.isAdmin && existing.isBlind) {
    qs(`/community/${id}`, "블라인드 처리된 글은 관리자 확인 후 수정할 수 있습니다.");
  }

  const category = parseCategory(String(formData.get("category") ?? ""));
  if (!category) {
    qs(`/community/${id}/edit`, "카테고리를 선택해 주세요.");
  }

  const title = sanitizeText(formData.get("title"));
  const content = sanitizeText(formData.get("content"));
  const payloadError = validatePostPayload(title, content);
  if (payloadError) {
    qs(`/community/${id}/edit`, payloadError);
  }

  const data: {
    category: CommunityPostCategory;
    title: string;
    content: string;
    visibility?: CommunityPostVisibility;
    isPinned?: boolean;
    status?: CommunityPostStatus;
    reviewedAt?: Date;
  } = {
    category,
    title,
    content,
  };

  if (viewer.isAdmin) {
    data.visibility =
      parseVisibility(String(formData.get("visibility") ?? "")) ??
      CommunityPostVisibility.verified_only;
    data.isPinned = String(formData.get("isPinned") ?? "") === "true";
  }

  await prisma.communityPost.update({ where: { id }, data });

  revalidateCommunity(id);
  success(`/community/${id}`, "게시글이 수정되었습니다.");
}

export async function softDeleteCommunityPost(id: string): Promise<void> {
  const viewer = await requireCommunityWriter();

  const existing = await prisma.communityPost.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      isBlind: true,
      deletedAt: true,
      status: true,
    },
  });

  if (!existing || existing.deletedAt) {
    qs(COMMUNITY_PATH, "게시글을 찾을 수 없습니다.");
  }

  if (!viewer.isAdmin && existing.authorId !== viewer.userId) {
    qs(`/community/${id}`, "본인 글만 삭제할 수 있습니다.");
  }

  if (!viewer.isAdmin && (existing.isBlind || existing.status === CommunityPostStatus.blinded)) {
    qs(`/community/${id}`, "신고 또는 블라인드 처리된 글은 관리자에게 문의해 주세요.");
  }

  await prisma.communityPost.update({
    where: { id },
    data: {
      status: CommunityPostStatus.deleted,
      deletedAt: new Date(),
      deletedById: viewer.userId,
    },
  });

  revalidateCommunity(id);
  success(COMMUNITY_PATH, "게시글이 삭제되었습니다.");
}

export async function reportCommunityPost(id: string, formData: FormData): Promise<void> {
  const viewer = await requireCommunityWriter();

  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });

  if (!post || post.deletedAt) {
    qs(COMMUNITY_PATH, "신고할 게시글을 찾을 수 없습니다.");
  }

  const reason = parseReason(String(formData.get("reason") ?? ""));
  if (!reason) {
    qs(`/community/${id}`, "신고 사유를 선택해 주세요.");
  }

  const message = sanitizeText(formData.get("message"));
  if (message.length > COMMUNITY_VALIDATION.reportMessageMax) {
    qs(`/community/${id}`, `신고 설명은 ${COMMUNITY_VALIDATION.reportMessageMax}자 이하로 입력해 주세요.`);
  }
  if (message && hasBlockedContent(message)) {
    qs(`/community/${id}`, "신고 설명에는 개인정보나 민감정보를 입력하지 마세요.");
  }

  try {
    await prisma.$transaction([
      prisma.communityReport.create({
        data: {
          postId: id,
          reporterId: viewer.userId,
          reason,
          status: CommunityReportStatus.new,
          message: message || null,
        },
      }),
      prisma.communityPost.update({
        where: { id },
        data: { reportCount: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      qs(`/community/${id}`, "동일 사유로 이미 신고한 게시글입니다.");
    }
    throw error;
  }

  revalidateCommunity(id);
  success(`/community/${id}`, "신고가 접수되었습니다. 관리자가 확인 후 처리합니다.");
}

export async function adminUpdateCommunityModeration(id: string, formData: FormData): Promise<void> {
  const session = await requireCommunityAdmin();
  const actorId = session.user?.id ?? null;
  if (!actorId) {
    qs(COMMUNITY_ADMIN_PATH, "관리자 세션을 확인할 수 없습니다.");
  }

  const status = parseStatus(String(formData.get("status") ?? ""));
  if (!status) {
    qs(`${COMMUNITY_ADMIN_PATH}/${id}`, "유효하지 않은 상태입니다.");
  }

  const blindReason = parseReason(String(formData.get("blindReason") ?? ""));
  const blindReasonText = sanitizeText(formData.get("blindReasonText"));
  const adminMemo = sanitizeText(formData.get("adminMemo"));

  const data: {
    status: CommunityPostStatus;
    reviewedAt: Date;
    reviewedById: string;
    isBlind?: boolean;
    blindReason?: CommunityReportReason | null;
    blindReasonText?: string | null;
    blindedAt?: Date | null;
    blindedById?: string | null;
    deletedAt?: Date | null;
    deletedById?: string | null;
    adminMemo?: string | null;
  } = {
    status,
    reviewedAt: new Date(),
    reviewedById: actorId,
    adminMemo: adminMemo || null,
  };

  if (status === CommunityPostStatus.blinded) {
    data.isBlind = true;
    data.blindReason = blindReason ?? CommunityReportReason.other;
    data.blindReasonText = blindReasonText || null;
    data.blindedAt = new Date();
    data.blindedById = actorId;
  }

  if (status === CommunityPostStatus.published) {
    data.isBlind = false;
    data.blindReason = null;
    data.blindReasonText = null;
    data.blindedAt = null;
    data.blindedById = null;
  }

  if (status === CommunityPostStatus.deleted) {
    data.deletedAt = new Date();
    data.deletedById = actorId;
  }

  await prisma.communityPost.update({ where: { id }, data });

  revalidateCommunity(id);
  success(`${COMMUNITY_ADMIN_PATH}/${id}`, "운영 상태가 저장되었습니다.");
}

