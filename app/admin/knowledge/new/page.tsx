import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getKnowledgeAdminAccess } from "../access";
import { createKnowledgeArticle } from "../actions";
import KnowledgeArticleForm from "../form";
import { ADMIN_KNOWLEDGE_COPY } from "../visibility";

export const dynamic = "force-dynamic";

export default async function NewKnowledgeArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getKnowledgeAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { error } = await searchParams;

  return (
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            새 지식 문서 작성
          </h1>
          <p className={`${textStyles.body} mt-3`}>
            기본값은 초안·비게시·AI 참조 불가입니다. 공개 화면 DB 연동 전에도 검수
            흐름을 적용합니다.
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
            action={createKnowledgeArticle}
            submitLabel="지식 문서 등록"
          />
        </section>
      </div>
    </main>
  );
}
