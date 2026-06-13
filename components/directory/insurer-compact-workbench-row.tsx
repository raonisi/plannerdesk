"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import { InsurerCardClaimDocumentsSection } from "@/components/directory/insurer-card-claim-documents-section";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import {
  getCompactInsurerStatusLabel,
  getInsurerWorkbenchCategoryLabel,
} from "@/lib/directory/directory-workbench-copy";
import { claimFaxDisplay, telHref } from "@/lib/directory/formatting";
import {
  insurerWorkbenchActionButton,
  insurerWorkbenchActionButtonAccent,
  insurerWorkbenchActionButtonDisabled,
  insurerWorkbenchActionButtonPrimary,
  insurerWorkbenchDetailPanel,
  insurerWorkbenchPdfPanel,
  insurerWorkbenchRowShell,
} from "@/lib/directory/insurer-workbench-ui";
import { insurerCardCategoryBadge } from "@/lib/directory/insurer-card-ui";
import type { PublicInsurer } from "@/lib/public/insurers";

export type InsurerCompactWorkbenchRowProps = {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onRequestCorrection?: (id: string) => void;
  layout?: "list" | "grid";
};

function WorkbenchFavoriteButton({
  active,
  onToggle,
  insurerName,
}: {
  active: boolean;
  onToggle: () => void;
  insurerName: string;
}) {
  return (
    <button
      aria-label={`${insurerName} 즐겨찾기 ${active ? "해제" : "추가"}`}
      aria-pressed={active}
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-base transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true">{active ? "★" : "☆"}</span>
    </button>
  );
}

export function InsurerCompactWorkbenchRow({
  insurer,
  claimItems,
  isFavorite = false,
  onToggleFavorite,
  onRequestCorrection,
  layout = "list",
}: InsurerCompactWorkbenchRowProps) {
  const [pdfPanelOpen, setPdfPanelOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const pdfCount = claimItems.filter((item) => item.kind === "pdf").length;
  const claimFax = claimFaxDisplay(insurer);
  const statusLabel = getCompactInsurerStatusLabel(insurer);
  const categoryLabel = getInsurerWorkbenchCategoryLabel(insurer);
  const customerTel = telHref(insurer.customerCenterPhone);

  const actionButtons = (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {insurer.systemUrl ? (
        <ExternalTabAnchor
          aria-label={`${insurer.name} 전산 바로가기`}
          className={insurerWorkbenchActionButtonPrimary}
          href={insurer.systemUrl}
        >
          전산
        </ExternalTabAnchor>
      ) : (
        <span className={insurerWorkbenchActionButtonDisabled}>전산</span>
      )}

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
          onClick={() => setPdfPanelOpen(true)}
          type="button"
        >
          청구
        </button>
      )}

      <button
        aria-expanded={pdfPanelOpen}
        aria-label={`${insurer.name} PDF ${pdfCount}건`}
        className={insurerWorkbenchActionButton}
        onClick={() => {
          setPdfPanelOpen((open) => !open);
          if (detailOpen) setDetailOpen(false);
        }}
        type="button"
      >
        PDF {pdfCount}
      </button>

      {customerTel ? (
        <a
          aria-label={`${insurer.name} 고객센터`}
          className={insurerWorkbenchActionButton}
          href={customerTel}
        >
          고객센터
        </a>
      ) : (
        <span className={insurerWorkbenchActionButtonDisabled}>고객센터</span>
      )}

      <button
        aria-label={`${insurer.name} 팩스 ${claimFax.primary}`}
        className={insurerWorkbenchActionButton}
        onClick={() => {
          setDetailOpen(true);
          setPdfPanelOpen(false);
        }}
        title={claimFax.primary}
        type="button"
      >
        팩스
      </button>
    </div>
  );

  return (
    <article className={insurerWorkbenchRowShell}>
      <div
        className={
          layout === "list"
            ? "grid min-w-0 grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_auto]"
            : "flex min-w-0 flex-col gap-3"
        }
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-base font-bold text-slate-950">
              {insurer.name}
            </h2>
            <span className={insurerCardCategoryBadge}>{categoryLabel}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">{statusLabel}</p>
        </div>

        <div className="min-w-0">{actionButtons}</div>

        <div className="flex shrink-0 items-center gap-2 self-start lg:self-center">
          {onToggleFavorite ? (
            <WorkbenchFavoriteButton
              active={isFavorite}
              insurerName={insurer.name}
              onToggle={() => onToggleFavorite(insurer.id)}
            />
          ) : null}
          <button
            aria-expanded={detailOpen}
            aria-label={`${insurer.name} 상세 보기`}
            className={insurerWorkbenchActionButton}
            onClick={() => {
              setDetailOpen((open) => !open);
              if (!detailOpen) setPdfPanelOpen(false);
            }}
            type="button"
          >
            상세
          </button>
          {onRequestCorrection ? (
            <button
              aria-label={`${insurer.name} 정보 수정 요청`}
              className="hidden min-h-9 rounded-lg px-2 text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-800 sm:inline-flex sm:items-center"
              onClick={() => onRequestCorrection(insurer.id)}
              type="button"
            >
              수정
            </button>
          ) : null}
        </div>
      </div>

      {pdfPanelOpen ? (
        <div className={insurerWorkbenchPdfPanel}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-900">
              {insurer.name} 청구서류 · PDF
            </p>
            <Link
              className="text-xs font-semibold text-emerald-800 underline underline-offset-2"
              href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
            >
              전체 청구서류 보기
            </Link>
          </div>
          <InsurerCardClaimDocumentsSection
            claimItems={claimItems}
            expanded
            hideSectionTitle
            hideToggle
            insurer={insurer}
            showFooterNotice={false}
          />
        </div>
      ) : null}

      {detailOpen ? (
        <div className={insurerWorkbenchDetailPanel}>
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
