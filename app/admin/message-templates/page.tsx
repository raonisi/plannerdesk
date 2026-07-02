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
  adminListPageCount,
  ADMIN_LIST_PAGE_SIZE,
  parseAdminListPage,
} from "@/lib/admin/list-pagination";
import { surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import AdminPageStateNotice from "@/components/admin/AdminPageStateNotice";
import { getMessageTemplateAdminAccess } from "./access";
import {
  ADMIN_MESSAGE_TEMPLATE_COPY,
  AUDIENCE_LABEL,
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  RISK_LABEL,
  STATUS_LABEL,
  TONE_LABEL,
} from "./visibility";
import MessageTemplatesAdminList, {
  type MessageTemplateListRow,
} from "./message-templates-admin-list";

export const dynamic = "force-dynamic";

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

function serializeMessageTemplateRows(
  rows: Prisma.MessageTemplateGetPayload<Record<string, never>>[],
): MessageTemplateListRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    useCase: row.useCase,
    category: row.category,
    channel: row.channel,
    audienceType: row.audienceType,
    tone: row.tone,
    riskLevel: row.riskLevel,
    status: row.status,
    isPublished: row.isPublished,
    isInternalOnly: row.isInternalOnly,
    safeCopy: row.safeCopy,
    reviewedAt: row.reviewedAt
      ? row.reviewedAt.toISOString().slice(0, 10)
      : null,
  }));
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
    <main className={`min-h-[100dvh] ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
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

            {rows.length === 0 ? (
              <AdminPageStateNotice kind="empty" className="mb-5" />
            ) : null}

            <MessageTemplatesAdminList
              key={rows.map((row) => row.id).join(",")}
              rows={serializeMessageTemplateRows(rows)}
              role={access.session.user?.role ?? null}
            />

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
