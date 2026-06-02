import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityReportReason, CommunityPostVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { reportCommunityPost, softDeleteCommunityPost } from "../actions";
import { getCommunityViewer } from "../access";
import { CATEGORY_LABEL, COMMUNITY_COPY, REPORT_REASON_LABEL, formatDate } from "../visibility";

export const dynamic = "force-dynamic";

function canViewPost(isAdmin: boolean, post: { status: string; deletedAt: Date | null; isBlind: boolean; visibility: CommunityPostVisibility }) {
  if (isAdmin) return true;
  if (post.deletedAt) return false;
  if (post.isBlind) return false;
  if (post.status !== "published") return false;
  return post.visibility === CommunityPostVisibility.public || post.visibility === CommunityPostVisibility.verified_only;
}

export default async function CommunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const viewer = await getCommunityViewer();

  if (!viewer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-[#4f5661]">로그인 후 커뮤니티를 이용할 수 있습니다.</p>
      </main>
    );
  }

  if (!viewer.canWrite && !viewer.isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">{viewer.denyReason ?? COMMUNITY_COPY.blockedNotice}</p>
      </main>
    );
  }

  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  if (!post) notFound();

  if (!canViewPost(viewer.isAdmin, post)) {
    if (post.isBlind && !viewer.isAdmin) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">{COMMUNITY_COPY.blindNotice}</p>
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">{COMMUNITY_COPY.missingNotice}</p>
      </main>
    );
  }

  const ownPost = post.authorId === viewer.userId;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/community" className="text-sm font-semibold text-[#102235] underline">목록으로</Link>

      {q.success ? <p className="mt-4 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-sm text-[#4f5661]">{q.success}</p> : null}
      {q.error ? <p className="mt-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{q.error}</p> : null}

      <article className="mt-4 rounded-lg border border-[#d9c9a8] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a612d]">{CATEGORY_LABEL[post.category]}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#102235]">{post.title}</h1>
        <p className="mt-2 text-xs text-[#5f6670]">
          작성자 {post.author.name?.trim() || `사용자 ${post.author.id.slice(0, 8)}…`} · 작성 {formatDate(post.createdAt.toISOString())} · 수정 {formatDate(post.updatedAt.toISOString())}
        </p>
        <div className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 text-[#303845]">{post.content}</div>
      </article>

      <div className="mt-5 flex flex-wrap gap-2">
        {ownPost || viewer.isAdmin ? (
          <Link href={`/community/${post.id}/edit`} className="rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235]">수정</Link>
        ) : null}

        {ownPost || viewer.isAdmin ? (
          <form action={softDeleteCommunityPost.bind(null, post.id)}>
            <button type="submit" className="rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-2 text-sm font-semibold text-[#8b2e2e]">삭제</button>
          </form>
        ) : null}
      </div>

      <section className="mt-8 rounded-lg border border-[#d9c9a8] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102235]">신고</h2>
        <p className="mt-1 text-xs text-[#5f6670]">자동 블라인드는 적용되지 않으며 관리자 검토 후 처리됩니다.</p>
        <form action={reportCommunityPost.bind(null, post.id)} className="mt-3 space-y-3">
          <select name="reason" defaultValue={CommunityReportReason.other} className="min-h-11 w-full rounded-md border border-[#d9c9a8] px-3 text-sm">
            {Object.entries(REPORT_REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <textarea name="message" maxLength={500} className="min-h-20 w-full rounded-md border border-[#d9c9a8] px-3 py-2 text-sm" placeholder="보충 설명 (선택, 500자 이하)" />
          <button type="submit" className="rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8]">신고 접수</button>
        </form>
      </section>
    </main>
  );
}

