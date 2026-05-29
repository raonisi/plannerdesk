import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getClaimDocumentAdminAccess } from "../access";
import { createClaimDocument } from "../actions";
import ClaimDocumentForm from "../form";
import { ADMIN_CLAIM_DOC_COPY } from "../visibility";

const PAGE_TITLE = "새 청구서류 등록";
const PAGE_DESCRIPTION =
  "초안 상태의 청구서류 레코드를 생성합니다. 공식 출처 확인 전에는 공개로 전환하지 마세요.";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
}

export default async function NewClaimDocumentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getClaimDocumentAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { error } = await searchParams;

  // Pulled here so the form receives a stable list and can render in a
  // single round-trip. Only id and name are projected; no admin governance
  // fields leak into the dropdown payload.
  const insurers = await prisma.insurer.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
  });

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
          <AdminSafetyNotice policySummary={ADMIN_CLAIM_DOC_COPY.policySummary} />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <ClaimDocumentForm
            action={createClaimDocument}
            insurers={insurers}
            submitLabel="청구서류 등록"
          />
        </section>
      </div>
    </main>
  );
}
