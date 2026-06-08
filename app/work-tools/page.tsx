import { AppShell } from "@/components/app-shell";
import { AccessRestrictedPanel } from "@/components/content/access-restricted-panel";
import { ContentSection, PageHero } from "@/components/content-page";
import { getWorkToolsAccess } from "@/lib/auth/access";
import {
  WORK_TOOLS_ACCESS_DENIED_BODY,
  WORK_TOOLS_PLANNER_ACCESS_NOTICE,
} from "@/lib/public/public-ux-copy";
import { WorkToolsClient } from "./work-tools-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "업무 도구 | PlannerDesk",
  description: "검증 설계사 전용 업무 도구입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WorkToolsPage() {
  const access = await getWorkToolsAccess();

  if (access.status === "locked") {
    return (
      <AccessRestrictedPanel
        description={`${WORK_TOOLS_PLANNER_ACCESS_NOTICE} 로그인 후 다시 시도해 주세요.`}
        title="로그인이 필요합니다"
      />
    );
  }

  if (access.status === "denied") {
    return (
      <AccessRestrictedPanel description={WORK_TOOLS_ACCESS_DENIED_BODY} />
    );
  }

  return (
    <AppShell>
      <PageHero
        eyebrow="업무 도구"
        title="업무 도구"
        description="보험나이, 실손 자기부담 참고, 상병코드, 수술분류표 등 설계사 업무 보조 도구입니다."
      />
      <ContentSection>
        <WorkToolsClient />
      </ContentSection>
    </AppShell>
  );
}
