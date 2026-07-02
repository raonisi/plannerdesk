import Link from "next/link";
import {
  PlannerBusinessChannel,
  PlannerCareerRange,
  PlannerLicenseScope,
  PlannerType,
  PlannerVerificationStatus,
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
import { getPlannerVerificationAdminAccess } from "./access";
import PlannerVerificationsAdminList, {
  type PlannerVerificationListRow,
} from "./planner-verifications-admin-list";
import {
  ADMIN_PLANNER_VERIFICATION_COPY,
  BUSINESS_CHANNEL_LABEL,
  CAREER_RANGE_LABEL,
  LICENSE_SCOPE_LABEL,
  PLANNER_TYPE_LABEL,
  STATUS_LABEL,
  formatApplicantLabel,
} from "./visibility";

export const dynamic = "force-dynamic";

interface SearchParams {
  error?: string;
  q?: string;
  status?: string;
  plannerType?: string;
  activityRegion?: string;
  careerRange?: string;
  licenseScope?: string;
  businessChannel?: string;
  reviewed?: string;
  suspended?: string;
  showDeleted?: string;
  requestedFrom?: string;
  requestedTo?: string;
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

function buildWhere(params: SearchParams): Prisma.PlannerVerificationWhereInput {
  const and: Prisma.PlannerVerificationWhereInput[] = [];

  if (params.showDeleted !== "true") {
    and.push({ deletedAt: null });
  }

  const query = params.q?.trim();
  if (query) {
    and.push({
      OR: [
        { displayName: { contains: query, mode: "insensitive" } },
        { affiliationName: { contains: query, mode: "insensitive" } },
        { adminMemo: { contains: query, mode: "insensitive" } },
        { rejectionReason: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (
    params.status &&
    params.status !== "all" &&
    (Object.values(PlannerVerificationStatus) as string[]).includes(
      params.status,
    )
  ) {
    and.push({ status: params.status as PlannerVerificationStatus });
  }

  if (
    params.plannerType &&
    params.plannerType !== "all" &&
    (Object.values(PlannerType) as string[]).includes(params.plannerType)
  ) {
    and.push({ plannerType: params.plannerType as PlannerType });
  }

  const region = params.activityRegion?.trim();
  if (region) {
    and.push({
      activityRegion: { contains: region, mode: "insensitive" },
    });
  }

  if (
    params.careerRange &&
    params.careerRange !== "all" &&
    (Object.values(PlannerCareerRange) as string[]).includes(params.careerRange)
  ) {
    and.push({ careerRange: params.careerRange as PlannerCareerRange });
  }

  if (
    params.licenseScope &&
    params.licenseScope !== "all" &&
    (Object.values(PlannerLicenseScope) as string[]).includes(
      params.licenseScope,
    )
  ) {
    and.push({ licenseScope: params.licenseScope as PlannerLicenseScope });
  }

  if (
    params.businessChannel &&
    params.businessChannel !== "all" &&
    (Object.values(PlannerBusinessChannel) as string[]).includes(
      params.businessChannel,
    )
  ) {
    and.push({
      businessChannel: params.businessChannel as PlannerBusinessChannel,
    });
  }

  if (params.reviewed === "true") {
    and.push({ reviewedAt: { not: null } });
  }
  if (params.reviewed === "false") {
    and.push({ reviewedAt: null });
  }

  if (params.suspended === "true") {
    and.push({
      OR: [
        { status: PlannerVerificationStatus.suspended },
        { suspendedAt: { not: null } },
      ],
    });
  }
  if (params.suspended === "false") {
    and.push({
      status: { not: PlannerVerificationStatus.suspended },
      suspendedAt: null,
    });
  }

  const requestedFrom = parseDateStart(params.requestedFrom);
  const requestedTo = parseDateEnd(params.requestedTo);
  if (requestedFrom || requestedTo) {
    const requestedAt: Prisma.DateTimeFilter = {};
    if (requestedFrom) requestedAt.gte = requestedFrom;
    if (requestedTo) requestedAt.lte = requestedTo;
    and.push({ requestedAt });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

function buildOrderBy(): Prisma.PlannerVerificationOrderByWithRelationInput[] {
  return [{ status: "asc" }, { requestedAt: "desc" }];
}

function filterQueryString(
  params: SearchParams,
  overrides: Partial<SearchParams>,
): string {
  const merged = { ...params, ...overrides };
  const parts = new URLSearchParams();
  if (merged.q) parts.set("q", merged.q);
  if (merged.status && merged.status !== "all") parts.set("status", merged.status);
  if (merged.plannerType && merged.plannerType !== "all") {
    parts.set("plannerType", merged.plannerType);
  }
  if (merged.activityRegion) parts.set("activityRegion", merged.activityRegion);
  if (merged.careerRange && merged.careerRange !== "all") {
    parts.set("careerRange", merged.careerRange);
  }
  if (merged.licenseScope && merged.licenseScope !== "all") {
    parts.set("licenseScope", merged.licenseScope);
  }
  if (merged.businessChannel && merged.businessChannel !== "all") {
    parts.set("businessChannel", merged.businessChannel);
  }
  if (merged.reviewed && merged.reviewed !== "all") {
    parts.set("reviewed", merged.reviewed);
  }
  if (merged.suspended && merged.suspended !== "all") {
    parts.set("suspended", merged.suspended);
  }
  if (merged.showDeleted === "true") parts.set("showDeleted", "true");
  if (merged.requestedFrom) parts.set("requestedFrom", merged.requestedFrom);
  if (merged.requestedTo) parts.set("requestedTo", merged.requestedTo);
  if (merged.page && merged.page !== "1") parts.set("page", merged.page);
  const qs = parts.toString();
  return qs ? `?${qs}` : "";
}

function formatReviewerLabel(user: {
  id: string;
  name: string | null;
} | null): string | null {
  if (!user) return null;
  return formatApplicantLabel(user);
}

function serializeRows(
  rows: Prisma.PlannerVerificationGetPayload<{
    include: {
      user: { select: { id: true; name: true } };
      reviewedBy: { select: { id: true; name: true } };
    };
  }>[],
): PlannerVerificationListRow[] {
  return rows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    applicantLabel: formatApplicantLabel(row.user),
    status: row.status,
    plannerType: row.plannerType,
    affiliationName: row.affiliationName,
    activityRegion: row.activityRegion,
    careerRange: row.careerRange,
    licenseScope: row.licenseScope,
    businessChannel: row.businessChannel,
    containsSensitiveData: row.containsSensitiveData,
    requestedAt: row.requestedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedByLabel: formatReviewerLabel(row.reviewedBy),
    suspendedAt: row.suspendedAt?.toISOString() ?? null,
    deletedAt: row.deletedAt?.toISOString() ?? null,
  }));
}

export default async function AdminPlannerVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getPlannerVerificationAdminAccess();

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
  let rows: PlannerVerificationListRow[] = [];
  let loadFailed = false;

  try {
    const [count, data] = await Promise.all([
      prisma.plannerVerification.count({ where }),
      prisma.plannerVerification.findMany({
        where,
        orderBy: buildOrderBy(),
        skip: (page - 1) * ADMIN_LIST_PAGE_SIZE,
        take: ADMIN_LIST_PAGE_SIZE,
        include: {
          user: { select: { id: true, name: true } },
          reviewedBy: { select: { id: true, name: true } },
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
              {ADMIN_PLANNER_VERIFICATION_COPY.pageTitle}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {ADMIN_PLANNER_VERIFICATION_COPY.pageDescription}
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
                policySummary={ADMIN_PLANNER_VERIFICATION_COPY.policySummary}
              />
            </div>

            <form
              className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`}
              method="get"
            >
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm lg:col-span-2"
                name="q"
                placeholder="표시 이름·소속·관리자 메모·거절 사유 검색"
                defaultValue={resolved.q ?? ""}
              />
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="status"
                defaultValue={resolved.status ?? "all"}
              >
                <option value="all">상태 전체</option>
                {Object.values(PlannerVerificationStatus).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="plannerType"
                defaultValue={resolved.plannerType ?? "all"}
              >
                <option value="all">유형 전체</option>
                {Object.values(PlannerType).map((value) => (
                  <option key={value} value={value}>
                    {PLANNER_TYPE_LABEL[value]}
                  </option>
                ))}
              </select>
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="activityRegion"
                placeholder="활동 지역"
                defaultValue={resolved.activityRegion ?? ""}
              />
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="careerRange"
                defaultValue={resolved.careerRange ?? "all"}
              >
                <option value="all">경력 전체</option>
                {Object.values(PlannerCareerRange).map((value) => (
                  <option key={value} value={value}>
                    {CAREER_RANGE_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="licenseScope"
                defaultValue={resolved.licenseScope ?? "all"}
              >
                <option value="all">자격 범위 전체</option>
                {Object.values(PlannerLicenseScope).map((value) => (
                  <option key={value} value={value}>
                    {LICENSE_SCOPE_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="businessChannel"
                defaultValue={resolved.businessChannel ?? "all"}
              >
                <option value="all">업무 채널 전체</option>
                {Object.values(PlannerBusinessChannel).map((value) => (
                  <option key={value} value={value}>
                    {BUSINESS_CHANNEL_LABEL[value]}
                  </option>
                ))}
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="reviewed"
                defaultValue={resolved.reviewed ?? "all"}
              >
                <option value="all">검토 완료 전체</option>
                <option value="true">검토 완료</option>
                <option value="false">미검토</option>
              </select>
              <select
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="suspended"
                defaultValue={resolved.suspended ?? "all"}
              >
                <option value="all">정지 여부 전체</option>
                <option value="true">정지</option>
                <option value="false">정지 아님</option>
              </select>
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="requestedFrom"
                type="date"
                defaultValue={resolved.requestedFrom ?? ""}
                aria-label="신청일 시작"
              />
              <input
                className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="requestedTo"
                type="date"
                defaultValue={resolved.requestedTo ?? ""}
                aria-label="신청일 종료"
              />
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

            <PlannerVerificationsAdminList rows={rows} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4f5661]">
              <p>
                총 {total}건 · {page}/{pageCount} 페이지
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={`/admin/planner-verifications${filterQueryString(resolved, {
                      page: String(page - 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    이전
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/admin/planner-verifications${filterQueryString(resolved, {
                      page: String(page + 1),
                    })}`}
                    className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
                  >
                    다음
                  </Link>
                ) : null}
                <Link
                  href="/admin/planner-verifications"
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
