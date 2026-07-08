import Link from "next/link";
import { getAdminAccess } from "@/lib/auth/access";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import {
  ADMIN_SEARCH_EMPTY_MESSAGE,
  ADMIN_SEARCH_IDLE_HINT,
  ADMIN_SENSITIVE_SEARCH_MESSAGE,
} from "@/lib/search/admin-constants";
import {
  ADMIN_INTERNAL_FILTER_OPTIONS,
  ADMIN_PUBLISHED_FILTER_OPTIONS,
  ADMIN_SEARCH_FILTER_OPTIONS,
  ADMIN_SENSITIVE_FILTER_OPTIONS,
  ADMIN_STATUS_FILTER_OPTIONS,
} from "@/lib/search/admin-labels";
import {
  adminDomainToQueryParam,
  parseAdminSearchParams,
} from "@/lib/search/admin-query";
import { searchAdminContent } from "@/lib/search/admin";
import { AdminSearchResultsList } from "./admin-search-results";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "관리자 통합 검색 | PlannerDesk",
  description: "운영 데이터를 도메인·상태별로 빠르게 찾는 관리자 전용 검색입니다.",
};

interface AdminSearchPageParams {
  q?: string;
  domain?: string;
  status?: string;
  published?: string;
  internal?: string;
  sensitive?: string;
}

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchPageParams>;
}) {
  const access = await getAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return (
      <AdminAccessDeniedState email={access.session.user?.email ?? null} />
    );
  }

  const resolved = await searchParams;
  const filters = parseAdminSearchParams(
    resolved as Record<string, string | string[] | undefined>,
  );

  let blockedMessage: string | null = null;
  let results: Awaited<ReturnType<typeof searchAdminContent>> | null = null;

  if (filters.q) {
    results = await searchAdminContent(filters);
    if (!results.ok) {
      blockedMessage =
        results.blockedReason === "sensitive_query"
          ? ADMIN_SENSITIVE_SEARCH_MESSAGE
          : results.message;
    }
  }

  const showResults =
    filters.q && results?.ok && results.results.length > 0;
  const showEmpty = filters.q && results?.ok && results.results.length === 0;

  return (
    <div className={`min-h-[100dvh] ${surfaces.page}`}>
      <header
        className={`${surfaces.hero} border-b ${borders.divider} px-6 py-4 sm:px-8`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#d8c08f]">
              PlannerDesk Admin
            </p>
            <h1 className="text-xl font-bold text-white">관리자 통합 검색</h1>
          </div>
          <Link
            className="min-h-10 rounded-lg border border-[#d8c08f]/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"
            href="/admin"
          >
            데스크로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
        <p className={`${textStyles.body} max-w-3xl`}>
          보험사·청구서류·지식·공시·고객문구·제보 큐를 한 번에 찾습니다. public
          통합 검색과 분리되어 있으며, 비공개·초안 데이터도 관리자 권한으로만
          조회됩니다.
        </p>

        <div className="mt-6">
          <AdminSafetyNotice
            policySummary="제보 원문·고객 개인정보·의료정보는 검색 결과에 노출하지 않습니다. 보험금 지급 판단 도구가 아닙니다."
            showNeedsReview
          />
        </div>

        <section
          className={`mt-8 ${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-6`}
        >
          <form
            action="/admin/search"
            className="space-y-4"
            method="get"
            role="search"
          >
            <label className="block text-sm font-semibold text-[#102235]">
              검색어
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-[#d9c9a8] px-3 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
                defaultValue={filters.q}
                maxLength={50}
                name="q"
                placeholder="문서 제목, 보험사명, 링크명, 제보 제목"
                type="search"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSelect
                label="도메인"
                name="domain"
                options={ADMIN_SEARCH_FILTER_OPTIONS.map((o) => ({
                  value: o.param,
                  label: o.label,
                }))}
                value={adminDomainToQueryParam(filters.domain ?? "all")}
              />
              <FilterSelect
                label="상태"
                name="status"
                options={ADMIN_STATUS_FILTER_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={filters.status ?? "all"}
              />
              <FilterSelect
                label="공개 여부"
                name="published"
                options={ADMIN_PUBLISHED_FILTER_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={filters.published ?? "all"}
              />
              <FilterSelect
                label="내부 전용 (고객문구)"
                name="internal"
                options={ADMIN_INTERNAL_FILTER_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={filters.internal ?? "all"}
              />
              <FilterSelect
                label="민감 플래그 (제보)"
                name="sensitive"
                options={ADMIN_SENSITIVE_FILTER_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={filters.sensitive ?? "all"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="min-h-11 rounded-lg bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e]"
                type="submit"
              >
                검색
              </button>
              <Link
                className="inline-flex min-h-11 items-center rounded-lg border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#7a612d]"
                href="/admin/search"
              >
                초기화
              </Link>
            </div>

            <p className="text-xs leading-5 text-[#5f6670]">
              {ADMIN_SEARCH_IDLE_HINT} 개인정보·의료정보·보험금 판단성 검색어는
              제한됩니다.
            </p>
          </form>
        </section>

        {!filters.q ? (
          <p className="mt-6 rounded-lg border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-4 text-sm text-[#4f5661]">
            {ADMIN_SEARCH_IDLE_HINT}
          </p>
        ) : null}

        {blockedMessage ? (
          <div
            className="mt-6 rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
            role="alert"
          >
            {blockedMessage}
          </div>
        ) : null}

        {showResults && results?.ok ? (
          <div className="mt-6">
            <AdminSearchResultsList
              results={results.results}
              total={results.total}
            />
          </div>
        ) : null}

        {showEmpty ? (
          <p
            className="mt-6 rounded-md border border-[#d9c9a8] bg-white px-4 py-3 text-sm text-[#4f5661]"
            role="status"
          >
            {ADMIN_SEARCH_EMPTY_MESSAGE}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#303845]">
      {label}
      <select
        className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235]"
        defaultValue={value}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
