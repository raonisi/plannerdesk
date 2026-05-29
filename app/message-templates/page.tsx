import { AppShell } from "@/components/app-shell";
import {
  CollapsibleNotice,
  ContentSection,
  PageHero,
} from "@/components/content-page";
import { customerMessageTemplates } from "@/lib/content";
import { uiLabels } from "@/lib/ui-labels";
import { MessageTemplateLibrary } from "./message-template-library";

const t = {
  eyebrow: "고객 문구",
  title: "고객 문구 복사",
  description:
    "고객명과 설계사명을 입력하면 상황별 안내 문구를 바로 복사할 수 있습니다.",
};

export default function MessageTemplatesPage() {
  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <div className="space-y-8">
          <MessageTemplateLibrary templates={customerMessageTemplates} />

          <CollapsibleNotice
            summary="제공 문구는 실무 참고용입니다. 발송 전 고객별 상황과 상품 약관을 반드시 확인해 주세요."
            title={uiLabels.safetyBoundary}
          >
            <ul className="space-y-2 break-keep">
              <li>보험금 지급 여부·금액에 대한 단정 표현은 사용하지 마세요.</li>
              <li>고객 의료서류 원본 업로드나 과도한 개인정보 요구는 하지 마세요.</li>
              <li>상품 가입 유도·공포 조장·특정 상품 추천처럼 보이는 표현은 피해 주세요.</li>
              <li>카카오톡 등 메신저에 붙여넣기 전 최종 문구를 한 번 더 검토해 주세요.</li>
            </ul>
          </CollapsibleNotice>
        </div>
      </ContentSection>
    </AppShell>
  );
}
