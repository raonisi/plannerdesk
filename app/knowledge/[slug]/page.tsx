import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentSection, PageFrame } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  getKnowledgeDetailBySlug,
  KNOWLEDGE_DETAIL_SLUGS,
  type KnowledgeRiskLevel,
  type KnowledgeStatus,
} from "../knowledge-seed";

const statusLabels: Record<KnowledgeStatus, string> = {
  draft: "작성 중",
  needs_review: "검수 필요",
  verified: "검수 완료",
  archived: "보관됨",
};

const statusClasses: Record<KnowledgeStatus, string> = {
  draft: "border-[#d9c9a8] bg-[#f7f1e5] text-[#5f6670]",
  needs_review: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
  verified: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  archived: "border-[#d6d8dc] bg-[#f4f5f6] text-[#5f6670]",
};

const riskClasses: Record<KnowledgeRiskLevel, string> = {
  low: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  medium: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  high: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
};

interface KnowledgeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return KNOWLEDGE_DETAIL_SLUGS.map((slug) => ({ slug }));
}

export default async function KnowledgeDetailPage({
  params,
}: KnowledgeDetailPageProps) {
  const { slug } = await params;
  const document = getKnowledgeDetailBySlug(slug);

  if (!document) {
    notFound();
  }

  return (
    <PageFrame>
      <Header />
      <ContentSection>
        <div className="space-y-8">
          <Link
            className="inline-flex min-h-10 items-center rounded-full border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
            href="/knowledge"
          >
            지식 아카이브로 돌아가기
          </Link>

          <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d9c9a8] bg-white px-3 py-1 text-xs font-semibold text-[#7a612d]">
                {document.category}
              </span>
              <span className="rounded-full border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1 text-xs font-semibold text-[#5f6670]">
                {document.type}
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
                상태: {statusLabels[document.status]}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[document.riskLevel]}`}
              >
                위험도: {document.riskLevel}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#d9c9a8] bg-white px-2.5 py-1 text-xs font-semibold text-[#303845]">
                {document.aiUsable ? "AI 참조 가능" : "AI 참조 제외"}
              </span>
            </div>
          </section>

          <aside className="rounded-xl border border-[#d9c9a8] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#102235]">검수 안내</h2>
            <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
              이 문서는 현재 검수 상태를 기준으로 제공됩니다. 공식 출처 확인
              전에는 확정 자료로 사용하지 마세요.
            </p>
            {document.status === "needs_review" ? (
              <p className="mt-2 break-keep text-sm leading-6 text-[#7a612d]">
                검수 필요: 공식 출처 또는 관리자 검수 전 자료입니다.
              </p>
            ) : null}
            {!document.aiUsable ? (
              <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
                AI 참조 제외: 검수 완료 전에는 AI 답변 보조의 근거 문서로
                사용하지 않습니다.
              </p>
            ) : null}
          </aside>

          <section className="space-y-6 rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-6">
            <div>
              <h2 className="text-lg font-semibold text-[#102235]">상세 설명</h2>
              <div className="mt-3 space-y-3">
                {document.body.map((paragraph, index) => (
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
              <h2 className="text-lg font-semibold text-[#102235]">확인 순서</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-[#4f5661]">
                {document.checkSteps.map((step, index) => (
                  <li className="break-keep" key={`${document.slug}-step-${index}`}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#102235]">주의사항</h2>
              <p className="mt-3 break-keep text-sm leading-7 text-[#4f5661]">
                {document.sourceNote}
              </p>
              <p className="mt-2 break-keep text-sm leading-7 text-[#4f5661]">
                {document.aiRestrictionNote}
              </p>
              <p className="mt-2 text-sm text-[#5f6670]">
                최종 수정일:{" "}
                {document.lastReviewedAt
                  ? document.lastReviewedAt
                  : "검수 전 (미기록)"}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#102235]">
                관련 PlannerDesk 링크
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {document.relatedLinks.map((link) => (
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
            <h2 className="text-sm font-semibold text-[#102235]">안전 경계</h2>
            <p className="mt-3 break-keep text-sm leading-6 text-[#5f6670]">
              PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.
              <br />
              PlannerDesk는 보험금 지급 금액을 산정하지 않습니다.
              <br />
              PlannerDesk는 손해사정 업무를 수행하지 않습니다.
              <br />
              고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.
            </p>
          </aside>

          <section className="rounded-xl border border-[#d9c9a8] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#102235]">
              고객 안내용 안전 문구
            </h2>
            <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
              {document.safeCopy}
            </p>
          </section>

          <section className="rounded-xl border border-[#d9c9a8] bg-[#fbf7ee] p-5">
            <h2 className="text-sm font-semibold text-[#102235]">금지 표현</h2>
            <ul className="mt-3 space-y-1 text-sm leading-6 text-[#5f6670]">
              {document.forbiddenClaims.map((claim) => (
                <li key={`${document.slug}-${claim}`}>- {claim}</li>
              ))}
            </ul>
          </section>
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
