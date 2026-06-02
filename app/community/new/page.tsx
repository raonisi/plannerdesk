import Link from "next/link";
import { CommunityPostCategory, CommunityPostVisibility } from "@prisma/client";
import CommunityPostEditor from "../post-editor";
import { createCommunityPost } from "../actions";
import { getCommunityViewer } from "../access";

export const dynamic = "force-dynamic";

export default async function CommunityNewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const q = await searchParams;
  const viewer = await getCommunityViewer();

  if (!viewer) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#4f5661]">로그인 후 이용할 수 있습니다.</main>;
  }
  if (!viewer.canWrite) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#4f5661]">{viewer.denyReason ?? "작성 권한이 없습니다."}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-2">
        <h1 className="text-2xl font-semibold text-[#102235]">커뮤니티 글쓰기</h1>
        <Link href="/community" className="text-sm font-semibold text-[#102235] underline">목록으로</Link>
      </div>
      {q.error ? <p className="mb-4 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-sm text-[#8b2e2e]">{q.error}</p> : null}
      <CommunityPostEditor
        initial={{
          category: CommunityPostCategory.field_tips,
          title: "",
          content: "",
          visibility: CommunityPostVisibility.verified_only,
          isPinned: false,
        }}
        isAdmin={viewer.isAdmin}
        submitLabel="게시글 등록"
        action={createCommunityPost}
      />
    </main>
  );
}

