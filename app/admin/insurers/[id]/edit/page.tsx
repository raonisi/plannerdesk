import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "../../access";
import { updateInsurer } from "../../actions";
import InsurerForm from "../../form";

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
            Edit insurer
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            Update insurer directory details. Hard delete is not supported.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}>
          <InsurerForm
            action={updateInsurer.bind(null, insurer.id)}
            insurer={insurer}
            submitLabel="Save changes"
          />
        </section>
      </div>
    </main>
  );
}
