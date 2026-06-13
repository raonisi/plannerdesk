"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { DataFreshnessMeta } from "@/components/content/data-freshness-meta";
import { GatedFavoriteButton } from "@/components/planner-favorites/gated-favorite-button";
import { claimLibraryFavoriteId } from "@/lib/planner-favorites/claim-favorite-id";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";
import { categoryLabels } from "@/lib/claim-documents/category-labels";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { publicClaimTrustHint } from "@/lib/directory/formatting";
import {
  insurerCardClaimDocumentActions,
  insurerCardClaimDocumentCard,
  insurerCardClaimDocumentTitle,
  insurerCardPdfDownloadButton,
  insurerCardPdfSecondaryButton,
} from "@/lib/directory/insurer-card-ui";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#0F1D2E] bg-[#0F1D2E] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#16382C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-[#B9975B] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25";

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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [linkCopyState, setLinkCopyState] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const title = item.kind === "pdf" ? item.title : item.document.title;
  const insurerName =
    item.kind === "pdf" ? item.insurerName : (item.document.insurerName ?? "공통 기준");
  const categoryLabel =
    item.kind === "pdf" ? item.categoryLabel : categoryLabels[item.document.category];
  const status =
    item.kind === "pdf" ? item.verificationStatus : item.document.verificationStatus;
  const trustHint = publicClaimTrustHint(status);

  async function handleCopyRequest() {
    const doc = item.kind === "pdf" ? null : item.document;
    const requiredText = doc?.requiredDocuments
      ? `\n\n필요서류\n${doc.requiredDocuments}`
      : "";
    const optionalText = doc?.optionalDocuments
      ? `\n\n상황별 추가 확인서류\n${doc.optionalDocuments}`
      : "";
    const noticeText = `안녕하세요 고객님. ${insurerName} ${categoryLabel} 청구 관련 서류를 안내드립니다.\n\n- ${title}${requiredText}${optionalText}\n\n최종 제출 기준은 보험사 공식 안내와 약관에 따라 달라질 수 있습니다. 보험금 지급 여부와 금액은 보험사 심사 후 결정됩니다.`;

    await copyTextToClipboard(noticeText);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  async function handleCopyPdfLink(href: string) {
    const absolute =
      typeof window !== "undefined"
        ? new URL(href, window.location.origin).toString()
        : href;
    await copyTextToClipboard(absolute);
    setLinkCopyState("copied");
    window.setTimeout(() => setLinkCopyState("idle"), 2000);
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
              <a
                aria-label={`${title} PDF 다운로드`}
                className={insurerCardPdfDownloadButton}
                download={item.fileName}
                href={item.href}
              >
                PDF 다운로드
              </a>
              <ExternalTabAnchor
                aria-label={`${title} PDF 바로 열기`}
                className={insurerCardPdfSecondaryButton}
                href={item.href}
              >
                PDF 바로 열기
              </ExternalTabAnchor>
              {item.officialSourceUrl ? (
                <ExternalTabAnchor
                  aria-label={`${insurerName} 보험사 공식 안내 확인`}
                  className={insurerCardPdfSecondaryButton}
                  href={item.officialSourceUrl}
                >
                  보험사 공식 안내 확인
                </ExternalTabAnchor>
              ) : null}
            </div>
          </article>
        </li>
      );
    }

    return (
      <li className="border-t border-slate-200 first:border-t-0">
        <div className="grid min-h-11 gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0 flex-1">
            {variant === "default" ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  {categoryLabel}
                </span>
                <span className="rounded-md border border-[#e3ded4] bg-[#f8f7f3] px-2.5 py-1 text-[11px] font-semibold text-[#5B6470]">
                  PDF
                </span>
              </div>
            ) : null}
            <p
              className={`break-keep text-base font-bold leading-6 text-slate-900 ${
                isCompactVariant ? "" : "mt-2"
              }`}
            >
              {title}
            </p>
            {variant === "default" ? (
              <>
                <p className="mt-1 break-all text-xs text-[#5B6470]">{item.fileName}</p>
                {trustHint ? (
                  <p className="mt-2 text-xs font-medium text-[#5B6470]">{trustHint}</p>
                ) : null}
                <DataFreshnessMeta
                  className="mt-2"
                  lastVerifiedAt={item.lastVerifiedAt}
                  officialSourceUrl={item.officialSourceUrl}
                  showClaimNotice
                />
                <p className="mt-2 break-keep text-xs leading-5 text-[#5B6470]">
                  {item.cautionText}
                </p>
              </>
            ) : null}
          </div>
          <div className={actionGridClass}>
            <a
              aria-label={`${title} PDF 다운로드`}
              className={`${primaryButtonClass} ${
                variant === "accordion" ? "sm:col-span-2 lg:col-span-3" : ""
              }`}
              download={item.fileName}
              href={item.href}
            >
              PDF 다운로드
            </a>
            <ExternalTabAnchor
              aria-label={`${title} PDF 바로 열기`}
              className={secondaryButtonClass}
              href={item.href}
            >
              PDF 바로 열기
            </ExternalTabAnchor>
            {item.officialSourceUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurerName} 보험사 공식 안내 확인`}
                className={secondaryButtonClass}
                href={item.officialSourceUrl}
              >
                보험사 공식 안내 확인
              </ExternalTabAnchor>
            ) : null}
            {variant === "default" ? (
              <>
                <button
                  aria-label={`${title} PDF 링크 복사`}
                  className={secondaryButtonClass}
                  onClick={() => handleCopyPdfLink(item.href)}
                  type="button"
                >
                  {getLinkCopyButtonLabel(linkCopyState)}
                </button>
                <button
                  aria-label={`${title} 고객 요청 문구 복사`}
                  className={secondaryButtonClass}
                  onClick={handleCopyRequest}
                  type="button"
                >
                  {getCopyButtonLabel(copyState)}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  const doc = item.document;
  const primaryHref = doc.claimFormUrl ?? doc.officialSourceUrl;
  const primaryLabel = doc.claimFormUrl ? "PDF 열기" : "청구안내 보기";

  return (
    <li className="border-t border-slate-200 first:border-t-0">
      <div className="grid min-h-11 gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-start">
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
          <p className="mt-2 break-keep text-base font-bold leading-6 text-slate-900">
            {title}
          </p>
          {doc.summary ? (
            <p className="mt-1 break-keep text-sm leading-6 text-slate-500">
              {doc.summary}
            </p>
          ) : null}
          {trustHint ? (
            <p className="mt-2 text-xs font-medium text-[#5B6470]">{trustHint}</p>
          ) : null}
          <DataFreshnessMeta
            className="mt-2"
            lastVerifiedAt={doc.lastVerifiedAt}
            officialSourceUrl={doc.officialSourceUrl}
            showClaimNotice
          />
        </div>
        <div className="grid gap-2 sm:flex lg:justify-end">
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
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold !text-white shadow-md transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
              href="/claim-documents"
            >
              전체 청구서류 검색
            </Link>
          )}
          <button
            aria-label={`${title} 고객 요청 문구 복사`}
            className={secondaryButtonClass}
            onClick={handleCopyRequest}
            type="button"
          >
            {getCopyButtonLabel(copyState)}
          </button>
        </div>
      </div>
    </li>
  );
}

function getCopyButtonLabel(state: "idle" | "copied" | "failed"): string {
  if (state === "copied") return "복사되었습니다";
  if (state === "failed") return "복사 실패";
  return "안내문 복사";
}

function getLinkCopyButtonLabel(state: "idle" | "copied" | "failed"): string {
  if (state === "copied") return "링크 복사됨";
  if (state === "failed") return "복사 실패";
  return "PDF 링크 복사";
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
