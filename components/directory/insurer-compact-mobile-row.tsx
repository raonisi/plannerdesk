"use client";

import { useId } from "react";
import { FreshnessBadge } from "@/components/content/freshness-badge";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import { InsurerLogo } from "@/components/directory/insurer-logo";
import { InsurerSystemPortalPrimaryCta } from "@/components/directory/insurer-system-portal-primary-cta";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { getInsurerWorkbenchCategoryLabel } from "@/lib/directory/directory-workbench-copy";
import {
  insurerCompactMobileDetailPanel,
  insurerCompactMobileExpandButton,
  insurerCompactMobileRowShell,
} from "@/lib/directory/insurer-compact-mobile-ui";
import { insurerCardCategoryBadge } from "@/lib/directory/insurer-card-ui";
import { MOBILE_PANEL_CLOSE_BUTTON } from "@/lib/mobile/field-usability";
import type { PublicInsurer } from "@/lib/public/insurers";

export type InsurerCompactMobileRowProps = {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onRequestCorrection?: (id: string) => void;
  logoLoading?: "lazy" | "eager";
  logoFetchPriority?: "high" | "low" | "auto";
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

function MobileFavoriteButton({
  active,
  insurerName,
  onToggle,
}: {
  active: boolean;
  insurerName: string;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={`${insurerName} 즐겨찾기 ${active ? "해제" : "추가"}`}
      aria-pressed={active}
      className={`${MOBILE_PANEL_CLOSE_BUTTON} text-sm font-semibold`}
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true">{active ? "★" : "☆"}</span>
      <span>{active ? "즐겨찾기 해제" : "즐겨찾기"}</span>
    </button>
  );
}

export function InsurerCompactMobileRow({
  insurer,
  claimItems,
  isFavorite = false,
  onToggleFavorite,
  onRequestCorrection,
  logoLoading,
  logoFetchPriority,
  expanded,
  onExpandedChange,
}: InsurerCompactMobileRowProps) {
  const detailPanelId = useId();
  const categoryLabel = getInsurerWorkbenchCategoryLabel(insurer);

  return (
    <article className={insurerCompactMobileRowShell}>
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <InsurerLogo
            fetchPriority={logoFetchPriority}
            insurer={insurer}
            loading={logoLoading}
            size="compact"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="min-w-0 break-words text-base font-bold leading-snug text-[#0F1D2E]">
                {insurer.name}
              </h2>
              <span className={insurerCardCategoryBadge}>{categoryLabel}</span>
            </div>
            <div className="mt-1">
              <FreshnessBadge
                hasOfficialSource={Boolean(
                  insurer.officialWebsiteUrl?.trim() || insurer.systemUrl?.trim(),
                )}
                lastVerifiedAt={insurer.lastVerifiedAt}
                verificationStatus={insurer.verificationStatus}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <InsurerSystemPortalPrimaryCta insurer={insurer} />
          </div>
          <button
            aria-controls={detailPanelId}
            aria-expanded={expanded}
            aria-label={
              expanded
                ? `${insurer.name} 상세 업무 정보 접기`
                : `${insurer.name} 상세 업무 정보 자세히 보기`
            }
            className={insurerCompactMobileExpandButton(expanded)}
            onClick={() => onExpandedChange(!expanded)}
            type="button"
          >
            {expanded ? "접기" : "자세히 보기"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div
          className={insurerCompactMobileDetailPanel}
          id={detailPanelId}
          role="region"
          aria-label={`${insurer.name} 상세 업무 정보`}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {onToggleFavorite ? (
              <MobileFavoriteButton
                active={isFavorite}
                insurerName={insurer.name}
                onToggle={() => onToggleFavorite(insurer.id)}
              />
            ) : null}
            {onRequestCorrection ? (
              <button
                aria-label={`${insurer.name} 정보 수정 요청`}
                className={insurerCompactMobileExpandButton(false)}
                onClick={() => onRequestCorrection(insurer.id)}
                type="button"
              >
                정보 수정
              </button>
            ) : null}
          </div>

          <InsurerActionCard
            claimItems={claimItems}
            insurer={insurer}
            isFavorite={isFavorite}
            onRequestCorrection={onRequestCorrection}
            onToggleFavorite={onToggleFavorite}
            workbenchDetailOnly
          />
        </div>
      ) : null}
    </article>
  );
}
