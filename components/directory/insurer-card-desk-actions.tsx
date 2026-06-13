"use client";

import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { claimFaxDisplay, DIRECTORY_TEXT, telHref } from "@/lib/directory/formatting";
import {
  insurerWorkbenchActionButton,
  insurerWorkbenchActionButtonAccent,
  insurerWorkbenchActionButtonPrimary,
  insurerWorkbenchActionScrollRow,
} from "@/lib/directory/insurer-workbench-ui";
import { resolveSystemLinks } from "@/lib/directory/work-links";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerCardDeskActions({
  insurer,
  claimItems,
  onOpenClaimDocuments,
  onOpenDetail,
}: {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
  onOpenClaimDocuments: () => void;
  onOpenDetail: () => void;
}) {
  const systemLinks = resolveSystemLinks(insurer);
  const pdfCount = claimItems.filter((item) => item.kind === "pdf").length;
  const customerTel = telHref(insurer.customerCenterPhone);
  const claimFax = claimFaxDisplay(insurer);
  const hasFax =
    claimFax.primary !== DIRECTORY_TEXT.missing &&
    claimFax.primary !== DIRECTORY_TEXT.unavailable &&
    Boolean(claimFax.primary?.trim());

  return (
    <div
      aria-label={`${insurer.name} 업무 바로가기`}
      className={insurerWorkbenchActionScrollRow}
      role="group"
    >
      {systemLinks.primary ? (
        <ExternalTabAnchor
          aria-label={`${insurer.name} 전산 바로가기`}
          className={insurerWorkbenchActionButtonPrimary}
          href={systemLinks.primary}
        >
          전산
        </ExternalTabAnchor>
      ) : null}

      {insurer.claimPageUrl ? (
        <ExternalTabAnchor
          aria-label={`${insurer.name} 청구안내`}
          className={insurerWorkbenchActionButtonAccent}
          href={insurer.claimPageUrl}
        >
          청구
        </ExternalTabAnchor>
      ) : (
        <button
          aria-label={`${insurer.name} 청구안내`}
          className={insurerWorkbenchActionButtonAccent}
          onClick={onOpenClaimDocuments}
          type="button"
        >
          청구
        </button>
      )}

      {pdfCount > 0 ? (
        <button
          aria-label={`${insurer.name} PDF ${pdfCount}건`}
          className={insurerWorkbenchActionButton}
          onClick={onOpenClaimDocuments}
          type="button"
        >
          PDF {pdfCount}
        </button>
      ) : null}

      {customerTel ? (
        <a
          aria-label={`${insurer.name} 고객센터`}
          className={insurerWorkbenchActionButton}
          href={customerTel}
        >
          고객센터
        </a>
      ) : null}

      {hasFax ? (
        <button
          aria-label={`${insurer.name} 팩스 ${claimFax.primary}`}
          className={insurerWorkbenchActionButton}
          onClick={onOpenDetail}
          title={claimFax.primary}
          type="button"
        >
          팩스
        </button>
      ) : null}

      <button
        aria-label={`${insurer.name} 상세 보기`}
        className={insurerWorkbenchActionButton}
        onClick={onOpenDetail}
        type="button"
      >
        상세
      </button>

      <Link
        className={`${insurerWorkbenchActionButton} no-underline`}
        href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
      >
        서류
      </Link>
    </div>
  );
}
