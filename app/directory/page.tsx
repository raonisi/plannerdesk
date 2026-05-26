import { ContentSection, PageFrame, PageHero } from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  MvpDraftNotice,
  MvpModuleLinks,
  MvpSafetyNotice
} from "@/components/mvp-navigation";
import { insurerDirectoryEntries } from "@/lib/content";
import { DirectoryExplorer } from "./directory-explorer";

const t = {
  title: "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30",
  draft:
    "\ud604\uc7ac \ubcf4\ud5d8\uc0ac \uc815\ubcf4\ub294 \uac80\uc218 \uc804 \uc0d8\ud50c \ub370\uc774\ud130\uac00 \ud3ec\ud568\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uacf5\uc2dd \ub9c1\ud06c, \uc5f0\ub77d\ucc98, \ud329\uc2a4\ubc88\ud638, \uc8fc\uc18c\ub294 \uace0\uac1d \uc548\ub0b4 \uc804 \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \ucd9c\ucc98\ub85c \ud655\uc778\ud574\uc57c \ud569\ub2c8\ub2e4.",
  claim: "\uccad\uad6c\uc11c\ub958 \ud655\uc778",
  disclosure: "\uacf5\uc2dc\u00b7\uc57d\uad00 \ud655\uc778"
};

export default function DirectoryPage() {
  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow="Insurer Work Portal"
        title={t.title}
        description="A practical directory for official insurer websites, claim pages, customer centers, fax numbers, and mailing addresses."
      />
      <ContentSection>
        <div className="space-y-8">
          <MvpDraftNotice>{t.draft}</MvpDraftNotice>

          <DirectoryExplorer insurers={insurerDirectoryEntries} />

          <MvpModuleLinks
            description="After checking insurer channels, continue to claim documents or official disclosure references."
            items={[
              {
                href: "/claim-documents",
                label: t.claim,
                description:
                  "Review claim document references before preparing customer guidance."
              },
              {
                href: "/disclosure-links",
                label: t.disclosure,
                description:
                  "Check product disclosure, policy terms, association references, and official insurer material paths."
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
