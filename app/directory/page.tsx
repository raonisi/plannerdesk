import { ContentSection, PageFrame, PageHero, RelatedPageLinks } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { insurerDirectoryEntries } from "@/lib/content";
import { DirectoryExplorer } from "./directory-explorer";

export default function DirectoryPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Insurer Work Portal"
        title="보험사 바로가기"
        description="보험설계사가 매일 확인하는 보험사 홈페이지, 청구 페이지, 고객센터, 팩스, 등기주소, 공식 링크를 빠르게 찾기 위한 실무 디렉터리입니다."
      />
      <RelatedPageLinks />
      <ContentSection>
        <div className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
          <p className="text-sm font-semibold text-[#102235]">검수 안내</p>
          <p className="mt-2 text-sm leading-6 text-[#4f5661]">
            현재 일부 정보는 검수 전 샘플 데이터입니다. 실제 공개 전 공식 출처
            확인이 필요합니다.
          </p>
        </div>

        <DirectoryExplorer insurers={insurerDirectoryEntries} />

        <section className="mt-10 grid gap-4 border-y border-[#d9c9a8] py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
              Daily Desk
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#102235]">
              반복 검색을 줄이는 보험사 업무 입구
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "자주 찾는 공식 링크를 한 화면에서 확인합니다.",
              "향후 즐겨찾기와 최근 사용 링크를 검토할 예정입니다.",
              "검증 이력과 업데이트 기록을 담을 수 있는 구조로 준비합니다."
            ].map((item) => (
              <div className="border border-[#e3d5b8] bg-white p-4" key={item}>
                <p className="text-sm leading-6 text-[#4f5661]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border border-[#d9c9a8] bg-[#fbf7ee] p-5">
          <p className="text-sm font-semibold text-[#102235]">안전 및 검증 기준</p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#4f5661] sm:grid-cols-2">
            <li>공식 링크와 연락처는 공개 전 반드시 검증해야 합니다.</li>
            <li>PlannerDesk는 특정 보험사를 대표하지 않습니다.</li>
            <li>PlannerDesk는 보험금 청구를 처리하거나 지급 여부를 판단하지 않습니다.</li>
            <li>이 디렉터리는 실무 참고와 업무 흐름 정리를 위한 페이지입니다.</li>
          </ul>
        </section>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
