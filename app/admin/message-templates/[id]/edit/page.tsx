import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminChangeHistoryMetadataPanel from "@/components/admin/AdminChangeHistoryMetadataPanel";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { buildMessageTemplateChangeHistoryMetadata } from "@/lib/admin/change-history-metadata";
import { getMessageTemplateAdminAccess } from "../../access";
import { updateMessageTemplate } from "../../actions";
import MessageTemplateForm from "../../form";
import { ADMIN_MESSAGE_TEMPLATE_COPY } from "../../visibility";

export const dynamic = "force-dynamic";

export default async function AdminMessageTemplateEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const { error } = await searchParams;

  let template = null;
  try {
    template = await prisma.messageTemplate.findUnique({ where: { id } });
  } catch {
    template = null;
  }

  if (!template) {
    return (
      <main className={`min-h-screen ${surfaces.page} px-4 py-8`}>
        <p className="text-sm text-[#4f5661]">
          {ADMIN_MESSAGE_TEMPLATE_COPY.notFound}
        </p>
      </main>
    );
  }

  const boundUpdate = updateMessageTemplate.bind(null, id);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            고객 안내 문구 수정
          </h1>
          <p className={`${textStyles.body} mt-3`}>{template.title}</p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice
            policySummary={ADMIN_MESSAGE_TEMPLATE_COPY.policySummary}
          />
        </div>

        <AdminChangeHistoryMetadataPanel
          snapshot={buildMessageTemplateChangeHistoryMetadata(template)}
        />

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <MessageTemplateForm
            action={boundUpdate}
            template={template}
            submitLabel="변경 저장"
          />
        </section>
      </div>
    </main>
  );
}
