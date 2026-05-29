import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero } from "@/components/content-page";
import { WorkToolsClient } from "./work-tools-client";

export default function WorkToolsPage() {
  return (
    <AppShell>
      <PageHero
        eyebrow="업무 도구"
        title="업무 도구"
        description="보험학교 주요 업무 링크에서 전산 로그인 그룹만 제외하고, 검색·계산·공식 업무 링크를 플래너데스크 자체 기능으로 다시 구성했습니다."
      />
      <ContentSection>
        <WorkToolsClient />
      </ContentSection>
    </AppShell>
  );
}
