import Link from "next/link";
import {
  InsurerCategory,
  VerificationStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getInsurerAdminAccess } from "./access";
import { setInsurerPublished } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "\ubcf4\ud5d8\uc0ac \ub514\ub809\ud1a0\ub9ac \uad00\ub9ac";
const PAGE_DESCRIPTION =
  "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30\uc640 \uccad\uad6c \uad00\ub828 \uae30\ubcf8 \uc815\ubcf4\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4.";
const SAFETY_NOTICE =
  "\uacf5\uc2dd \ub9c1\ud06c\uc640 \uc5f0\ub77d\ucc98\ub294 \uacf5\uac1c \uc804 \ubc18\ub4dc\uc2dc \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \ucd9c\ucc98 \uae30\uc900\uc73c\ub85c \uac80\uc218\ud574 \uc8fc\uc138\uc694.";
const MISSING_TEXT =
  "\uacf5\uc2dd \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8 \uc608\uc815";

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
  if (!value) return "Not verified";
  return value.toISOString().slice(0, 10);
}

function categoryLabel(category: string) {
  return category === "life" ? "Life" : "Non-life";
}

function statusLabel(status: string) {
  if (status === "verified") return "Verified";
  if (status === "needs_review") return "Needs review";
  return "Draft";
}

function optionalValue(value: string | null) {
  return value && value.trim().length > 0 ? value : MISSING_TEXT;
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

function statusTone(status: string): "green" | "gold" | "gray" {
  if (status === "verified") return "green";
  if (status === "needs_review") return "gold";
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
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
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
            className="inline-flex items-center justify-center rounded-md bg-[#102235] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b344e]"
          >
            Add insurer
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

        <form
          className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 grid gap-3 rounded-lg p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]`}
        >
          <input
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="q"
            placeholder="Search insurer name"
            defaultValue={resolvedSearchParams.q ?? ""}
          />
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="category"
            defaultValue={resolvedSearchParams.category ?? "all"}
          >
            <option value="all">All categories</option>
            <option value={InsurerCategory.life}>Life</option>
            <option value={InsurerCategory.non_life}>Non-life</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="status"
            defaultValue={resolvedSearchParams.status ?? "all"}
          >
            <option value="all">All statuses</option>
            <option value={VerificationStatus.draft}>Draft</option>
            <option value={VerificationStatus.needs_review}>Needs review</option>
            <option value={VerificationStatus.verified}>Verified</option>
          </select>
          <select
            className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] outline-none focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15"
            name="published"
            defaultValue={resolvedSearchParams.published ?? "all"}
          >
            <option value="all">All publication states</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#102235] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b344e]"
          >
            Filter
          </button>
        </form>

        <section className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}>
          {insurers.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">No insurer records found.</h2>
              <p className={`${textStyles.body} mt-2`}>
                Add a draft insurer record or adjust the filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="px-4 py-3">Insurer desk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last verified</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {insurers.map((insurer) => (
                    <tr key={insurer.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#102235]">{insurer.name}</div>
                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          <DetailItem label="Official website" value={insurer.officialWebsiteUrl} />
                          <DetailItem label="Planner portal" value={insurer.plannerPortalUrl} />
                          <DetailItem label="Claim page" value={insurer.claimPageUrl} />
                          <DetailItem label="Customer center" value={insurer.customerCenterPhone} />
                          <DetailItem label="Fax" value={insurer.faxNumber} />
                          <DetailItem label="Mailing address" value={insurer.mailingAddress} />
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
                            {insurer.isPublished ? "Published" : "Unpublished"}
                          </span>
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
                            Edit
                          </Link>
                          <form action={setInsurerPublished.bind(null, insurer.id, !insurer.isPublished)}>
                            <button
                              type="submit"
                              className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] transition hover:bg-[#f7f1e5]"
                            >
                              {insurer.isPublished ? "Unpublish" : "Publish"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
