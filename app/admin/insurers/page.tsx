import Link from "next/link";
import {
  CardPaymentStatus,
  ClaimFaxHandlingType,
  InsurerCategory,
  VerificationStatus,
  type Insurer,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "./access";
import { setInsurerPublished } from "./actions";
import {
  ADMIN_VISIBILITY_COPY,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isInsurerPubliclyVisible,
  wouldPublishDraft,
} from "./visibility";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "보험사 디렉토리 관리";
const PAGE_DESCRIPTION =
  "보험사 접속/지원/청구/카드납 운영 정보를 관리합니다. 공개 디렉토리 DB 읽기는 PR-30에서 연결됩니다.";
const SAFETY_NOTICE =
  "공식 링크와 연락처는 공개 전 반드시 보험사 공식 출처 기준으로 검수해 주세요.";
const MISSING_TEXT =
  "공식 확인 후 업데이트 예정";
const UNAVAILABLE_TEXT = "해당사항 없음";
const CALL_CENTER_INDIVIDUAL_TEXT = "콜센터 개별접수";
const CONDITIONAL_TEXT = "조건 확인 필요";
const NEEDS_UPDATE_TEXT = "운영 정보 보강 필요";

// Core operational fields. If too many are missing, the list page flags the
// record with the gold "운영 정보 보강 필요" badge so operators can prioritize
// follow-up verification before public surface read-through ships in PR-30.
const CORE_OPERATIONAL_FIELDS = [
  "systemUrl",
  "helpdeskPhone",
  "claimFaxNumber",
  "termsUrl",
  "claimFormUrl",
] as const satisfies readonly (keyof Insurer)[];
const MISSING_FIELD_THRESHOLD = 3;

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

interface SearchParams {
  error?: string;
  q?: string;
  category?: string;
  status?: string;
  published?: string;
}

function formatDate(value: Date | null) {
  if (!value) return "검수 이력 없음";
  return value.toISOString().slice(0, 10);
}

function categoryLabel(category: string) {
  if (category === InsurerCategory.life) return "생명보험";
  if (category === InsurerCategory.non_life) return "손해보험";
  return category;
}

function statusLabel(status: VerificationStatus) {
  return VERIFICATION_STATUS_LABEL[status];
}

function optionalValue(value: string | null) {
  return value && value.trim().length > 0 ? value : MISSING_TEXT;
}

function cardPaymentStatusLabel(status: CardPaymentStatus): string {
  if (status === CardPaymentStatus.available) return "사용 가능";
  if (status === CardPaymentStatus.conditional) return CONDITIONAL_TEXT;
  if (status === CardPaymentStatus.unavailable) return UNAVAILABLE_TEXT;
  return MISSING_TEXT;
}

function claimFaxHandlingLabel(value: ClaimFaxHandlingType): string {
  if (value === ClaimFaxHandlingType.fax) return "팩스 사용";
  if (value === ClaimFaxHandlingType.call_center_individual)
    return CALL_CENTER_INDIVIDUAL_TEXT;
  if (value === ClaimFaxHandlingType.unavailable) return UNAVAILABLE_TEXT;
  return MISSING_TEXT;
}

function countMissingOperational(insurer: Insurer): number {
  return CORE_OPERATIONAL_FIELDS.reduce((acc, key) => {
    const raw = insurer[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return acc + (value.length === 0 ? 1 : 0);
  }, 0);
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy") {
  if (tone === "green") {
    return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  }
  if (tone === "gold") {
    return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  }
  if (tone === "navy") {
    return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  }
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: VerificationStatus): "green" | "gold" | "gray" {
  if (status === VerificationStatus.verified) return "green";
  if (status === VerificationStatus.needs_review) return "gold";
  return "gray";
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

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="break-words text-[#4f5661]">{optionalValue(value)}</dd>
    </div>
  );
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

        <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm leading-relaxed text-[#4f5661]">
          {SAFETY_NOTICE}
        </div>

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_VISIBILITY_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_VISIBILITY_COPY.draftRule}</p>
          <p className="mt-1 text-[#4f5661]">
            {ADMIN_VISIBILITY_COPY.governanceRule}
          </p>
        </div>

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

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}>
          {insurers.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                필터 조건에 맞는 보험사가 없습니다.
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                초안 보험사를 등록하거나 필터 조건을 다시 확인해 주세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="px-4 py-3">보험사 운영 정보</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">최종 검수일</th>
                    <th className="px-4 py-3">수정일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {insurers.map((insurer) => {
                    const missingOperational = countMissingOperational(insurer);
                    const needsOperationalUpdate =
                      missingOperational >= MISSING_FIELD_THRESHOLD;
                    const publiclyVisible = isInsurerPubliclyVisible({
                      isPublished: insurer.isPublished,
                      verificationStatus: insurer.verificationStatus,
                    });
                    // The publish toggle button below would attempt to publish
                    // this record on click. Disable it when that target state
                    // is the forbidden draft+published combination so admins
                    // see the constraint up front. Server still enforces it.
                    const togglePublishTarget = !insurer.isPublished;
                    const publishWouldBeBlocked = wouldPublishDraft({
                      isPublished: togglePublishTarget,
                      verificationStatus: insurer.verificationStatus,
                    });
                    return (
                    <tr key={insurer.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#102235]">{insurer.name}</div>
                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          <DetailItem label="공식 웹사이트" value={insurer.officialWebsiteUrl} />
                          <DetailItem label="설계사 포털" value={insurer.plannerPortalUrl} />
                          <DetailItem label="전산 접속" value={insurer.systemUrl} />
                          <DetailItem label="전산 헬프데스크" value={insurer.helpdeskPhone} />
                          <DetailItem label="고객센터" value={insurer.customerCenterPhone} />
                          <DetailItem label="청구 안내 페이지" value={insurer.claimPageUrl} />
                          <DetailItem label="청구 팩스" value={insurer.claimFaxNumber} />
                          <DetailItem
                            label="청구 팩스 처리"
                            value={claimFaxHandlingLabel(insurer.claimFaxHandlingType)}
                          />
                          <DetailItem label="청구 양식" value={insurer.claimFormUrl} />
                          <DetailItem label="약관" value={insurer.termsUrl} />
                          <DetailItem
                            label="카드납 종합 상태"
                            value={cardPaymentStatusLabel(insurer.cardPaymentStatus)}
                          />
                          <DetailItem label="우편 주소" value={insurer.mailingAddress} />
                        </dl>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={badgeClass("navy")}>
                            {categoryLabel(insurer.category)}
                          </span>
                          <span className={badgeClass(statusTone(insurer.verificationStatus))}>
                            {statusLabel(insurer.verificationStatus)}
                          </span>
                          <span className={badgeClass(insurer.isPublished ? "green" : "gray")}>
                            {insurer.isPublished
                              ? PUBLICATION_LABEL.published
                              : PUBLICATION_LABEL.unpublished}
                          </span>
                          <span
                            className={badgeClass(publiclyVisible ? "green" : "gray")}
                            title={
                              publiclyVisible
                                ? ADMIN_VISIBILITY_COPY.policySummary
                                : `${ADMIN_VISIBILITY_COPY.policySummary} ${ADMIN_VISIBILITY_COPY.draftRule}`
                            }
                          >
                            {publiclyVisible
                              ? VISIBILITY_LABEL.visible
                              : VISIBILITY_LABEL.hidden}
                          </span>
                          {insurer.isFeatured ? (
                            <span className={badgeClass("green")}>특별 표기</span>
                          ) : null}
                          {needsOperationalUpdate ? (
                            <span
                              className={badgeClass("gold")}
                              title={`${missingOperational}/${CORE_OPERATIONAL_FIELDS.length} 운영 필드 미입력`}
                            >
                              {NEEDS_UPDATE_TEXT}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#4f5661]">
                        {formatDate(insurer.lastVerifiedAt)}
                      </td>
                      <td className="px-4 py-4 text-[#4f5661]">
                        {formatDate(insurer.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <Link
                            href={`/admin/insurers/${insurer.id}/edit`}
                            className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
                          >
                            수정
                          </Link>
                          <form action={setInsurerPublished.bind(null, insurer.id, togglePublishTarget)}>
                            <button
                              type="submit"
                              disabled={publishWouldBeBlocked}
                              title={
                                publishWouldBeBlocked
                                  ? ADMIN_VISIBILITY_COPY.draftPublishBlocked
                                  : undefined
                              }
                              className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] transition hover:bg-[#f7f1e5] disabled:cursor-not-allowed disabled:border-[#d6d8dc] disabled:bg-[#f4f5f6] disabled:text-[#8a909a] disabled:hover:bg-[#f4f5f6]"
                            >
                              {insurer.isPublished
                                ? "비게시로 전환"
                                : "공개로 전환"}
                            </button>
                          </form>
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
