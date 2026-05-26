import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../access";
import { createInsurer } from "../actions";
import InsurerForm from "../form";
import { ADMIN_VISIBILITY_COPY } from "../visibility";

const PAGE_TITLE = "\uc0c8 \ubcf4\ud5d8\uc0ac \ub4f1\ub85d";
const PAGE_DESCRIPTION =
  "\ucd08\uc548 \uc0c1\ud0dc\uc758 \ubcf4\ud5d8\uc0ac \ub808\ucf54\ub4dc\ub97c \uc0dd\uc131\ud569\ub2c8\ub2e4. \uc811\uc18d\u00b7\uc9c0\uc6d0\u00b7\uccad\uad6c\u00b7\uc57d\uad00\u00b7\uce74\ub4dc\ub0a9\u00b7\uc6b4\uc601 \uba54\ud0c0\ub370\uc774\ud130\ub97c \uc774\uacf3\uc5d0\uc11c \ud568\uaed8 \uc785\ub825\ud569\ub2c8\ub2e4.";

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

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_VISIBILITY_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_VISIBILITY_COPY.draftRule}</p>
        </div>

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm action={createInsurer} submitLabel="\ubcf4\ud5d8\uc0ac \ub4f1\ub85d" />
        </section>
      </div>
    </main>
  );
}
