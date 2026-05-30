import Link from "next/link";
import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  type KnowledgeArticle,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getKnowledgeAdminAccess } from "./access";
import {
  archiveKnowledgeArticle,
  setKnowledgeArticlePublished,
  setKnowledgeArticleStatus,
} from "./actions";
import {
  ADMIN_KNOWLEDGE_COPY,
  CATEGORY_LABEL,
  PUBLICATION_LABEL,
  RISK_LABEL,
  SOURCE_TYPE_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  VISIBILITY_LABEL,
  isKnowledgeArticlePubliclyVisible,
  wouldPublishBlocked,
} from "./visibility";

export const dynamic = "force-dynamic";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

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

function formatDate(value: Date | string | number | null | undefined) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") {
    return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  }
  if (tone === "gold") {
    return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  }
  if (tone === "navy") {
    return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  }
  if (tone === "red") {
    return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  }
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: KnowledgeArticleStatus): "green" | "gold" | "gray" | "red" {
  if (status === KnowledgeArticleStatus.verified) return "green";
  if (status === KnowledgeArticleStatus.needs_review) return "gold";
  if (status === KnowledgeArticleStatus.rejected) return "red";
  return "gray";
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
  
  let articles: KnowledgeArticle[] = [];
  let dbError = false;
  let dbErrorMessage = "";

  try {
    articles = await prisma.knowledgeArticle.findMany({
      where: buildWhere(resolvedSearchParams),
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    });
  } catch (error: unknown) {
    console.error("[AdminKnowledgePage] Database query failed:", error);
    dbError = true;
    dbErrorMessage = (error as Error)?.message || "Unknown database error";
  }

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
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
            {ADMIN_KNOWLEDGE_COPY.sensitiveNotice} {ADMIN_KNOWLEDGE_COPY.aiGuidance}
          </p>
        </div>

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
            <option value="all">상태 전체</option>
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

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {dbError ? (
            <div className="p-8 text-center text-[#8b2e2e]">
              <h2 className="text-lg font-semibold">
                데이터를 불러오는 중 오류가 발생했습니다.
              </h2>
              <p className={`${textStyles.body} mt-2 text-sm`}>
                데이터베이스 연결 문제일 수 있습니다. 잠시 후 다시 시도해 주세요.
              </p>
              <p className="mt-4 text-xs font-mono opacity-70 break-all max-w-2xl mx-auto text-left">
                {dbErrorMessage}
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                등록된 지식 문서가 없습니다.
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                새 문서를 작성하거나 필터를 조정해 주세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="px-4 py-3">문서</th>
                    <th className="px-4 py-3">분류·상태</th>
                    <th className="px-4 py-3">수정일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {articles.map((article) => {
                    const publiclyVisible = isKnowledgeArticlePubliclyVisible({
                      isPublished: article.isPublished,
                      status: article.status,
                    });
                    const togglePublishTarget = !article.isPublished;
                    const publishBlocked = wouldPublishBlocked({
                      isPublished: togglePublishTarget,
                      status: article.status,
                    });
                    const canArchive =
                      article.status !== KnowledgeArticleStatus.archived;

                    return (
                      <tr key={article.id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {article.title}
                          </div>
                          <div className="mt-1 font-mono text-xs text-[#5f6875]">
                            {article.slug}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-[#4f5661]">
                            {article.summary}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass("navy")}>
                              {CATEGORY_LABEL[article.category as KnowledgeArticleCategory] || String(article.category)}
                            </span>
                            <span className={badgeClass("navy")}>
                              {TYPE_LABEL[article.type as KnowledgeArticleType] || String(article.type)}
                            </span>
                            <span
                              className={badgeClass(statusTone(article.status))}
                            >
                              {STATUS_LABEL[article.status as KnowledgeArticleStatus] || String(article.status)}
                            </span>
                            <span
                              className={badgeClass(
                                article.isPublished ? "green" : "gray",
                              )}
                            >
                              {article.isPublished
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
                            {article.aiUsable ? (
                              <span className={badgeClass("gold")}>AI 참조</span>
                            ) : null}
                            <span className={badgeClass("gray")}>
                              {RISK_LABEL[article.riskLevel as KnowledgeRiskLevel] || String(article.riskLevel)}
                            </span>
                            <span className={badgeClass("gray")}>
                              {SOURCE_TYPE_LABEL[article.sourceType as keyof typeof SOURCE_TYPE_LABEL] || String(article.sourceType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(article.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:items-end">
                            <Link
                              href={`/admin/knowledge/${article.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                            >
                              수정
                            </Link>
                            {article.status !== KnowledgeArticleStatus.needs_review ? (
                              <form
                                action={setKnowledgeArticleStatus.bind(
                                  null,
                                  article.id,
                                  KnowledgeArticleStatus.needs_review,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] hover:bg-[#f7f1e5]"
                                >
                                  검수 필요
                                </button>
                              </form>
                            ) : null}
                            {article.status !== KnowledgeArticleStatus.verified ? (
                              <form
                                action={setKnowledgeArticleStatus.bind(
                                  null,
                                  article.id,
                                  KnowledgeArticleStatus.verified,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#1f6b55] hover:bg-[#edf7f2]"
                                >
                                  검수 완료
                                </button>
                              </form>
                            ) : null}
                            <form
                              action={setKnowledgeArticlePublished.bind(
                                null,
                                article.id,
                                togglePublishTarget,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={publishBlocked}
                                title={
                                  publishBlocked
                                    ? ADMIN_KNOWLEDGE_COPY.draftPublishBlocked
                                    : undefined
                                }
                                className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                              >
                                {article.isPublished ? "비게시" : "공개 전환"}
                              </button>
                            </form>
                            {canArchive ? (
                              <form
                                action={archiveKnowledgeArticle.bind(
                                  null,
                                  article.id,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#e8c4c4] px-3 py-1.5 text-xs font-semibold text-[#8b2e2e] hover:bg-[#fdf2f2]"
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
      </div>
    </main>
  );
}
