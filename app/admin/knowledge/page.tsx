import Link from "next/link";
import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { probeKnowledgeArticleTable } from "@/lib/admin/dashboard-status";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import { getKnowledgeAdminAccess } from "./access";
import KnowledgeAdminList, { type KnowledgeListRow } from "./knowledge-admin-list";
import KnowledgeAdminWorkflowGuide from "@/components/admin/knowledge/KnowledgeAdminWorkflowGuide";
import {
  ADMIN_KNOWLEDGE_COPY,
  CATEGORY_LABEL,
  PUBLICATION_LABEL,
  RISK_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
} from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  type?: string;
  status?: string;
  published?: string;
  ai?: string;
  risk?: string;
}

function buildWhere(searchParams: SearchParams): Prisma.KnowledgeArticleWhereInput {
  const where: Prisma.KnowledgeArticleWhereInput = {};
  const query = searchParams.q?.trim();

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { sourceTitle: { contains: query, mode: "insensitive" } },
      { sourceUrl: { contains: query, mode: "insensitive" } },
      { tags: { has: query } },
    ];
  }

  if (
    searchParams.category &&
    (Object.values(KnowledgeArticleCategory) as string[]).includes(
      searchParams.category,
    )
  ) {
    where.category = searchParams.category as KnowledgeArticleCategory;
  }

  if (
    searchParams.type &&
    (Object.values(KnowledgeArticleType) as string[]).includes(searchParams.type)
  ) {
    where.type = searchParams.type as KnowledgeArticleType;
  }

  if (
    searchParams.status &&
    (Object.values(KnowledgeArticleStatus) as string[]).includes(
      searchParams.status,
    )
  ) {
    where.status = searchParams.status as KnowledgeArticleStatus;
  }

  if (searchParams.published === "true") {
    where.isPublished = true;
  }
  if (searchParams.published === "false") {
    where.isPublished = false;
  }

  if (searchParams.ai === "true") {
    where.aiUsable = true;
  }
  if (searchParams.ai === "false") {
    where.aiUsable = false;
  }

  if (
    searchParams.risk &&
    (Object.values(KnowledgeRiskLevel) as string[]).includes(searchParams.risk)
  ) {
    where.riskLevel = searchParams.risk as KnowledgeRiskLevel;
  }

  return where;
}

function serializeKnowledgeRows(
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: KnowledgeArticleCategory;
    type: KnowledgeArticleType;
    status: KnowledgeArticleStatus;
    isPublished: boolean;
    aiUsable: boolean;
    riskLevel: KnowledgeRiskLevel;
    sourceType: KnowledgeSourceType;
    updatedAt: Date;
  }>,
): KnowledgeListRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    category: row.category,
    type: row.type,
    status: row.status,
    isPublished: row.isPublished,
    aiUsable: row.aiUsable,
    riskLevel: row.riskLevel,
    sourceType: row.sourceType,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getKnowledgeAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolvedSearchParams = await searchParams;
  const tableProbe = await probeKnowledgeArticleTable();

  if (tableProbe.status === "missing_table") {
    return (
      <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-3xl">
          <AdminPageStateNotice
            kind="setupRequired"
            detail="KnowledgeArticle migration을 운영 DB에 적용한 뒤 다시 접속해 주세요."
          />
        </div>
      </main>
    );
  }

  if (tableProbe.status === "unavailable") {
    return (
      <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-3xl">
          <AdminPageStateNotice kind="error" />
        </div>
      </main>
    );
  }

  let articles: Awaited<ReturnType<typeof prisma.knowledgeArticle.findMany>>;
  try {
    articles = await prisma.knowledgeArticle.findMany({
      where: buildWhere(resolvedSearchParams),
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
  } catch {
    return (
      <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-3xl">
          <AdminPageStateNotice kind="error" />
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              {ADMIN_KNOWLEDGE_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_KNOWLEDGE_COPY.pageDescription}
            </p>
          </div>
          <Link
            href="/admin/knowledge/new"
            className="inline-flex items-center justify-center rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
          >
            새 지식 문서 작성
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_KNOWLEDGE_COPY.policySummary} />
          <p className="mt-3 text-xs leading-relaxed text-[#4f5661]">
            {ADMIN_KNOWLEDGE_COPY.sensitiveNotice} {ADMIN_KNOWLEDGE_COPY.guidanceNotice}{" "}
            PlannerDesk는 손해사정 업무를 수행하지 않습니다. PlannerDesk는 의료 진단을
            해석하지 않습니다. {ADMIN_KNOWLEDGE_COPY.aiGuidance} aiUsable은 기본 false로
            유지합니다.
          </p>
        </div>

        <KnowledgeAdminWorkflowGuide />

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 lg:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15 lg:col-span-1"
            name="q"
            placeholder="제목·요약·본문·출처·태그"
            defaultValue={resolvedSearchParams.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="category"
            defaultValue={resolvedSearchParams.category ?? "all"}
          >
            <option value="all">카테고리 전체</option>
            {Object.values(KnowledgeArticleCategory).map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="type"
            defaultValue={resolvedSearchParams.type ?? "all"}
          >
            <option value="all">유형 전체</option>
            {Object.values(KnowledgeArticleType).map((value) => (
              <option key={value} value={value}>
                {TYPE_LABEL[value]}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="status"
            defaultValue={resolvedSearchParams.status ?? "all"}
          >
            <option value="all">검수 상태 전체</option>
            {Object.values(KnowledgeArticleStatus).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="published"
            defaultValue={resolvedSearchParams.published ?? "all"}
          >
            <option value="all">게시 전체</option>
            <option value="true">{PUBLICATION_LABEL.published}</option>
            <option value="false">{PUBLICATION_LABEL.unpublished}</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="ai"
            defaultValue={resolvedSearchParams.ai ?? "all"}
          >
            <option value="all">AI 참조 전체</option>
            <option value="true">AI 참조 가능</option>
            <option value="false">AI 참조 불가</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            name="risk"
            defaultValue={resolvedSearchParams.risk ?? "all"}
          >
            <option value="all">위험도 전체</option>
            {Object.values(KnowledgeRiskLevel).map((value) => (
              <option key={value} value={value}>
                {RISK_LABEL[value]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
          >
            필터
          </button>
        </form>

        {articles.length === 0 ? (
          <AdminPageStateNotice kind="empty" className="mb-5" />
        ) : null}

        <KnowledgeAdminList
          articles={serializeKnowledgeRows(articles)}
          role={access.session.user?.role ?? null}
        />
      </div>
    </main>
  );
}
