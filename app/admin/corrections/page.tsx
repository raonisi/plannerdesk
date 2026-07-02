import Link from "next/link";
import {
  CorrectionRequestPriority,
  CorrectionRequestStatus,
  CorrectionRequestType,
  CorrectionTargetType,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
import { getCorrectionAdminAccess } from "./access";
import CorrectionsAdminList, {
  type CorrectionListRow,
} from "./corrections-admin-list";
import {
  ADMIN_CORRECTION_COPY,
  PRIORITY_LABEL,
  REQUEST_TYPE_LABELS,
  STATUS_LABEL,
  TARGET_TYPE_LABELS,
} from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
  q?: string;
  status?: string;
  targetType?: string;
  requestType?: string;
  priority?: string;
  sensitive?: string;
  redaction?: string;
  resolved?: string;
  showDeleted?: string;
  showArchived?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: string;
}

function parseDateStart(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(`${value.trim()}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(`${value.trim()}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function buildWhere(params: SearchParams): Prisma.CorrectionRequestWhereInput {
  const and: Prisma.CorrectionRequestWhereInput[] = [];

  if (params.showDeleted !== "true") {
    and.push({ deletedAt: null });
  }

  if (params.showArchived !== "true") {
    and.push({ status: { not: CorrectionRequestStatus.archived } });
  }

  const query = params.q?.trim();
  if (query) {
    and.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { message: { contains: query, mode: "insensitive" } },
        { adminMemo: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (
    params.status &&
    params.status !== "all" &&
    (Object.values(CorrectionRequestStatus) as string[]).includes(params.status)
  ) {
    and.push({ status: params.status as CorrectionRequestStatus });
  }

  if (
    params.targetType &&
    params.targetType !== "all" &&
    (Object.values(CorrectionTargetType) as string[]).includes(
      params.targetType,
    )
  ) {
    and.push({ targetType: params.targetType as CorrectionTargetType });
  }

  if (
    params.requestType &&
    params.requestType !== "all" &&
    (Object.values(CorrectionRequestType) as string[]).includes(
      params.requestType,
    )
  ) {
    and.push({ requestType: params.requestType as CorrectionRequestType });
  }

  if (
    params.priority &&
    params.priority !== "all" &&
    (Object.values(CorrectionRequestPriority) as string[]).includes(
      params.priority,
    )
  ) {
    and.push({ priority: params.priority as CorrectionRequestPriority });
  }

  if (params.sensitive === "true") {
    and.push({ containsSensitiveData: true });
  }
  if (params.sensitive === "false") {
    and.push({ containsSensitiveData: false });
  }

  if (params.redaction === "true") {
    and.push({ redactionRequired: true });
  }
  if (params.redaction === "false") {
    and.push({ redactionRequired: false });
  }

  if (params.resolved === "true") {
    and.push({ resolvedAt: { not: null } });
  }
  if (params.resolved === "false") {
    and.push({ resolvedAt: null });
  }

  const createdFrom = parseDateStart(params.createdFrom);
  const createdTo = parseDateEnd(params.createdTo);
  if (createdFrom || createdTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (createdFrom) createdAt.gte = createdFrom;
    if (createdTo) createdAt.lte = createdTo;
    and.push({ createdAt });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

function buildOrderBy(): Prisma.CorrectionRequestOrderByWithRelationInput[] {
  return [
    { redactionRequired: "desc" },
    { containsSensitiveData: "desc" },
    { priority: "desc" },
    { createdAt: "desc" },
  ];
}

function filterQueryString(
  params: SearchParams,
  overrides: Partial<SearchParams>,
): string {
  const merged = { ...params, ...overrides };
  const parts = new URLSearchParams();
  if (merged.q) parts.set("q", merged.q);
  if (merged.status && merged.status !== "all") parts.set("status", merged.status);
  if (merged.targetType && merged.targetType !== "all") {
    parts.set("targetType", merged.targetType);
  }
  if (merged.requestType && merged.requestType !== "all") {
    parts.set("requestType", merged.requestType);
  }
  if (merged.priority && merged.priority !== "all") {
    parts.set("priority", merged.priority);
  }
  if (merged.sensitive && merged.sensitive !== "all") {
    parts.set("sensitive", merged.sensitive);
  }
  if (merged.redaction && merged.redaction !== "all") {
    parts.set("redaction", merged.redaction);
  }
  if (merged.resolved && merged.resolved !== "all") {
    parts.set("resolved", merged.resolved);
  }
  if (merged.showDeleted === "true") parts.set("showDeleted", "true");
  if (merged.showArchived === "true") parts.set("showArchived", "true");
  if (merged.createdFrom) parts.set("createdFrom", merged.createdFrom);
  if (merged.createdTo) parts.set("createdTo", merged.createdTo);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

function serializeRows(
  rows: Prisma.CorrectionRequestGetPayload<{
    include: {
      resolvedBy: { select: { id: true; name: true; email: true } };
    };
  }>[],
): CorrectionListRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    requestType: row.requestType,
    targetType: row.targetType,
    targetId: row.targetId,
    status: row.status,
    priority: row.priority,
    containsSensitiveData: row.containsSensitiveData,
    redactionRequired: row.redactionRequired,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByLabel:
      row.resolvedBy?.name ??
      row.resolvedBy?.email ??
      (row.resolvedById ? row.resolvedById.slice(0, 8) : null),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  }));
}

export default async function AdminCorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getCorrectionAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolved = await searchParams;
  const page = parseAdminListPage(resolved.page);
  const where = buildWhere(resolved);

  let total = 0;
  let rows: CorrectionListRow[] = [];
  let loadFailed = false;

  try {
    const [count, data] = await Promise.all([
      prisma.correctionRequest.count({ where }),
      prisma.correctionRequest.findMany({
        where,
        orderBy: buildOrderBy(),
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
        include: {
          resolvedBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);
    total = count;
    rows = serializeRows(data);
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
              {ADMIN_CORRECTION_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_CORRECTION_COPY.pageDescription}
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235] shadow-sm transition hover:bg-[#f7f1e5]"
          >
            관리자 홈
          </Link>
        </div>

        {resolved.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolved.error}
          </div>
        ) : null}

        {loadFailed ? (
          <AdminPageStateNotice kind="error" className="mb-5" />
        ) : (
          <>
            <div className="mb-5">
              <AdminSafetyNotice
                policySummary={ADMIN_CORRECTION_COPY.policySummary}
              />
            </div>

            <form
              className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`}
              method="get"
            >
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm lg:col-span-2"
                name="q"
                placeholder="제목·내용·관리자 메모 검색"
                defaultValue={resolved.q ?? ""}
              />
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="status"
                defaultValue={resolved.status ?? "all"}
              >
                <option value="all">상태 전체</option>
                {Object.values(CorrectionRequestStatus).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="targetType"
                defaultValue={resolved.targetType ?? "all"}
              >
                <option value="all">대상 전체</option>
                {Object.values(CorrectionTargetType).map((value) => (
                  <option key={value} value={value}>
                    {TARGET_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="requestType"
                defaultValue={resolved.requestType ?? "all"}
              >
                <option value="all">유형 전체</option>
                {Object.values(CorrectionRequestType).map((value) => (
                  <option key={value} value={value}>
                    {REQUEST_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="priority"
                defaultValue={resolved.priority ?? "all"}
              >
                <option value="all">우선순위 전체</option>
                {Object.values(CorrectionRequestPriority).map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="sensitive"
                defaultValue={resolved.sensitive ?? "all"}
              >
                <option value="all">민감정보 전체</option>
                <option value="true">민감정보 의심</option>
                <option value="false">민감정보 없음</option>
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="redaction"
                defaultValue={resolved.redaction ?? "all"}
              >
                <option value="all">마스킹 전체</option>
                <option value="true">마스킹 필요</option>
                <option value="false">마스킹 불필요</option>
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="resolved"
                defaultValue={resolved.resolved ?? "all"}
              >
                <option value="all">처리 여부 전체</option>
                <option value="true">처리 완료</option>
                <option value="false">미처리</option>
              </select>
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="createdFrom"
                type="date"
                defaultValue={resolved.createdFrom ?? ""}
                aria-label="접수일 시작"
              />
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="createdTo"
                type="date"
                defaultValue={resolved.createdTo ?? ""}
                aria-label="접수일 종료"
              />
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-[#d9c9a8] bg-white px-3 text-xs text-[#4f5661]">
                <input
                  defaultChecked={resolved.showArchived === "true"}
                  name="showArchived"
                  type="checkbox"
                  value="true"
                />
                보관 포함
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-[#d9c9a8] bg-white px-3 text-xs text-[#4f5661]">
                <input
                  defaultChecked={resolved.showDeleted === "true"}
                  name="showDeleted"
                  type="checkbox"
                  value="true"
                />
                삭제 포함
              </label>
              <button
                type="submit"
                className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] lg:col-span-2"
              >
                필터
              </button>
            </form>

            {rows.length === 0 ? (
              <AdminPageStateNotice kind="empty" className="mb-5" />
            ) : null}

            <CorrectionsAdminList rows={rows} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4f5661]">
              <p>
                총 {total}건 · {page}/{pageCount} 페이지
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={`/admin/corrections${filterQueryString(resolved, {
                      page: String(page - 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    이전
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/admin/corrections${filterQueryString(resolved, {
                      page: String(page + 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    다음
                  </Link>
                ) : null}
                <Link
                  href="/admin/corrections"
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
