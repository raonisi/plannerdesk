import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { customerMessageTemplates } from "@/lib/content";
import { MessageTemplateLibrary } from "./message-template-library";

const t = {
  title: "고객 안내 문구 라이브러리",
  note:
    "※ 제공되는 안내 문구는 실무 참고용 템플릿입니다. 실제 고객 발송 전에 고객별 특이사항과 상품 기준을 반드시 반영해 주시기 바랍니다.",
  workflowTitle: "고객 안내문 복사 및 발송 순서",
  claim: "청구서류 확인",
  directory: "보험사 바로가기"
};

const workflowSteps = [
  "고객이 처한 보험 청구 또는 문의 상황을 선택합니다.",
  "상단에 고객명과 설계사명을 입력하여 문구를 실시간 치환합니다.",
  "상황에 맞게 기본/카톡/정중/전문 버전 버튼을 눌러 복사합니다.",
  "카카오톡이나 메신저 창을 열고 붙여넣기(Ctrl+V) 하여 발송합니다.",
  "최종 발송 전 개별 상품 약관 및 한도를 반드시 확인합니다."
];

export default function MessageTemplatesPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#17202A] flex flex-col justify-between">
      <div>
        <Header />
        
        {/* 히어로 영역 */}
        <section className="bg-[#0F1D2E] text-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
              고객 문구
            </span>
            <h1 className="mt-3 break-keep text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-3xl break-keep text-xs leading-relaxed text-slate-400">
              {t.note}
            </p>
          </div>
        </section>

        {/* 메인 컨텐츠 영역 */}
        <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 lg:px-10">
          <MessageTemplateLibrary templates={customerMessageTemplates} />
          
          {/* 고객 발송 프로세스 안내 */}
          <section className="rounded-xl border border-[#E3DED4] bg-white p-6 shadow-sm">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
              설계사 실무 흐름
            </span>
            <h2 className="mt-2 break-keep text-base font-bold text-[#0F1D2E]">
              {t.workflowTitle}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {workflowSteps.map((step, index) => (
                <div className="rounded-lg border border-slate-100 bg-[#F8F7F3] p-4 shadow-sm" key={step}>
                  <p className="text-[11px] font-bold tracking-widest text-[#B9975B]">
                    {index + 1}단계
                  </p>
                  <p className="mt-2 break-keep text-xs font-semibold leading-relaxed text-slate-600">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <MvpModuleLinks
            description="안내 메시지를 복사한 뒤, 필요 서류 규정을 한 번 더 검토하거나 해당 보험사 연락처 정보를 이어서 확인해 보세요."
            items={[
              {
                href: "/claim-documents",
                label: t.claim,
                description:
                  "청구 필수 서류 리스트와 공식 PDF 접수 양식을 확인합니다."
              },
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 전산 접속 주소와 콜센터 헬프데스크 연락처로 연결합니다."
              }
            ]}
          />
          <MvpSafetyNotice />
        </section>
      </div>
      <Footer />
    </main>
  );
}
