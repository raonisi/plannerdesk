import Link from "next/link";
import { CommunityPostCategory, CommunityPostStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminListPageCount, ADMIN_LIST_PAGE_SIZE, parseAdminListPage } from "@/lib/admin/list-pagination";
import { surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getCommunityAdminAccess } from "./access";
import CommunityPostsAdminList, { type CommunityAdminListRow } from "./community-posts-admin-list";
import { ADMIN_COMMUNITY_COPY, CATEGORY_LABEL, STATUS_LABEL } from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  status?: string;
  category?: string;
  isBlind?: string;
  showDeleted?: string;
  page?: string;
  error?: string;
}

function where(params: SearchParams): Prisma.CommunityPostWhereInput {
  const and: Prisma.CommunityPostWhereInput[] = [];
  if (params.showDeleted !== "true") and.push({ deletedAt: null });

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { adminMemo: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (params.status && params.status !== "all" && (Object.values(CommunityPostStatus) as string[]).includes(params.status)) {
    and.push({ status: params.status as CommunityPostStatus });
  }
  if (params.category && params.category !== "all" && (Object.values(CommunityPostCategory) as string[]).includes(params.category)) {
    and.push({ category: params.category as CommunityPostCategory });
  }
  if (params.isBlind === "true") and.push({ isBlind: true });
  if (params.isBlind === "false") and.push({ isBlind: false });

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

function qs(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const sp = new URLSearchParams();
  if (merged.q) sp.set("q", merged.q);
  if (merged.status && merged.status !== "all") sp.set("status", merged.status);
  if (merged.category && merged.category !== "all") sp.set("category", merged.category);
  if (merged.isBlind && merged.isBlind !== "all") sp.set("isBlind", merged.isBlind);
  if (merged.showDeleted === "true") sp.set("showDeleted", "true");
  if (merged.page && merged.page !== "1") sp.set("page", merged.page);
  return sp.toString() ? `?${sp.toString()}` : "";
}

function rows(data: Prisma.CommunityPostGetPayload<{ include: { author: { select: { id: true; name: true } } } }>[]): CommunityAdminListRow[] {
  return data.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    status: row.status,
    isBlind: row.isBlind,
    reportCount: row.reportCount,
    authorLabel: row.author.name?.trim() || `사용자 ${row.author.id.slice(0, 8)}…`,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  }));
}

export default async function AdminCommunityPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const access = await getCommunityAdminAccess();
  if (access.status === "locked") return <AdminLockedState />;
  if (access.status === "denied") return <AdminAccessDeniedState />;

  const params = await searchParams;
  const page = parseAdminListPage(params.page);
  const filters = where(params);

  let total = 0;
  let list: CommunityAdminListRow[] = [];
  let loadFailed = false;

  try {
    const [count, data] = await Promise.all([
      prisma.communityPost.count({ where: filters }),
      prisma.communityPost.findMany({
        where: filters,
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
        include: { author: { select: { id: true, name: true } } },
      }),
    ]);
    total = count;
    list = rows(data);
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
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">{ADMIN_COMMUNITY_COPY.pageTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#4f5661]">{ADMIN_COMMUNITY_COPY.pageDescription}</p>
          </div>
          <Link href="/admin" className="inline-flex items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235]">관리자 홈</Link>
        </div>

        {params.error ? <p className="mb-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{params.error}</p> : null}

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mb-5" />
        ) : (
          <>
            <div className="mb-5">
              <AdminSafetyNotice policySummary={ADMIN_COMMUNITY_COPY.policySummary} />
            </div>
            <form method="get" className="mb-5 grid gap-3 rounded-lg border border-[#d9c9a8] bg-white p-4 md:grid-cols-2 lg:grid-cols-5">
              <input name="q" defaultValue={params.q ?? ""} placeholder="제목·본문·관리자 메모 검색" className="min-h-11 rounded-md border border-[#d9c9a8] px-3 text-sm lg:col-span-2" />
              <select name="status" defaultValue={params.status ?? "all"} className="min-h-11 rounded-md border border-[#d9c9a8] px-3 text-sm">
                <option value="all">상태 전체</option>
                {Object.values(CommunityPostStatus).map((value) => <option key={value} value={value}>{STATUS_LABEL[value]}</option>)}
              </select>
              <select name="category" defaultValue={params.category ?? "all"} className="min-h-11 rounded-md border border-[#d9c9a8] px-3 text-sm">
                <option value="all">카테고리 전체</option>
                {Object.values(CommunityPostCategory).map((value) => <option key={value} value={value}>{CATEGORY_LABEL[value]}</option>)}
              </select>
              <select name="isBlind" defaultValue={params.isBlind ?? "all"} className="min-h-11 rounded-md border border-[#d9c9a8] px-3 text-sm">
                <option value="all">블라인드 전체</option>
                <option value="true">블라인드</option>
                <option value="false">정상</option>
              </select>
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-[#d9c9a8] px-3 text-xs text-[#4f5661]">
                <input type="checkbox" name="showDeleted" value="true" defaultChecked={params.showDeleted === "true"} /> 삭제 포함
              </label>
              <button type="submit" className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]">필터</button>
              <Link href="/admin/community-posts" className="min-h-11 rounded-md border border-[#d9c9a8] px-4 py-2 text-sm font-semibold text-[#102235]">초기화</Link>
            </form>

            <CommunityPostsAdminList rows={list} />

            <div className="mt-4 flex items-center justify-between text-sm text-[#4f5661]">
              <p>총 {total}건 · {page}/{pageCount} 페이지</p>
              <div className="flex gap-2">
                {page > 1 ? <Link href={`/admin/community-posts${qs(params, { page: String(page - 1) })}`} className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold">이전</Link> : null}
                {page < pageCount ? <Link href={`/admin/community-posts${qs(params, { page: String(page + 1) })}`} className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold">다음</Link> : null}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

