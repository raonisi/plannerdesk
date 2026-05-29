import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentSection, PageFrame } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getPublicKnowledgeArticleBySlug } from "@/lib/public/knowledge-articles";

export const dynamic = "force-dynamic";

const statusClasses = {
  needs_review: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
  verified: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
} as const;

const riskClasses = {
  low: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  medium: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  high: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
  blocked: "border-[#d6d8dc] bg-[#f4f5f6] text-[#5f6670]",
} as const;

const RELATED_LINKS = [
  { href: "/directory", label: "보험사 디렉토리" },
  { href: "/claim-documents", label: "청구서류 라이브러리" },
  { href: "/disclosure-links", label: "공시·약관 링크센터" },
  { href: "/message-templates", label: "고객 안내문 템플릿" },
  { href: "/knowledge", label: "지식 아카이브 목록" },
];

interface KnowledgeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function KnowledgeDetailPage({
  params,
}: KnowledgeDetailPageProps) {
  const { slug } = await params;
  const result = await getPublicKnowledgeArticleBySlug(slug);

  if (result.status === "not_found" || result.status === "unavailable") {
    notFound();
  }

  const document = result.article;
  const riskClass =
    riskClasses[document.riskLevel as keyof typeof riskClasses] ??
    riskClasses.medium;

  const sourceNoteParts = [
    document.sourceTitle,
    document.sourceUrl ? `출처 URL: ${document.sourceUrl}` : null,
    `출처 유형: ${document.sourceTypeLabel}`,
  ].filter(Boolean);

  return (
    <PageFrame>
      <Header />
      <ContentSection>
        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
              href="/knowledge"
            >
              지식 아카이브로 돌아가기
            </Link>
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
              href="/work-tools"
            >
              업무 도구로 이동
            </Link>
          </div>

          <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              {document.workflowLabel ? (
                <span className="rounded-full bg-[#102235] px-3 py-1 text-xs font-semibold text-white">
                  {document.workflowLabel}
                </span>
              ) : null}
              <span className="rounded-full border border-[#d9c9a8] bg-white px-3 py-1 text-xs font-semibold text-[#7a612d]">
                {document.categoryLabel}
              </span>
              <span className="rounded-full border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1 text-xs font-semibold text-[#5f6670]">
                {document.typeLabel}
              </span>
            </div>

            <h1 className="mt-4 break-keep text-3xl font-semibold leading-tight text-[#102235]">
              {document.title}
            </h1>
            <p className="mt-3 break-keep text-base leading-7 text-[#4f5661]">
              {document.summary}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[document.status]}`}
              >
                상태: {document.statusLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass}`}
              >
                위험도: {document.riskLabel}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#d9c9a8] bg-white px-2.5 py-1 text-xs font-semibold text-[#303845]">
                {document.aiUsable ? "AI 참조 가능" : "AI 참조 제외"}
              </span>
            </div>
          </section>

          <aside className="rounded-xl border border-[#d9c9a8] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#102235]">검수 안내</h2>
            <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
              이 문서는 검수 상태를 기준으로 제공됩니다. 공식 출처 또는 관리자
              검수 전까지 확정 자료로 사용하지 마세요.
            </p>
            {document.status === "needs_review" ? (
              <div className="mt-3 rounded-lg border border-[#c5b08a] bg-[#fff9ed] p-3 text-sm font-semibold leading-6 text-[#7a612d]">
                검수 필요: 공식 출처 또는 관리자 검수 전 자료이므로 확정 자료로
                사용하지 마세요.
              </div>
            ) : null}
            {!document.aiUsable ? (
              <div className="mt-2 rounded-lg border border-[#d6d8dc] bg-[#f4f5f6] p-3 text-sm font-semibold leading-6 text-[#5f6670]">
                AI 참조 제외: AI 답변 보조 API는 연결되지 않았으며, 검수 완료
                전에는 근거 문서로 사용하지 않습니다.
              </div>
            ) : (
              <div className="mt-2 rounded-lg border border-[#d6d8dc] bg-[#f4f5f6] p-3 text-sm leading-6 text-[#5f6670]">
                AI 참조 가능으로 표시되어 있으나, PlannerDesk는 AI API를
                제공하지 않습니다.
              </div>
            )}
          </aside>

          <section className="space-y-6 rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-6">
            <div>
              <h2 className="text-lg font-semibold text-[#102235]">상세 설명</h2>
              <div className="mt-3 space-y-3">
                {document.bodyParagraphs.map((paragraph, index) => (
                  <p
                    className="break-keep text-sm leading-7 text-[#4f5661]"
                    key={`${document.slug}-body-${index}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#102235]">출처 안내</h2>
              <p className="mt-3 break-keep text-sm leading-7 text-[#4f5661]">
                {sourceNoteParts.join(" · ")}
              </p>
              <p className="mt-2 text-sm text-[#5f6670]">
                최종 확인일:{" "}
                {document.lastReviewedAt ?? "검수 전 (미기록)"}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#102235]">
                관련 PlannerDesk 링크
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {RELATED_LINKS.map((link) => (
                  <Link
                    className="inline-flex min-h-10 items-center rounded-full border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
                    href={link.href}
                    key={`${document.slug}-${link.href}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-5">
            <h2 className="text-sm font-semibold text-[#102235]">안전 안내 박스</h2>
            <p className="mt-3 break-keep text-sm leading-6 text-[#5f6670]">
              PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.
              <br />
              PlannerDesk는 보험금 지급 금액을 산정하지 않습니다.
              <br />
              PlannerDesk는 손해사정 업무를 수행하지 않습니다.
              <br />
              PlannerDesk는 의료 진단을 해석하지 않습니다.
              <br />
              고객 개인정보, 의료자료, 진단서, 처방전, 검사결과지, 청구서류
              원본은 입력하거나 업로드하지 마세요.
            </p>
          </aside>

          {document.safeCopy ? (
            <section className="rounded-xl border border-[#d9c9a8] bg-white p-5">
              <h2 className="text-sm font-semibold text-[#102235]">
                고객 안내용 문구 설명
              </h2>
              <p className="mt-2 break-keep text-sm text-[#5f6670]">
                아래 문구는 고객에게 안내할 때 참고할 수 있는 중립 문구입니다.
                실제 안내 전 보험사 기준과 고객 상황을 함께 확인하세요.
              </p>
              <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
                {document.safeCopy}
              </p>
            </section>
          ) : null}

          {document.forbiddenClaims.length > 0 ? (
            <section className="rounded-xl border border-[#d9c9a8] bg-[#fbf7ee] p-5">
              <h2 className="text-sm font-semibold text-[#102235]">금지 표현 설명</h2>
              <p className="mt-2 break-keep text-sm text-[#5f6670]">
                이 문서에서 피해야 할 표현입니다. 보험금 지급 단정, 손해사정
                오인, 의료 판단, 개인정보 입력 유도 표현은 사용하지 않습니다.
              </p>
              <ul className="mt-3 space-y-1 text-sm leading-6 text-[#5f6670]">
                {document.forbiddenClaims.map((claim) => (
                  <li key={`${document.slug}-${claim}`}>- {claim}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
