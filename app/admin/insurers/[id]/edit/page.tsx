import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminChangeHistoryMetadataPanel from "@/components/admin/AdminChangeHistoryMetadataPanel";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { buildInsurerChangeHistoryMetadata } from "@/lib/admin/change-history-metadata";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../../access";
import { updateInsurer } from "../../actions";
import InsurerForm from "../../form";
import { ADMIN_VISIBILITY_COPY } from "../../visibility";

const PAGE_TITLE = "보험사 정보 수정";
const PAGE_DESCRIPTION =
  "접속·지원·청구·약관·카드납·운영 메타데이터를 수정합니다. 하드 삭제는 제공되지 않으며, 공개 조건은 하단 안내문을 우선 확인해 주세요.";

export const dynamic = "force-dynamic";

interface EditInsurerPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function EditInsurerPage({
  params,
  searchParams,
}: EditInsurerPageProps) {
  const access = await getInsurerAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const { error } = await searchParams;
  const insurer = await prisma.insurer.findUnique({ where: { id } });

  if (!insurer) {
    notFound();
  }

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

        <AdminChangeHistoryMetadataPanel
          snapshot={buildInsurerChangeHistoryMetadata(insurer)}
        />

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm
            action={updateInsurer.bind(null, insurer.id)}
            insurer={insurer}
            submitLabel="변경 사항 저장"
          />
        </section>
      </div>
    </main>
  );
}
