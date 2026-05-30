import Link from "next/link";
import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
} from "@/lib/message-template/safety";
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
import { getMessageTemplateAdminAccess } from "./access";
import {
  archiveMessageTemplate,
  setMessageTemplatePublished,
  setMessageTemplateStatus,
} from "./actions";
import {
  ADMIN_MESSAGE_TEMPLATE_COPY,
  AUDIENCE_LABEL,
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  INTERNAL_LABEL,
  isMessageTemplatePubliclyVisible,
  PUBLICATION_LABEL,
  RISK_LABEL,
  STATUS_LABEL,
  TONE_LABEL,
  VISIBILITY_LABEL,
  wouldPublishBlocked,
} from "./visibility";
import { validatePublishRules } from "@/lib/validators/message-template";

export const dynamic = "force-dynamic";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  channel?: string;
  audience?: string;
  tone?: string;
  risk?: string;
  status?: string;
  published?: string;
  internal?: string;
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

function statusTone(status: MessageTemplateStatus): "green" | "gold" | "gray" | "red" {
  if (status === MessageTemplateStatus.published) return "green";
  if (status === MessageTemplateStatus.needs_review) return "gold";
  if (status === MessageTemplateStatus.archived) return "red";
  return "gray";
}

function riskTone(risk: MessageTemplateRiskLevel): "green" | "gold" | "red" {
  if (risk === MessageTemplateRiskLevel.high) return "red";
  if (risk === MessageTemplateRiskLevel.medium) return "gold";
  return "green";
}

function buildWhere(params: SearchParams): Prisma.MessageTemplateWhereInput {
  const where: Prisma.MessageTemplateWhereInput = {};
  const query = params.q?.trim();

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { body: { contains: query, mode: "insensitive" } },
      { safeCopy: { contains: query, mode: "insensitive" } },
      { complianceNote: { contains: query, mode: "insensitive" } },
    ];
  }

  if (
    params.category &&
    (Object.values(MessageTemplateCategory) as string[]).includes(params.category)
  ) {
    where.category = params.category as MessageTemplateCategory;
  }

  if (
    params.channel &&
    (Object.values(MessageTemplateChannel) as string[]).includes(params.channel)
  ) {
    where.channel = params.channel as MessageTemplateChannel;
  }

  if (
    params.audience &&
    (Object.values(MessageTemplateAudienceType) as string[]).includes(params.audience)
  ) {
    where.audienceType = params.audience as MessageTemplateAudienceType;
  }

  if (
    params.tone &&
    (Object.values(MessageTemplateTone) as string[]).includes(params.tone)
  ) {
    where.tone = params.tone as MessageTemplateTone;
  }

  if (
    params.risk &&
    (Object.values(MessageTemplateRiskLevel) as string[]).includes(params.risk)
  ) {
    where.riskLevel = params.risk as MessageTemplateRiskLevel;
  }

  if (
    params.status &&
    (Object.values(MessageTemplateStatus) as string[]).includes(params.status)
  ) {
    where.status = params.status as MessageTemplateStatus;
  }

  if (params.published === "true") where.isPublished = true;
  if (params.published === "false") where.isPublished = false;

  if (params.internal === "true") where.isInternalOnly = true;
  if (params.internal === "false") where.isInternalOnly = false;

  return where;
}

function buildOrderBy(
  sort: string | undefined,
): Prisma.MessageTemplateOrderByWithRelationInput[] {
  if (sort === "created") {
    return [{ createdAt: "desc" }];
  }
  if (sort === "sortOrder") {
    return [{ sortOrder: "asc" }, { updatedAt: "desc" }];
  }
  if (sort === "risk") {
    return [{ riskLevel: "desc" }, { updatedAt: "desc" }];
  }
  if (sort === "reviewed") {
    return [{ reviewedAt: "desc" }, { updatedAt: "desc" }];
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
  if (merged.category && merged.category !== "all") {
    parts.set("category", merged.category);
  }
  if (merged.channel && merged.channel !== "all") parts.set("channel", merged.channel);
  if (merged.audience && merged.audience !== "all") {
    parts.set("audience", merged.audience);
  }
  if (merged.tone && merged.tone !== "all") parts.set("tone", merged.tone);
  if (merged.risk && merged.risk !== "all") parts.set("risk", merged.risk);
  if (merged.status && merged.status !== "all") parts.set("status", merged.status);
  if (merged.published && merged.published !== "all") {
    parts.set("published", merged.published);
  }
  if (merged.internal && merged.internal !== "all") {
    parts.set("internal", merged.internal);
  }
  if (merged.sort) parts.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

export default async function AdminMessageTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getMessageTemplateAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolved = await searchParams;
  const page = parseAdminListPage(resolved.page);
  const where = buildWhere(resolved);

  type MessageTemplateListRow = Prisma.MessageTemplateGetPayload<object>;

  let total = 0;
  let rows: MessageTemplateListRow[] = [];
  let loadFailed = false;

  try {
    [total, rows] = await Promise.all([
      prisma.messageTemplate.count({ where }),
      prisma.messageTemplate.findMany({
        where,
        orderBy: buildOrderBy(resolved.sort),
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
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
              {ADMIN_MESSAGE_TEMPLATE_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_MESSAGE_TEMPLATE_COPY.pageDescription}
            </p>
          </div>
          <Link
            href="/admin/message-templates/new"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
          >
            신규 등록
          </Link>
        </div>

        {resolved.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolved.error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice
            policySummary={ADMIN_MESSAGE_TEMPLATE_COPY.policySummary}
          />
        </div>

        {loadFailed ? (
          <AdminPageStateNotice kind="error" />
        ) : (
          <>
            <form
              method="get"
              className="mb-5 grid gap-3 rounded-lg border border-[#e7ddc9] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="text-xs font-semibold text-[#102235] sm:col-span-2 lg:col-span-4">
                검색
                <input
                  name="q"
                  defaultValue={resolved.q ?? ""}
                  placeholder="제목, 본문, 안전 문구, 금지 표현…"
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-3 py-2 text-sm"
                />
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                카테고리
                <select
                  name="category"
                  defaultValue={resolved.category ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateCategory).map((value) => (
                    <option key={value} value={value}>
                      {CATEGORY_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                채널
                <select
                  name="channel"
                  defaultValue={resolved.channel ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateChannel).map((value) => (
                    <option key={value} value={value}>
                      {CHANNEL_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                대상
                <select
                  name="audience"
                  defaultValue={resolved.audience ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateAudienceType).map((value) => (
                    <option key={value} value={value}>
                      {AUDIENCE_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                톤
                <select
                  name="tone"
                  defaultValue={resolved.tone ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateTone).map((value) => (
                    <option key={value} value={value}>
                      {TONE_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                위험도
                <select
                  name="risk"
                  defaultValue={resolved.risk ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateRiskLevel).map((value) => (
                    <option key={value} value={value}>
                      {RISK_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                상태
                <select
                  name="status"
                  defaultValue={resolved.status ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  {Object.values(MessageTemplateStatus).map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                게시
                <select
                  name="published"
                  defaultValue={resolved.published ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="true">게시 중</option>
                  <option value="false">비게시</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                내부 전용
                <select
                  name="internal"
                  defaultValue={resolved.internal ?? "all"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="true">내부 전용</option>
                  <option value="false">외부 안내</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-[#102235]">
                정렬
                <select
                  name="sort"
                  defaultValue={resolved.sort ?? "updated"}
                  className="mt-1 w-full rounded-md border border-[#d9c9a8] px-2 py-2 text-sm"
                >
                  <option value="updated">수정일순</option>
                  <option value="created">최신순</option>
                  <option value="sortOrder">sortOrder</option>
                  <option value="risk">위험도순</option>
                  <option value="reviewed">검수일순</option>
                </select>
              </label>

              <div className="flex items-end sm:col-span-2">
                <button
                  type="submit"
                  className="min-h-11 w-full rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] sm:w-auto"
                >
                  필터
                </button>
              </div>
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
                        <th className="px-4 py-3">분류·채널</th>
                        <th className="px-4 py-3">상태·공개</th>
                        <th className="px-4 py-3">검수일</th>
                        <th className="px-4 py-3 text-right">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7ddc9]">
                      {rows.map((row) => {
                        const publiclyVisible = isMessageTemplatePubliclyVisible({
                          isPublished: row.isPublished,
                          status: row.status,
                          isInternalOnly: row.isInternalOnly,
                        });
                        const togglePublish = !row.isPublished;
                        const publishBlocked =
                          wouldPublishBlocked({
                            isPublished: togglePublish,
                            status: row.status,
                          }) ||
                          validatePublishRules({
                            isPublished: togglePublish,
                            status: row.status,
                            isInternalOnly: row.isInternalOnly,
                            safeCopy: row.safeCopy,
                            riskLevel: row.riskLevel,
                          }) !== null;
                        const canArchive =
                          row.status !== MessageTemplateStatus.archived;
                        const missingSafeCopy = !row.safeCopy?.trim();
                        const prohibitedHit = findProhibitedPhrase(row.body);
                        const sensitiveHit = findSensitiveVariable(row.body);

                        return (
                          <tr key={row.id} className="align-top">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-[#102235]">
                                {row.title}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-[#4f5661]">
                                {row.useCase}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {missingSafeCopy ? (
                                  <span className={badgeClass("gold")}>
                                    안전 문구 없음
                                  </span>
                                ) : null}
                                {prohibitedHit ? (
                                  <span className={badgeClass("red")}>
                                    금지 표현
                                  </span>
                                ) : null}
                                {sensitiveHit ? (
                                  <span className={badgeClass("red")}>
                                    민감 변수
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={badgeClass("navy")}>
                                {CATEGORY_LABEL[row.category]}
                              </span>
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className={badgeClass("gray")}>
                                  {CHANNEL_LABEL[row.channel]}
                                </span>
                                <span className={badgeClass("gray")}>
                                  {TONE_LABEL[row.tone]}
                                </span>
                                <span className={badgeClass(riskTone(row.riskLevel))}>
                                  위험 {RISK_LABEL[row.riskLevel]}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-[#4f5661]">
                                {AUDIENCE_LABEL[row.audienceType]}
                              </p>
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
                                    row.isInternalOnly ? "gold" : "gray",
                                  )}
                                >
                                  {row.isInternalOnly
                                    ? INTERNAL_LABEL.internal
                                    : INTERNAL_LABEL.external}
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
                              {formatDate(row.reviewedAt)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2 sm:items-end">
                                <Link
                                  href={`/admin/message-templates/${row.id}/edit`}
                                  className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                                >
                                  수정
                                </Link>
                                {row.status !== MessageTemplateStatus.needs_review ? (
                                  <form
                                    action={setMessageTemplateStatus.bind(
                                      null,
                                      row.id,
                                      MessageTemplateStatus.needs_review,
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
                                {row.status !== MessageTemplateStatus.published ? (
                                  <form
                                    action={setMessageTemplateStatus.bind(
                                      null,
                                      row.id,
                                      MessageTemplateStatus.published,
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
                                  action={setMessageTemplatePublished.bind(
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
                                    action={archiveMessageTemplate.bind(null, row.id)}
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
                    href={`/admin/message-templates${filterQueryString(resolved, {
                      page: String(page - 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    이전
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/admin/message-templates${filterQueryString(resolved, {
                      page: String(page + 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    다음
                  </Link>
                ) : null}
                <Link
                  href="/admin/message-templates"
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
