import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero, WorkflowStepsSection } from "@/components/content-page";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { customerMessageTemplates } from "@/lib/content";
import { MessageTemplateLibrary } from "./message-template-library";

const t = {
  eyebrow: "고객 문구",
  title: "고객 안내 문구 라이브러리",
  description:
    "제공되는 안내 문구는 실무 참고용 템플릿입니다. 실제 고객 발송 전에 고객별 특이사항과 상품 기준을 반드시 반영해 주세요.",
  workflowTitle: "고객 안내문 복사 및 발송 순서",
  claim: "청구서류 확인",
  directory: "보험사 바로가기",
};

const workflowSteps = [
  "고객이 처한 보험 청구 또는 문의 상황을 선택합니다.",
  "상단에 고객명과 설계사명을 입력하여 문구를 실시간 치환합니다.",
  "상황에 맞게 기본/카톡/정중/전문 버전 버튼을 눌러 복사합니다.",
  "카카오톡이나 메신저 창을 열고 붙여넣기(Ctrl+V) 하여 발송합니다.",
  "최종 발송 전 개별 상품 약관 및 한도를 반드시 확인합니다.",
];

export default function MessageTemplatesPage() {
  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <div className="space-y-8">
          <MessageTemplateLibrary templates={customerMessageTemplates} />

          <WorkflowStepsSection
            columnsClass="sm:grid-cols-2 lg:grid-cols-5"
            steps={workflowSteps}
            title={t.workflowTitle}
          />

          <MvpModuleLinks
            description="안내 메시지를 복사한 뒤, 필요 서류 규정을 한 번 더 검토하거나 해당 보험사 연락처 정보를 이어서 확인해 보세요."
            items={[
              {
                href: "/claim-documents",
                label: t.claim,
                description:
                  "청구 필수 서류 리스트와 공식 PDF 접수 양식을 확인합니다.",
              },
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 전산 접속 주소와 콜센터 헬프데스크 연락처로 연결합니다.",
              },
            ]}
          />
          <MvpSafetyNotice />
        </div>
      </ContentSection>
    </AppShell>
  );
}
