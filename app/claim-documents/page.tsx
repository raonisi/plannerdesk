import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpDraftNotice,
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { claimDocumentEntries, insurerDirectoryEntries } from "@/lib/content";
import { ClaimDocumentExplorer } from "./claim-document-explorer";

const t = {
  title: "\uccad\uad6c\uc11c\ub958",
  draft:
    "\ud604\uc7ac \uccad\uad6c\uc11c\ub958 \uc815\ubcf4\ub294 \uac80\uc218 \uc804 \uc0d8\ud50c \ub370\uc774\ud130\uac00 \ud3ec\ud568\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uc2e4\uc81c \uace0\uac1d \uc548\ub0b4 \ub610\ub294 \uc81c\ucd9c \uc804 \uacf5\uc2dd \ubcf4\ud5d8\uc0ac \uae30\uc900\uacfc \ucd5c\uc2e0 \uc548\ub0b4\ub97c \ud655\uc778\ud574\uc57c \ud569\ub2c8\ub2e4.",
  workflowTitle:
    "\uace0\uac1d \uc548\ub0b4 \uc804 \uacf5\uc2dd \uae30\uc900\uc744 \ub2e4\uc2dc \ud655\uc778\ud558\ub294 \ud750\ub984",
  directory: "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30",
  message: "\uace0\uac1d \ubb38\uad6c \ud655\uc778"
};

const workflowSteps = [
  "Confirm the claim type first.",
  "Check the insurer's official guidance path.",
  "Review document requirements by product and claim type.",
  "Use calm wording that does not imply a claim result."
];

export default function ClaimDocumentsPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Claim Document Desk"
        title={t.title}
        description="A mobile-friendly working library for checking claim document references by claim type and insurer context."
      />
      <ContentSection>
        <div className="space-y-8">
          <MvpDraftNotice>{t.draft}</MvpDraftNotice>

          <ClaimDocumentExplorer
            documents={claimDocumentEntries}
            insurers={insurerDirectoryEntries}
          />

          <section className="grid gap-4 border-y border-[#d9c9a8] py-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
                Planner workflow
              </p>
              <h2 className="mt-3 break-keep text-3xl font-semibold leading-tight text-[#102235]">
                {t.workflowTitle}
              </h2>
              <p className="mt-4 break-keep text-sm leading-6 text-[#4f5661]">
                This page does not guarantee claim results. Official insurer
                review and current guidance remain the source of truth.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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

          <MvpModuleLinks
            description="After checking claim documents, continue to insurer channels and customer-facing draft messages."
            items={[
              {
                href: "/directory",
                label: t.directory,
                description:
                  "Open insurer official websites, customer center paths, and claim pages."
              },
              {
                href: "/message-templates",
                label: t.message,
                description:
                  "Review safe draft messages before requesting documents or follow-up details."
              }
            ]}
          />

          <MvpSafetyNotice />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
