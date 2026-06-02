import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess, type AdminSession } from "@/lib/auth/access";
import type { UserStatus } from "@prisma/client";

export type CommunityViewer = {
  userId: string;
  isAdmin: boolean;
  canWrite: boolean;
  denyReason?: string;
};

export async function getCommunityViewer(): Promise<CommunityViewer | null> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (!userId) return null;

  const role = (session?.user?.role ?? "").toLowerCase();
  const isAdmin = role === "super_admin" || role === "content_admin";

  if (isAdmin) {
    return { userId, isAdmin: true, canWrite: true };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user) return null;

  if (user.status !== ("active" as UserStatus)) {
    return {
      userId,
      isAdmin: false,
      canWrite: false,
      denyReason: "현재 계정 상태로는 커뮤니티를 이용할 수 없습니다.",
    };
  }

  if (user.role !== "verified_planner") {
    return {
      userId,
      isAdmin: false,
      canWrite: false,
      denyReason: "커뮤니티 글쓰기는 검증 완료된 설계사만 이용할 수 있습니다.",
    };
  }

  const [approved, suspended] = await Promise.all([
    prisma.plannerVerification.findFirst({
      where: {
        userId,
        status: "approved",
        deletedAt: null,
        suspendedAt: null,
      },
      orderBy: { reviewedAt: "desc" },
      select: { id: true },
    }),
    prisma.plannerVerification.findFirst({
      where: {
        userId,
        status: "suspended",
        deletedAt: null,
      },
      orderBy: { reviewedAt: "desc" },
      select: { id: true },
    }),
  ]);

  if (suspended) {
    return {
      userId,
      isAdmin: false,
      canWrite: false,
      denyReason: "현재 검증 상태가 정지되어 커뮤니티 작성 권한이 제한됩니다.",
    };
  }

  if (!approved) {
    return {
      userId,
      isAdmin: false,
      canWrite: false,
      denyReason: "커뮤니티 글쓰기는 검증 완료된 설계사만 이용할 수 있습니다.",
    };
  }

  return { userId, isAdmin: false, canWrite: true };
}

export async function requireCommunityWriter(): Promise<CommunityViewer> {
  const viewer = await getCommunityViewer();
  if (!viewer) {
    throw new Error("COMMUNITY_AUTH_REQUIRED");
  }
  if (!viewer.canWrite) {
    throw new Error(viewer.denyReason ?? "COMMUNITY_WRITE_DENIED");
  }
  return viewer;
}

export async function requireCommunityViewer(): Promise<CommunityViewer> {
  const viewer = await getCommunityViewer();
  if (!viewer) throw new Error("COMMUNITY_AUTH_REQUIRED");
  if (!viewer.canWrite && !viewer.isAdmin) {
    throw new Error(viewer.denyReason ?? "COMMUNITY_READ_DENIED");
  }
  return viewer;
}

export async function requireCommunityAdmin(): Promise<AdminSession> {
  return requireAdminAccess();
}

