import Link from "next/link";
import {
  ClaimDocumentCategory,
  VerificationStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminSafetyNotice from "@/components/admin/AdminSafetyNotice";
import { getClaimDocumentAdminAccess } from "./access";
import ClaimDocumentsAdminList, {
  type ClaimDocumentListRow,
} from "./claim-documents-admin-list";
import {
  ADMIN_CLAIM_DOC_COPY,
  CLAIM_DOCUMENT_CATEGORY_LABEL,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "./visibility";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "청구서류 라이브러리 관리";
const PAGE_DESCRIPTION =
  "청구 유형별 필요서류 안내와 공식 출처 링크를 관리합니다. 공개 청구서류 라이브러리 DB 읽기는 PR-39에서 연결됩니다.";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  status?: string;
  published?: string;
}

function isValidCategory(value: string): value is ClaimDocumentCategory {
  return (Object.values(ClaimDocumentCategory) as string[]).includes(value);
}

function buildWhere(
  searchParams: SearchParams,
): Prisma.ClaimDocumentWhereInput {
  const where: Prisma.ClaimDocumentWhereInput = {};
  const query = searchParams.q?.trim();

  if (query) {
    where.title = { contains: query, mode: "insensitive" };
  }

  if (searchParams.category && isValidCategory(searchParams.category)) {
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

function serializeClaimDocumentRows(
  rows: Array<{
    id: string;
    title: string;
    slug: string;
    category: ClaimDocumentCategory;
    verificationStatus: VerificationStatus;
    isPublished: boolean;
    lastVerifiedAt: Date | null;
    updatedAt: Date;
    summary: string | null;
    insurer: { name: string } | null;
  }>,
): ClaimDocumentListRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    verificationStatus: row.verificationStatus,
    isPublished: row.isPublished,
    lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    summary: row.summary,
    insurerName: row.insurer?.name ?? null,
  }));
}

export default async function AdminClaimDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await getClaimDocumentAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const resolvedSearchParams = await searchParams;
  const claimDocuments = await prisma.claimDocument.findMany({
    where: buildWhere(resolvedSearchParams),
    orderBy: [
      { sortOrder: "asc" },
      { updatedAt: "desc" },
      { title: "asc" },
    ],
    include: {
      insurer: {
        select: { id: true, name: true },
      },
    },
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
            <p className={`${textStyles.body} mt-3 max-w-2xl`}>
              {PAGE_DESCRIPTION}
            </p>
          </div>
          <Link
            href="/admin/claim-documents/new"
            className="inline-flex items-center justify-center rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
          >
            새 청구서류 등록
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div className="mb-5">
          <AdminSafetyNotice policySummary={ADMIN_CLAIM_DOC_COPY.policySummary} />
        </div>

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="q"
            placeholder="제목 검색"
            defaultValue={resolvedSearchParams.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="category"
            defaultValue={resolvedSearchParams.category ?? "all"}
          >
            <option value="all">청구 유형 전체</option>
            {(Object.values(ClaimDocumentCategory) as ClaimDocumentCategory[]).map(
              (value) => (
                <option key={value} value={value}>
                  {CLAIM_DOCUMENT_CATEGORY_LABEL[value]}
                </option>
              ),
            )}
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

        <ClaimDocumentsAdminList
          claimDocuments={serializeClaimDocumentRows(claimDocuments)}
          role={access.session.user?.role ?? null}
        />
      </div>
    </main>
  );
}
