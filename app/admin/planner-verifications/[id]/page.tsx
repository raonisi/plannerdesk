import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getPlannerVerificationAdminAccess } from "../access";
import PlannerVerificationDetailPanel, {
  type PlannerVerificationDetailData,
} from "../planner-verification-detail-panel";
import {
  ADMIN_PLANNER_VERIFICATION_COPY,
  formatApplicantLabel,
} from "../visibility";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

type DetailRecord = Prisma.PlannerVerificationGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    reviewedBy: { select: { id: true; name: true } };
  };
}>;

function serializeDetail(row: DetailRecord): PlannerVerificationDetailData {
  return {
    id: row.id,
    displayName: row.displayName,
    applicant: row.user,
    status: row.status,
    plannerType: row.plannerType,
    affiliationName: row.affiliationName,
    activityRegion: row.activityRegion,
    careerRange: row.careerRange,
    licenseScope: row.licenseScope,
    businessChannel: row.businessChannel,
    verificationNote: row.verificationNote,
    containsSensitiveData: row.containsSensitiveData,
    requestedAt: row.requestedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedByLabel: row.reviewedBy
      ? formatApplicantLabel(row.reviewedBy)
      : null,
    adminMemo: row.adminMemo,
    rejectionReason: row.rejectionReason,
    userFacingRejectionSummary: row.userFacingRejectionSummary,
    suspendedAt: row.suspendedAt?.toISOString() ?? null,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    retentionUntil: row.retentionUntil?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export default async function AdminPlannerVerificationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const access = await getPlannerVerificationAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const resolvedSearch = await searchParams;

  const record = await prisma.plannerVerification.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (!record) {
    notFound();
  }

  const row = serializeDetail(record);

  return (
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              {ADMIN_PLANNER_VERIFICATION_COPY.detailTitle}
            </h1>
          </div>
          <Link
            href="/admin/planner-verifications"
            className="inline-flex items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
          >
            목록으로
          </Link>
        </div>

        {resolvedSearch.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolvedSearch.error}
          </div>
        ) : null}

        <PlannerVerificationDetailPanel row={row} />
      </div>
    </main>
  );
}
