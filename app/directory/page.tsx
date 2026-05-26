import {
  ContentSection,
  EmptyState,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MvpModuleLinks, MvpSafetyNotice } from "@/components/mvp-navigation";
import { getPublicInsurers } from "@/lib/public/insurers";
import { DirectoryExplorer } from "./directory-explorer";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "Insurer Work Portal",
  title: "\ubcf4\ud5d8\uc0ac \ub514\ub809\ud1a0\ub9ac",
  description:
    "\uc804\uc0b0\u00b7\uccad\uad6c\u00b7\uace0\uac1d\uc13c\ud130 \uc815\ubcf4\ub97c \ud55c \uacf3\uc5d0\uc11c \ud655\uc778\ud558\uc138\uc694.",
  subcopy:
    "\uacf5\uc2dd \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8\ub418\ub294 \uc815\ubcf4\ubd80\ud130 \uc21c\ucc28\uc801\uc73c\ub85c \ubc18\uc601\ub429\ub2c8\ub2e4.",
  footerNote:
    "\ubcf4\ud5d8\uc0ac\ubcc4 \ub9c1\ud06c\uc640 \uc5f0\ub77d\ucc98\ub294 \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8\ub429\ub2c8\ub2e4.",
  emptyTitle: "\uacf5\uac1c\ub41c \ubcf4\ud5d8\uc0ac \uc815\ubcf4\uac00 \uc544\uc9c1 \uc5c6\uc2b5\ub2c8\ub2e4.",
  emptyDescription:
    "\uad00\ub9ac\uc790 \uac80\uc218 \ud6c4 \uc21c\ucc28\uc801\uc73c\ub85c \uc5c5\ub370\uc774\ud2b8\ub429\ub2c8\ub2e4.",
  errorTitle: "\ubcf4\ud5d8\uc0ac \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
  errorDescription: "\uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \ud655\uc778\ud574 \uc8fc\uc138\uc694.",
  claim: "\uccad\uad6c\uc11c\ub958 \ud655\uc778",
  disclosure: "\uacf5\uc2dc\u00b7\uc57d\uad00 \ud655\uc778",
  moduleDescription:
    "\ubcf4\ud5d8\uc0ac \ucc44\ub110\uc744 \ud655\uc778\ud55c \ub2e4\uc74c\uc5d0\ub294 \uccad\uad6c\uc11c\ub958 \ub610\ub294 \uacf5\uc2dc \uc790\ub8cc\ub97c \uc774\uc5b4\uc11c \ud655\uc778\ud558\uc138\uc694.",
  claimDesc:
    "\uccad\uad6c\uc11c\ub958 \uad6c\uc870\ub97c \ud655\uc778\ud558\uace0 \uace0\uac1d \uc548\ub0b4 \uc804 \ud544\uc218 \ud56d\ubaa9\uc744 \uc815\ub9ac\ud558\uc138\uc694.",
  disclosureDesc:
    "\uc0c1\ud488 \uacf5\uc2dc, \uc57d\uad00, \ud611\ud68c \uc790\ub8cc, \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \uc790\ub8cc \uacbd\ub85c\ub97c \ud655\uc778\ud558\uc138\uc694.",
};

export default async function DirectoryPage() {
  const result = await getPublicInsurers();

  return (
    <PageFrame>
      <Header />
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <ContentSection>
        <div className="space-y-8">
          <p className="break-keep text-sm leading-6 text-[#5f6670]">
            {t.subcopy}
          </p>

          {result.status === "error" ? (
            <EmptyState
              title={t.errorTitle}
              description={t.errorDescription}
            />
          ) : result.insurers.length === 0 ? (
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDescription}
            />
          ) : (
            <DirectoryExplorer insurers={result.insurers} />
          )}

          <p className="break-keep border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
            {t.footerNote}
          </p>

          <MvpModuleLinks
            description={t.moduleDescription}
            items={[
              {
                href: "/claim-documents",
                label: t.claim,
                description: t.claimDesc,
              },
              {
                href: "/disclosure-links",
                label: t.disclosure,
                description: t.disclosureDesc,
              },
            ]}
          />

          <MvpSafetyNotice />
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
