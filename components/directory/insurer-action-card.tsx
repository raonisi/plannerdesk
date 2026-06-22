"use client";

import Link from "next/link";
import { FreshnessBadge } from "@/components/content/freshness-badge";
import { InsurerLogo } from "@/components/directory/insurer-logo";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ExternalTabAnchor } from "@/components/content-page";
import { CopyToast } from "@/components/ui/copy-toast";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { InsurerCardClaimDocumentsSection } from "@/components/directory/insurer-card-claim-documents-section";
import { InsurerCardContactStrip } from "@/components/directory/insurer-card-contact-strip";
import { InsurerCardDeskActions } from "@/components/directory/insurer-card-desk-actions";
import { InsurerSystemPortalPrimaryCta } from "@/components/directory/insurer-system-portal-primary-cta";
import { InsurerPrimaryWorkLinks } from "@/components/directory/insurer-primary-work-links";
import {
  insurerCardCategoryBadge,
  insurerCardDetailedToggle,
  insurerCardFeaturedBar,
  insurerCardInsurerName,
  insurerCardShell,
  insurerCardTrustNote,
} from "@/lib/directory/insurer-card-ui";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { getDisclosureLinksForInsurer } from "@/lib/content/disclosure-match";
import { getInsurerWorkbenchCategoryLabel } from "@/lib/directory/directory-workbench-copy";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  DIRECTORY_TEXT,
  cardPaymentLegLabel,
  cardPaymentStatusLabel,
  claimFaxDisplay,
  telHref,
} from "@/lib/directory/formatting";
import {
  WORK_LINK_ACTION_LABELS,
  WORK_LINK_COPY,
  WORK_LINK_GROUP_LABELS,
  disclosureLinkStatus,
} from "@/lib/directory/work-links";
import { buttons } from "@/lib/design-system";








export interface InsurerActionCardProps {
  insurer: PublicInsurer;
  claimItems?: ClaimLibraryItem[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onRequestCorrection?: (id: string) => void;
  /** Workbench detail panel: expanded sections only (no compact card shell). */
  workbenchDetailOnly?: boolean;
}

export function InsurerActionCard({
  insurer,
  claimItems = [],
  isFavorite = false,
  onToggleFavorite,
  onRequestCorrection,
  workbenchDetailOnly = false,
}: InsurerActionCardProps) {
  const [detailedOpen, setDetailedOpen] = useState(workbenchDetailOnly);
  const [claimDocumentsOpen, setClaimDocumentsOpen] = useState(false);
  const [cardPaymentOpen, setCardPaymentOpen] = useState(false);
  const [mailAddressOpen, setMailAddressOpen] = useState(false);
  
  const mailAddress = insurer.registeredMailAddress || insurer.mailingAddress;
  const claimFax = claimFaxDisplay(insurer);
  const disclosureLinks = getDisclosureLinksForInsurer(insurer.id);
  const disclosureState = disclosureLinkStatus(disclosureLinks);
  const showExpandedDetails = workbenchDetailOnly || detailedOpen;
  const Shell = workbenchDetailOnly ? "div" : "article";

  return (
    <Shell className={workbenchDetailOnly ? "space-y-6" : insurerCardShell}>
      {!workbenchDetailOnly && insurer.isFeatured ? (
        <span aria-hidden="true" className={insurerCardFeaturedBar} />
      ) : null}

      <div className={workbenchDetailOnly ? "space-y-6" : "relative"}>
        {!workbenchDetailOnly ? (
          <CardHeader
            insurer={insurer}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ) : null}

        {workbenchDetailOnly ? (
          <div className="space-y-6">
            <InsurerPrimaryWorkLinks
              hideMissingSlots
              insurer={insurer}
              sections={["system", "support", "official"]}
              showActionHints={false}
              showLinkCheckNotice={false}
              showTrustHint={false}
            />
            <InsurerCardClaimDocumentsSection
              claimItems={claimItems}
              expanded={claimDocumentsOpen}
              insurer={insurer}
              onExpandedChange={setClaimDocumentsOpen}
            />
            <InsurerCardContactStrip
              insurer={insurer}
              onOpenMailAddress={() => setMailAddressOpen(true)}
            />
          </div>
        ) : (
        <div className="mt-2 space-y-2 lg:mt-4 lg:space-y-4">
          <div className="lg:hidden">
            <InsurerSystemPortalPrimaryCta insurer={insurer} />
          </div>
          <InsurerCardDeskActions
            claimItems={claimItems}
            claimPanelOpen={claimDocumentsOpen}
            hideSystemPortalCta
            insurer={insurer}
            onClaimPanelOpenChange={setClaimDocumentsOpen}
            onOpenDetail={() => setDetailedOpen(true)}
          />

          <InsurerCardContactStrip
            insurer={insurer}
            onOpenMailAddress={() => setMailAddressOpen(true)}
          />

          <InsurerPrimaryWorkLinks
            hideMissingSlots
            insurer={insurer}
            sections={["official"]}
            showActionHints={false}
            showLinkCheckNotice={false}
            showTrustHint={false}
          />

          <button
            type="button"
            aria-expanded={detailedOpen}
            aria-label={`${insurer.name} 상세 실무 정보 ${detailedOpen ? "닫기" : "열기"}`}
            onClick={() => setDetailedOpen(!detailedOpen)}
            className={insurerCardDetailedToggle(detailedOpen)}
          >
            상세 실무 정보 {detailedOpen ? "닫기 ▲" : "열기 ▼"}
          </button>
        </div>
        )}

        {showExpandedDetails ? (
          <div
            className={
              workbenchDetailOnly
                ? "space-y-6"
                : "mt-4 space-y-6 border-t border-[#E3DED4] pt-4 animate-in fade-in duration-200"
            }
          >
            {!workbenchDetailOnly ? (
              <InsurerPrimaryWorkLinks
                hideMissingSlots
                insurer={insurer}
                sections={["support"]}
                showActionHints={false}
                showLinkCheckNotice={false}
                showTrustHint={false}
              />
            ) : null}

            {!workbenchDetailOnly ? (
              <div className={insurerCardTrustNote}>
                <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed">
                  <li>보험사별 링크와 연락처는 공식 출처 기준으로 확인 후 사용하세요.</li>
                  <li>PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다.</li>
                  <li>고객 개인정보와 의료자료는 PlannerDesk에 입력하지 마세요.</li>
                </ul>
              </div>
            ) : null}

            {/* 지원·문의 상세 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                {WORK_LINK_GROUP_LABELS.support}
              </h4>
              <div className="overflow-hidden rounded-xl border border-[#E3DED4] bg-white text-sm">
                <div className="grid grid-cols-[100px_1fr] border-b border-[#E3DED4] p-3 items-center">
                  <span className="font-semibold text-slate-600">고객센터</span>
                  <div className="text-right">
                    {insurer.customerCenterPhone ? (
                      <a
                        href={telHref(insurer.customerCenterPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.customerCenterPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] border-b border-[#E3DED4] p-3 items-center">
                  <span className="font-semibold text-slate-600">헬프데스크</span>
                  <div className="text-right">
                    {insurer.helpdeskPhone ? (
                      <a
                        href={telHref(insurer.helpdeskPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.helpdeskPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] p-3 items-center bg-[#F8F7F3]">
                  <span className="font-semibold text-slate-600">인콜/모니터링</span>
                  <div className="text-right">
                    {insurer.callMonitoringPhone ? (
                      <a
                        href={telHref(insurer.callMonitoringPhone) || "#"}
                        className="font-bold text-[#0F1D2E] underline decoration-slate-300 underline-offset-4 hover:decoration-[#0F1D2E]"
                      >
                        {insurer.callMonitoringPhone}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">{DIRECTORY_TEXT.missing}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                {WORK_LINK_GROUP_LABELS.claim}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col justify-center rounded-xl border border-[#E3DED4] bg-white p-4">
                  <span className="text-xs font-semibold text-slate-600">청구 팩스</span>
                  <span
                    className={`mt-1 break-all text-sm font-bold ${
                      claimFax.primary !== DIRECTORY_TEXT.missing &&
                      claimFax.primary !== DIRECTORY_TEXT.unavailable
                        ? "text-[#0F1D2E]"
                        : "text-[#4A5565]"
                    }`}
                  >
                    {claimFax.primary}
                  </span>
                  {claimFax.secondary ? (
                    <span className="mt-1 text-[11px] font-medium text-[#4A5565] break-all">
                      {claimFax.secondary}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!mailAddress}
                  onClick={() => setMailAddressOpen(true)}
                  aria-label={`${insurer.name} 등기우편 주소 확인`}
                  className="flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-[#E3DED4] bg-white p-4 text-left transition hover:border-[#B9975B] hover:bg-[#F7F4EE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-xs font-semibold text-slate-600">등기우편 주소</span>
                  <span
                    className={`mt-1 text-sm font-bold break-keep ${mailAddress ? "text-[#B9975B] underline" : "text-[#4A5565] no-underline"}`}
                  >
                    {mailAddress ? "주소 확인" : DIRECTORY_TEXT.missing}
                  </span>
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {insurer.claimFormUrl ? (
                  <ExternalTabAnchor
                    aria-label={`${insurer.name} 청구양식 열기`}
                    className={`${buttons.base} ${buttons.outline} w-full text-xs`}
                    href={insurer.claimFormUrl}
                  >
                    {WORK_LINK_ACTION_LABELS.claimForm} ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-3 text-xs font-semibold text-[#4A5565] break-keep">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
                <Link
                  href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
                  className={`${buttons.base} ${buttons.outline} w-full text-xs`}
                >
                  청구서류 확인
                </Link>
              </div>

              {claimItems.length > 0 ? (
                <p className="text-xs font-medium leading-5 text-[#4A5565] break-keep">
                  PDF 다운로드는 카드 상단 청구 안내에서 바로 확인할 수 있습니다.
                </p>
              ) : null}

              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/message-templates"
                  className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
                >
                  고객 안내문 확인
                </Link>
              </div>
            </section>

            <section className="space-y-3 border-t border-[#E3DED4] pt-6">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                {WORK_LINK_GROUP_LABELS.official}
              </h4>
              {disclosureState !== "available" ? (
                <p className="text-xs leading-5 text-[#4A5565]">
                  {WORK_LINK_COPY.disclosureUnverified}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {insurer.termsUrl ? (
                  <ExternalTabAnchor
                    aria-label={`${insurer.name} 약관 확인`}
                    className={`${buttons.base} ${buttons.outline} w-full text-sm`}
                    href={insurer.termsUrl}
                  >
                    {WORK_LINK_ACTION_LABELS.terms} ↗
                  </ExternalTabAnchor>
                ) : null}
                {disclosureLinks.productDisclosure?.sourceUrl ? (
                  <ExternalTabAnchor
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3DED4] bg-white text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] hover:text-[#B9975B]"
                    href={disclosureLinks.productDisclosure.sourceUrl}
                  >
                    {WORK_LINK_ACTION_LABELS.productDisclosure} ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-slate-50 text-sm font-semibold text-slate-400">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
                
                {disclosureLinks.policyTerms?.sourceUrl ? (
                  <ExternalTabAnchor
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3DED4] bg-white text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] hover:text-[#B9975B]"
                    href={disclosureLinks.policyTerms.sourceUrl}
                  >
                    {WORK_LINK_ACTION_LABELS.policyTerms} ↗
                  </ExternalTabAnchor>
                ) : (
                  <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-slate-50 text-sm font-semibold text-slate-400">
                    {DIRECTORY_TEXT.missing}
                  </span>
                )}
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/disclosure-links"
                  className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
                >
                  {WORK_LINK_ACTION_LABELS.disclosureHub}
                </Link>
              </div>
            </section>

            {/* 5순위: 카드납 정보 */}
            <section className="space-y-3 border-t border-[#E3DED4] pt-6">
              <h4 className="text-sm font-bold text-[#0F1D2E] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B9975B]" />
                카드납 정보
              </h4>
              <button
                type="button"
                onClick={() => setCardPaymentOpen(true)}
                aria-label={`${insurer.name} 카드납 가능 여부 상세`}
                className="flex min-h-12 w-full flex-col gap-2 rounded-xl border border-[#E3DED4] bg-white px-4 py-3 text-left transition hover:border-[#B9975B] hover:bg-[#F7F4EE]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-bold text-slate-600">카드납 가능 여부</span>
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#F7F4EE] px-2.5 py-1 text-xs font-bold text-[#0F1D2E]">
                    {cardPaymentStatusLabel(insurer.cardPaymentStatus)}
                  </span>
                  <span className="text-[11px] font-medium text-[#4A5565]">
                    초회 {cardPaymentLegLabel(insurer.cardPaymentInitialAvailable)} · 계속{" "}
                    {cardPaymentLegLabel(insurer.cardPaymentRecurringAvailable)}
                  </span>
                </span>
              </button>
            </section>
          </div>
        ) : null}

        {/* 정보 수정 요청 */}
        {onRequestCorrection ? (
          <div className="flex justify-end pt-3 mt-4 border-t border-slate-100">
            <button
              aria-label={`${insurer.name} 수정 요청`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              onClick={() => onRequestCorrection(insurer.id)}
              type="button"
            >
              <span>✍ 정보 수정 요청</span>
            </button>
          </div>
        ) : null}
      </div>

      <CardPaymentDialog
        insurer={insurer}
        onClose={() => setCardPaymentOpen(false)}
        open={cardPaymentOpen}
      />
      <MailAddressDialog
        address={mailAddress}
        insurerName={insurer.name}
        onClose={() => setMailAddressOpen(false)}
        open={mailAddressOpen}
      />
    </Shell>
  );
}

function CardHeader({
  insurer,
  isFavorite,
  onToggleFavorite,
}: {
  insurer: PublicInsurer;
  isFavorite: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          <InsurerLogo insurer={insurer} />
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={insurerCardCategoryBadge}>
                {getInsurerWorkbenchCategoryLabel(insurer)}
              </span>
            </div>
            <h2 className={`mt-2 ${insurerCardInsurerName}`}>
              {insurer.name}
            </h2>
            <div className="mt-2">
              <FreshnessBadge
                hasOfficialSource={Boolean(
                  insurer.officialWebsiteUrl?.trim() ||
                    insurer.systemUrl?.trim(),
                )}
                lastVerifiedAt={insurer.lastVerifiedAt}
                verificationStatus={insurer.verificationStatus}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-2">
          {onToggleFavorite ? (
            <FavoriteButton
              id={insurer.id}
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

function FavoriteButton({
  id,
  isFavorite,
  onToggle,
}: {
  id: string;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}) {
  const label = isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가";
  const toneClass = isFavorite
    ? "border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 hover:border-amber-300"
    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600";

  return (
    <button
      aria-label={label}
      aria-pressed={isFavorite}
      className={`inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 ${toneClass}`}
      onClick={() => onToggle(id)}
      title={label}
      type="button"
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {isFavorite ? "\u2605" : "\u2606"}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function parseCardPaymentRows(note: string | null) {
  if (!note) return [];

  return note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^\[([^\]]+)\]\s*(.*)$/.exec(line);
      return match
        ? { label: match[1], value: match[2] || DIRECTORY_TEXT.missing }
        : { label: "메모", value: line };
    });
}

function DialogFrame({
  children,
  onClose,
  open,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Tab") {
        const focusableElements = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => !element.hasAttribute("disabled"));

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        ref={dialogRef}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4.5">
          <h3
            className="break-keep text-base sm:text-lg font-bold text-slate-900"
            id={titleId}
          >
            {title}
          </h3>
          <button
            aria-label="닫기"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function CardPaymentDialog({
  insurer,
  onClose,
  open,
}: {
  insurer: PublicInsurer;
  onClose: () => void;
  open: boolean;
}) {
  const rows = parseCardPaymentRows(insurer.cardPaymentNote);

  return (
    <DialogFrame
      onClose={onClose}
      open={open}
      title={`${insurer.name} 카드납 정보`}
    >
      <p className="break-keep text-sm leading-relaxed text-slate-600">
        참고용으로만 사용하고, 고객 안내 전 보험사 공식 기준을 다시 확인해 주세요.
      </p>
      {rows.length > 0 ? (
        <dl className="mt-5 space-y-3.5 text-sm">
          {rows.map((row) => (
            <div
              className="grid gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-[8rem_1fr] hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
              key={`${row.label}-${row.value}`}
            >
              <dt className="font-bold text-slate-700 sm:pt-0.5">{row.label}</dt>
              <dd className="whitespace-pre-wrap break-keep leading-relaxed text-slate-600">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 break-keep text-sm leading-relaxed text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </DialogFrame>
  );
}

function MailAddressDialog({
  address,
  insurerName,
  onClose,
  open,
}: {
  address: string | null;
  insurerName: string;
  onClose: () => void;
  open: boolean;
}) {
  const { feedback, copyWithFeedback } = useCopyFeedback();
  const [copying, setCopying] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const copyAddress = useCallback(async () => {
    if (!address) return;

    setCopying(true);
    try {
      await copyWithFeedback({
        text: address,
        source: "directory",
      });
    } finally {
      setCopying(false);
      copyButtonRef.current?.focus();
    }
  }, [address, copyWithFeedback]);

  return (
    <DialogFrame
      onClose={onClose}
      open={open}
      title={`${insurerName} 등기우편 주소`}
    >
      {address ? (
        <div className="space-y-5">
          <div className="whitespace-pre-wrap break-keep rounded-xl border border-slate-200 bg-slate-50 p-5 text-[15px] font-semibold leading-relaxed text-slate-800 shadow-inner">
            {address}
          </div>
          <button
            ref={copyButtonRef}
            aria-busy={copying || undefined}
            aria-label={`${insurerName} 등기우편 주소 연락 안내 복사`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-md shadow-indigo-600/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/20 active:translate-y-0"
            disabled={copying}
            onClick={copyAddress}
            type="button"
          >
            {copying ? "복사 중…" : "연락 안내 복사"}
          </button>
          <CopyToast message={feedback?.message ?? null} variant={feedback?.variant} />
        </div>
      ) : (
        <p className="break-keep text-sm leading-relaxed text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </DialogFrame>
  );
}
