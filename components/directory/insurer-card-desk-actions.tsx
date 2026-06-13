"use client";

import { useState } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import { InsurerCardClaimDocumentsSection } from "@/components/directory/insurer-card-claim-documents-section";
import { InsurerQuickClaimActions } from "@/components/directory/insurer-quick-claim-actions";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { claimFaxDisplay, DIRECTORY_TEXT, telHref } from "@/lib/directory/formatting";
import {
  insurerWorkbenchActionButton,
  insurerWorkbenchActionButtonAccent,
  insurerWorkbenchClaimPanel,
  insurerWorkbenchSecondaryActionGrid,
  insurerWorkbenchSystemPrimaryCta,
} from "@/lib/directory/insurer-workbench-ui";
import { resolveSystemLinks } from "@/lib/directory/work-links";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerCardDeskActions({
  insurer,
  claimItems,
  claimPanelOpen,
  onClaimPanelOpenChange,
  onOpenDetail,
  showDetailButton = true,
}: {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
  claimPanelOpen?: boolean;
  onClaimPanelOpenChange?: (open: boolean) => void;
  onOpenDetail: () => void;
  showDetailButton?: boolean;
}) {
  const [internalClaimOpen, setInternalClaimOpen] = useState(false);
  const isClaimControlled = claimPanelOpen !== undefined;
  const claimOpen = isClaimControlled ? claimPanelOpen : internalClaimOpen;

  const systemLinks = resolveSystemLinks(insurer);
  const pdfCount = claimItems.filter((item) => item.kind === "pdf").length;
  const customerTel = telHref(insurer.customerCenterPhone);
  const claimFax = claimFaxDisplay(insurer);
  const hasFax =
    claimFax.primary !== DIRECTORY_TEXT.missing &&
    claimFax.primary !== DIRECTORY_TEXT.unavailable &&
    Boolean(claimFax.primary?.trim());

  function setClaimOpen(next: boolean) {
    if (!isClaimControlled) {
      setInternalClaimOpen(next);
    }
    onClaimPanelOpenChange?.(next);
  }

  const claimPanelLabel =
    pdfCount > 0 ? `청구·서류 (${pdfCount})` : "청구·서류";

  return (
    <div
      aria-label={`${insurer.name} 업무 바로가기`}
      className="min-w-0 space-y-3"
      role="group"
    >
      {systemLinks.primary ? (
        <ExternalTabAnchor
          aria-label={`${insurer.name} 전산 바로가기`}
          className={insurerWorkbenchSystemPrimaryCta}
          href={systemLinks.primary}
        >
          <span>전산 바로가기</span>
          <span aria-hidden="true" className="text-xs opacity-80">
            ↗
          </span>
        </ExternalTabAnchor>
      ) : null}

      <div className={insurerWorkbenchSecondaryActionGrid}>
        <button
          aria-controls={`${insurer.id}-claim-panel`}
          aria-expanded={claimOpen}
          aria-label={`${insurer.name} ${claimPanelLabel}`}
          className={`${insurerWorkbenchActionButtonAccent} w-full`}
          onClick={() => setClaimOpen(!claimOpen)}
          type="button"
        >
          {claimPanelLabel}
        </button>

        {customerTel ? (
          <a
            aria-label={`${insurer.name} 고객센터`}
            className={`${insurerWorkbenchActionButton} w-full`}
            href={customerTel}
          >
            고객센터
          </a>
        ) : null}

        {hasFax ? (
          <button
            aria-label={`${insurer.name} 팩스 ${claimFax.primary}`}
            className={`${insurerWorkbenchActionButton} w-full`}
            onClick={onOpenDetail}
            title={claimFax.primary}
            type="button"
          >
            팩스
          </button>
        ) : null}

        {showDetailButton ? (
          <button
            aria-label={`${insurer.name} 상세 보기`}
            className={`${insurerWorkbenchActionButton} w-full text-slate-600`}
            onClick={onOpenDetail}
            type="button"
          >
            상세
          </button>
        ) : null}
      </div>

      {claimOpen ? (
        <div
          className={insurerWorkbenchClaimPanel}
          id={`${insurer.id}-claim-panel`}
          role="region"
        >
          <InsurerQuickClaimActions
            claimItemCount={claimItems.length}
            insurer={insurer}
            onOpenClaimGuide={() => setClaimOpen(true)}
          />
          <InsurerCardClaimDocumentsSection
            claimItems={claimItems}
            expanded
            hideSectionTitle
            hideToggle
            insurer={insurer}
          />
        </div>
      ) : null}
    </div>
  );
}
