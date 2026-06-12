import Link from "next/link";
import { DataFreshnessMeta } from "@/components/content/data-freshness-meta";
import { WORK_LINK_INFO_TYPE_LABELS } from "@/lib/work-links/review-copy";
import type {
  PlannerVerifiedWorkLinkView,
  PublicVerifiedWorkLinkView,
} from "@/lib/work-links/review-types";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function riskBadge(level: "medium" | "high") {
  if (level === "high") {
    return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  }
  return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
}

type VerifiedWorkLinkCardProps = {
  link: PublicVerifiedWorkLinkView | PlannerVerifiedWorkLinkView;
  mode: "public" | "planner";
};

export function VerifiedWorkLinkCard({ link, mode }: VerifiedWorkLinkCardProps) {
  const href = link.targetUrl?.trim() || link.officialSourceUrl;
  const plannerNotice =
    mode === "planner" && "plannerNotice" in link ? link.plannerNotice : null;

  return (
    <article
      className={`${surfaces.card} ${borders.default} ${shadows.card} min-w-0 rounded-lg p-4`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`}>
          {WORK_LINK_INFO_TYPE_LABELS[link.infoType]}
        </span>
        <span className={riskBadge(link.riskLevel)}>{link.riskLevel}</span>
      </div>

      <h3 className="mt-2 text-base font-semibold text-[#102235]">{link.title}</h3>
      <p className={`mt-1 ${textStyles.small}`}>{link.insurerName}</p>

      <p className={`mt-3 break-keep ${textStyles.small}`}>{link.displayNotice}</p>
      {plannerNotice ? (
        <p className={`mt-2 break-keep ${textStyles.small}`}>{plannerNotice}</p>
      ) : null}

      <div className="mt-3">
        <DataFreshnessMeta
          lastVerifiedAt={link.lastVerifiedAt}
          officialSourceUrl={link.officialSourceUrl}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-md bg-[#102235] px-4 text-sm font-semibold text-white hover:bg-[#1b344e]"
        >
          공식 안내 열기
        </Link>
        <Link
          href={link.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-md border border-[#d9c9a8] px-4 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
        >
          출처 확인
        </Link>
      </div>
    </article>
  );
}
