import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { customerMessageTemplates } from "@/lib/content";
import { MessageTemplateLibrary } from "./message-template-library";

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
            고객 안내 문구
          </h1>
          <p className="mt-5 max-w-3xl break-keep text-base leading-7 text-[#d8d0c3] sm:text-lg">
            보험설계사가 고객 상황에 맞는 안내 문구 초안을 빠르게 찾고,
            톤을 확인한 뒤 안전하게 수정해 사용할 수 있도록 정리한 실무형
            메시지 라이브러리입니다.
          </p>
          <p className="mt-6 max-w-3xl border-l border-[#d8c08f] pl-4 text-sm leading-6 text-[#eee4d2]">
            현재 문구는 실무 참고용 초안입니다. 실제 고객 발송 전 상황과 상품
            기준에 맞게 반드시 수정해 주세요.
          </p>
        </div>
      </section>

      <nav className="border-b border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-4 sm:px-8 lg:px-10">
          <InternalLink href="/directory">보험사 디렉터리</InternalLink>
          <InternalLink href="/claim-documents">청구 서류</InternalLink>
          <InternalLink href="/disclosure-links">공시·약관 링크센터</InternalLink>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8 lg:px-10">
        <MessageTemplateLibrary templates={customerMessageTemplates} />
        <PlannerWorkflow />
        <SafetyNotice />
      </section>
      <Footer />
    </main>
  );
}

function InternalLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className="shrink-0 whitespace-nowrap border border-[#d9c9a8] px-3 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] hover:text-[#7a612d]"
      href={href}
    >
      {children}
    </a>
  );
}

function PlannerWorkflow() {
  const steps = [
    "고객 상황 선택",
    "문구 톤 검토",
    "초안 복사",
    "고객 실제 상황에 맞게 수정",
    "상품·보험사 기준 확인 후 발송"
  ];

  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Planner workflow
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        고객 발송 전 확인 순서
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => (
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
      <p className="mt-5 break-keep text-sm leading-6 text-[#4f5661]">
        보장 결과를 단정하거나 고객을 압박하는 표현은 피하고, 상담 전 확인한
        공식 기준과 고객 상황에 맞게 문구를 조정해 주세요.
      </p>
    </section>
  );
}

function SafetyNotice() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Safety boundary
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        문구 사용 및 업무 범위 안내
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <p>
          이 MVP는 필요한 경우 실무 참고용 초안 메시지 템플릿을 사용합니다.
          모든 고객 안내 문구는 발송 전 고객 상황, 상품 약관, 보험사 기준,
          관련 규정에 맞게 검토하고 수정해야 합니다.
        </p>
        <p>
          고객 안내 문구에는 보장 결과 단정, 불안 조성, 오해를 줄 수 있는
          보험 설명, 과도한 긴급성 표현을 포함하지 않아야 합니다.
        </p>
      </div>
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <li>PlannerDesk는 최종 법률, 의료, 세무, 금융 자문을 제공하지 않습니다.</li>
        <li>PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.</li>
        <li>PlannerDesk는 보험금 지급 금액을 추정하지 않습니다.</li>
        <li>PlannerDesk는 손해사정 업무를 수행하지 않습니다.</li>
        <li>PlannerDesk는 이 MVP에서 고객 의료문서를 처리하지 않습니다.</li>
        <li>최종 고객 커뮤니케이션은 설계사의 검토와 책임 하에 발송되어야 합니다.</li>
      </ul>
    </section>
  );
}
