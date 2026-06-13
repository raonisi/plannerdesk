import Link from "next/link";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { ClaimDocumentGovernanceBoard } from "@/components/admin/claim-documents/claim-document-governance-board";
import { buildClaimDocumentGovernanceList } from "@/lib/claim-documents/governance-helpers";
import { getClaimDocumentAdminAccess } from "../access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "청구서류 검수 관리 | PlannerDesk Admin",
  description:
    "청구서류 PDF의 검수일, 공식 확인 URL, 노출 여부를 관리하기 위한 governance 확인 화면입니다.",
  robots: { index: false, follow: false },
};

const PAGE_TITLE = "청구서류 검수 관리";
const PAGE_DESCRIPTION =
  "청구서류 PDF의 검수일, 공식 확인 URL, 노출 여부를 관리하기 위한 화면입니다. PDF 파일은 삭제하지 않고, 운영 기준과 최신성 정보를 점검합니다.";

export default async function AdminClaimDocumentGovernancePage() {
  const access = await getClaimDocumentAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState email={access.session.user?.email ?? null} />;
  }

  const items = buildClaimDocumentGovernanceList();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              PlannerDesk Admin
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {PAGE_TITLE}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
              {PAGE_DESCRIPTION}
            </p>
          </header>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              href="/admin/claim-documents"
            >
              DB 청구서류 라이브러리
            </Link>
            <Link
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              href="/admin"
            >
              Admin 홈
            </Link>
          </div>
        </div>

        <ClaimDocumentGovernanceBoard items={items} />
      </div>
    </main>
  );
}
