import Link from "next/link";
import { InsurerCategory, VerificationStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getInsurerAdminAccess } from "./access";
import InsurersAdminList, { type InsurerListRow } from "./insurers-admin-list";
import {
  ADMIN_VISIBILITY_COPY,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "./visibility";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "보험사 디렉토리 관리";
const PAGE_DESCRIPTION =
  "보험사 접속/지원/청구/카드납 운영 정보를 관리합니다. 공개 디렉토리 DB 읽기는 PR-30에서 연결됩니다.";
const SAFETY_NOTICE =
  "공식 링크와 연락처는 공개 전 반드시 보험사 공식 출처 기준으로 검수해 주세요.";
interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  status?: string;
  published?: string;
}

function buildWhere(searchParams: SearchParams): Prisma.InsurerWhereInput {
  const where: Prisma.InsurerWhereInput = {};
  const query = searchParams.q?.trim();

  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  if (
    searchParams.category === InsurerCategory.life ||
    searchParams.category === InsurerCategory.non_life
  ) {
    where.category = searchParams.category;
  }

  if (
    searchParams.status === VerificationStatus.draft ||
    searchParams.status === VerificationStatus.needs_review ||
    searchParams.status === VerificationStatus.verified
  ) {
    where.verificationStatus = searchParams.status;
  }

  if (searchParams.published === "true") {
    where.isPublished = true;
  }

  if (searchParams.published === "false") {
    where.isPublished = false;
  }

  return where;
}

function serializeInsurerRows(
  insurers: Awaited<ReturnType<typeof prisma.insurer.findMany>>,
): InsurerListRow[] {
  return insurers.map((insurer) => ({
    id: insurer.id,
    name: insurer.name,
    category: insurer.category,
    verificationStatus: insurer.verificationStatus,
    isPublished: insurer.isPublished,
    isFeatured: insurer.isFeatured,
    lastVerifiedAt: insurer.lastVerifiedAt?.toISOString() ?? null,
    updatedAt: insurer.updatedAt.toISOString(),
    officialWebsiteUrl: insurer.officialWebsiteUrl,
    plannerPortalUrl: insurer.plannerPortalUrl,
    systemUrl: insurer.systemUrl,
    helpdeskPhone: insurer.helpdeskPhone,
    customerCenterPhone: insurer.customerCenterPhone,
    claimPageUrl: insurer.claimPageUrl,
    claimFaxNumber: insurer.claimFaxNumber,
    claimFaxHandlingType: insurer.claimFaxHandlingType,
    claimFormUrl: insurer.claimFormUrl,
    termsUrl: insurer.termsUrl,
    cardPaymentStatus: insurer.cardPaymentStatus,
    mailingAddress: insurer.mailingAddress,
  }));
}

export default async function AdminInsurersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getInsurerAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolvedSearchParams = await searchParams;
  const insurers = await prisma.insurer.findMany({
    where: buildWhere(resolvedSearchParams),
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }, { name: "asc" }],
  });

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
              {PAGE_TITLE}
            </h1>
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>{PAGE_DESCRIPTION}</p>
          </div>
          <Link
            href="/admin/insurers/new"
            className="inline-flex items-center justify-center rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
          >
            새 보험사 등록
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_VISIBILITY_COPY.policySummary} />
        </div>

        <p className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm leading-relaxed text-[#4f5661]">
          {SAFETY_NOTICE}
        </p>

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="q"
            placeholder="보험사 이름 검색"
            defaultValue={resolvedSearchParams.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="category"
            defaultValue={resolvedSearchParams.category ?? "all"}
          >
            <option value="all">분류 전체</option>
            <option value={InsurerCategory.life}>생명보험</option>
            <option value={InsurerCategory.non_life}>손해보험</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="status"
            defaultValue={resolvedSearchParams.status ?? "all"}
          >
            <option value="all">검수 상태 전체</option>
            <option value={VerificationStatus.draft}>
              {VERIFICATION_STATUS_LABEL[VerificationStatus.draft]}
            </option>
            <option value={VerificationStatus.needs_review}>
              {VERIFICATION_STATUS_LABEL[VerificationStatus.needs_review]}
            </option>
            <option value={VerificationStatus.verified}>
              {VERIFICATION_STATUS_LABEL[VerificationStatus.verified]}
            </option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="published"
            defaultValue={resolvedSearchParams.published ?? "all"}
          >
            <option value="all">게시 상태 전체</option>
            <option value="true">{PUBLICATION_LABEL.published}</option>
            <option value="false">{PUBLICATION_LABEL.unpublished}</option>
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
          >
            필터 적용
          </button>
        </form>

        <InsurersAdminList
          insurers={serializeInsurerRows(insurers)}
          role={access.session.user?.role ?? null}
        />
      </div>
    </main>
  );
}
