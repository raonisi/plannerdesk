import Link from "next/link";
import { customerMessageTemplates } from "@/lib/content";
import { filterMessageTemplates } from "@/lib/admin/static-message-template-admin";
import {
  messageSituationLabels,
  messageSituationOrder,
  messageToneLabels,
} from "@/lib/message-templates/display";
import type { MessageTone } from "@/lib/content";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminStaticContentNotice from "@/components/admin/AdminStaticContentNotice";
import { getMessageTemplateAdminAccess } from "./access";
import MessageTemplatesAdminList, {
  serializeMessageTemplateRows,
} from "./message-templates-admin-list";
import {
  ADMIN_MESSAGE_TEMPLATE_COPY,
  MESSAGE_TEMPLATE_FORBIDDEN_PHRASES,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
  q?: string;
  situation?: string;
  tone?: string;
  status?: string;
  published?: string;
}

const toneOptions = Object.keys(messageToneLabels) as MessageTone[];

export default async function AdminMessageTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolved = await searchParams;
  const filtered = filterMessageTemplates(customerMessageTemplates, resolved);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              {ADMIN_MESSAGE_TEMPLATE_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_MESSAGE_TEMPLATE_COPY.pageDescription}
            </p>
          </div>
          <Link
            href="/admin/message-templates/new"
            className="inline-flex items-center justify-center rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-2 text-sm font-semibold text-[#7b5b19] hover:bg-[#efe4cf]"
          >
            신규 등록 (DB PR 이후)
          </Link>
        </div>

        {resolved.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolved.error}
          </div>
        ) : null}

        <AdminStaticContentNotice dbPrLabel="MessageTemplate 모델 + migration" />

        <div className="mb-5">
          <AdminSafetyNotice
            policySummary={ADMIN_MESSAGE_TEMPLATE_COPY.policySummary}
          />
          <p className="mt-3 text-xs leading-relaxed text-[#4f5661]">
            {ADMIN_MESSAGE_TEMPLATE_COPY.sensitiveNotice}{" "}
            {ADMIN_MESSAGE_TEMPLATE_COPY.guidanceNotice} 상품 가입을 과도하게 유도하거나
            공포를 조장하는 표현은 금지됩니다.
          </p>
          <p className="mt-2 text-xs text-[#4f5661]">
            금지 표현 예: {MESSAGE_TEMPLATE_FORBIDDEN_PHRASES.join(" · ")}
          </p>
        </div>

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="q"
            placeholder="제목·본문·상황 검색"
            defaultValue={resolved.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="situation"
            defaultValue={resolved.situation ?? "all"}
          >
            <option value="all">상황 전체</option>
            {messageSituationOrder.map((value) => (
              <option key={value} value={value}>
                {messageSituationLabels[value]}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="tone"
            defaultValue={resolved.tone ?? "all"}
          >
            <option value="all">어조 전체</option>
            {toneOptions.map((value) => (
              <option key={value} value={value}>
                {messageToneLabels[value]}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="status"
            defaultValue={resolved.status ?? "all"}
          >
            <option value="all">검수 전체</option>
            <option value="draft">{VERIFICATION_STATUS_LABEL.draft}</option>
            <option value="needs_review">
              {VERIFICATION_STATUS_LABEL.needs_review}
            </option>
            <option value="verified">{VERIFICATION_STATUS_LABEL.verified}</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="published"
            defaultValue={resolved.published ?? "all"}
          >
            <option value="all">게시(편집) 전체</option>
            <option value="true">{PUBLICATION_LABEL.published}</option>
            <option value="false">{PUBLICATION_LABEL.unpublished}</option>
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
          >
            필터
          </button>
        </form>

        <MessageTemplatesAdminList
          templates={serializeMessageTemplateRows(filtered)}
          role={access.session.user?.role ?? null}
        />
      </div>
    </main>
  );
}
