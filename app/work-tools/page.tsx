import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero } from "@/components/content-page";
import { WorkToolsClient } from "./work-tools-client";

export default function WorkToolsPage() {
  return (
    <AppShell>
      <PageHero
        eyebrow="업무 도구"
        title="업무 도구"
        description="보험나이, 실손보험금, 상병코드, 수술분류표 등 반복 업무를 빠르게 실행하세요."
      />
      <ContentSection>
        <WorkToolsClient />
      </ContentSection>
    </AppShell>
  );
}
