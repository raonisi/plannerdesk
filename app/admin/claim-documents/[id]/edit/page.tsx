import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import AdminAccessDeniedState from "@/components/admin/AdminAccessDeniedState";
import AdminLockedState from "@/components/admin/AdminLockedState";
import { getClaimDocumentAdminAccess } from "../../access";
import { updateClaimDocument } from "../../actions";
import ClaimDocumentForm from "../../form";
import { ADMIN_CLAIM_DOC_COPY } from "../../visibility";

const PAGE_TITLE = "청구서류 정보 수정";
const PAGE_DESCRIPTION =
  "제목, 안내 본문, 공식 링크, 고객용 메시지 템플릿, 운영 메타데이터를 수정합니다. 하드 삭제는 제공되지 않으며, 공개 조건은 하단 안내문을 우선 확인해 주세요.";

export const dynamic = "force-dynamic";

interface EditClaimDocumentPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function EditClaimDocumentPage({
  params,
  searchParams,
}: EditClaimDocumentPageProps) {
  const access = await getClaimDocumentAdminAccess();

  if (access.status === "locked") {
    return <AdminLockedState />;
  }

  if (access.status === "denied") {
    return <AdminAccessDeniedState />;
  }

  const { id } = await params;
  const { error } = await searchParams;
  const claimDocument = await prisma.claimDocument.findUnique({
    where: { id },
  });

  if (!claimDocument) {
    notFound();
  }

  const insurers = await prisma.insurer.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <main className={`min-h-screen ${surfaces.page} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
            {PAGE_TITLE}
          </h1>
          <p className={`${textStyles.body} mt-3`}>{PAGE_DESCRIPTION}</p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#4f5661]">
            {error}
          </div>
        ) : null}

        <div className="mb-5 rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-4 py-3 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.policySummary}</p>
          <p className="mt-1 text-[#4f5661]">{ADMIN_CLAIM_DOC_COPY.draftRule}</p>
        </div>

        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-5 sm:p-7`}
        >
          <ClaimDocumentForm
            action={updateClaimDocument.bind(null, claimDocument.id)}
            claimDocument={claimDocument}
            insurers={insurers}
            submitLabel="변경 사항 저장"
          />
        </section>
      </div>
    </main>
  );
}
