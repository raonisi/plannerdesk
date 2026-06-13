"use client";



import { useState } from "react";

import { InsurerCardDeskActions } from "@/components/directory/insurer-card-desk-actions";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";

import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";

import { getInsurerWorkbenchCategoryLabel } from "@/lib/directory/directory-workbench-copy";

import {

  insurerWorkbenchActionButton,

  insurerWorkbenchDetailPanel,

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
  const [detailOpen, setDetailOpen] = useState(false);
  const categoryLabel = getInsurerWorkbenchCategoryLabel(insurer);

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
        </div>



        <div className="min-w-0">
          <InsurerCardDeskActions
            claimItems={claimItems}
            insurer={insurer}
            onOpenDetail={() => {
              setDetailOpen(true);
            }}
            showDetailButton={false}
          />
        </div>



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

