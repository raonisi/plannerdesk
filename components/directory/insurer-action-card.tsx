"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import { InsurerClaimGuidePanel } from "@/components/directory/insurer-claim-guide-panel";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { getDisclosureLinksForInsurer } from "@/lib/content/disclosure-match";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CATEGORY_LABELS,
  DIRECTORY_TEXT,
  cardPaymentStatusLabel,
  claimFaxDisplay,
  telHref,
} from "@/lib/directory/formatting";

const cardClass =
  "group/insurer relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5";

const sectionEyebrowClass =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600";
const sectionHeadingClass = "text-sm font-bold text-slate-900";
const sectionContainerClass = "space-y-4";
const groupDividerClass = "border-t border-slate-200 pt-6 mt-2";

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
  const [claimGuideOpen, setClaimGuideOpen] = useState(false);
  const [cardPaymentOpen, setCardPaymentOpen] = useState(false);
  const [mailAddressOpen, setMailAddressOpen] = useState(false);
  const accessHref = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const mailAddress = insurer.registeredMailAddress || insurer.mailingAddress;
  const claimFax = claimFaxDisplay(insurer);
  const claimGuidePanelId = `claim-guide-${insurer.id}`;

  return (
    <article className={cardClass}>
      {insurer.isFeatured ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
        />
      ) : null}

      <div className="p-6 sm:p-7">
        <CardHeader
          insurer={insurer}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />

        <div className="mt-6 space-y-5">
          {/* 1) 업무 바로가기 */}
          <ActionGroup eyebrow="ACCESS" title="업무 바로가기">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <ActionLink href={accessHref} label="전산접속" tone="primary" />
                {insurer.supportedBrowsers &&
                insurer.supportedBrowsers.length > 0 ? (
                  <span className="text-[11px] font-semibold text-slate-500 pl-1">
                    권장 브라우저:{" "}
                    {insurer.supportedBrowsers
                      .map((b) => (b === "chrome" ? "Chrome" : "Edge"))
                      .join(", ")}
                  </span>
                ) : null}
              </div>
              <ActionLink
                href={insurer.officialWebsiteUrl}
                label="공식 홈페이지"
              />
            </div>
          </ActionGroup>

          {/* 2) 청구 */}
          <div className={groupDividerClass}>
            <ActionGroup eyebrow="CLAIM" title="청구">
              <div className="space-y-3">
                <ClaimGuideToggleButton
                  count={claimItems.length}
                  isOpen={claimGuideOpen}
                  onToggle={() => setClaimGuideOpen((open) => !open)}
                  panelId={claimGuidePanelId}
                />
                <div hidden={!claimGuideOpen}>
                  <InsurerClaimGuidePanel
                    claimItems={claimItems}
                    insurer={insurer}
                  />
                </div>
              </div>
            </ActionGroup>
          </div>

          {/* 3) 지원 */}
          <div className={groupDividerClass}>
            <ActionGroup eyebrow="SUPPORT" title="지원">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <PhoneRow
                  label="고객센터"
                  value={insurer.customerCenterPhone}
                />
                <PhoneRow label="전산 헬프" value={insurer.helpdeskPhone} />
                <PhoneRow
                  label="인물 모니터링"
                  value={insurer.callMonitoringPhone}
                />
                <DisplayRow
                  label="청구팩스"
                  secondary={claimFax.secondary}
                  value={claimFax.primary}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoActionRow
                  detail={cardPaymentStatusLabel(insurer.cardPaymentStatus)}
                  label="카드납"
                  onClick={() => setCardPaymentOpen(true)}
                />
                <InfoActionRow
                  detail={
                    mailAddress ? "주소 보기" : DIRECTORY_TEXT.missing
                  }
                  disabled={!mailAddress}
                  label="등기우편"
                  onClick={() => setMailAddressOpen(true)}
                />
              </div>
            </ActionGroup>
          </div>

          {/* 4) 자료 */}
          <DisclosureSection insurer={insurer} />

          {/* 정보 수정 요청 */}
          {onRequestCorrection ? (
            <div className="flex justify-end pt-1">
              <button
                aria-label={`${insurer.name} 수정 요청`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                onClick={() => onRequestCorrection(insurer.id)}
                type="button"
              >
                <span aria-hidden="true">{"\u270e"}</span>
                <span>{"정보 수정 요청"}</span>
              </button>
            </div>
          ) : null}
        </div>
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
            <p className={sectionEyebrowClass}>
              {CATEGORY_LABELS[insurer.category]}
            </p>
            <h2 className="mt-2 break-keep text-2xl font-bold leading-tight text-slate-900 sm:text-[1.75rem]">
              {insurer.name}
            </h2>
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
    ? "border-[#aa8137] bg-[#fff7e6] text-[#7a612d]"
    : "border-[#d9c9a8] bg-white text-[#5f6670] hover:border-[#aa8137] hover:text-[#7a612d]";

  return (
    <button
      aria-label={label}
      aria-pressed={isFavorite}
      className={`inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${toneClass}`}
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

function ActionGroup({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={sectionContainerClass}>
      <div className="flex items-baseline gap-3">
        <p className={sectionEyebrowClass}>{eyebrow}</p>
        <p className={sectionHeadingClass}>{title}</p>
      </div>
      {children}
    </section>
  );
}

function ClaimGuideToggleButton({
  count,
  isOpen,
  onToggle,
  panelId,
}: {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <button
      aria-controls={panelId}
      aria-expanded={isOpen}
      className="inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-slate-900 bg-slate-900 px-5 py-3 text-left text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
      onClick={onToggle}
      type="button"
    >
      <span className="break-keep">청구안내 보기</span>
      <span className="shrink-0 text-xs font-semibold text-indigo-300">
        {count}건 {isOpen ? "▲" : "▼"}
      </span>
    </button>
  );
}

interface ActionLinkProps {
  href: string | null;
  label: string;
  tone?: "primary" | "default";
}

function ActionLink({ href, label, tone = "default" }: ActionLinkProps) {
  if (!href) {
    return (
      <span className="inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-400">
        <span className="break-keep">{label}</span>
        <span className="text-xs font-normal text-slate-400">
          {DIRECTORY_TEXT.missing}
        </span>
      </span>
    );
  }

  const toneClass =
    tone === "primary"
      ? "border-slate-900 bg-slate-900 text-white shadow-md hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900";

  return (
    <ExternalTabAnchor
      className={`inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border-2 px-5 py-3 text-sm font-bold tracking-[0.01em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 sm:text-[15px] ${toneClass}`}
      href={href}
    >
      <span className="break-keep">{label}</span>
      <span aria-hidden="true" className="text-base leading-none">
        {"\u2197"}
      </span>
    </ExternalTabAnchor>
  );
}

function DisclosureSection({ insurer }: { insurer: PublicInsurer }) {
  const disclosureLinks = useMemo(
    () => getDisclosureLinksForInsurer(insurer.id),
    [insurer.id],
  );

  const hasDisclosureData =
    disclosureLinks.productDisclosure || disclosureLinks.policyTerms;

  // If disclosure-links has matched data, show both product disclosure and
  // policy terms links.  Otherwise fall back to insurer.termsUrl for backward
  // compatibility.
  if (hasDisclosureData) {
    return (
      <div className={groupDividerClass}>
        <ActionGroup eyebrow="DATA" title="자료">
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionLink
              href={disclosureLinks.productDisclosure?.sourceUrl ?? null}
              label="상품공시 보기"
            />
            <ActionLink
              href={disclosureLinks.policyTerms?.sourceUrl ?? null}
              label="약관 보기"
            />
          </div>
        </ActionGroup>
      </div>
    );
  }

  return (
    <div className={groupDividerClass}>
      <ActionGroup eyebrow="DATA" title="자료">
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionLink href={insurer.termsUrl} label="공시·약관 보기" />
        </div>
      </ActionGroup>
    </div>
  );
}

function PhoneRow({ label, value }: { label: string; value: string | null }) {
  const href = telHref(value);
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      {hasValue && href ? (
        <a
          className="mt-1 inline-flex min-h-10 items-center text-[17px] font-bold text-slate-900 underline decoration-indigo-400 underline-offset-4 hover:text-indigo-600 transition-colors"
          href={href}
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : hasValue ? (
        <p className="mt-1 break-keep text-[17px] font-bold text-slate-900">
          {value}
        </p>
      ) : (
        <p className="mt-1 break-keep text-sm font-semibold text-slate-400">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </div>
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

function DisplayRow({
  label,
  secondary,
  value,
}: {
  label: string;
  secondary?: string | null;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-keep text-[17px] font-bold text-slate-900">
        {value}
      </p>
      {secondary ? (
        <p className="mt-1.5 break-keep text-xs font-semibold leading-5 text-indigo-500">
          문의: {secondary}
        </p>
      ) : null}
    </div>
  );
}

function InfoActionRow({
  detail,
  disabled = false,
  label,
  onClick,
}: {
  detail: string;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-all hover:border-slate-400 hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:bg-slate-50/60 disabled:text-slate-400"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="break-keep text-sm font-bold text-slate-900">
        {detail}
      </span>
    </button>
  );
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

  if (!open) return null;

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102235]/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-[#d9c9a8] bg-white shadow-[0_30px_80px_rgba(16,34,53,0.22)]"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#e7ddc9] px-5 py-4">
          <h3
            className="break-keep text-base font-semibold text-[#102235]"
            id={titleId}
          >
            {title}
          </h3>
          <button
            aria-label="닫기"
            className="rounded-full px-2 py-1 text-sm font-semibold text-[#5f6670] transition hover:bg-[#f7f1e5]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            닫기
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
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
      <p className="break-keep text-sm leading-6 text-[#5f6670]">
        참고용으로만 사용하고, 고객 안내 전 보험사 공식 기준을 다시 확인해 주세요.
      </p>
      {rows.length > 0 ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {rows.map((row) => (
            <div
              className="grid gap-1 rounded-lg border border-[#e7ddc9] bg-[#fbf7ee] p-3 sm:grid-cols-[7rem_1fr]"
              key={`${row.label}-${row.value}`}
            >
              <dt className="font-semibold text-[#7a612d]">{row.label}</dt>
              <dd className="whitespace-pre-wrap break-keep leading-6 text-[#303845]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 break-keep text-sm leading-6 text-[#8b7660]">
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
        <div className="space-y-4">
          <p className="whitespace-pre-wrap break-keep rounded-lg border border-[#e7ddc9] bg-[#fbf7ee] p-4 text-sm font-semibold leading-6 text-[#303845]">
            {address}
          </p>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#173f36] bg-[#173f36] px-4 text-sm font-semibold text-[#fbf7ee] transition hover:bg-[#0f2f28]"
            onClick={copyAddress}
            type="button"
          >
            {copied ? "복사됨" : "주소 복사"}
          </button>
        </div>
      ) : (
        <p className="break-keep text-sm leading-6 text-[#8b7660]">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </DialogFrame>
  );
}
