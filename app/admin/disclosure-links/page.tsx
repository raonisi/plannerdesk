import Link from "next/link";
import { disclosureLinkEntries } from "@/lib/content";
import { disclosureCategoryOrder } from "@/lib/disclosure-display";
import { disclosureCategoryLabels } from "@/lib/disclosure-display";
import { filterDisclosureEntries } from "@/lib/admin/static-disclosure-admin";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminStaticContentNotice from "@/components/admin/AdminStaticContentNotice";
import { getDisclosureLinkAdminAccess } from "./access";
import DisclosureLinksAdminList, {
  serializeDisclosureRows,
} from "./disclosure-links-admin-list";
import {
  ADMIN_DISCLOSURE_COPY,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  status?: string;
  published?: string;
}

export default async function AdminDisclosureLinksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getDisclosureLinkAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolved = await searchParams;
  const filtered = filterDisclosureEntries(disclosureLinkEntries, resolved);

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              {ADMIN_DISCLOSURE_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_DISCLOSURE_COPY.pageDescription}
            </p>
          </div>
          <Link
            href="/admin/disclosure-links/new"
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

        <AdminStaticContentNotice dbPrLabel="DisclosureLink 모델 + migration" />

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_DISCLOSURE_COPY.policySummary} />
          <p className="mt-3 text-xs leading-relaxed text-[#4f5661]">
            {ADMIN_DISCLOSURE_COPY.governanceRule} 약관·공시 정보는 최신 기준 확인이
            필요합니다. {ADMIN_DISCLOSURE_COPY.guidanceNotice}{" "}
            {ADMIN_DISCLOSURE_COPY.staticPublicNote}
          </p>
        </div>

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="q"
            placeholder="제목·설명·ID 검색"
            defaultValue={resolved.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="category"
            defaultValue={resolved.category ?? "all"}
          >
            <option value="all">카테고리 전체</option>
            {disclosureCategoryOrder.map((value) => (
              <option key={value} value={value}>
                {disclosureCategoryLabels[value]}
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

        <DisclosureLinksAdminList
          entries={serializeDisclosureRows(filtered)}
          role={access.session.user?.role ?? null}
        />
      </div>
    </main>
  );
}
