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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400">
            Disclosure & Policy Link Center
          </p>
          <h1 className="mt-5 break-keep text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-3xl break-keep text-lg leading-relaxed text-slate-300 sm:text-xl">
            A practical reference hub for official disclosure, policy terms,
            product pages, association references, and insurer material paths.
          </p>
          <p className="mt-8 max-w-3xl border-l-2 border-indigo-500 pl-4 text-sm font-medium leading-relaxed text-indigo-100/70">
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
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
        Planner workflow
      </p>
      <h2 className="mt-3 break-keep text-2xl font-bold tracking-tight text-slate-900">
        {t.workflowTitle}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" key={step}>
            <p className="text-[13px] font-bold tracking-widest text-indigo-600">
              STEP {index + 1}
            </p>
            <p className="mt-3 break-keep text-sm font-medium leading-relaxed text-slate-600">
              {step}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
