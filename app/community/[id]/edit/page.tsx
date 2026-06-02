import Link from "next/link";
import { notFound } from "next/navigation";
import CommunityPostEditor from "../../post-editor";
import { getCommunityViewer } from "../../access";
import { updateCommunityPost } from "../../actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CommunityEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const viewer = await getCommunityViewer();

  if (!viewer) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#4f5661]">로그인 후 이용할 수 있습니다.</main>;
  }

  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post || post.deletedAt) notFound();

  const ownPost = post.authorId === viewer.userId;
  if (!viewer.isAdmin && (!viewer.canWrite || !ownPost)) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#4f5661]">본인 글만 수정할 수 있습니다.</main>;
  }

  if (!viewer.isAdmin && post.isBlind) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#4f5661]">블라인드 처리된 글은 관리자 확인 후 수정할 수 있습니다.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold text-[#102235]">게시글 수정</h1>
        <Link href={`/community/${id}`} className="text-sm font-semibold text-[#102235] underline">상세로</Link>
      </div>
      {q.error ? <p className="mb-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{q.error}</p> : null}
      <CommunityPostEditor
        initial={{
          category: post.category,
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          isPinned: post.isPinned,
        }}
        isAdmin={viewer.isAdmin}
        submitLabel="수정 저장"
        action={updateCommunityPost.bind(null, id)}
      />
    </main>
  );
}

