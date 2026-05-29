import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { disclosureLinkEntries } from "@/lib/content";
import { DisclosureLinkCenter } from "./disclosure-link-center";

const t = {
  title: "공시·약관 링크센터",
  note:
    "보험 상품공시실과 약관 정보는 수시로 변경될 수 있으므로, 최종 안내 전 공식 채널을 다시 확인해 주세요.",
  workflowTitle: "실무 약관 및 공시 자료 확인 흐름",
  directory: "보험사 바로가기",
  claim: "청구서류 확인"
};

const workflowSteps = [
  "공식 상품공시실/약관실 링크를 먼저 클릭합니다.",
  "해당 상품의 개정 일자와 세부 보장 한도를 확인합니다.",
  "협회 공시 자료나 참고 소식지를 비교 검토합니다.",
  "최종 안내 시 법적 결론이나 지급 보장이 아님을 명시합니다."
];

export default function DisclosureLinksPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#17202A] flex flex-col justify-between">
      <div>
        <Header />
        
        {/* 히어로 영역 */}
        <section className="bg-[#0F1D2E] text-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
              공시·약관
            </span>
            <h1 className="mt-3 break-keep text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-3xl break-keep text-xs leading-relaxed text-slate-400">
              {t.note}
            </p>
          </div>
        </section>

        {/* 컨텐츠 메인 */}
        <section className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 lg:px-10">
          <DisclosureLinkCenter entries={disclosureLinkEntries} />
          
          {/* 실무 약관 및 공시 자료 확인 흐름 */}
          <section className="rounded-xl border border-[#E3DED4] bg-white p-6 shadow-sm">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#B9975B]">
              설계사 실무 흐름
            </span>
            <h2 className="mt-2 break-keep text-base font-bold text-[#0F1D2E]">
              {t.workflowTitle}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            description="공시 약관 및 상품 채널 확인 후, 보험사 공식 연락처 또는 필요 청구서류 항목을 빠르게 이어 확인해 보세요."
            items={[
              {
                href: "/directory",
                label: t.directory,
                description:
                  "보험사 공식 웹사이트, 콜센터, 전산 접속 및 팩스 정보를 확인합니다."
              },
              {
                href: "/claim-documents",
                label: t.claim,
                description:
                  "유형별 필요 청구서류와 제출 방법을 종합 비교합니다."
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
