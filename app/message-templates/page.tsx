import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { customerMessageTemplates } from "@/lib/content";
import { MessageTemplateLibrary } from "./message-template-library";

const t = {
  title: "고객 안내 문구",
  note:
    "현재 문구는 실무 참고용 초안입니다. 실제 고객 발송 전 상황과 상품 기준에 맞게 반드시 수정해 주세요.",
  workflowTitle: "고객 발송 전 확인 순서",
  claim: "청구서류 확인",
  directory: "보험사 바로가기"
};

const workflowSteps = [
  "Choose the customer situation.",
  "Review the tone.",
  "Copy the draft.",
  "Edit for the customer's real context.",
  "Check product and insurer standards before sending."
];

export default function MessageTemplatesPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e5] text-[#18202b]">
      <Header />
      <section className="border-b border-[#d9c9a8] bg-[#102235] text-[#fbf7ee]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
            Customer Message Template Library
          </p>
          <h1 className="mt-4 break-keep text-4xl font-semibold leading-tight sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl break-keep text-base leading-7 text-[#d8d0c3] sm:text-lg">
            A field-ready draft library for finding customer-facing message
            templates, reviewing tone, and editing before sending.
          </p>
          <p className="mt-6 max-w-3xl border-l border-[#d8c08f] pl-4 text-sm leading-6 text-[#eee4d2]">
            {t.note}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8 lg:px-10">
        <MessageTemplateLibrary templates={customerMessageTemplates} />
        <PlannerWorkflow />
        <MvpModuleLinks
          description="After choosing a customer message, continue to claim document references or insurer official channels."
          items={[
            {
              href: "/claim-documents",
              label: t.claim,
              description:
                "Review document requirements before requesting or supplementing claim materials."
            },
            {
              href: "/directory",
              label: t.directory,
              description:
                "Open insurer official channels, customer centers, and claim pages for final checks."
            }
          ]}
        />
        <MvpSafetyNotice />
      </section>
      <Footer />
    </main>
  );
}

function PlannerWorkflow() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Planner workflow
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        {t.workflowTitle}
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {workflowSteps.map((step, index) => (
          <div className="border border-[#e3d5b8] bg-white p-4" key={step}>
            <p className="text-sm font-semibold text-[#7a612d]">
              Step {index + 1}
            </p>
            <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
              {step}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
