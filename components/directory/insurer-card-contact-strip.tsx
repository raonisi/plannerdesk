"use client";

import {
  insurerCardContactTile,
  insurerCardSectionTitle,
} from "@/lib/directory/insurer-card-ui";
import { claimFaxDisplay, DIRECTORY_TEXT } from "@/lib/directory/formatting";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerCardContactStrip({
  insurer,
  onOpenMailAddress,
}: {
  insurer: PublicInsurer;
  onOpenMailAddress: () => void;
}) {
  const claimFax = claimFaxDisplay(insurer);
  const mailAddress = insurer.registeredMailAddress || insurer.mailingAddress;
  const hasFax =
    claimFax.primary !== DIRECTORY_TEXT.missing &&
    claimFax.primary !== DIRECTORY_TEXT.unavailable;

  return (
    <section aria-label={`${insurer.name} 팩스·주소`} className="space-y-2">
      <h3 className={insurerCardSectionTitle}>팩스 · 주소</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={insurerCardContactTile}>
          <span className="text-xs font-medium text-slate-500">청구 팩스</span>
          <span
            className={`mt-1 break-words text-sm font-semibold leading-snug ${
              hasFax ? "text-slate-900" : "text-slate-500"
            }`}
          >
            {claimFax.primary}
          </span>
          {claimFax.secondary ? (
            <span className="mt-1 break-words text-xs font-medium leading-snug text-slate-500">
              {claimFax.secondary}
            </span>
          ) : null}
        </div>
        <button
          aria-label={`${insurer.name} 등기우편 주소 확인`}
          className={`${insurerCardContactTile} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={!mailAddress}
          onClick={onOpenMailAddress}
          type="button"
        >
          <span className="text-xs font-medium text-slate-500">등기우편 주소</span>
          <span
            className={`mt-1 break-words text-sm font-semibold leading-snug ${
              mailAddress
                ? "text-slate-900 underline decoration-slate-300 underline-offset-2"
                : "text-slate-500 no-underline"
            }`}
          >
            {mailAddress ? "주소 확인" : DIRECTORY_TEXT.missing}
          </span>
        </button>
      </div>
    </section>
  );
}
