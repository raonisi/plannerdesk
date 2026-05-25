import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { disclosureLinkEntries } from "@/lib/content";
import { DisclosureLinkCenter } from "./disclosure-link-center";

export default function DisclosureLinksPage() {
  return (
    <main className="min-h-screen bg-[#f7f1e5] text-[#18202b]">
      <Header />
      <section className="border-b border-[#d9c9a8] bg-[#102235] text-[#fbf7ee]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
            Disclosure & Policy Link Center
          </p>
          <h1 className="mt-4 break-keep text-4xl font-semibold leading-tight sm:text-5xl">
            공시·약관 링크센터
          </h1>
          <p className="mt-5 max-w-3xl break-keep text-base leading-7 text-[#d8d0c3] sm:text-lg">
            보험설계사가 공식 공시, 약관, 상품, 보험협회 기준, 보험사
            공식자료를 상담 전 참고 기준으로 빠르게 정리해 볼 수 있는 실무형
            링크 허브입니다.
          </p>
          <p className="mt-6 max-w-3xl border-l border-[#d8c08f] pl-4 text-sm leading-6 text-[#eee4d2]">
            현재 일부 정보는 검수 전 샘플 데이터입니다. 실제 고객 상담 또는
            자료 안내 전 공식 출처 확인이 필요합니다.
          </p>
        </div>
      </section>

      <nav className="border-b border-[#d9c9a8] bg-[#fbf7ee]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-4 sm:px-8 lg:px-10">
          <InternalLink href="/directory">보험사 디렉터리</InternalLink>
          <InternalLink href="/claim-documents">청구 서류</InternalLink>
          <InternalLink href="/message-templates">메시지 템플릿</InternalLink>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8 lg:px-10">
        <DisclosureLinkCenter entries={disclosureLinkEntries} />
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
    "먼저 공식 출처 확인",
    "상품별·보험사별 세부 기준 재확인",
    "고객 설명에는 참고 자료로만 활용",
    "최종 법적 판단, 지급 판단, 보험사 심사 결론으로 표현하지 않기"
  ];

  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Planner workflow
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        상담 전 자료 확인 순서
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
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
        PlannerDesk는 보험사 또는 공식 협회 출처를 대체하지 않으며, 실무
        참고 자료를 구조화해 상담 준비 시간을 줄이는 데 목적이 있습니다.
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
        검수 및 업무 범위 안내
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <p>
          이 MVP는 필요한 경우 초안 placeholder 데이터를 사용합니다. 공식
          링크, 상품 페이지, 약관 참조, 공시 페이지, 연락처, 문서 링크는 공개
          전 검수되어야 합니다.
        </p>
        <p>
          공식 보험사와 협회 출처가 최종 기준입니다. 정보는 보험사, 상품,
          특약, 계약일, 인수·심사 기준에 따라 달라질 수 있습니다.
        </p>
      </div>
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <li>PlannerDesk는 최종 약관 해석을 제공하지 않습니다.</li>
        <li>PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.</li>
        <li>PlannerDesk는 보험금 지급 금액을 추정하지 않습니다.</li>
        <li>PlannerDesk는 손해사정 업무를 수행하지 않습니다.</li>
        <li>PlannerDesk는 이 MVP에서 고객 의료문서를 처리하지 않습니다.</li>
        <li>정보는 실무 참고와 업무 정리를 위한 용도로만 제공됩니다.</li>
      </ul>
    </section>
  );
}
