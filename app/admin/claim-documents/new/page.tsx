import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getClaimDocumentAdminAccess } from "../access";
import { createClaimDocument } from "../actions";
import ClaimDocumentForm from "../form";
import { ADMIN_CLAIM_DOC_COPY } from "../visibility";

const PAGE_TITLE = "\uc0c8 \uccad\uad6c\uc11c\ub958 \ub4f1\ub85d";
const PAGE_DESCRIPTION =
  "\ucd08\uc548 \uc0c1\ud0dc\uc758 \uccad\uad6c\uc11c\ub958 \ub808\ucf54\ub4dc\ub97c \uc0dd\uc131\ud569\ub2c8\ub2e4. \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778 \uc804\uc5d0\ub294 \uacf5\uac1c\ub85c \uc804\ud658\ud558\uc9c0 \ub9c8\uc138\uc694.";

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

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_CLAIM_DOC_COPY.draftRule}</p>
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <ClaimDocumentForm
            action={createClaimDocument}
            insurers={insurers}
            submitLabel={"\uccad\uad6c\uc11c\ub958 \ub4f1\ub85d"}
          />
        </section>
      </div>
    </main>
  );
}
