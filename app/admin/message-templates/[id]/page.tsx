import Link from "next/link";
import { notFound } from "next/navigation";
import { customerMessageTemplates } from "@/lib/content";
import {
  messageSituationLabels,
  messageToneLabels,
} from "@/lib/message-templates/display";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminStaticContentNotice from "@/components/admin/AdminStaticContentNotice";
import { getMessageTemplateAdminAccess } from "../access";
import {
  ADMIN_MESSAGE_TEMPLATE_COPY,
  VERIFICATION_STATUS_LABEL,
  getMessageTemplateVerificationStatus,
} from "../visibility";

export const dynamic = "force-dynamic";

export default async function AdminMessageTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const template = customerMessageTemplates.find((row) => row.id === id);

  if (!template) {
    notFound();
  }

  const verificationStatus = getMessageTemplateVerificationStatus(template);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/message-templates"
          className="text-sm font-semibold text-[#1f6b55] hover:underline"
        >
          ← 목록으로
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#102235]">{template.title}</h1>
        <p className={`${textStyles.body} mt-2`}>
          {ADMIN_MESSAGE_TEMPLATE_COPY.pageDescription}
        </p>

        <div className="mt-5">
          <AdminStaticContentNotice dbPrLabel="MessageTemplate 모델 + migration" />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} mt-6 space-y-4 rounded-lg p-6`}
        >
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">ID</dt>
              <dd className="font-mono text-[#102235]">{template.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">상황</dt>
              <dd>
                {messageSituationLabels[template.situationCategory]} — {template.situation}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">어조</dt>
              <dd>{messageToneLabels[template.tone]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">검수 상태(추론)</dt>
              <dd>{VERIFICATION_STATUS_LABEL[verificationStatus]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">수정일</dt>
              <dd>{template.lastUpdatedAt}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">본문</dt>
              <dd className="whitespace-pre-wrap leading-relaxed">{template.body}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">안전 문구</dt>
              <dd className="whitespace-pre-wrap leading-relaxed">{template.safetyNote}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
