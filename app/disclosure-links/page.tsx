import Link from "next/link";
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

        <div className="mt-8 rounded-xl border border-[#E3DED4] bg-slate-50 p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">약관 안내문이 필요하신가요?</p>
          <p className="mt-1 text-xs text-slate-500 break-keep">고객에게 약관 확인을 안내하거나 판단 유보를 안내하는 실무 문구를 확인해 보세요.</p>
          <Link
            href="/message-templates"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#0F1D2E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17202A]"
          >
            고객 안내문 확인하기
          </Link>
        </div>
      </ContentSection>
    </AppShell>
  );
}
