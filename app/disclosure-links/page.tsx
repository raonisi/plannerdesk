import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero, WorkflowStepsSection } from "@/components/content-page";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { disclosureLinkEntries } from "@/lib/content";
import { DisclosureLinkCenter } from "./disclosure-link-center";

const t = {
  eyebrow: "공시·약관",
  title: "공시·약관 링크센터",
  description:
    "보험 상품공시실과 약관 정보는 수시로 변경될 수 있으므로, 최종 안내 전 공식 채널을 다시 확인해 주세요.",
  workflowTitle: "실무 약관 및 공시 자료 확인 흐름",
  directory: "보험사 바로가기",
  claim: "청구서류 확인",
};

const workflowSteps = [
  "공식 상품공시실/약관실 링크를 먼저 클릭합니다.",
  "해당 상품의 개정 일자와 세부 보장 한도를 확인합니다.",
  "협회 공시 자료나 참고 소식지를 비교 검토합니다.",
  "최종 안내 시 법적 결론이나 지급 보장이 아님을 명시합니다.",
];

export default function DisclosureLinksPage() {
  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <div className="space-y-8">
          <DisclosureLinkCenter entries={disclosureLinkEntries} />

          <WorkflowStepsSection steps={workflowSteps} title={t.workflowTitle} />

          <MvpModuleLinks
            description="공시 약관 및 상품 채널 확인 후, 보험사 공식 연락처 또는 필요 청구서류 항목을 빠르게 이어 확인해 보세요."
            items={[
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 공식 웹사이트, 콜센터, 전산 접속 및 팩스 정보를 확인합니다.",
              },
              {
                href: "/claim-documents",
                label: t.claim,
                description: "유형별 필요 청구서류와 제출 방법을 종합 비교합니다.",
              },
            ]}
          />
          <MvpSafetyNotice />
        </div>
      </ContentSection>
    </AppShell>
  );
}
