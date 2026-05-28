"use client";

import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { DIRECTORY_TEXT, claimFaxDisplay, telHref } from "@/lib/directory/formatting";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerClaimGuidePanel({
  insurer,
  claimItems,
}: {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
}) {
  const claimFax = claimFaxDisplay(insurer);
  const panelId = `claim-guide-${insurer.id}`;

  return (
    <div
      className="mt-3 rounded-xl border border-[#d9c9a8] bg-[#fdfbf7]"
      id={panelId}
      role="region"
      aria-label={`${insurer.name} 청구 안내`}
    >
      <div className="border-b border-[#e3d5b8] px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-[#173f36]">청구 채널</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ChannelLink href={insurer.claimPageUrl} label="공식 청구 안내" />
          <ChannelLink href={insurer.claimFormUrl} label="공식 청구양식" />
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#303845]">청구 팩스</dt>
            <dd className="mt-0.5 break-keep text-[#4f5661]">
              {claimFax.primary}
              {claimFax.secondary ? (
                <span className="mt-0.5 block text-xs text-[#5f6670]">
                  {claimFax.secondary}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#303845]">고객센터</dt>
            <dd className="mt-0.5">
              {insurer.customerCenterPhone && telHref(insurer.customerCenterPhone) ? (
                <a
                  className="font-semibold text-[#173f36] underline-offset-2 hover:underline"
                  href={telHref(insurer.customerCenterPhone)!}
                >
                  {insurer.customerCenterPhone}
                </a>
              ) : insurer.customerCenterPhone ? (
                <span className="font-semibold text-[#173f36]">
                  {insurer.customerCenterPhone}
                </span>
              ) : (
                <span className="text-[#8b7660]">{DIRECTORY_TEXT.missing}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#173f36]">
            청구서류 · 공식 양식 ({claimItems.length}건)
          </p>
          <Link
            className="text-sm font-semibold text-[#7a612d] underline-offset-2 hover:underline"
            href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
          >
            전체 검색에서 보기
          </Link>
        </div>

        {claimItems.length > 0 ? (
          <ul className="mt-2">
            {claimItems.map((item) => (
              <ClaimFormListItem
                item={item}
                key={item.kind === "pdf" ? item.id : item.document.id}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-3 break-keep text-sm leading-6 text-[#5f6670]">
            이 보험사에 연결된 청구서류 양식이 아직 없습니다. 공식 청구 안내
            링크를 확인하거나{" "}
            <Link
              className="font-semibold text-[#173f36] underline-offset-2 hover:underline"
              href="/claim-documents"
            >
              청구서류 검색
            </Link>
            에서 다른 보험사 자료를 찾아보세요.
          </p>
        )}
      </div>
    </div>
  );
}

function ChannelLink({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (!href) {
    return (
      <span className="inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-dashed border-[#d9c9a8] bg-white/70 px-3 py-2.5 text-sm font-semibold text-[#8b7660]">
        <span>{label}</span>
        <span className="text-xs font-normal">{DIRECTORY_TEXT.missing}</span>
      </span>
    );
  }

  return (
    <ExternalTabAnchor
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#173f36] bg-white px-3 py-2.5 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
      href={href}
    >
      {label}
    </ExternalTabAnchor>
  );
}
