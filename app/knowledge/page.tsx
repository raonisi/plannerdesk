import Link from "next/link";
import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  filterAndSortKnowledgeArchive,
  parseKnowledgeArchiveParams,
} from "@/lib/knowledge/archive-filter";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { DataResponsibilityInlineNotice } from "@/components/content/data-responsibility-inline-notice";
import { KnowledgeArchiveList } from "./knowledge-archive-list";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "지식 아카이브",
  title: "지식 아카이브",
  description:
    "보험설계사가 반복해서 확인하는 청구, 고지, 해지, 약관, 고객응대 기준을 검수 상태와 함께 정리합니다.",
  subcopy:
    "현재 자료는 설계사 실무 참고용입니다. 보험금 지급 여부와 지급 금액은 보험사 심사 후 결정됩니다.",
  safetyTitle: "안전 안내 박스",
  safetyBody:
    "PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.\nPlannerDesk는 보험금 지급 금액을 산정하지 않습니다.\nPlannerDesk는 손해사정 업무를 수행하지 않습니다.\nPlannerDesk는 의료 진단을 해석하지 않습니다.\n고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하거나 업로드하지 마세요.",
};

interface KnowledgePageSearchParams {
  q?: string;
  category?: string;
  type?: string;
  risk?: string;
  review?: string;
  sort?: string;
}

export default async function KnowledgeArchivePage({
  searchParams,
}: {
  searchParams: Promise<KnowledgePageSearchParams>;
}) {
  const resolved = await searchParams;
  const filterState = parseKnowledgeArchiveParams(
    resolved as Record<string, string | string[] | undefined>,
  );

  const result = await getPublicKnowledgeArticles();
  const articles = result.status === "ok" ? result.articles : [];
  const isCatalogEmpty = articles.length === 0;

  const { items: filteredItems, blockedMessage } = filterAndSortKnowledgeArchive(
    articles,
    filterState,
  );

  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <ContentSection>
        <div className="space-y-8">
          <p className="break-keep text-sm leading-6 text-[#5f6670]">{t.subcopy}</p>

          <DataResponsibilityInlineNotice variant="knowledge" />

          <aside
            className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-5 sm:p-6"
            role="note"
          >
            <h2 className="text-sm font-semibold text-[#102235]">{t.safetyTitle}</h2>
            <p className="mt-3 break-keep whitespace-pre-line text-sm leading-6 text-[#5f6670]">
              {t.safetyBody}
            </p>
          </aside>

          <KnowledgeWorkflows />

          <KnowledgeArchiveList
            blockedMessage={blockedMessage}
            filterState={filterState}
            filteredItems={filteredItems}
            isCatalogEmpty={isCatalogEmpty}
            items={articles}
          />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}

function KnowledgeWorkflows() {
  const workflows = [
    {
      title: "1. 청구 기준 확인",
      description: "청구서류, 접수 채널, 고객 안내문 기준을 함께 확인합니다.\n보험사별 기준과 공식 안내를 먼저 확인하세요.",
      links: [
        { href: "/claim-documents", label: "청구서류 확인" },
        { href: "/message-templates", label: "고객 안내문 확인" },
        { href: "/directory", label: "보험사 정보 확인" }
      ]
    },
    {
      title: "2. 고지·심사 전 확인",
      description: "청약서 질문, 진단·투약 기간, 최근 병원 이력 등 확인 순서를 정리합니다.\n가입 가능 여부, 할증, 부담보, 거절 여부는 보험사 심사 후 결정됩니다.",
      links: [
        { href: "/knowledge", label: "고지 관련 지식 보기" },
        { href: "/message-templates", label: "고객 안내문 확인" }
      ]
    },
    {
      title: "3. 해지·유지 상담 전 확인",
      description: "보장 공백, 환급금, 감액, 납입유예, 재가입 조건을 먼저 확인합니다.\n해지 또는 유지를 무조건 권유하지 않고, 선택지를 비교할 수 있도록 돕습니다.",
      links: [
        { href: "/knowledge", label: "해지 전 기준 보기" },
        { href: "/message-templates", label: "고객 안내문 확인" }
      ]
    },
    {
      title: "4. 공시·약관 기준 확인",
      description: "보험사 공식 홈페이지, 상품공시, 약관 링크를 기준으로 확인합니다.\n비공식 블로그·카페 링크를 확정 자료처럼 사용하지 않습니다.",
      links: [
        { href: "/disclosure-links", label: "공시·약관 확인" },
        { href: "/message-templates", label: "약관 안내문 확인" }
      ]
    },
    {
      title: "5. 고객 안내문 확인",
      description: "고객에게 보낼 수 있는 중립 문구를 확인합니다.\n보험금 지급 가능 여부를 단정하지 않고, 공식 기준 확인으로 안내합니다.",
      links: [
        { href: "/message-templates", label: "고객 안내문 보기" },
        { href: "/claim-documents", label: "청구서류 확인" }
      ]
    },
    {
      title: "6. 운영 안전 기준",
      description: "개인정보, 의료자료, 보험금 판단, 손해사정 오인 위험을 차단하기 위한 기준입니다.\nPlannerDesk 안에는 주민등록번호, 진단서, 처방전, 검사결과지, 청구서류 원본을 입력하지 않습니다.",
      links: [
        { href: "/knowledge", label: "안전 기준 보기" },
        { href: "/work-tools", label: "업무 도구로 이동" }
      ]
    }
  ];

  return (
    <section>
      <h2 className="text-lg font-bold text-[#102235] mb-4">상황별 실무 기준</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((flow, index) => (
          <div key={index} className="flex flex-col justify-between rounded-xl border border-[#d9c9a8] bg-white p-5 shadow-sm transition hover:shadow-md">
            <div>
              <h3 className="text-sm font-bold text-[#102235]">{flow.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#5f6670] break-keep">{flow.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {flow.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="inline-flex items-center rounded-lg bg-[#fbf7ee] px-3 py-1.5 text-[11px] font-semibold text-[#7a612d] hover:bg-[#f7f1e5] transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
