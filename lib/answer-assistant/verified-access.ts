// Verified planner access for answer assistant preview route (PR-97-B).

import { auth } from "@/auth";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import type { PlannerVerificationStatus, UserStatus } from "@prisma/client";
import {
  canAdminTestVerifiedAnswerAssistant,
  isAnswerAssistantVerifiedPreviewEnabled,
} from "./feature-gate";

const BLOCKING_VERIFICATION_STATUSES: PlannerVerificationStatus[] = [
  "pending",
  "under_review",
  "rejected",
  "suspended",
  "expired",
  "deleted",
];

export type VerifiedAnswerAssistantAccessState =
  | { status: "locked" }
  | {
      status: "feature_disabled";
      userId: string;
      email: string | null;
      canViewShell: boolean;
    }
  | {
      status: "denied";
      email: string | null;
      denyReason: string;
    }
  | {
      status: "authenticated";
      userId: string;
      email: string | null;
      isAdminTester: boolean;
      canGenerate: boolean;
    };

export async function getVerifiedAnswerAssistantAccess(): Promise<VerifiedAnswerAssistantAccessState> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const email = session?.user?.email ?? null;

  if (!userId) {
    return { status: "locked" };
  }

  const role = (session?.user?.role ?? "").toLowerCase();
  const isAdmin = canAccessAdmin(session);

  if (!isAnswerAssistantVerifiedPreviewEnabled()) {
    const canViewShell = isAdmin || role === "verified_planner";
    if (!canViewShell) {
      return {
        status: "denied",
        email,
        denyReason:
          "답변 보조 초안 기능은 검증 완료된 설계사만 이용할 수 있습니다.",
      };
    }
    return {
      status: "feature_disabled",
      userId,
      email,
      canViewShell: true,
    };
  }

  if (isAdmin && canAdminTestVerifiedAnswerAssistant()) {
    return {
      status: "authenticated",
      userId,
      email,
      isAdminTester: true,
      canGenerate: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user) {
    return {
      status: "denied",
      email,
      denyReason: "계정 정보를 확인할 수 없습니다.",
    };
  }

  if (user.status !== ("active" as UserStatus)) {
    return {
      status: "denied",
      email,
      denyReason: "현재 계정 상태로는 답변 보조 기능을 이용할 수 없습니다.",
    };
  }

  if (user.role !== "verified_planner") {
    return {
      status: "denied",
      email,
      denyReason:
        "답변 보조 초안 기능은 검증 완료된 설계사만 이용할 수 있습니다.",
    };
  }

  const latestVerification = await prisma.plannerVerification.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: { status: true, suspendedAt: true },
  });

  if (!latestVerification) {
    return {
      status: "denied",
      email,
      denyReason: "설계사 검증 기록이 없어 이용할 수 없습니다.",
    };
  }

  if (
    BLOCKING_VERIFICATION_STATUSES.includes(latestVerification.status) ||
    latestVerification.suspendedAt
  ) {
    const statusMessages: Partial<Record<PlannerVerificationStatus, string>> = {
      pending: "검증 승인 전에는 이용할 수 없습니다.",
      under_review: "검증 검토 중에는 이용할 수 없습니다.",
      rejected: "검증 반려 상태에서는 이용할 수 없습니다.",
      suspended: "검증 정지 상태에서는 이용할 수 없습니다.",
      expired: "검증 만료 상태에서는 이용할 수 없습니다.",
      deleted: "검증 기록이 삭제되어 이용할 수 없습니다.",
    };

    return {
      status: "denied",
      email,
      denyReason:
        statusMessages[latestVerification.status] ??
        "현재 검증 상태로는 이용할 수 없습니다.",
    };
  }

  if (latestVerification.status !== "approved") {
    return {
      status: "denied",
      email,
      denyReason: "검증 완료된 설계사만 이용할 수 있습니다.",
    };
  }

  const approved = await prisma.plannerVerification.findFirst({
    where: {
      userId,
      status: "approved",
      deletedAt: null,
      suspendedAt: null,
    },
    select: { id: true },
  });

  if (!approved) {
    return {
      status: "denied",
      email,
      denyReason: "검증 완료된 설계사만 이용할 수 있습니다.",
    };
  }

  return {
    status: "authenticated",
    userId,
    email,
    isAdminTester: false,
    canGenerate: true,
  };
}

export async function requireVerifiedAnswerAssistantAccess(): Promise<{
  userId: string;
  isAdminTester: boolean;
}> {
  const access = await getVerifiedAnswerAssistantAccess();

  if (access.status === "locked") {
    throw new Error("VERIFIED_ANSWER_ASSIST_AUTH_REQUIRED");
  }

  if (access.status === "denied") {
    throw new Error("VERIFIED_ANSWER_ASSIST_ACCESS_DENIED");
  }

  if (access.status === "feature_disabled") {
    throw new Error("VERIFIED_ANSWER_ASSIST_FEATURE_DISABLED");
  }

  if (!access.canGenerate) {
    throw new Error("VERIFIED_ANSWER_ASSIST_GENERATION_DISABLED");
  }

  return { userId: access.userId, isAdminTester: access.isAdminTester };
}
