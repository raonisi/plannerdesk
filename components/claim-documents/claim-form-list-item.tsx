"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { DataFreshnessMeta } from "@/components/content/data-freshness-meta";
import { FreshnessBadge } from "@/components/content/freshness-badge";
import { CopyToast } from "@/components/ui/copy-toast";
import { GatedFavoriteButton } from "@/components/planner-favorites/gated-favorite-button";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { categoryLabels } from "@/lib/claim-documents/category-labels";
import {
  mobileCardActionsTight,
  mobileCardDescription,
  mobileCardShell,
  mobileCardTitle,
} from "@/lib/mobile/card-density";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { publicClaimTrustHint } from "@/lib/directory/formatting";
import {
  PUBLIC_CTA_CLAIM_GUIDE_VIEW,
  PUBLIC_CTA_COPYING_LABEL,
  PUBLIC_CTA_COPY_CLAIM_GUIDE,
  PUBLIC_CTA_OFFICIAL_GUIDE_CHECK,
  PUBLIC_CTA_PDF_DOWNLOAD,
  PUBLIC_CTA_PDF_LINK_COPY,
  PUBLIC_CTA_PDF_OPEN,
} from "@/lib/public/public-cta-labels";
import {
  insurerCardClaimDocumentActions,
  insurerCardClaimDocumentCard,
  insurerCardClaimDocumentTitle,
  insurerCardPdfDownloadButton,
  insurerCardPdfSecondaryButton,
} from "@/lib/directory/insurer-card-ui";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#0F1D2E] bg-[#0F1D2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#16382C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-[#B9975B] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35";

const disabledButtonClass =
  "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-400";

function isPdfDownloadEnabled(item: ClaimLibraryItem): boolean {
  return item.kind !== "pdf" || item.downloadEnabled !== false;
}

function renderPdfDownloadButton(
  title: string,
  item: Extract<ClaimLibraryItem, { kind: "pdf" }>,
  className: string,
  gridSpanClass = "",
) {
  if (!isPdfDownloadEnabled(item)) {
    return (
      <span
        aria-disabled="true"
        className={`${disabledButtonClass} ${gridSpanClass}`}
        title="현재 다운로드할 수 없습니다"
      >
        PDF 다운로드 비활성
      </span>
    );
  }

  return (
    <a
      aria-label={`${title} ${PUBLIC_CTA_PDF_DOWNLOAD}`}
      className={`${className} ${gridSpanClass}`}
      download={item.fileName}
      href={item.href}
    >
      {PUBLIC_CTA_PDF_DOWNLOAD}
    </a>
  );
}

function renderPdfAssetActions(
  title: string,
  insurerName: string,
  item: Extract<ClaimLibraryItem, { kind: "pdf" }>,
  primaryClass: string,
  secondaryClass: string,
  gridSpanClass = "",
) {
  const view = item.publicAssetView;

  if (view.kind === "pending") {
    return (
      <span
        className={`${secondaryClass} ${gridSpanClass} cursor-default text-[#4A5565]`}
      >
        {view.label}
      </span>
    );
  }

  if (view.kind === "official_external") {
    return (
      <ExternalTabAnchor
        aria-label={`${title} ${view.label}`}
        className={`${primaryClass} ${gridSpanClass}`}
        href={view.href}
      >
        {view.label}
      </ExternalTabAnchor>
    );
  }

  return (
    <>
      {renderPdfDownloadButton(title, item, primaryClass, gridSpanClass)}
      <ExternalTabAnchor
        aria-label={`${title} ${PUBLIC_CTA_PDF_OPEN}`}
        className={secondaryClass}
        href={item.href}
      >
        {PUBLIC_CTA_PDF_OPEN}
      </ExternalTabAnchor>
      {item.officialSourceUrl ? (
        <ExternalTabAnchor
          aria-label={`${insurerName} ${PUBLIC_CTA_OFFICIAL_GUIDE_CHECK}`}
          className={secondaryClass}
          href={item.officialSourceUrl}
        >
          {PUBLIC_CTA_OFFICIAL_GUIDE_CHECK}
        </ExternalTabAnchor>
      ) : null}
    </>
  );
}

export function ClaimFormListItem({
  item,
  variant = "default",
}: {
  item: ClaimLibraryItem;
  variant?: "default" | "accordion" | "card";
}) {
  const favoriteId = claimLibraryFavoriteId(item);
  const { isFavorite, toggle } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.claimDocuments,
  );
  const { feedback, copyWithFeedback } = useCopyFeedback();
  const [copyingGuide, setCopyingGuide] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const guideCopyButtonRef = useRef<HTMLButtonElement>(null);
  const linkCopyButtonRef = useRef<HTMLButtonElement>(null);
  const title = item.kind === "pdf" ? item.title : item.document.title;
  const insurerName =
    item.kind === "pdf" ? item.insurerName : (item.document.insurerName ?? "공통 기준");
  const categoryLabel =
    item.kind === "pdf" ? item.categoryLabel : categoryLabels[item.document.category];
  const status =
    item.kind === "pdf" ? item.verificationStatus : item.document.verificationStatus;
  const trustHint = publicClaimTrustHint(status);

  async function handleCopyRequest() {
    setCopyingGuide(true);
    try {
      await copyWithFeedback({
        text: buildClaimNoticeText(item, title, insurerName, categoryLabel),
        source: "claim-guide",
      });
    } finally {
      setCopyingGuide(false);
      guideCopyButtonRef.current?.focus();
    }
  }

  async function handleCopyPdfLink(href: string) {
    const absolute =
      typeof window !== "undefined"
        ? new URL(href, window.location.origin).toString()
        : href;
    setCopyingLink(true);
    try {
      await copyWithFeedback({
        text: absolute,
        source: "claim-guide",
        successMessage: "링크를 복사했습니다.",
      });
    } finally {
      setCopyingLink(false);
      linkCopyButtonRef.current?.focus();
    }
  }

  if (item.kind === "pdf") {
    const isCompactVariant = variant === "accordion" || variant === "card";
    const actionGridClass =
      variant === "accordion"
        ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        : "grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:justify-items-stretch xl:grid-cols-2";

    if (variant === "card") {
      return (
        <li className="w-full min-w-0">
          <article className={`${insurerCardClaimDocumentCard} space-y-3`}>
            <div className={insurerCardClaimDocumentTitle}>{title}</div>
            <div className={insurerCardClaimDocumentActions}>
              {renderPdfAssetActions(
                title,
                insurerName,
                item,
                insurerCardPdfDownloadButton,
                insurerCardPdfSecondaryButton,
              )}
            </div>
          </article>
        </li>
      );
    }

    return (
      <>
        <li className={`border-t border-slate-200 first:border-t-0 ${mobileCardShell}`}>
        <div className="grid min-h-11 gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0 flex-1">
            {variant === "default" ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {categoryLabel}
                </span>
                <span className="rounded-md border border-[#e3ded4] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold text-[#4A5565]">
                  PDF
                </span>
              </div>
            ) : null}
            <p
              className={`${mobileCardTitle} ${
                isCompactVariant ? "" : "mt-2"
              }`}
            >
              {title}
            </p>
            {isCompactVariant ? (
              <div className="mt-2">
                <FreshnessBadge
                  hasOfficialSource={Boolean(item.officialSourceUrl?.trim())}
                  lastVerifiedAt={item.lastVerifiedAt}
                  verificationStatus={status}
                />
              </div>
            ) : null}
            {variant === "default" ? (
              <>
                {item.publicAssetView.kind === "approved_local" ? (
                  <p className="mt-1 break-all text-xs text-[#4A5565]">{item.fileName}</p>
                ) : null}
                {trustHint ? (
                  <p className="mt-2 text-xs font-medium text-[#4A5565]">{trustHint}</p>
                ) : null}
                <DataFreshnessMeta
                  className="mt-2"
                  lastVerifiedAt={item.lastVerifiedAt}
                  officialSourceUrl={item.officialSourceUrl}
                  showClaimNotice
                  verificationStatus={status}
                />
                <p className="mt-2 break-keep text-xs leading-5 text-[#4A5565]">
                  {item.cautionText}
                </p>
              </>
            ) : null}
          </div>
          <div className={actionGridClass}>
            {renderPdfAssetActions(
              title,
              insurerName,
              item,
              primaryButtonClass,
              secondaryButtonClass,
              variant === "accordion" ? "sm:col-span-2 lg:col-span-3" : "",
            )}
            {variant === "default" ? (
              <>
                {item.publicAssetView.kind === "approved_local" ? (
                  <button
                    ref={linkCopyButtonRef}
                    aria-busy={copyingLink || undefined}
                    aria-label={`${title} ${PUBLIC_CTA_PDF_LINK_COPY}`}
                    className={secondaryButtonClass}
                    disabled={copyingLink}
                    onClick={() => handleCopyPdfLink(item.href)}
                    type="button"
                  >
                    {copyingLink ? PUBLIC_CTA_COPYING_LABEL : PUBLIC_CTA_PDF_LINK_COPY}
                  </button>
                ) : null}
                <button
                  ref={guideCopyButtonRef}
                  aria-busy={copyingGuide || undefined}
                  aria-label={`${title} ${PUBLIC_CTA_COPY_CLAIM_GUIDE}`}
                  className={secondaryButtonClass}
                  disabled={copyingGuide}
                  onClick={handleCopyRequest}
                  type="button"
                >
                  {copyingGuide ? PUBLIC_CTA_COPYING_LABEL : PUBLIC_CTA_COPY_CLAIM_GUIDE}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </li>
        <CopyToast message={feedback?.message ?? null} variant={feedback?.variant} />
      </>
    );
  }

  const doc = item.document;
  const primaryHref = doc.claimFormUrl ?? doc.officialSourceUrl;
  const primaryLabel = doc.claimFormUrl
    ? PUBLIC_CTA_PDF_OPEN
    : PUBLIC_CTA_CLAIM_GUIDE_VIEW;

  return (
    <>
      <li className={`border-t border-slate-200 first:border-t-0 ${mobileCardShell}`}>
        <div className="grid min-w-0 gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
              {categoryLabel}
            </span>
            <GatedFavoriteButton
              active={isFavorite(favoriteId)}
              callbackPath="/claim-documents"
              label={title}
              onToggle={() => toggle(favoriteId)}
            />
          </div>
          <p className={`mt-2 ${mobileCardTitle}`}>{title}</p>
          {doc.summary ? (
            <p className={`mt-1 ${mobileCardDescription}`}>{doc.summary}</p>
          ) : null}
          {trustHint ? (
            <p className="mt-2 text-xs font-medium text-[#4A5565]">{trustHint}</p>
          ) : null}
          <DataFreshnessMeta
            className="mt-2"
            lastVerifiedAt={doc.lastVerifiedAt}
            officialSourceUrl={doc.officialSourceUrl}
            showClaimNotice
            verificationStatus={status}
          />
        </div>
        <div className={`${mobileCardActionsTight} lg:justify-end`}>
          {primaryHref ? (
            <ExternalTabAnchor
              aria-label={`${title} ${primaryLabel}`}
              className={primaryButtonClass}
              href={primaryHref}
            >
              {primaryLabel}
            </ExternalTabAnchor>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold !text-white shadow-md transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
              href="/claim-documents"
            >
              전체 청구서류 검색
            </Link>
          )}
          <button
            ref={guideCopyButtonRef}
            aria-busy={copyingGuide || undefined}
            aria-label={`${title} ${PUBLIC_CTA_COPY_CLAIM_GUIDE}`}
            className={secondaryButtonClass}
            disabled={copyingGuide}
            onClick={handleCopyRequest}
            type="button"
          >
            {copyingGuide ? PUBLIC_CTA_COPYING_LABEL : PUBLIC_CTA_COPY_CLAIM_GUIDE}
          </button>
        </div>
      </div>
    </li>
      <CopyToast message={feedback?.message ?? null} variant={feedback?.variant} />
    </>
  );
}

function buildClaimNoticeText(
  item: ClaimLibraryItem,
  title: string,
  insurerName: string,
  categoryLabel: string,
): string {
  const doc = item.kind === "pdf" ? null : item.document;
  const requiredText = doc?.requiredDocuments
    ? `\n\n필요서류\n${doc.requiredDocuments}`
    : "";
  const optionalText = doc?.optionalDocuments
    ? `\n\n상황별 추가 확인서류\n${doc.optionalDocuments}`
    : "";
  return `안녕하세요 고객님. ${insurerName} ${categoryLabel} 청구 관련 서류를 안내드립니다.\n\n- ${title}${requiredText}${optionalText}\n\n최종 제출 기준은 보험사 공식 안내와 약관에 따라 달라질 수 있습니다. 보험금 지급 여부와 금액은 보험사 심사 후 결정됩니다.`;
}
