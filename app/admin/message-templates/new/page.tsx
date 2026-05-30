import Link from "next/link";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminStaticContentNotice from "@/components/admin/AdminStaticContentNotice";
import { STATIC_CONTENT_DB_REQUIRED_MESSAGE } from "@/lib/admin/static-content-guard";
import { getMessageTemplateAdminAccess } from "../access";
import { ADMIN_MESSAGE_TEMPLATE_COPY } from "../visibility";

export const dynamic = "force-dynamic";

export default async function AdminMessageTemplateNewPage() {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/message-templates"
          className="text-sm font-semibold text-[#1f6b55] hover:underline"
        >
          ← 목록으로
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#102235]">고객 안내 문구 등록</h1>
        <p className={`${textStyles.body} mt-2`}>
          {ADMIN_MESSAGE_TEMPLATE_COPY.pageDescription}
        </p>

        <div className="mt-6">
          <AdminStaticContentNotice dbPrLabel="MessageTemplate 모델 + migration" />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} mt-6 rounded-lg p-6`}
        >
          <p className="text-sm leading-relaxed text-[#4f5661]">
            {STATIC_CONTENT_DB_REQUIRED_MESSAGE}
          </p>
          <p className="mt-3 text-xs text-[#4f5661]">
            현재 데이터는 <code className="font-mono">lib/content/message-templates.ts</code>{" "}
            정적 파일에서 관리됩니다.
          </p>
        </section>
      </div>
    </main>
  );
}
