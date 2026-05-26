import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../../access";
import { updateInsurer } from "../../actions";
import InsurerForm from "../../form";
import { ADMIN_VISIBILITY_COPY } from "../../visibility";

const PAGE_TITLE = "\ubcf4\ud5d8\uc0ac \uc815\ubcf4 \uc218\uc815";
const PAGE_DESCRIPTION =
  "\uc811\uc18d\u00b7\uc9c0\uc6d0\u00b7\uccad\uad6c\u00b7\uc57d\uad00\u00b7\uce74\ub4dc\ub0a9\u00b7\uc6b4\uc601 \uba54\ud0c0\ub370\uc774\ud130\ub97c \uc218\uc815\ud569\ub2c8\ub2e4. \ud558\ub4dc \uc0ad\uc81c\ub294 \uc81c\uacf5\ub418\uc9c0 \uc54a\uc73c\uba70, \uacf5\uac1c \uc870\uac74\uc740 \ud558\ub2e8 \uc548\ub0b4\ubb38\uc744 \uc6b0\uc120 \ud655\uc778\ud574 \uc8fc\uc138\uc694.";

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

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_VISIBILITY_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_VISIBILITY_COPY.draftRule}</p>
        </div>

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm
            action={updateInsurer.bind(null, insurer.id)}
            insurer={insurer}
            submitLabel="\ubcc0\uacbd \uc0ac\ud56d \uc800\uc7a5"
          />
        </section>
      </div>
    </main>
  );
}
