import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getCommunityAdminAccess } from "../access";
import { ADMIN_COMMUNITY_COPY } from "../visibility";
import CommunityPostDetailPanel, { type CommunityAdminDetail } from "../community-post-detail-panel";

export const dynamic = "force-dynamic";

type CommunityDetailRecord = Prisma.CommunityPostGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    reports: {
      include: { reporter: { select: { id: true; name: true } } };
    };
  };
}>;

function serialize(row: CommunityDetailRecord): CommunityAdminDetail {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    status: row.status,
    visibility: row.visibility,
    isBlind: row.isBlind,
    blindReason: row.blindReason,
    blindReasonText: row.blindReasonText,
    reportCount: row.reportCount,
    adminMemo: row.adminMemo,
    authorLabel: row.author.name?.trim() || `사용자 ${row.author.id.slice(0, 8)}…`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
    reports: row.reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      status: report.status,
      message: report.message,
      createdAt: report.createdAt.toISOString(),
      reporterLabel: report.reporter.name?.trim() || `사용자 ${report.reporter.id.slice(0, 8)}…`,
    })),
  };
}

export default async function AdminCommunityPostDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const access = await getCommunityAdminAccess();
  if (access.status === "locked") return <AdminLockedState />;
  if (access.status === "denied") return <AdminAccessDeniedState />;

  const { id } = await params;
  const q = await searchParams;

  const record = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { reporter: { select: { id: true, name: true } } },
      },
    },
  });

  if (!record) notFound();

  const row = serialize(record);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">{ADMIN_COMMUNITY_COPY.detailTitle}</h1>
          </div>
          <Link href="/admin/community-posts" className="inline-flex items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]">목록으로</Link>
        </div>
        {q.error ? <p className="mb-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{q.error}</p> : null}
        <CommunityPostDetailPanel row={row} />
      </div>
    </main>
  );
}

