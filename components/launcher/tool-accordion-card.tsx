"use client";

import { type ReactNode, useState } from "react";
import {
  getToolTypeLabel,
  type ToolKind,
} from "@/lib/tool-display";
import { shadows } from "@/lib/design-system";
import {
  mobileCardBadgeRow,
  mobileCardDescription,
  mobileCardPadding,
  mobileCardShell,
  mobileCardTitleSm,
} from "@/lib/mobile/card-density";
import { FavoriteButton } from "./favorite-button";

export function ToolAccordionCard({
  title,
  description,
  kind,
  categoryLabel,
  icon,
  items,
  isFavorite,
  onToggleFavorite,
  onSelectFolder,
}: {
  title: string;
  description: string;
  kind: ToolKind;
  categoryLabel?: string;
  icon: ReactNode;
  items: { label: string; href: string }[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectFolder: (href: string) => void;
}) {
  const typeLabel = getToolTypeLabel(kind);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article
      className={`relative flex min-h-0 flex-col justify-between rounded-xl border border-[#E3DED4] bg-white sm:min-h-[200px] ${mobileCardPadding} ${mobileCardShell} ${shadows.card} transition hover:-translate-y-0.5 hover:border-[#B9975B] hover:shadow-[0_10px_30px_rgba(15,29,46,0.08)]`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3DED4] bg-[#F7F4EE]">
            {icon}
          </div>
          <FavoriteButton
            active={isFavorite}
            label={title}
            onToggle={onToggleFavorite}
          />
        </div>
        <h3 className={`mt-4 ${mobileCardTitleSm}`}>
          {title}
        </h3>
        <p className={`mt-1.5 ${mobileCardDescription}`}>
          {description}
        </p>
        <div className={`mt-3 mb-4 ${mobileCardBadgeRow}`}>
          <span className="rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-2 py-0.5 text-[10px] font-bold text-[#16382C]">
            {typeLabel}
          </span>
          {categoryLabel ? (
            <span className="rounded-md border border-[#E3DED4] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4A5565]">
              {categoryLabel}
            </span>
          ) : null}
        </div>
      </div>
      
      <div className="mt-2 bg-[#F7F4EE] border border-[#E3DED4] rounded-lg overflow-hidden relative z-10">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          type="button"
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold text-[#0F1D2E] hover:bg-[#E3DED4]/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
        >
          <span>월별 자료 보기</span>
          <svg className={`w-4 h-4 text-[#4A5565] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="border-t border-[#E3DED4] divide-y divide-[#E3DED4]/50 bg-white">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectFolder(item.href)}
                className="w-full text-left px-4 py-2.5 text-xs text-[#16382C] font-semibold hover:bg-[#F7F4EE] flex items-center justify-between group transition focus-visible:outline-none focus-visible:bg-[#F7F4EE]"
              >
                {item.label}
                <svg className="w-3.5 h-3.5 text-[#B9975B] opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
