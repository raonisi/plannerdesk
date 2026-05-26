"use client";

import type { ReactNode } from "react";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CATEGORY_LABELS,
  DIRECTORY_TEXT,
  cardPaymentLegLabel,
  cardPaymentStatusLabel,
  cardPaymentTone,
  claimFaxDisplay,
  lastVerifiedLabel,
  telHref,
  verificationStatusLabel,
} from "@/lib/directory/formatting";

const cardClass =
  "group/insurer relative overflow-hidden rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] shadow-[0_18px_40px_rgba(16,34,53,0.06)] transition hover:shadow-[0_30px_60px_rgba(16,34,53,0.1)]";

const sectionEyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]";
const sectionHeadingClass = "text-sm font-semibold text-[#102235]";
const sectionContainerClass = "space-y-3";
const groupDividerClass = "border-t border-[#e7ddc9] pt-5";

const verificationBadgeTone: Record<
  PublicInsurer["verificationStatus"],
  string
> = {
  verified:
    "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  needs_review:
    "border-[#d9c9a8] bg-[#fff9ed] text-[#7b5b19]",
  draft: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
  unverified: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
  pending: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
};

const paymentToneClass: Record<
  ReturnType<typeof cardPaymentTone>,
  { pill: string; text: string }
> = {
  ok: {
    pill: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
    text: "text-[#173f36]",
  },
  warn: {
    pill: "border-[#d9c9a8] bg-[#fff9ed] text-[#7b5b19]",
    text: "text-[#7b5b19]",
  },
  muted: {
    pill: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
    text: "text-[#4f5661]",
  },
};

export interface InsurerActionCardProps {
  insurer: PublicInsurer;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onRequestCorrection?: (id: string) => void;
}

export function InsurerActionCard({
  insurer,
  isFavorite = false,
  onToggleFavorite,
  onRequestCorrection,
}: InsurerActionCardProps) {
  const accessHref = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const claimFax = claimFaxDisplay(insurer);
  const registeredMailing =
    insurer.registeredMailAddress ?? insurer.mailingAddress;
  const paymentTone = cardPaymentTone(insurer.cardPaymentStatus);
  const paymentToneClasses = paymentToneClass[paymentTone];

  return (
    <article className={cardClass}>
      {insurer.isFeatured ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#aa8137] via-[#d6b06b] to-[#aa8137]"
        />
      ) : null}

      <div className="p-6 sm:p-7">
        <CardHeader
          insurer={insurer}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />

        <div className="mt-6 space-y-5">
          <ActionGroup eyebrow="ACCESS" title="\uc811\uc18d">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActionLink
                href={accessHref}
                label="\uc804\uc0b0\uc811\uc18d"
                tone="primary"
              />
              <ActionLink
                href={insurer.officialWebsiteUrl}
                label="\uacf5\uc2dd \ud648\ud398\uc774\uc9c0"
              />
            </div>
          </ActionGroup>

          <div className={groupDividerClass}>
            <ActionGroup eyebrow="SUPPORT" title="\uc9c0\uc6d0">
              <div className="grid gap-3 sm:grid-cols-3">
                <PhoneRow
                  label="\uace0\uac1d\uc13c\ud130"
                  value={insurer.customerCenterPhone}
                />
                <PhoneRow
                  label="\uc804\uc0b0 \ud5ec\ud504"
                  value={insurer.helpdeskPhone}
                />
                <PhoneRow
                  label="\uc778\ucf5c \ubaa8\ub2c8\ud130\ub9c1"
                  value={insurer.callMonitoringPhone}
                />
              </div>
            </ActionGroup>
          </div>

          <div className={groupDividerClass}>
            <ActionGroup eyebrow="CLAIM" title="\uccad\uad6c">
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionLink
                  href={insurer.claimPageUrl}
                  label="\uccad\uad6c \uc548\ub0b4"
                />
                <ActionLink
                  href={insurer.claimFormUrl}
                  label="\uccad\uad6c\uc591\uc2dd"
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoRow
                  label="\uccad\uad6c \ud329\uc2a4"
                  value={claimFax.primary}
                  hint={claimFax.secondary}
                  isFallback={claimFax.isFallback}
                />
                <InfoRow
                  label="\ub4f1\uae30\uc6b0\ud3b8"
                  value={registeredMailing ?? DIRECTORY_TEXT.missing}
                  isFallback={!registeredMailing}
                />
              </div>
            </ActionGroup>
          </div>

          <div className={groupDividerClass}>
            <ActionGroup eyebrow="POLICY" title="\uc57d\uad00">
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionLink href={insurer.termsUrl} label="\uc57d\uad00" />
              </div>
            </ActionGroup>
          </div>

          <div className={groupDividerClass}>
            <ActionGroup eyebrow="PAYMENT" title="\uce74\ub4dc\ub0a9">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${paymentToneClasses.pill}`}
                >
                  {cardPaymentStatusLabel(insurer.cardPaymentStatus)}
                </span>
                <span className={`text-xs ${paymentToneClasses.text}`}>
                  \uce74\ub4dc\ub0a9 \uc885\ud569 \uc0c1\ud0dc
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <InfoRow
                  label="\ucd08\ud68c\ubcf4\ud5d8\ub8cc"
                  value={cardPaymentLegLabel(insurer.cardPaymentInitialAvailable)}
                  isFallback={insurer.cardPaymentInitialAvailable === null}
                />
                <InfoRow
                  label="\uacc4\uc18d\ubcf4\ud5d8\ub8cc"
                  value={cardPaymentLegLabel(insurer.cardPaymentRecurringAvailable)}
                  isFallback={insurer.cardPaymentRecurringAvailable === null}
                />
              </div>

              {insurer.cardPaymentNote ? (
                <p className="mt-3 break-keep rounded-md bg-white/70 px-3 py-2 text-sm leading-6 text-[#4f5661]">
                  {insurer.cardPaymentNote}
                </p>
              ) : null}
            </ActionGroup>
          </div>

          {onRequestCorrection ? (
            <div className="flex justify-end pt-1">
              <button
                aria-label={`${insurer.name} \uc218\uc815 \uc694\uccad`}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-[#7a612d] underline-offset-4 transition hover:bg-[#fff7e6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
                onClick={() => onRequestCorrection(insurer.id)}
                type="button"
              >
                <span aria-hidden="true">{"\u270e"}</span>
                <span>{"\uc815\ubcf4 \uc218\uc815 \uc694\uccad"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
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
        <div className="min-w-0">
          <p className={sectionEyebrowClass}>
            {CATEGORY_LABELS[insurer.category]}
          </p>
          <h2 className="mt-2 break-keep text-2xl font-semibold leading-snug text-[#102235] sm:text-[1.65rem]">
            {insurer.name}
          </h2>
        </div>

        <div className="flex flex-wrap items-start justify-end gap-2">
          {onToggleFavorite ? (
            <FavoriteButton
              id={insurer.id}
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
          ) : null}
          <span
            className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${verificationBadgeTone[insurer.verificationStatus]}`}
          >
            {verificationStatusLabel(insurer.verificationStatus)}
          </span>
          {insurer.isFeatured ? (
            <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-[#aa8137] bg-[#fff7e6] px-3 py-1 text-xs font-semibold text-[#7a612d]">
              \ud2b9\ubcc4 \ud45c\uae30
            </span>
          ) : null}
        </div>
      </div>

      <div className="inline-flex items-center gap-2 text-xs text-[#5f6670]">
        <span className="rounded-full border border-[#e7ddc9] bg-white px-2.5 py-0.5 font-semibold text-[#7a612d]">
          \ucd5c\uadfc \uac80\uc218
        </span>
        <span className="break-keep">{lastVerifiedLabel(insurer.lastVerifiedAt)}</span>
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
  const label = isFavorite
    ? "\uc990\uaca8\ucc3e\uae30 \ud574\uc81c"
    : "\uc990\uaca8\ucc3e\uae30 \ucd94\uac00";
  const toneClass = isFavorite
    ? "border-[#aa8137] bg-[#fff7e6] text-[#7a612d]"
    : "border-[#d9c9a8] bg-white text-[#5f6670] hover:border-[#aa8137] hover:text-[#7a612d]";

  return (
    <button
      aria-label={label}
      aria-pressed={isFavorite}
      className={`inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${toneClass}`}
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

function ActionGroup({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={sectionContainerClass}>
      <div className="flex items-baseline gap-3">
        <p className={sectionEyebrowClass}>{eyebrow}</p>
        <p className={sectionHeadingClass}>{title}</p>
      </div>
      {children}
    </section>
  );
}

interface ActionLinkProps {
  href: string | null;
  label: string;
  tone?: "primary" | "default";
}

function ActionLink({ href, label, tone = "default" }: ActionLinkProps) {
  if (!href) {
    return (
      <span className="inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border border-dashed border-[#d9c9a8] bg-white/60 px-4 py-3 text-sm font-semibold text-[#8b7660]">
        <span className="break-keep">{label}</span>
        <span className="text-xs font-normal text-[#a08e6f]">
          {DIRECTORY_TEXT.missing}
        </span>
      </span>
    );
  }

  const toneClass =
    tone === "primary"
      ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee] hover:bg-[#0f322a]"
      : "border-[#173f36] bg-white text-[#173f36] hover:bg-[#173f36] hover:text-[#fbf7ee]";

  return (
    <a
      className={`inline-flex min-h-12 items-center justify-between gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${toneClass}`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="break-keep">{label}</span>
      <span
        aria-hidden="true"
        className="text-base leading-none"
      >
        {"\u2197"}
      </span>
    </a>
  );
}

function PhoneRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const href = telHref(value);
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className="rounded-lg border border-[#e7ddc9] bg-white px-3 py-3">
      <p className="text-xs font-semibold text-[#7a612d]">{label}</p>
      {hasValue && href ? (
        <a
          className="mt-1 inline-flex min-h-10 items-center text-base font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
          href={href}
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : hasValue ? (
        <p className="mt-1 break-keep text-base font-semibold text-[#173f36]">
          {value}
        </p>
      ) : (
        <p className="mt-1 break-keep text-sm text-[#8b7660]">
          {DIRECTORY_TEXT.missing}
        </p>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  hint,
  isFallback = false,
}: {
  label: string;
  value: string;
  hint?: string | null;
  isFallback?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e7ddc9] bg-white px-3 py-3">
      <p className="text-xs font-semibold text-[#7a612d]">{label}</p>
      <p
        className={`mt-1 break-keep ${
          isFallback
            ? "text-sm text-[#8b7660]"
            : "text-base font-semibold text-[#173f36]"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-5 text-[#5f6670]">{hint}</p>
      ) : null}
    </div>
  );
}
