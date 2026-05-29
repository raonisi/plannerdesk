import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../access";
import { createInsurer } from "../actions";
import InsurerForm from "../form";
import { ADMIN_VISIBILITY_COPY } from "../visibility";

const PAGE_TITLE = "새 보험사 등록";
const PAGE_DESCRIPTION =
  "초안 상태의 보험사 레코드를 생성합니다. 접속·지원·청구·약관·카드납·운영 메타데이터를 이곳에서 함께 입력합니다.";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
}

export default async function NewInsurerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getInsurerAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { error } = await searchParams;

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            {PAGE_TITLE}
          </h1>
          <p className={`${textStyles.body} mt-3`}>{PAGE_DESCRIPTION}</p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_VISIBILITY_COPY.policySummary} />
        </div>

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm action={createInsurer} submitLabel="보험사 등록" />
        </section>
      </div>
    </main>
  );
}
