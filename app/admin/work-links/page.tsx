import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { WorkLinkReviewDraftPanel } from "@/components/admin/work-links/WorkLinkReviewDraftPanel";
import { parseWorkLinkReviewFilter } from "@/lib/work-links/review-filters";
import { WORK_LINK_REVIEW_SCOPE_NOTICE } from "@/lib/work-links/review-copy";
import { borders, surfaces, textStyles } from "@/lib/design-system";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "업무 링크 검수 | PlannerDesk Admin",
  description: WORK_LINK_REVIEW_SCOPE_NOTICE,
  robots: { index: false, follow: false },
};

interface SearchParams {
  filter?: string;
}

export default async function AdminWorkLinksReviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return (
      <AdminAccessDeniedState email={access.session.user?.email ?? null} />
    );
  }

  const resolved = await searchParams;
  const filter = parseWorkLinkReviewFilter(resolved.filter);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin · PR-BS-14</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              업무 링크 검수 초안
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              보험사 전산·청구·고객센터·팩스·납입 정보 후보를 Admin에서 검수하기 위한
              draft UI입니다. public/planner 자동 노출은 하지 않습니다.
            </p>
          </div>
          <Link
            href="/admin"
            className={`inline-flex items-center justify-center rounded-md border ${borders.default} bg-white px-4 py-2 text-sm font-semibold text-[#102235] shadow-sm hover:bg-[#f7f1e5]`}
          >
            Admin 홈
          </Link>
        </div>

        <WorkLinkReviewDraftPanel filter={filter} />
      </div>
    </main>
  );
}
