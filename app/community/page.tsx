import Link from "next/link";
import { CommunityPostCategory, CommunityPostVisibility, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adminListPageCount, ADMIN_LIST_PAGE_SIZE, parseAdminListPage } from "@/lib/admin/list-pagination";
import { getCommunityViewer } from "./access";
import { CATEGORY_LABEL, COMMUNITY_COPY, STATUS_LABEL, formatDate, postStatusTone } from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
  page?: string;
  success?: string;
  error?: string;
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  const base = "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";
  if (tone === "green") return `${base} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${base} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${base} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${base} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${base} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function buildWhere(category: string | undefined): Prisma.CommunityPostWhereInput {
  const where: Prisma.CommunityPostWhereInput = {
    status: "published",
    deletedAt: null,
    isBlind: false,
    visibility: { in: [CommunityPostVisibility.verified_only, CommunityPostVisibility.public] },
  };

  if (category && (Object.values(CommunityPostCategory) as string[]).includes(category)) {
    where.category = category as CommunityPostCategory;
  }

  return where;
}

function queryString(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (merged.category && merged.category !== "all") qs.set("category", merged.category);
  if (merged.page && merged.page !== "1") qs.set("page", merged.page);
  return qs.toString() ? `?${qs.toString()}` : "";
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const viewer = await getCommunityViewer();

  if (!viewer) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#102235]">{COMMUNITY_COPY.pageTitle}</h1>
        <p className="mt-3 text-sm text-[#4f5661]">로그인 후 커뮤니티를 이용할 수 있습니다.</p>
      </main>
    );
  }

  if (!viewer.canWrite && !viewer.isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#102235]">{COMMUNITY_COPY.pageTitle}</h1>
        <p className="mt-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
          {viewer.denyReason ?? COMMUNITY_COPY.blockedNotice}
        </p>
      </main>
    );
  }

  const page = parseAdminListPage(params.page);
  const where = buildWhere(params.category);
  const [total, posts] = await Promise.all([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
      take: ADMIN_LIST_PAGE_SIZE,
      select: {
        id: true,
        category: true,
        title: true,
        status: true,
        isPinned: true,
        updatedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    }),
  ]);

  const pageCount = adminListPageCount(total);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#102235]">{COMMUNITY_COPY.pageTitle}</h1>
          <p className="mt-2 text-sm text-[#4f5661]">{COMMUNITY_COPY.pageDescription}</p>
        </div>
        <Link href="/community/new" className="rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8]">
          새 글 작성
        </Link>
      </div>

      {params.success ? <p className="mb-4 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-sm text-[#4f5661]">{params.success}</p> : null}
      {params.error ? <p className="mb-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{params.error}</p> : null}

      <form className="mb-5 grid gap-3 rounded-lg border border-[#d9c9a8] bg-white p-4 md:grid-cols-[1fr_auto_auto]" method="get">
        <select name="category" defaultValue={params.category ?? "all"} className="min-h-11 rounded-md border border-[#d9c9a8] px-3 text-sm">
          <option value="all">카테고리 전체</option>
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit" className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]">필터</button>
        <Link href="/community" className="min-h-11 rounded-md border border-[#d9c9a8] px-4 py-2 text-sm font-semibold text-[#102235]">초기화</Link>
      </form>

      <section className="space-y-3">
        {posts.length === 0 ? (
          <p className="rounded-md border border-[#d9c9a8] bg-white px-4 py-5 text-sm text-[#4f5661]">표시할 게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-[#d9c9a8] bg-white p-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className={badgeClass("gray")}>{CATEGORY_LABEL[post.category]}</span>
                <span className={badgeClass(postStatusTone(post.status))}>{STATUS_LABEL[post.status]}</span>
                {post.isPinned ? <span className={badgeClass("navy")}>고정</span> : null}
              </div>
              <h2 className="text-lg font-semibold text-[#102235]">
                <Link href={`/community/${post.id}`} className="hover:underline">{post.title}</Link>
              </h2>
              <p className="mt-2 text-xs text-[#5f6670]">
                작성자 {post.author.name?.trim() || `사용자 ${post.author.id.slice(0, 8)}…`} · 작성 {formatDate(post.createdAt.toISOString())} · 수정 {formatDate(post.updatedAt.toISOString())}
              </p>
            </article>
          ))
        )}
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#4f5661]">
        <p>총 {total}건 · {page}/{pageCount} 페이지</p>
        <div className="flex gap-2">
          {page > 1 ? <Link href={`/community${queryString(params, { page: String(page - 1) })}`} className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold">이전</Link> : null}
          {page < pageCount ? <Link href={`/community${queryString(params, { page: String(page + 1) })}`} className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold">다음</Link> : null}
        </div>
      </div>
    </main>
  );
}

