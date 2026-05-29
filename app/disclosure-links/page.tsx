import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero } from "@/components/content-page";
import { disclosureLinkEntries } from "@/lib/content";
import { getPublicInsurers } from "@/lib/public/insurers";
import { DisclosureLinksClient } from "./disclosure-links-client";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "공시·약관",
  title: "공시·약관",
  description:
    "보험사 공식 상품공시실, 약관, 협회 자료를 빠르게 확인하세요.",
};

export default async function DisclosureLinksPage() {
  const insurerResult = await getPublicInsurers();
  const insurers = insurerResult.status === "ok" ? insurerResult.insurers : [];

  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <DisclosureLinksClient entries={disclosureLinkEntries} insurers={insurers} />
      </ContentSection>
    </AppShell>
  );
}
