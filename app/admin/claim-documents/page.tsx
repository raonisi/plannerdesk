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
import { getClaimDocumentAdminAccess } from "./access";
import { setClaimDocumentPublished } from "./actions";
import {
  ADMIN_CLAIM_DOC_COPY,
  CLAIM_DOCUMENT_CATEGORY_LABEL,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isClaimDocumentPubliclyVisible,
  wouldPublishDraft,
} from "./visibility";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "\uccad\uad6c\uc11c\ub958 \ub77c\uc774\ube0c\ub7ec\ub9ac \uad00\ub9ac";
const PAGE_DESCRIPTION =
  "\uccad\uad6c \uc720\ud615\ubcc4 \ud544\uc694\uc11c\ub958 \uc548\ub0b4\uc640 \uacf5\uc2dd \ucd9c\ucc98 \ub9c1\ud06c\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4. \uacf5\uac1c \uccad\uad6c\uc11c\ub958 \ub77c\uc774\ube0c\ub7ec\ub9ac DB \uc77d\uae30\ub294 PR-39\uc5d0\uc11c \uc5f0\uacb0\ub429\ub2c8\ub2e4.";

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
  if (!value) return "\uac80\uc218 \uc774\ub825 \uc5c6\uc74c";
  return value.toISOString().slice(0, 10);
}

function categoryLabel(category: ClaimDocumentCategory) {
  return CLAIM_DOCUMENT_CATEGORY_LABEL[category];
}

function statusLabel(status: VerificationStatus) {
  return VERIFICATION_STATUS_LABEL[status];
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
            {"\uc0c8 \uccad\uad6c\uc11c\ub958 \ub4f1\ub85d"}
          </Link>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <div className="mb-5 rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]">
          <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.guidanceNotice}</p>
          <p className="mt-2 text-[#4f5661]">
            {ADMIN_CLAIM_DOC_COPY.sensitiveNotice}
          </p>
        </div>

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_CLAIM_DOC_COPY.draftRule}</p>
          <p className="mt-1 text-[#4f5661]">
            {ADMIN_CLAIM_DOC_COPY.governanceRule}
          </p>
        </div>

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="q"
            placeholder={"\uc81c\ubaa9 \uac80\uc0c9"}
            defaultValue={resolvedSearchParams.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="category"
            defaultValue={resolvedSearchParams.category ?? "all"}
          >
            <option value="all">{"\uccad\uad6c \uc720\ud615 \uc804\uccb4"}</option>
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
            <option value="all">{"\uac80\uc218 \uc0c1\ud0dc \uc804\uccb4"}</option>
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
            <option value="all">{"\uac8c\uc2dc \uc0c1\ud0dc \uc804\uccb4"}</option>
            <option value="true">{PUBLICATION_LABEL.published}</option>
            <option value="false">{PUBLICATION_LABEL.unpublished}</option>
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
          >
            {"\ud544\ud130 \uc801\uc6a9"}
          </button>
        </form>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {claimDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                {"\ud544\ud130 \uc870\uac74\uc5d0 \ub9de\ub294 \uccad\uad6c\uc11c\ub958\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."}
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                {
                  "\ucd08\uc548 \uccad\uad6c\uc11c\ub958\ub97c \ub4f1\ub85d\ud558\uac70\ub098 \ud544\ud130 \uc870\uac74\uc744 \ub2e4\uc2dc \ud655\uc778\ud574 \uc8fc\uc138\uc694."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="px-4 py-3">
                      {"\uc81c\ubaa9 / \ubcf4\ud5d8\uc0ac"}
                    </th>
                    <th className="px-4 py-3">{"\uc0c1\ud0dc"}</th>
                    <th className="px-4 py-3">{"\ucd5c\uc885 \uac80\uc218\uc77c"}</th>
                    <th className="px-4 py-3">{"\uc218\uc815\uc77c"}</th>
                    <th className="px-4 py-3 text-right">{"\uc791\uc5c5"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {claimDocuments.map((claimDocument) => {
                    const publiclyVisible = isClaimDocumentPubliclyVisible({
                      isPublished: claimDocument.isPublished,
                      verificationStatus: claimDocument.verificationStatus,
                    });
                    const togglePublishTarget = !claimDocument.isPublished;
                    const publishWouldBeBlocked = wouldPublishDraft({
                      isPublished: togglePublishTarget,
                      verificationStatus: claimDocument.verificationStatus,
                    });
                    return (
                      <tr key={claimDocument.id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {claimDocument.title}
                          </div>
                          <div className="mt-1 text-xs text-[#5f6875]">
                            <span className="font-mono">
                              {claimDocument.slug}
                            </span>
                            {" \u00b7 "}
                            {claimDocument.insurer
                              ? claimDocument.insurer.name
                              : "\uc77c\ubc18 \uccad\uad6c \uc548\ub0b4"}
                          </div>
                          {claimDocument.summary ? (
                            <p className="mt-2 line-clamp-2 break-words text-xs text-[#4f5661]">
                              {claimDocument.summary}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass("navy")}>
                              {categoryLabel(claimDocument.category)}
                            </span>
                            <span
                              className={badgeClass(
                                statusTone(claimDocument.verificationStatus),
                              )}
                            >
                              {statusLabel(claimDocument.verificationStatus)}
                            </span>
                            <span
                              className={badgeClass(
                                claimDocument.isPublished ? "green" : "gray",
                              )}
                            >
                              {claimDocument.isPublished
                                ? PUBLICATION_LABEL.published
                                : PUBLICATION_LABEL.unpublished}
                            </span>
                            <span
                              className={badgeClass(
                                publiclyVisible ? "green" : "gray",
                              )}
                              title={
                                publiclyVisible
                                  ? ADMIN_CLAIM_DOC_COPY.policySummary
                                  : `${ADMIN_CLAIM_DOC_COPY.policySummary} ${ADMIN_CLAIM_DOC_COPY.draftRule}`
                              }
                            >
                              {publiclyVisible
                                ? VISIBILITY_LABEL.visible
                                : VISIBILITY_LABEL.hidden}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(claimDocument.lastVerifiedAt)}
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(claimDocument.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Link
                              href={`/admin/claim-documents/${claimDocument.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
                            >
                              {"\uc218\uc815"}
                            </Link>
                            <form
                              action={setClaimDocumentPublished.bind(
                                null,
                                claimDocument.id,
                                togglePublishTarget,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={publishWouldBeBlocked}
                                title={
                                  publishWouldBeBlocked
                                    ? ADMIN_CLAIM_DOC_COPY.draftPublishBlocked
                                    : undefined
                                }
                                className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] transition hover:bg-[#f7f1e5] disabled:cursor-not-allowed disabled:border-[#d6d8dc] disabled:bg-[#f4f5f6] disabled:text-[#8a909a] disabled:hover:bg-[#f4f5f6]"
                              >
                                {claimDocument.isPublished
                                  ? "\ube44\uac8c\uc2dc\ub85c \uc804\ud658"
                                  : "\uacf5\uac1c\ub85c \uc804\ud658"}
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
