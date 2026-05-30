import Link from "next/link";
import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  adminListPageCount,
  ADMIN_LIST_PAGE_SIZE,
  parseAdminListPage,
} from "@/lib/admin/list-pagination";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import { getDisclosureLinkAdminAccess } from "./access";
import {
  archiveDisclosureLink,
  setDisclosureLinkPublished,
  setDisclosureLinkStatus,
} from "./actions";
import {
  ADMIN_DISCLOSURE_COPY,
  CATEGORY_LABEL,
  PUBLICATION_LABEL,
  STATUS_LABEL,
  TARGET_TYPE_LABEL,
  VISIBILITY_LABEL,
  isDisclosureLinkPubliclyVisible,
  wouldPublishBlocked,
} from "./visibility";

export const dynamic = "force-dynamic";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  status?: string;
  published?: string;
  official?: string;
  insurerId?: string;
  sort?: string;
  page?: string;
}

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toISOString().slice(0, 10);
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: DisclosureLinkStatus): "green" | "gold" | "gray" | "red" {
  if (status === DisclosureLinkStatus.published) return "green";
  if (status === DisclosureLinkStatus.needs_review) return "gold";
  if (status === DisclosureLinkStatus.archived) return "red";
  return "gray";
}

function buildWhere(params: SearchParams): Prisma.DisclosureLinkWhereInput {
  const where: Prisma.DisclosureLinkWhereInput = {};
  const query = params.q?.trim();

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { url: { contains: query, mode: "insensitive" } },
      { sourceName: { contains: query, mode: "insensitive" } },
      { adminMemo: { contains: query, mode: "insensitive" } },
    ];
  }

  if (
    params.category &&
    (Object.values(DisclosureLinkCategory) as string[]).includes(params.category)
  ) {
    where.category = params.category as DisclosureLinkCategory;
  }

  if (
    params.status &&
    (Object.values(DisclosureLinkStatus) as string[]).includes(params.status)
  ) {
    where.status = params.status as DisclosureLinkStatus;
  }

  if (params.published === "true") where.isPublished = true;
  if (params.published === "false") where.isPublished = false;

  if (params.official === "true") where.isOfficialSource = true;
  if (params.official === "false") where.isOfficialSource = false;

  if (params.insurerId && params.insurerId !== "all") {
    where.insurerId = params.insurerId;
  }

  return where;
}

function buildOrderBy(sort: string | undefined): Prisma.DisclosureLinkOrderByWithRelationInput[] {
  if (sort === "created") {
    return [{ createdAt: "desc" }];
  }
  if (sort === "sortOrder") {
    return [{ sortOrder: "asc" }, { updatedAt: "desc" }];
  }
  if (sort === "verified") {
    return [{ lastVerifiedAt: "desc" }, { updatedAt: "desc" }];
  }
  return [{ updatedAt: "desc" }];
}

function filterQueryString(
  params: SearchParams,
  overrides: Partial<SearchParams>,
): string {
  const merged = { ...params, ...overrides };
  const parts = new URLSearchParams();
  if (merged.q) parts.set("q", merged.q);
  if (merged.category && merged.category !== "all") parts.set("category", merged.category);
  if (merged.status && merged.status !== "all") parts.set("status", merged.status);
  if (merged.published && merged.published !== "all") {
    parts.set("published", merged.published);
  }
  if (merged.official && merged.official !== "all") parts.set("official", merged.official);
  if (merged.insurerId && merged.insurerId !== "all") {
    parts.set("insurerId", merged.insurerId);
  }
  if (merged.sort) parts.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
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
  const page = parseAdminListPage(resolved.page);
  const where = buildWhere(resolved);

  type DisclosureLinkListRow = Prisma.DisclosureLinkGetPayload<{
    include: { insurer: { select: { id: true; name: true } } };
  }>;

  let total = 0;
  let rows: DisclosureLinkListRow[] = [];
  let insurers: { id: string; name: string }[] = [];
  let loadFailed = false;

  try {
    [total, rows, insurers] = await Promise.all([
      prisma.disclosureLink.count({ where }),
      prisma.disclosureLink.findMany({
        where,
        orderBy: buildOrderBy(resolved.sort),
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
        include: { insurer: { select: { id: true, name: true } } },
      }),
      prisma.insurer.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
  } catch {
    loadFailed = true;
  }

  const pageCount = adminListPageCount(total);

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
            className="inline-flex items-center justify-center rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F]"
          >
            새 링크 등록
          </Link>
        </div>

        {resolved.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolved.error}
          </div>
        ) : null}

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mb-5" />
        ) : (
          <>
            <div className="mb-5">
              <AdminSafetyNotice policySummary={ADMIN_DISCLOSURE_COPY.policySummary} />
            </div>

            <form
              className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 lg:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))_auto]`}
            >
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="q"
                placeholder="제목·설명·URL·출처·메모"
                defaultValue={resolved.q ?? ""}
              />
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="category"
                defaultValue={resolved.category ?? "all"}
              >
                <option value="all">카테고리 전체</option>
                {Object.values(DisclosureLinkCategory).map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="status"
                defaultValue={resolved.status ?? "all"}
              >
                <option value="all">상태 전체</option>
                {Object.values(DisclosureLinkStatus).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="published"
                defaultValue={resolved.published ?? "all"}
              >
                <option value="all">게시 전체</option>
                <option value="true">{PUBLICATION_LABEL.published}</option>
                <option value="false">{PUBLICATION_LABEL.unpublished}</option>
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="official"
                defaultValue={resolved.official ?? "all"}
              >
                <option value="all">공식 출처 전체</option>
                <option value="true">공식 출처</option>
                <option value="false">기타</option>
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="insurerId"
                defaultValue={resolved.insurerId ?? "all"}
              >
                <option value="all">보험사 전체</option>
                {insurers.map((insurer) => (
                  <option key={insurer.id} value={insurer.id}>
                    {insurer.name}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="sort"
                defaultValue={resolved.sort ?? "updated"}
              >
                <option value="updated">수정일순</option>
                <option value="created">등록일순</option>
                <option value="sortOrder">정렬순</option>
                <option value="verified">검증일순</option>
              </select>
              <button
                type="submit"
                className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
              >
                필터
              </button>
            </form>

            <section
              className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
            >
              {rows.length === 0 ? (
                <div className="p-8">
                  <AdminPageStateNotice kind="empty" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                    <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                      <tr>
                        <th className="px-4 py-3">제목</th>
                        <th className="px-4 py-3">분류</th>
                        <th className="px-4 py-3">대상</th>
                        <th className="px-4 py-3">상태</th>
                        <th className="px-4 py-3">검증일</th>
                        <th className="px-4 py-3 text-right">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7ddc9]">
                      {rows.map((row) => {
                        const publiclyVisible = isDisclosureLinkPubliclyVisible({
                          isPublished: row.isPublished,
                          status: row.status,
                        });
                        const togglePublish = !row.isPublished;
                        const publishBlocked = wouldPublishBlocked({
                          isPublished: togglePublish,
                          status: row.status,
                        });
                        const canArchive =
                          row.status !== DisclosureLinkStatus.archived;

                        return (
                          <tr key={row.id} className="align-top">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-[#102235]">
                                {row.title}
                              </div>
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block break-all text-xs text-[#1f6b55] hover:underline"
                              >
                                URL 열기
                              </a>
                            </td>
                            <td className="px-4 py-4">
                              <span className={badgeClass("navy")}>
                                {CATEGORY_LABEL[row.category]}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-[#4f5661]">
                              {row.insurer?.name ?? "공통"}
                              <div className="mt-1 text-xs">
                                {TARGET_TYPE_LABEL[row.targetType]}
                                {row.isOfficialSource ? (
                                  <span className={`${badgeClass("green")} ml-1`}>
                                    공식
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <span className={badgeClass(statusTone(row.status))}>
                                  {STATUS_LABEL[row.status]}
                                </span>
                                <span
                                  className={badgeClass(
                                    row.isPublished ? "green" : "gray",
                                  )}
                                >
                                  {row.isPublished
                                    ? PUBLICATION_LABEL.published
                                    : PUBLICATION_LABEL.unpublished}
                                </span>
                                <span
                                  className={badgeClass(
                                    publiclyVisible ? "green" : "gray",
                                  )}
                                >
                                  {publiclyVisible
                                    ? VISIBILITY_LABEL.visible
                                    : VISIBILITY_LABEL.hidden}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[#4f5661]">
                              {formatDate(row.lastVerifiedAt)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2 sm:items-end">
                                <Link
                                  href={`/admin/disclosure-links/${row.id}/edit`}
                                  className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                                >
                                  수정
                                </Link>
                                {row.status !== DisclosureLinkStatus.needs_review ? (
                                  <form
                                    action={setDisclosureLinkStatus.bind(
                                      null,
                                      row.id,
                                      DisclosureLinkStatus.needs_review,
                                    )}
                                  >
                                    <button
                                      type="submit"
                                      className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661]"
                                    >
                                      검수 필요
                                    </button>
                                  </form>
                                ) : null}
                                {row.status !== DisclosureLinkStatus.published ? (
                                  <form
                                    action={setDisclosureLinkStatus.bind(
                                      null,
                                      row.id,
                                      DisclosureLinkStatus.published,
                                    )}
                                  >
                                    <button
                                      type="submit"
                                      className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#1f6b55]"
                                    >
                                      검수 완료
                                    </button>
                                  </form>
                                ) : null}
                                <form
                                  action={setDisclosureLinkPublished.bind(
                                    null,
                                    row.id,
                                    togglePublish,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    disabled={publishBlocked}
                                    className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                                  >
                                    {row.isPublished ? "비게시" : "게시"}
                                  </button>
                                </form>
                                {canArchive ? (
                                  <form
                                    action={archiveDisclosureLink.bind(null, row.id)}
                                  >
                                    <button
                                      type="submit"
                                      className="w-full rounded-md border border-[#e8c4c4] px-3 py-1.5 text-xs font-semibold text-[#8b2e2e]"
                                    >
                                      보관
                                    </button>
                                  </form>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4f5661]">
              <p>
                총 {total}건 · {page}/{pageCount} 페이지
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={`/admin/disclosure-links${filterQueryString(resolved, {
                      page: String(page - 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    이전
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/admin/disclosure-links${filterQueryString(resolved, {
                      page: String(page + 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    다음
                  </Link>
                ) : null}
                <Link
                  href="/admin/disclosure-links"
                  className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                >
                  필터 초기화
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
