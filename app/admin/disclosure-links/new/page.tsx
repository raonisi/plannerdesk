import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getDisclosureLinkAdminAccess } from "../access";
import { createDisclosureLink } from "../actions";
import DisclosureLinkForm from "../form";
import { ADMIN_DISCLOSURE_COPY } from "../visibility";

export const dynamic = "force-dynamic";

export default async function NewDisclosureLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getDisclosureLinkAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { error } = await searchParams;

  const insurers = await prisma.insurer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            공시·약관 링크 등록
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            초안 상태로 등록합니다. 공식 출처 확인 전에는 게시하지 마세요.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_DISCLOSURE_COPY.policySummary} />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <DisclosureLinkForm
            action={createDisclosureLink}
            insurers={insurers}
            submitLabel="링크 등록"
          />
        </section>
      </div>
    </main>
  );
}
