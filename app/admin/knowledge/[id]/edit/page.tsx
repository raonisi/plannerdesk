import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getKnowledgeAdminAccess } from "../../access";
import { updateKnowledgeArticle } from "../../actions";
import KnowledgeArticleForm from "../../form";
import { ADMIN_KNOWLEDGE_COPY } from "../../visibility";

export const dynamic = "force-dynamic";

export default async function EditKnowledgeArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getKnowledgeAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const { error } = await searchParams;

  const article = await prisma.knowledgeArticle.findUnique({ where: { id } });

  if (!article) {
    notFound();
  }

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            지식 문서 수정
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            보관·반려·초안 상태는 공개 화면에 노출되지 않습니다. public /knowledge DB
            연동은 별도 PR에서 진행합니다.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_KNOWLEDGE_COPY.policySummary} />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <KnowledgeArticleForm
            action={updateKnowledgeArticle.bind(null, id)}
            article={article}
            submitLabel="변경 사항 저장"
          />
        </section>
      </div>
    </main>
  );
}
