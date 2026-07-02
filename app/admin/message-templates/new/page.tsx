import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getMessageTemplateAdminAccess } from "../access";
import { createMessageTemplate } from "../actions";
import MessageTemplateForm from "../form";
import { ADMIN_MESSAGE_TEMPLATE_COPY } from "../visibility";

export const dynamic = "force-dynamic";

export default async function AdminMessageTemplateNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { error } = await searchParams;

  return (
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            고객 안내 문구 등록
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            초안 상태로 등록합니다. 검수·안전 문구 확인 전에는 게시하지 마세요.
          </p>
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

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <MessageTemplateForm
            action={createMessageTemplate}
            submitLabel="문구 등록"
          />
        </section>
      </div>
    </main>
  );
}
