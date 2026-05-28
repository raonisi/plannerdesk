import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WorkToolsClient } from "./work-tools-client";

export default function WorkToolsPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Planner Work Tools"
        title="업무 도구"
        description="보험학교 주요 업무 링크에서 GA 전산시스템을 제외한 검색·계산 업무를 플래너데스크 기준으로 정리했습니다."
      />
      <ContentSection>
        <WorkToolsClient />
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
