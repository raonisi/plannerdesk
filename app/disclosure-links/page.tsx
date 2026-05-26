import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { disclosureLinkEntries } from "@/lib/content";
import { DisclosureLinkCenter } from "./disclosure-link-center";

const t = {
  title: "\uacf5\uc2dc\u00b7\uc57d\uad00 \ub9c1\ud06c\uc13c\ud130",
  note:
    "\ud604\uc7ac \uc77c\ubd80 \uc815\ubcf4\ub294 \uac80\uc218 \uc804 \uc0d8\ud50c \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc2e4\uc81c \uace0\uac1d \uc0c1\ub2f4 \ub610\ub294 \uc790\ub8cc \uc548\ub0b4 \uc804 \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
  workflowTitle: "\uc0c1\ub2f4 \uc804 \uc790\ub8cc \ud655\uc778 \uc21c\uc11c",
  directory: "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30",
  claim: "\uccad\uad6c\uc11c\ub958 \ud655\uc778"
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
