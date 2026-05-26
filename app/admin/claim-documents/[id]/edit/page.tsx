import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getClaimDocumentAdminAccess } from "../../access";
import { updateClaimDocument } from "../../actions";
import ClaimDocumentForm from "../../form";
import { ADMIN_CLAIM_DOC_COPY } from "../../visibility";

const PAGE_TITLE = "\uccad\uad6c\uc11c\ub958 \uc815\ubcf4 \uc218\uc815";
const PAGE_DESCRIPTION =
  "\uc81c\ubaa9, \uc548\ub0b4 \ubcf8\ubb38, \uacf5\uc2dd \ub9c1\ud06c, \uace0\uac1d\uc6a9 \uba54\uc2dc\uc9c0 \ud15c\ud50c\ub9bf, \uc6b4\uc601 \uba54\ud0c0\ub370\uc774\ud130\ub97c \uc218\uc815\ud569\ub2c8\ub2e4. \ud558\ub4dc \uc0ad\uc81c\ub294 \uc81c\uacf5\ub418\uc9c0 \uc54a\uc73c\uba70, \uacf5\uac1c \uc870\uac74\uc740 \ud558\ub2e8 \uc548\ub0b4\ubb38\uc744 \uc6b0\uc120 \ud655\uc778\ud574 \uc8fc\uc138\uc694.";

export const dynamic = "force-dynamic";

interface EditClaimDocumentPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function EditClaimDocumentPage({
  params,
  searchParams,
}: EditClaimDocumentPageProps) {
  const access = await getClaimDocumentAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const { error } = await searchParams;
  const claimDocument = await prisma.claimDocument.findUnique({
    where: { id },
  });

  if (!claimDocument) {
    notFound();
  }

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
            action={updateClaimDocument.bind(null, claimDocument.id)}
            claimDocument={claimDocument}
            insurers={insurers}
            submitLabel={"\ubcc0\uacbd \uc0ac\ud56d \uc800\uc7a5"}
          />
        </section>
      </div>
    </main>
  );
}
