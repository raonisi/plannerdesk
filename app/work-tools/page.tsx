import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero } from "@/components/content-page";
import { HomeScreenInstallNotice } from "@/components/pwa/home-screen-install-notice";
import { WorkToolsPublicNotice } from "@/components/work-tools/work-tools-public-notice";
import { WorkToolsClient } from "./work-tools-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "업무 도구 | PlannerDesk",
  description:
    "보험나이, 상병코드, 수술분류, 공식 링크 등 로그인 없이 사용할 수 있는 공개 참고 업무 도구입니다.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function WorkToolsPage() {
  return (
    <AppShell>
      <PageHero
        eyebrow="업무 도구"
        title="업무 도구"
        description="보험나이, 실손 자기부담 참고, 상병코드, 수술분류표 등 설계사 업무 보조 참고 도구입니다."
      />
      <ContentSection>
        <div className="space-y-6">
          <WorkToolsPublicNotice />
          <WorkToolsClient />
          <HomeScreenInstallNotice variant="public" />
        </div>
      </ContentSection>
    </AppShell>
  );
}
