"use client";

import { useState } from "react";
import Link from "next/link";
import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import { COMMON_INSURER_KEY } from "@/lib/claim-documents/library-items";
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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const panelId = `claim-group-panel-${group.key}`;
  const buttonId = `claim-group-button-${group.key}`;
  const officialGuideHref =
    group.directoryInsurerId
      ? `/directory?insurer=${encodeURIComponent(group.directoryInsurerId)}`
      : group.key === COMMON_INSURER_KEY
        ? "/directory"
        : `/directory?search=${encodeURIComponent(group.label)}`;

  async function handleCopyNotice(e: React.MouseEvent) {
    e.stopPropagation();
    const docList = group.items
      .map((item, idx) => `${idx + 1}. ${item.kind === "pdf" ? item.title : item.document.title}`)
      .join("\n");
    const noticeText = `안녕하세요 고객님. [${group.label}] 보험금 청구에 필요한 서류 목록을 안내드립니다.\n\n${docList}\n\n서류 기준은 보험사 심사와 공식 안내에 따라 달라질 수 있습니다. 준비 전 해당 보험사 공식 안내를 함께 확인해 주세요. 보험금 지급 여부나 금액은 보험사 심사 후 결정됩니다.`;
    
    await copyTextToClipboard(noticeText);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <section className="rounded-xl border border-[#E3DED4] bg-white shadow-sm">
      <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <button
            aria-controls={panelId}
            aria-expanded={isExpanded}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
            id={buttonId}
            onClick={onToggle}
            type="button"
          >
            <span className="min-w-0 flex-1">
              <span className="block break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
                {group.label}
              </span>
              <span className="mt-1 block text-sm font-semibold text-[#5B6470]">
                공개·검수된 서류 {group.items.length}건 · 공식 안내 확인 필요
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`inline-block shrink-0 text-[#B9975B] transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        </div>

        <div className="grid gap-2 sm:flex sm:justify-end">
          <button
            aria-label={`${group.label} 고객 안내문 복사`}
            onClick={handleCopyNotice}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#16382C] bg-[#16382C] px-4 text-sm font-bold text-white transition hover:bg-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
            title="고객에게 보낼 서류 목록 텍스트를 복사합니다"
            type="button"
          >
            {copyState === "copied"
              ? "복사되었습니다"
              : copyState === "failed"
                ? "복사 실패"
                : "안내문 복사"}
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-4 text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
            href={officialGuideHref}
          >
            청구안내 보기
          </Link>
        </div>
      </div>

      <div
        aria-labelledby={buttonId}
        hidden={!isExpanded}
        id={panelId}
        role="region"
      >
        <ul className="border-t border-[#E3DED4] px-4 sm:px-5">
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

async function copyTextToClipboard(text: string): Promise<void> {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    return;
  } catch {
    // Fall through to Clipboard API for browsers where execCommand is blocked.
  } finally {
    document.body.removeChild(textarea);
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    return;
  }
}
