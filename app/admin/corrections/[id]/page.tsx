import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getCorrectionAdminAccess } from "../access";
import CorrectionDetailPanel, {
  type CorrectionDetailData,
} from "../correction-detail-panel";
import { ADMIN_CORRECTION_COPY } from "../visibility";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

type CorrectionDetailRecord = Prisma.CorrectionRequestGetPayload<{
  include: { resolvedBy: { select: { id: true; name: true; email: true } } };
}>;

function serializeDetail(row: CorrectionDetailRecord): CorrectionDetailData {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    requestType: row.requestType,
    targetType: row.targetType,
    targetId: row.targetId,
    status: row.status,
    priority: row.priority,
    containsSensitiveData: row.containsSensitiveData,
    redactionRequired: row.redactionRequired,
    redactedAt: row.redactedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByLabel:
      row.resolvedBy?.name ??
      row.resolvedBy?.email ??
      (row.resolvedById ? row.resolvedById.slice(0, 8) : null),
    retentionUntil: row.retentionUntil?.toISOString() ?? null,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    adminMemo: row.adminMemo,
  };
}

export default async function AdminCorrectionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const access = await getCorrectionAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const resolvedSearch = await searchParams;

  const record = await prisma.correctionRequest.findUnique({
    where: { id },
    include: {
      resolvedBy: { select: { id: true, name: true, email: true } },
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
              {ADMIN_CORRECTION_COPY.detailTitle}
            </h1>
          </div>
          <Link
            href="/admin/corrections"
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

        <CorrectionDetailPanel row={row} />
      </div>
    </main>
  );
}
