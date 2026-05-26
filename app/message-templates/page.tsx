import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { customerMessageTemplates } from "@/lib/content";
import { MessageTemplateLibrary } from "./message-template-library";

const t = {
  title: "\uace0\uac1d \uc548\ub0b4 \ubb38\uad6c",
  note:
    "\ud604\uc7ac \ubb38\uad6c\ub294 \uc2e4\ubb34 \ucc38\uace0\uc6a9 \ucd08\uc548\uc785\ub2c8\ub2e4. \uc2e4\uc81c \uace0\uac1d \ubc1c\uc1a1 \uc804 \uc0c1\ud669\uacfc \uc0c1\ud488 \uae30\uc900\uc5d0 \ub9de\uac8c \ubc18\ub4dc\uc2dc \uc218\uc815\ud574 \uc8fc\uc138\uc694.",
  workflowTitle: "\uace0\uac1d \ubc1c\uc1a1 \uc804 \ud655\uc778 \uc21c\uc11c",
  claim: "\uccad\uad6c\uc11c\ub958 \ud655\uc778",
  directory: "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30"
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
