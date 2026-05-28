"use client";

import { useState, type ReactNode } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import { InsurerClaimGuidePanel } from "@/components/directory/insurer-claim-guide-panel";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CATEGORY_LABELS,
  DIRECTORY_TEXT,
  telHref,
} from "@/lib/directory/formatting";

const cardClass =
  "group/insurer relative overflow-hidden rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] shadow-[0_18px_40px_rgba(16,34,53,0.06)] transition hover:shadow-[0_30px_60px_rgba(16,34,53,0.1)]";

const sectionEyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]";
const sectionHeadingClass = "text-sm font-semibold text-[#102235]";
const sectionContainerClass = "space-y-3";
const groupDividerClass = "border-t border-[#e7ddc9] pt-5";

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
  const accessHref = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const claimGuidePanelId = `claim-guide-${insurer.id}`;

  return (
    <article className={cardClass}>
      {insurer.isFeatured ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#aa8137] via-[#d6b06b] to-[#aa8137]"
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
              <div className="flex flex-col gap-1.5">
                <ActionLink href={accessHref} label="전산접속" tone="primary" />
                {insurer.supportedBrowsers &&
                insurer.supportedBrowsers.length > 0 ? (
                  <span className="text-[11px] font-medium text-[#7a612d] pl-1">
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
              <div className="grid gap-3 sm:grid-cols-3">
                <PhoneRow
                  label="고객센터"
                  value={insurer.customerCenterPhone}
                />
                <PhoneRow label="전산 헬프" value={insurer.helpdeskPhone} />
                <PhoneRow
                  label="인물 모니터링"
                  value={insurer.callMonitoringPhone}
                />
              </div>
            </ActionGroup>
          </div>

          {/* 4) 자료 */}
          <div className={groupDividerClass}>
            <ActionGroup eyebrow="DATA" title="자료">
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionLink href={insurer.termsUrl} label="공시·약관 보기" />
              </div>
            </ActionGroup>
          </div>

          {/* 정보 수정 요청 */}
          {onRequestCorrection ? (
            <div className="flex justify-end pt-1">
              <button
                aria-label={`${insurer.name} 수정 요청`}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-[#7a612d] underline-offset-4 transition hover:bg-[#fff7e6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
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
        <div className="flex min-w-0 items-start gap-3">
          <InsurerLogo insurer={insurer} />
          <div className="min-w-0">
            <p className={sectionEyebrowClass}>
              {CATEGORY_LABELS[insurer.category]}
            </p>
            <h2 className="mt-2 break-keep text-2xl font-semibold leading-snug text-[#102235] sm:text-[1.65rem]">
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
    <span className="grid h-16 w-32 shrink-0 place-items-center rounded-xl border border-[#e7ddc9] bg-white px-4 py-2 shadow-[0_10px_22px_rgba(16,34,53,0.08)] sm:w-36">
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
        <span className="text-sm font-black tracking-[0.02em] text-[#102235]">
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
      className="inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-[#173f36] bg-[#173f36] px-4 py-3 text-left text-sm font-semibold text-[#fbf7ee] transition hover:bg-[#0f2f28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
      onClick={onToggle}
      type="button"
    >
      <span className="break-keep">청구안내 보기</span>
      <span className="shrink-0 text-xs font-semibold text-[#d8c08f]">
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
      <span className="inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border border-dashed border-[#d9c9a8] bg-white/60 px-4 py-3 text-sm font-semibold text-[#8b7660]">
        <span className="break-keep">{label}</span>
        <span className="text-xs font-normal text-[#a08e6f]">
          {DIRECTORY_TEXT.missing}
        </span>
      </span>
    );
  }

  const toneClass =
    tone === "primary"
      ? "border-[#102235] bg-[#102235] !text-[#fffaf0] shadow-[0_12px_24px_rgba(16,34,53,0.16)] hover:bg-[#173f36]"
      : "border-[#173f36] bg-white text-[#173f36] hover:bg-[#173f36] hover:text-[#fbf7ee]";

  return (
    <ExternalTabAnchor
      className={`inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border-2 px-4 py-3 text-sm font-bold tracking-[0.01em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] sm:text-[15px] ${toneClass}`}
      href={href}
    >
      <span className="break-keep">{label}</span>
      <span aria-hidden="true" className="text-base leading-none">
        {"\u2197"}
      </span>
    </ExternalTabAnchor>
  );
}

function PhoneRow({ label, value }: { label: string; value: string | null }) {
  const href = telHref(value);
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className="rounded-lg border border-[#e7ddc9] bg-white px-3 py-3">
      <p className="text-xs font-semibold text-[#7a612d]">{label}</p>
      {hasValue && href ? (
        <a
          className="mt-1 inline-flex min-h-10 items-center text-base font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
          href={href}
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : hasValue ? (
        <p className="mt-1 break-keep text-base font-semibold text-[#173f36]">
          {value}
        </p>
      ) : (
        <p className="mt-1 break-keep text-sm text-[#8b7660]">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </div>
  );
}
