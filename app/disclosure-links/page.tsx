import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ContentSection, EmptyState, PageHero } from "@/components/content-page";
import { getPublicDisclosureLinks } from "@/lib/public/disclosure-links";
import { getPublicInsurers } from "@/lib/public/insurers";
import { DataResponsibilityInlineNotice } from "@/components/content/data-responsibility-inline-notice";
import { PUBLIC_EMPTY_CONTENT_UPDATING } from "@/lib/public/public-surface-terminology";
import { DisclosureLinksClient } from "./disclosure-links-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "공시·약관 링크 | PlannerDesk",
  description:
    "보험사, 협회, 감독기관의 공식 공시·약관 링크를 확인할 수 있는 실무 참고 페이지입니다.",
};

const t = {
  eyebrow: "공시·약관",
  title: "공시·약관",
  description:
    "보험사 공식 상품공시실, 약관, 협회 자료를 빠르게 확인하세요.",
};

export default async function DisclosureLinksPage() {
  const [linkResult, insurerResult] = await Promise.all([
    getPublicDisclosureLinks(),
    getPublicInsurers(),
  ]);

  const entries = linkResult.status === "ok" ? linkResult.data : [];
  const insurers = insurerResult.status === "ok" ? insurerResult.insurers : [];
  const dbError = linkResult.status === "error";

  return (
    <AppShell>
      <PageHero description={t.description} eyebrow={t.eyebrow} title={t.title} />
      <ContentSection>
        <div className="mb-6">
          <DataResponsibilityInlineNotice variant="disclosure" />
        </div>
        {dbError ? (
          <EmptyState
            description="잠시 후 다시 확인해 주세요."
            title="공시·약관 링크를 불러오지 못했습니다."
          />
        ) : entries.length === 0 ? (
          <EmptyState
            description={PUBLIC_EMPTY_CONTENT_UPDATING}
            title="공개된 공시·약관 링크가 아직 없습니다."
          />
        ) : (
          <DisclosureLinksClient entries={entries} insurers={insurers} />
        )}

        <div className="mt-8 rounded-xl border border-[#E3DED4] bg-[#F8F7F3] p-5 text-center">
          <p className="text-sm font-semibold text-[#0F1D2E]">
            약관 안내문이 필요하신가요?
          </p>
          <p className="mt-1 break-keep text-xs text-[#4A5565]">
            고객에게 약관 확인을 안내하거나 판단 유보를 안내하는 실무 문구를 확인해
            보세요.
          </p>
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
