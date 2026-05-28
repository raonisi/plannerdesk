"use client";

import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import type { InsurerClaimGroup } from "@/lib/claim-documents/group-by-insurer";

export function InsurerClaimGroup({
  group,
  isExpanded,
  onToggle,
}: {
  group: InsurerClaimGroup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const panelId = `claim-group-panel-${group.key}`;
  const buttonId = `claim-group-button-${group.key}`;

  return (
    <section className="border border-[#d9c9a8] bg-white">
      <button
        aria-controls={panelId}
        aria-expanded={isExpanded}
        className="flex min-h-11 w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#aa8137] sm:px-5"
        id={buttonId}
        onClick={onToggle}
        type="button"
      >
        <span className="break-keep text-lg font-semibold leading-snug text-[#102235] sm:text-xl">
          {group.label}
        </span>
        <span className="flex shrink-0 items-center gap-3 text-sm text-[#5f6670]">
          <span className="whitespace-nowrap font-semibold text-[#7a612d]">
            {group.items.length}건
          </span>
          <span
            aria-hidden="true"
            className={`inline-block text-[#173f36] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </span>
      </button>

      <div
        aria-labelledby={buttonId}
        hidden={!isExpanded}
        id={panelId}
        role="region"
      >
        <ul className="border-t border-[#d9c9a8] px-4 sm:px-5">
          {group.items.map((item) => (
            <ClaimFormListItem item={item} key={getItemKey(item)} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function getItemKey(item: InsurerClaimGroup["items"][number]): string {
  return item.kind === "pdf" ? item.id : item.document.id;
}
