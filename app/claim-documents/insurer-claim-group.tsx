"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const panelId = `claim-group-panel-${group.key}`;
  const buttonId = `claim-group-button-${group.key}`;

  async function handleCopyNotice(e: React.MouseEvent) {
    e.stopPropagation();
    const docList = group.items.map((item, idx) => `${idx + 1}. ${item.kind === 'pdf' ? item.title : item.document.title}`).join('\n');
    const noticeText = `안녕하세요 고객님! [${group.label}] 보험금 청구에 필요한 필수 서류 안내해 드립니다.\n\n${docList}\n\n위 서류들을 준비해서 사진으로 찍어 보내주시면, 제가 꼼꼼하게 확인 후 신속히 청구 도와드리겠습니다! 궁금한 점 있으시면 언제든 연락 주세요.`;
    
    await navigator.clipboard.writeText(noticeText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="border border-[#d9c9a8] bg-white">
      <div className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition hover:bg-[#fbf7ee] sm:px-5">
        <button
          aria-controls={panelId}
          aria-expanded={isExpanded}
          className="min-h-9 flex-1 break-keep text-left text-sm font-semibold leading-snug text-[#102235] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] sm:text-base"
          id={buttonId}
          onClick={onToggle}
          type="button"
        >
          {group.label}
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleCopyNotice}
            className="inline-flex items-center justify-center rounded border border-[#173f36] px-2 py-1 text-[11px] font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
            title="고객에게 보낼 서류 목록 텍스트를 복사합니다"
            type="button"
          >
            {copied ? "✓ 복사완료" : "📋 안내문 복사"}
          </button>
          <span className="flex shrink-0 items-center gap-2 text-xs text-[#5f6670]">
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
        </div>
      </div>



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
