import Link from "next/link";
import { notFound } from "next/navigation";
import { disclosureLinkEntries } from "@/lib/content";
import { disclosureCategoryLabels } from "@/lib/disclosure-display";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import AdminStaticContentNotice from "@/components/admin/AdminStaticContentNotice";
import { getDisclosureLinkAdminAccess } from "../access";
import {
  ADMIN_DISCLOSURE_COPY,
  VERIFICATION_STATUS_LABEL,
} from "../visibility";

export const dynamic = "force-dynamic";

export default async function AdminDisclosureLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getDisclosureLinkAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const entry = disclosureLinkEntries.find((row) => row.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/disclosure-links"
          className="text-sm font-semibold text-[#1f6b55] hover:underline"
        >
          ← 목록으로
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-[#102235]">{entry.title}</h1>
        <p className={`${textStyles.body} mt-2`}>{ADMIN_DISCLOSURE_COPY.pageDescription}</p>

        <div className="mt-5">
          <AdminStaticContentNotice dbPrLabel="DisclosureLink 모델 + migration" />
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} mt-6 space-y-4 rounded-lg p-6`}
        >
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">ID</dt>
              <dd className="font-mono text-[#102235]">{entry.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">카테고리</dt>
              <dd>{disclosureCategoryLabels[entry.category]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">검수 상태</dt>
              <dd>{VERIFICATION_STATUS_LABEL[entry.verificationStatus]}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">출처 확인일</dt>
              <dd>{entry.lastVerifiedAt ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">출처 URL</dt>
              <dd className="break-all">
                {entry.sourceUrl ? (
                  <a
                    href={entry.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1f6b55] hover:underline"
                  >
                    {entry.sourceUrl}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#4f5661]">설명</dt>
              <dd className="whitespace-pre-wrap leading-relaxed">{entry.description}</dd>
            </div>
            {entry.notes ? (
              <div>
                <dt className="text-xs font-semibold text-[#4f5661]">메모</dt>
                <dd className="whitespace-pre-wrap leading-relaxed">{entry.notes}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>
    </main>
  );
}
