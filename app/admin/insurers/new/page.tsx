import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../access";
import { createInsurer } from "../actions";
import InsurerForm from "../form";

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
            Add insurer
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            Create a draft insurer record. Operational action fields can be edited here.
            Public directory reads remain static until PR-30; the public action card UI ships in PR-31.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm action={createInsurer} submitLabel="Create insurer" />
        </section>
      </div>
    </main>
  );
}
