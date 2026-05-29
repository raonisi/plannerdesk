import Link from "next/link";
import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KnowledgeArchiveList } from "./knowledge-archive-list";

const t = {
  eyebrow: "지식 아카이브",
  title: "지식 아카이브",
  description:
    "보험설계사가 반복해서 확인하는 청구, 고지, 해지, 약관, 고객응대 기준을 검수 상태와 함께 정리합니다.",
  subcopy:
    "현재 자료는 실무 참고용이며, 보험금 지급 여부와 지급 금액은 보험사 심사 후 결정됩니다.",
  safetyTitle: "안전한 실무 참고 기준",
  safetyBody:
    "플래너데스크는 보험금 지급 여부를 판단하지 않으며, 보험금 지급 금액을 산정하지 않습니다.\n고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.\n지식 문서는 공식 출처와 관리자 검수 후 신뢰 상태가 갱신됩니다.",
};

export default function KnowledgeArchivePage() {
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

          <KnowledgeArchiveList />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}

function KnowledgeWorkflows() {
  const workflows = [
    {
      title: "청구 기준 확인",
      description: "청구서류, 접수 채널, 고객 안내문 기준을 함께 확인합니다.",
      links: [
        { href: "/claim-documents", label: "청구서류" },
        { href: "/message-templates", label: "고객안내문" }
      ]
    },
    {
      title: "고지·심사 전 확인",
      description: "청약서 질문, 진단·투약 기간, 최근 병원 이력 등 확인 순서를 정리합니다.",
      links: [
        { href: "/knowledge", label: "지식 아카이브" }
      ]
    },
    {
      title: "해지·유지 상담 전 확인",
      description: "보장 공백, 환급금, 감액, 납입유예, 재가입 조건을 점검합니다.",
      links: [
        { href: "/knowledge", label: "지식 아카이브" }
      ]
    },
    {
      title: "공시·약관 기준 확인",
      description: "공식 약관과 상품공시 기준을 먼저 확인합니다.",
      links: [
        { href: "/disclosure-links", label: "공시·약관" },
        { href: "/message-templates", label: "고객안내문" }
      ]
    },
    {
      title: "고객 안내문 확인",
      description: "지급 여부를 단정하지 않는 중립 문구를 확인합니다.",
      links: [
        { href: "/message-templates", label: "고객안내문" }
      ]
    },
    {
      title: "운영 안전 기준",
      description: "개인정보, 의료자료, 보험금 판단, 손해사정 오인 위험을 차단합니다.",
      links: [
        { href: "/knowledge", label: "지식 아카이브" }
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
