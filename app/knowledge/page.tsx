import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KnowledgeArchiveList } from "./knowledge-archive-list";

const t = {
  eyebrow: "Knowledge Archive",
  title: "지식 아카이브",
  description:
    "보험설계사가 반복해서 확인하는 실무 질문을 검수 상태와 함께 정리합니다.",
  subcopy:
    "현재 목록은 초기 정적 샘플이며, 공식 출처 확인 전에는 확정 자료로 사용하지 않습니다.",
  safetyTitle: "안전한 실무 참고 기준",
  safetyBody:
    "PlannerDesk는 보험금 지급 여부를 판단하지 않으며, 보험금 지급 금액을 산정하지 않습니다.\n고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하지 마세요.\n지식 문서는 공식 출처와 관리자 검수 후 신뢰 상태가 갱신됩니다.",
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

          <KnowledgeArchiveList />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
