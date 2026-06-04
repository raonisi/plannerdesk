"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ExternalTabAnchor } from "@/components/content-page";
import { InsurerClaimGuidePanel } from "@/components/directory/insurer-claim-guide-panel";
import { InsurerQuickClaimActions } from "@/components/directory/insurer-quick-claim-actions";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { getDisclosureLinksForInsurer } from "@/lib/content/disclosure-match";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CATEGORY_LABELS,
  DIRECTORY_TEXT,
  cardPaymentLegLabel,
  cardPaymentStatusLabel,
  claimFaxDisplay,
  lastVerifiedLabel,
  publicContentTrustHint,
  telHref,
} from "@/lib/directory/formatting";
import { buttons } from "@/lib/design-system";








const INSURER_LOGO_SOURCES: Array<{ tokens: string[]; src: string }> = [
  {
    tokens: ["samsung-fire", "samsungfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/samsung-fire.png",
  },
  {
    tokens: ["hanwha-general", "hwgeneralins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hanhwa-fire.png",
  },
  {
    tokens: ["hyundai-marine", "hi.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hyundai-fire.png",
  },
  {
    tokens: ["meritz-fire", "meritzfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/meritz-fire.png",
  },
  {
    tokens: ["db-general", "db-insurance", "idbins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/db-fire.png",
  },
  {
    tokens: ["kb-general", "kb-insurance", "kbinsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/kb-fire.png",
  },
  {
    tokens: ["heungkuk-fire", "heungkukfire.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/heungkuk-fire.png",
  },
  {
    tokens: ["nh-general", "nhfire.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/nh-fire.png",
  },
  {
    tokens: ["lotte-general", "lotte-fire", "lotteins.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/lotte-fire.png",
  },
  {
    tokens: ["aig-general", "aig.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/aig-fire.png",
  },
  {
    tokens: ["chubb-general", "lina-general", "chubb.com/kr-kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/lina-fire.png",
  },
  {
    tokens: ["yebyeol-general", "yebyeol-insurance", "yebyeol.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/yb-fire.png",
  },
  {
    tokens: ["hana-general", "hanainsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hana-fire.png",
  },
  {
    tokens: ["samsung-life", "samsunglife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/samsung-life.png",
  },
  {
    tokens: ["hanwha-life", "hanwhalife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/hanhwa-life.png",
  },
  {
    tokens: ["kyobo-life", "kyobo.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kyobo-life.png",
  },
  {
    tokens: ["metlife", "metlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/met-life.png",
  },
  {
    tokens: ["nh-life", "nhlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/nh-life.png",
  },
  {
    tokens: ["shinhan-life", "shinhanlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/shinhan-life.png",
  },
  {
    tokens: ["kb-life", "kblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kb-life.png",
  },
  {
    tokens: ["heungkuk-life", "heungkuklife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/heungkuk-life.png",
  },
  {
    tokens: ["abl-life", "abllife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/abl-life.png",
  },
  {
    tokens: ["miraeasset-life", "miraeasset.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/miraeasset-life.png",
  },
  {
    tokens: ["tongyang-life", "myangel.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/tongyang-life.png",
  },
  {
    tokens: ["kdb-life", "kdblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kdb-life.png",
  },
  {
    tokens: ["db-life", "idblife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/db-life.png",
  },
  {
    tokens: ["aia-life", "aia.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/aia-life.png",
  },
  {
    tokens: ["im-life", "dgbfnlife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/im-life.png",
  },
  {
    tokens: ["lina-life", "lina.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/lina-life.png",
  },
  {
    tokens: ["chubb-life", "chubblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/chubb-life.png",
  },
  {
    tokens: ["hana-life", "hanalife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/hana-life.png",
  },
  {
    tokens: ["bnp-life", "cardif.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/bnp-life.png",
  },
  {
    tokens: ["fubonhyundai-life", "fubonhyundai.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/fubon-life.png",
  },
  {
    tokens: ["woochegook-mutual", "wuchegook-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/wuchegook-gongje.png",
  },
  {
    tokens: ["suhyeop-mutual", "suhyup-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/suhyup-gongje.png",
  },
  {
    tokens: ["thek-mutual", "thek-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/thek-gongje.png",
  },
  {
    tokens: ["shinhyeop-mutual", "shinhyup-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/shinhyup-gongje.png",
  },
  {
    tokens: ["axa-insurance", "axa.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/axa-digital.png",
  },
  {
    tokens: ["samsung-digital", "direct.samsungfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/samsung-digital.png",
  },
  {
    tokens: ["kakaopay-digital", "kakaopayinscorp.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/kakao-digital.png",
  },
  {
    tokens: ["kyobo-digital", "lifeplanet.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/kyobo-digital%20(1).png",
  },
  {
    tokens: ["shinhanez-digital", "shinhanez.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/shinhan-digital.png",
  },
  {
    tokens: ["carrot-digital", "carrotins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/carrot-digital.png",
  },
  {
    tokens: ["hanaoneday-digital", "day.hanainsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/hana-digital.png",
  },
];

function insurerLogoLabel(name: string) {
  const compactName = name.replace(/\s+/g, "");
  const latinMatch = compactName.match(/[A-Za-z]+/);

  if (latinMatch?.[0]) {
    return latinMatch[0].slice(0, 2).toUpperCase();
  }

  return compactName.slice(0, 2);
}

function insurerLogoMatchKey(insurer: PublicInsurer) {
  const urls = [
    insurer.officialWebsiteUrl,
    insurer.systemUrl,
    insurer.plannerPortalUrl,
  ];
  const hostnames = urls.flatMap((url) => {
    if (!url) return [];

    try {
      const parsedUrl = new URL(url);
      return [parsedUrl.hostname.replace(/^www\./, ""), url];
    } catch {
      return [url];
    }
  });

  return [insurer.id, ...hostnames].join(" ").toLowerCase();
}

function insurerLogoSrc(insurer: PublicInsurer) {
  const matchKey = insurerLogoMatchKey(insurer);

  return (
    INSURER_LOGO_SOURCES.find(({ tokens }) =>
      tokens.some((token) => matchKey.includes(token)),
    )?.src ?? null
  );
}

export interface InsurerActionCardProps {
  insurer: PublicInsurer;
  claimItems?: ClaimLibraryItem[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onRequestCorrection?: (id: string) => void;
}

export function InsurerActionCard({
  insurer,
  claimItems = [],
  isFavorite = false,
  onToggleFavorite,
  onRequestCorrection,
}: InsurerActionCardProps) {
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [cardPaymentOpen, setCardPaymentOpen] = useState(false);
  const [mailAddressOpen, setMailAddressOpen] = useState(false);
  
  const accessHref = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const mailAddress = insurer.registeredMailAddress || insurer.mailingAddress;
  const claimFax = claimFaxDisplay(insurer);
  const disclosureLinks = getDisclosureLinksForInsurer(insurer.id);

  return (
    <article className="group/insurer relative overflow-hidden rounded-2xl border border-[#E3DED4] bg-white shadow-[0_4px_20px_rgba(15,29,46,0.02)] transition-all hover:shadow-[0_10px_30px_rgba(15,29,46,0.06)] hover:-translate-y-0.5">
      {insurer.isFeatured ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#B9975B] via-[#0F1D2E] to-[#B9975B]"
        />
      ) : null}

      <div className="p-6 sm:p-7">
        <CardHeader
          insurer={insurer}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />

        <div className="mt-5">
          <InsurerQuickClaimActions
            claimItemCount={claimItems.length}
            insurer={insurer}
            onOpenClaimGuide={() => setDetailedOpen(true)}
          />
        </div>

        <div className="mt-6 space-y-5">
          <section className="space-y-2">
            <CardSectionTitle>전산 업무</CardSectionTitle>
            {accessHref ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} 전산 접속`}
                className={`${buttons.base} ${buttons.primary} w-full gap-2`}
                href={accessHref}
              >
                전산 접속 ↗
              </ExternalTabAnchor>
            ) : (
              <span className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-4 text-sm font-semibold text-[#5B6470] break-keep">
                {DIRECTORY_TEXT.missing}
              </span>
            )}
            {insurer.supportedBrowsers && insurer.supportedBrowsers.length > 0 ? (
              <p className="text-center text-[11px] font-medium text-[#5B6470]">
                ({insurer.supportedBrowsers.map((b) => (b === "chrome" ? "크롬" : "엣지")).join("/")} 권장)
              </p>
            ) : null}
          </section>

          <section className="space-y-2">
            <CardSectionTitle>상담·문의</CardSectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              <PhoneActionButton
                label="고객센터 전화"
                phone={insurer.customerCenterPhone}
              />
              <PhoneActionButton
                label="헬프데스크 전화"
                phone={insurer.helpdeskPhone}
              />
            </div>
          </section>

          <button
            type="button"
            aria-expanded={detailedOpen}
            aria-label={`${insurer.name} 상세 실무 정보 ${detailedOpen ? "닫기" : "열기"}`}
            onClick={() => setDetailedOpen(!detailedOpen)}
            className={`inline-flex min-h-12 w-full items-center justify-center rounded-lg border text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
              detailedOpen
                ? "border-[#B9975B] bg-[#F7F4EE] text-[#B9975B]"
                : "border-[#E3DED4] bg-white text-[#0F1D2E] hover:bg-slate-50"
            }`}
          >
            상세 실무 정보 {detailedOpen ? "닫기 ▲" : "열기 ▼"}
          </button>
        </div>

        {/* 아코디언 상세 정보 영역 (기본 닫힘) */}
        {detailedOpen && (
          <div className="mt-6 space-y-8 border-t border-[#E3DED4] pt-6 animate-in fade-in duration-200">
            {/* 안전 안내문구 */}
            <div className="rounded-xl border border-[#c5b08a] bg-[#fff9ed] p-4 text-sm font-medium leading-relaxed text-[#7a612d]">
              <ul className="list-inside list-disc space-y-1">
                <li>보험사별 링크와 연락처는 공식 출처 기준으로 확인 후 사용하세요.</li>
                <li>PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다.</li>
                <li>고객 개인정보와 의료자료는 PlannerDesk에 입력하지 마세요.</li>
              </ul>
            </div>

            {/* 2순위: 상담·문의 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                상담·문의
              </h4>
              <div className="overflow-hidden rounded-xl border border-[#E3DED4] bg-white text-sm">
                <div className="grid grid-cols-[100px_1fr] border-b border-[#E3DED4] p-3 items-center">
                  <span className="font-semibold text-slate-500">고객센터</span>
                  <div className="text-right">
                    {insurer.customerCenterPhone ? (
                      <a
                        href={telHref(insurer.customerCenterPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.customerCenterPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] border-b border-[#E3DED4] p-3 items-center">
                  <span className="font-semibold text-slate-500">헬프데스크</span>
                  <div className="text-right">
                    {insurer.helpdeskPhone ? (
                      <a
                        href={telHref(insurer.helpdeskPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.helpdeskPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] p-3 items-center bg-[#F8F7F3]">
                  <span className="font-semibold text-slate-500">인콜/모니터링</span>
                  <div className="text-right">
                    {insurer.callMonitoringPhone ? (
                      <a
                        href={telHref(insurer.callMonitoringPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.callMonitoringPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 3순위: 청구 접수 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                청구 접수
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col justify-center rounded-xl border border-[#E3DED4] bg-white p-4">
                  <span className="text-xs font-semibold text-slate-500">청구 팩스</span>
                  <span
                    className={`mt-1 break-all text-sm font-bold ${
                      claimFax.primary !== DIRECTORY_TEXT.missing &&
                      claimFax.primary !== DIRECTORY_TEXT.unavailable
                        ? "text-[#0F1D2E]"
                        : "text-[#5B6470]"
                    }`}
                  >
                    {claimFax.primary}
                  </span>
                  {claimFax.secondary ? (
                    <span className="mt-1 text-[11px] font-medium text-[#5B6470] break-all">
                      {claimFax.secondary}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!mailAddress}
                  onClick={() => setMailAddressOpen(true)}
                  aria-label={`${insurer.name} 등기우편 주소 확인`}
                  className="flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:bg-[#F7F4EE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-xs font-semibold text-slate-500">등기우편 주소</span>
                  <span
                    className={`mt-1 text-sm font-bold break-keep ${mailAddress ? "text-[#B9975B] underline" : "text-[#5B6470] no-underline"}`}
                  >
                    {mailAddress ? "주소 확인" : DIRECTORY_TEXT.missing}
                  </span>
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {insurer.claimFormUrl ? (
                  <ExternalTabAnchor
                    aria-label={`${insurer.name} 청구양식 열기`}
                    className={`${buttons.base} ${buttons.outline} w-full text-xs`}
                    href={insurer.claimFormUrl}
                  >
                    청구양식 열기 ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-3 text-xs font-semibold text-[#5B6470] break-keep">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
                <Link
                  href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
                  className={`${buttons.base} ${buttons.outline} w-full text-xs`}
                >
                  청구서류 확인
                </Link>
              </div>

              {claimItems.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500">필요 청구서류 양식 ({claimItems.length}건)</p>
                  <InsurerClaimGuidePanel claimItems={claimItems} insurer={insurer} />
                </div>
              ) : null}

              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/message-templates"
                  className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
                >
                  고객 안내문 확인
                </Link>
              </div>
            </section>

            {/* 4순위: 약관·공시 */}
            <section className="space-y-3 border-t border-[#E3DED4] pt-6">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                약관·공시
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {insurer.termsUrl ? (
                  <ExternalTabAnchor
                    aria-label={`${insurer.name} 약관 확인`}
                    className={`${buttons.base} ${buttons.outline} w-full text-sm`}
                    href={insurer.termsUrl}
                  >
                    약관 확인 ↗
                  </ExternalTabAnchor>
                ) : null}
                {disclosureLinks.productDisclosure?.sourceUrl ? (
                  <ExternalTabAnchor
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3DED4] bg-white text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] hover:text-[#B9975B]"
                    href={disclosureLinks.productDisclosure.sourceUrl}
                  >
                    공식 상품공시실 ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-slate-50 text-sm font-semibold text-slate-400">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
                
                {disclosureLinks.policyTerms?.sourceUrl ? (
                  <ExternalTabAnchor
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3DED4] bg-white text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] hover:text-[#B9975B]"
                    href={disclosureLinks.policyTerms.sourceUrl}
                  >
                    공식 통합약관실 ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-slate-50 text-sm font-semibold text-slate-400">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/disclosure-links"
                  className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
                >
                  공시·약관 확인
                </Link>
                <Link
                  href="/work-tools"
                  className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
                >
                  업무 도구로 이동
                </Link>
              </div>
            </section>

            {/* 5순위: 카드납 정보 */}
            <section className="space-y-3 border-t border-[#E3DED4] pt-6">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                카드납 정보
              </h4>
              <button
                type="button"
                onClick={() => setCardPaymentOpen(true)}
                aria-label={`${insurer.name} 카드납 가능 여부 상세`}
                className="flex min-h-12 w-full flex-col gap-2 rounded-xl border border-[#E3DED4] bg-white px-4 py-3 text-left transition hover:border-[#B9975B] hover:bg-[#F7F4EE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-bold text-slate-500">카드납 가능 여부</span>
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#F7F4EE] px-2.5 py-1 text-xs font-bold text-[#0F1D2E]">
                    {cardPaymentStatusLabel(insurer.cardPaymentStatus)}
                  </span>
                  <span className="text-[11px] font-medium text-[#5B6470]">
                    초회 {cardPaymentLegLabel(insurer.cardPaymentInitialAvailable)} · 계속{" "}
                    {cardPaymentLegLabel(insurer.cardPaymentRecurringAvailable)}
                  </span>
                </span>
              </button>
            </section>
          </div>
        )}

        {/* 정보 수정 요청 */}
        {onRequestCorrection ? (
          <div className="flex justify-end pt-3 mt-4 border-t border-slate-100">
            <button
              aria-label={`${insurer.name} 수정 요청`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              onClick={() => onRequestCorrection(insurer.id)}
              type="button"
            >
              <span>✍ 정보 수정 요청</span>
            </button>
          </div>
        ) : null}
      </div>

      <CardPaymentDialog
        insurer={insurer}
        onClose={() => setCardPaymentOpen(false)}
        open={cardPaymentOpen}
      />
      <MailAddressDialog
        address={mailAddress}
        insurerName={insurer.name}
        onClose={() => setMailAddressOpen(false)}
        open={mailAddressOpen}
      />
    </article>
  );
}

function CardSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-[#B9975B]">
      {children}
    </h3>
  );
}

function PhoneActionButton({
  label,
  phone,
}: {
  label: string;
  phone: string | null;
}) {
  const href = telHref(phone);

  if (href) {
    return (
      <a
        aria-label={`${label} ${phone}`}
        className={`${buttons.base} ${buttons.outline} w-full break-all px-3 text-xs`}
        href={href}
      >
        {label}
      </a>
    );
  }

  return (
    <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-3 text-xs font-semibold text-[#5B6470] break-keep">
      {DIRECTORY_TEXT.missing}
    </span>
  );
}

function CardHeader({
  insurer,
  isFavorite,
  onToggleFavorite,
}: {
  insurer: PublicInsurer;
  isFavorite: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          <InsurerLogo insurer={insurer} />
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B9975B]">
                {CATEGORY_LABELS[insurer.category]}
              </p>
            </div>
            <h2 className="mt-2 break-keep text-2xl font-bold leading-tight text-slate-900 sm:text-[1.75rem]">
              {insurer.name}
            </h2>
            <p className="mt-2 text-xs font-medium text-[#5B6470]">
              {publicContentTrustHint(insurer.verificationStatus) ? (
                <>
                  {publicContentTrustHint(insurer.verificationStatus)}
                  <span className="mx-1.5 text-[#E3DED4]">·</span>
                </>
              ) : null}
              최근 확인 {lastVerifiedLabel(insurer.lastVerifiedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-2">
          {onToggleFavorite ? (
            <FavoriteButton
              id={insurer.id}
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

function InsurerLogo({ insurer }: { insurer: PublicInsurer }) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoSrc = insurerLogoSrc(insurer);

  return (
    <span className="grid h-16 w-32 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:w-36">
      {logoSrc && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${insurer.name} 로고`}
          className="h-full max-h-11 w-full object-contain"
          loading="lazy"
          onError={() => setImageFailed(true)}
          referrerPolicy="no-referrer"
          src={logoSrc}
        />
      ) : (
        <span className="text-sm font-black tracking-[0.02em] text-slate-400">
          {insurerLogoLabel(insurer.name)}
        </span>
      )}
    </span>
  );
}

function FavoriteButton({
  id,
  isFavorite,
  onToggle,
}: {
  id: string;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}) {
  const label = isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가";
  const toneClass = isFavorite
    ? "border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:border-amber-300"
    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600";

  return (
    <button
      aria-label={label}
      aria-pressed={isFavorite}
      className={`inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${toneClass}`}
      onClick={() => onToggle(id)}
      title={label}
      type="button"
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {isFavorite ? "\u2605" : "\u2606"}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function parseCardPaymentRows(note: string | null) {
  if (!note) return [];

  return note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^\[([^\]]+)\]\s*(.*)$/.exec(line);
      return match
        ? { label: match[1], value: match[2] || DIRECTORY_TEXT.missing }
        : { label: "메모", value: line };
    });
}

function DialogFrame({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Tab") {
        const focusableElements = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => !element.hasAttribute("disabled"));

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        ref={dialogRef}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4.5">
          <h3
            className="break-keep text-base sm:text-lg font-bold text-slate-900"
            id={titleId}
          >
            {title}
          </h3>
          <button
            aria-label="닫기"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function CardPaymentDialog({
  insurer,
  onClose,
  open,
}: {
  insurer: PublicInsurer;
  onClose: () => void;
  open: boolean;
}) {
  const rows = parseCardPaymentRows(insurer.cardPaymentNote);

  return (
    <DialogFrame
      onClose={onClose}
      open={open}
      title={`${insurer.name} 카드납 정보`}
    >
      <p className="break-keep text-sm leading-relaxed text-slate-500">
        참고용으로만 사용하고, 고객 안내 전 보험사 공식 기준을 다시 확인해 주세요.
      </p>
      {rows.length > 0 ? (
        <dl className="mt-5 space-y-3.5 text-sm">
          {rows.map((row) => (
            <div
              className="grid gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-[8rem_1fr] hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
              key={`${row.label}-${row.value}`}
            >
              <dt className="font-bold text-slate-700 sm:pt-0.5">{row.label}</dt>
              <dd className="whitespace-pre-wrap break-keep leading-relaxed text-slate-600">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 break-keep text-sm leading-relaxed text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </DialogFrame>
  );
}

function MailAddressDialog({
  address,
  insurerName,
  onClose,
  open,
}: {
  address: string | null;
  insurerName: string;
  onClose: () => void;
  open: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copyAddress = useCallback(async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [address]);

  return (
    <DialogFrame
      onClose={onClose}
      open={open}
      title={`${insurerName} 등기우편 주소`}
    >
      {address ? (
        <div className="space-y-5">
          <div className="whitespace-pre-wrap break-keep rounded-xl border border-slate-200 bg-slate-50 p-5 text-[15px] font-semibold leading-relaxed text-slate-800 shadow-inner">
            {address}
          </div>
          <button
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
              copied
                ? "bg-emerald-600 shadow-emerald-600/10 hover:bg-emerald-700 hover:shadow-emerald-600/20"
                : "bg-indigo-600 shadow-indigo-600/10 hover:bg-indigo-700 hover:shadow-indigo-600/20"
            }`}
            onClick={copyAddress}
            type="button"
          >
            {copied ? "주소 복사 완료!" : "주소 복사하기"}
          </button>
        </div>
      ) : (
        <p className="break-keep text-sm leading-relaxed text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </DialogFrame>
  );
}
