"use client";

import { useState } from "react";
import {
  getInsurerDisplayCategory,
  type InsurerDisplayCategory,
} from "@/lib/directory/insurer-display-category";
import { insurerLogoLabel, insurerLogoSrc } from "@/lib/directory/insurer-logo";
import type { PublicInsurer } from "@/lib/public/insurers";

const MONOGRAM_TONE: Record<InsurerDisplayCategory, string> = {
  life: "border-emerald-200 bg-emerald-50 text-emerald-800",
  non_life: "border-sky-200 bg-sky-50 text-sky-800",
  mutual: "border-amber-200 bg-amber-50 text-amber-900",
  digital: "border-violet-200 bg-violet-50 text-violet-800",
};

const SIZE_CLASS = {
  card: "h-12 w-24 sm:h-16 sm:w-32 lg:w-36",
  compact: "h-10 w-10 sm:h-11 sm:w-11",
} as const;

export function InsurerLogo({
  insurer,
  size = "card",
}: {
  insurer: PublicInsurer;
  size?: keyof typeof SIZE_CLASS;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoSrc = insurerLogoSrc(insurer);
  const displayCategory = getInsurerDisplayCategory(insurer);
  const monogramTone = MONOGRAM_TONE[displayCategory];
  const isCompact = size === "compact";

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 shadow-sm ${SIZE_CLASS[size]} ${
        isCompact ? "p-1" : "p-2"
      }`}
    >
      {logoSrc && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`${insurer.name} 로고`}
          className={
            isCompact
              ? "h-full max-h-8 w-full object-contain"
              : "h-full max-h-11 w-full object-contain"
          }
          loading="lazy"
          onError={() => setImageFailed(true)}
          referrerPolicy="no-referrer"
          src={logoSrc}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`inline-flex h-full w-full items-center justify-center rounded-lg border text-xs font-bold tracking-tight sm:text-sm ${monogramTone}`}
          title={insurer.name}
        >
          {insurerLogoLabel(insurer.name)}
        </span>
      )}
    </span>
  );
}
