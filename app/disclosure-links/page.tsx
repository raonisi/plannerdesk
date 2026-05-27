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
    "현재 일부 정보는 검수 전 샘플 데이터입니다. 실제 고객 상담 또는 자료 안내 전 공식 출처 확인이 필요합니다.",
  workflowTitle: "상담 전 자료 확인 순서",
  directory: "보험사 바로가기",
  claim: "청구서류 확인"
};

const workflowSteps = [
  "Check the official source first.",
  "Reconfirm product and insurer-specific details.",
  "Use the information only as a practical reference.",
  "Avoid presenting it as a final legal, payout, or insurer review conclusion."
];

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
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl break-keep text-base leading-7 text-[#d8d0c3] sm:text-lg">
            A practical reference hub for official disclosure, policy terms,
            product pages, association references, and insurer material paths.
          </p>
          <p className="mt-6 max-w-3xl border-l border-[#d8c08f] pl-4 text-sm leading-6 text-[#eee4d2]">
            {t.note}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8 lg:px-10">
        <DisclosureLinkCenter entries={disclosureLinkEntries} />
        <PlannerWorkflow />
        <MvpModuleLinks
          description="After checking disclosure and policy references, continue to official insurer channels or claim document references."
          items={[
            {
              href: "/directory",
              label: t.directory,
              description:
                "Open insurer official websites, customer centers, and claim page paths."
            },
            {
              href: "/claim-documents",
              label: t.claim,
              description:
                "Review claim document references before preparing customer guidance."
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
      <div className="mt-5 grid gap-3 md:grid-cols-4">
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
