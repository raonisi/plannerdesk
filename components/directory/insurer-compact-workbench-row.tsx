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
  insurerWorkbenchActionScrollRow,
  insurerWorkbenchDetailPanel,
  insurerWorkbenchPdfPanel,
  insurerWorkbenchRowShell,
} from "@/lib/directory/insurer-workbench-ui";
import { insurerCardCategoryBadge } from "@/lib/directory/insurer-card-ui";
import { MOBILE_PANEL_CLOSE_BUTTON } from "@/lib/mobile/field-usability";
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
      className={`${MOBILE_PANEL_CLOSE_BUTTON} text-base`}
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true">{active ? "★" : "☆"}</span>
    </button>
  );
}

function WorkbenchPanelHeader({
  title,
  onClose,
  closeLabel,
}: {
  title: string;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
      <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
        {title}
      </p>
      <button
        aria-label={closeLabel}
        className={MOBILE_PANEL_CLOSE_BUTTON}
        onClick={onClose}
        type="button"
      >
        닫기
      </button>
    </div>
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
    <div className={insurerWorkbenchActionScrollRow}>
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
          onClick={() => {
            setPdfPanelOpen(true);
            setDetailOpen(false);
          }}
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

        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-center">
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
              className={`${insurerWorkbenchActionButton} text-slate-600`}
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
          <WorkbenchPanelHeader
            closeLabel={`${insurer.name} PDF 패널 닫기`}
            onClose={() => setPdfPanelOpen(false)}
            title={`${insurer.name} 청구서류 · PDF`}
          />
          <Link
            className="mb-3 inline-flex min-h-11 items-center text-xs font-semibold text-emerald-800 underline underline-offset-2"
            href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
          >
            전체 청구서류 보기
          </Link>
          <InsurerCardClaimDocumentsSection
            claimItems={claimItems}
            expanded
            hideSectionTitle
            hideToggle
            insurer={insurer}
            showFooterNotice={false}
          />
          <div className="mt-3 flex justify-end sm:hidden">
            <button
              aria-label={`${insurer.name} PDF 패널 닫기`}
              className={insurerWorkbenchActionButton}
              onClick={() => setPdfPanelOpen(false)}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      {detailOpen ? (
        <div className={insurerWorkbenchDetailPanel}>
          <WorkbenchPanelHeader
            closeLabel={`${insurer.name} 상세 패널 닫기`}
            onClose={() => setDetailOpen(false)}
            title={`${insurer.name} 상세 실무 정보`}
          />
          <InsurerActionCard
            claimItems={claimItems}
            insurer={insurer}
            isFavorite={isFavorite}
            onRequestCorrection={onRequestCorrection}
            onToggleFavorite={onToggleFavorite}
            workbenchDetailOnly
          />
          <div className="mt-3 flex justify-end">
            <button
              aria-label={`${insurer.name} 상세 패널 닫기`}
              className={insurerWorkbenchActionButton}
              onClick={() => setDetailOpen(false)}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
