"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  EmptyState,
  EmptyValue,
  LastVerified,
  PremiumCard,
} from "@/components/content-page";
import type { PublicInsurer } from "@/lib/public/insurers";

type CategoryFilter = "all" | PublicInsurer["category"];
type StatusFilter = "all" | "verified" | "needs_review";
type FeaturedFilter = "all" | "featured";

const MISSING_TEXT = "\uacf5\uc2dd \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8 \uc608\uc815";
const UNAVAILABLE_TEXT = "\ud574\ub2f9\uc0ac\ud56d \uc5c6\uc74c";
const CALL_CENTER_INDIVIDUAL_TEXT = "\ucf5c\uc13c\ud130 \uac1c\ubcc4\uc811\uc218";
const CONDITIONAL_TEXT = "\uc870\uac74 \ud655\uc778 \ud544\uc694";

const categoryLabels: Record<PublicInsurer["category"], string> = {
  life: "\uc0dd\uba85\ubcf4\ud5d8",
  non_life: "\uc190\ud574\ubcf4\ud5d8",
};

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\uc190\ud574\ubcf4\ud5d8", value: "non_life" },
  { label: "\uc0dd\uba85\ubcf4\ud5d8", value: "life" },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\uac80\uc218 \uc644\ub8cc", value: "verified" },
  { label: "\uac80\uc218 \ud544\uc694", value: "needs_review" },
];

const featuredOptions: { label: string; value: FeaturedFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\ud2b9\ubcc4 \ud45c\uae30\ub9cc", value: "featured" },
];

const statusBadgeClass: Record<StatusFilter, string> = {
  all: "",
  verified:
    "inline-flex shrink-0 items-center whitespace-nowrap border px-2.5 py-1 text-xs font-semibold border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]",
  needs_review:
    "inline-flex shrink-0 items-center whitespace-nowrap border px-2.5 py-1 text-xs font-semibold border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]",
};

function statusLabel(status: PublicInsurer["verificationStatus"]): string {
  if (status === "verified") return "\uac80\uc218 \uc644\ub8cc";
  if (status === "needs_review") return "\uac80\uc218 \ud544\uc694";
  return "\uac80\uc218 \uc911";
}

function cardPaymentSummary(insurer: PublicInsurer): string {
  switch (insurer.cardPaymentStatus) {
    case "available":
      return "\uc0ac\uc6a9 \uac00\ub2a5";
    case "conditional":
      return CONDITIONAL_TEXT;
    case "unavailable":
      return UNAVAILABLE_TEXT;
    case "unknown":
    default:
      return MISSING_TEXT;
  }
}

function cardPaymentDetail(value: boolean | null): string {
  if (value === true) return "\uac00\ub2a5";
  if (value === false) return UNAVAILABLE_TEXT;
  return MISSING_TEXT;
}

function claimFaxSummary(insurer: PublicInsurer): {
  primary: string;
  secondary: string | null;
} {
  switch (insurer.claimFaxHandlingType) {
    case "fax": {
      const primary = insurer.claimFaxNumber ?? insurer.faxNumber;
      return primary
        ? { primary, secondary: null }
        : { primary: MISSING_TEXT, secondary: null };
    }
    case "call_center_individual":
      return {
        primary: CALL_CENTER_INDIVIDUAL_TEXT,
        secondary: insurer.customerCenterPhone ?? insurer.helpdeskPhone,
      };
    case "unavailable":
      return { primary: UNAVAILABLE_TEXT, secondary: null };
    case "unknown":
    default:
      return { primary: MISSING_TEXT, secondary: null };
  }
}

function formatLastVerified(value: string | null): string | null {
  return value;
}

export function DirectoryExplorer({
  insurers,
}: {
  insurers: PublicInsurer[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");

  const filteredInsurers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return insurers.filter((insurer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        insurer.name.toLocaleLowerCase("ko-KR").includes(normalizedQuery);
      const matchesCategory =
        category === "all" || insurer.category === category;
      const matchesStatus =
        status === "all" || insurer.verificationStatus === status;
      const matchesFeatured = featured === "all" || insurer.isFeatured === true;

      return matchesQuery && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [category, featured, insurers, query, status]);

  return (
    <div className="space-y-6">
      <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">\ubcf4\ud5d8\uc0ac \uac80\uc0c9</span>
            <input
              className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="\ubcf4\ud5d8\uc0ac \uc774\ub984\uc744 \uc785\ub825\ud558\uc138\uc694"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <FilterGroup
              label="\ubd84\ub958"
              onChange={(value) => setCategory(value as CategoryFilter)}
              options={categoryOptions}
              value={category}
            />
            <FilterGroup
              label="\uac80\uc218 \uc0c1\ud0dc"
              onChange={(value) => setStatus(value as StatusFilter)}
              options={statusOptions}
              value={status}
            />
            <FilterGroup
              label="\ud2b9\ubcc4 \ud45c\uae30"
              onChange={(value) => setFeatured(value as FeaturedFilter)}
              options={featuredOptions}
              value={featured}
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredInsurers.length}\uac1c \ubcf4\ud5d8\uc0ac\uac00 \ud45c\uc2dc\ub429\ub2c8\ub2e4. \ub2f9 \uc815\ubcf4\ub294 \uad00\ub9ac\uc790 \uac80\uc218 \uacb0\uacfc\ub97c \ubc18\uc601\ud55c \uacf5\uac1c\uc6a9 \ub370\uc774\ud130\uc785\ub2c8\ub2e4.
        </p>
      </section>

      {filteredInsurers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredInsurers.map((insurer) => (
            <InsurerActionCard insurer={insurer} key={insurer.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="\uc870\uac74\uc5d0 \ub9de\ub294 \ubcf4\ud5d8\uc0ac\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
          description="\uac80\uc0c9\uc5b4\ub97c \uc904\uc774\uac70\ub098 \ud544\ud130\ub97c \ubcc0\uacbd\ud574 \uc8fc\uc138\uc694."
        />
      )}
    </div>
  );
}

function FilterGroup({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#303845]">{label}</legend>
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              className={`shrink-0 border px-3 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
                  : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function InsurerActionCard({ insurer }: { insurer: PublicInsurer }) {
  const systemHref = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const claimFax = claimFaxSummary(insurer);
  const registeredMailing =
    insurer.registeredMailAddress ?? insurer.mailingAddress;
  const paymentSummary = cardPaymentSummary(insurer);

  return (
    <PremiumCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a612d]">
            {categoryLabels[insurer.category]}
          </p>
          <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
            {insurer.name}
          </h2>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          <span
            className={
              statusBadgeClass[
                insurer.verificationStatus as Exclude<StatusFilter, "all">
              ] ?? ""
            }
          >
            {statusLabel(insurer.verificationStatus)}
          </span>
          {insurer.isFeatured ? (
            <span className="inline-flex shrink-0 items-center whitespace-nowrap border border-[#aa8137] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              \ud2b9\ubcc4 \ud45c\uae30
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <LastVerified value={formatLastVerified(insurer.lastVerifiedAt)} />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <ExternalAction href={systemHref} label="\uc804\uc0b0\uc811\uc18d" />
        <ExternalAction href={insurer.officialWebsiteUrl} label="\uacf5\uc2dd \ud648\ud398\uc774\uc9c0" />
        <ExternalAction href={insurer.claimPageUrl} label="\uccad\uad6c \uc548\ub0b4" />
        <ExternalAction href={insurer.claimFormUrl} label="\uccad\uad6c\uc591\uc2dd" />
        <ExternalAction href={insurer.termsUrl} label="\uc57d\uad00" />
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow
          label="\uace0\uac1d\uc13c\ud130"
          telValue={insurer.customerCenterPhone}
        />
        <InfoRow
          label="\uc804\uc0b0 \ud5ec\ud504"
          telValue={insurer.helpdeskPhone}
        />
        <InfoRow label="\uccad\uad6c \ud329\uc2a4" value={claimFax.primary} hint={claimFax.secondary} />
        <InfoRow label="\ub4f1\uae30\uc6b0\ud3b8" value={registeredMailing} />
      </dl>

      <div className="mt-6 border-t border-[#e3d5b8] pt-4">
        <p className="text-sm font-semibold text-[#303845]">\uce74\ub4dc\ub0a9 \uc548\ub0b4</p>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <PaymentRow
            label="\uc885\ud569 \uc0c1\ud0dc"
            value={paymentSummary}
          />
          <PaymentRow
            label="\ucd08\ud68c\ubcf4\ud5d8\ub8cc"
            value={cardPaymentDetail(insurer.cardPaymentInitialAvailable)}
          />
          <PaymentRow
            label="\uacc4\uc18d\ubcf4\ud5d8\ub8cc"
            value={cardPaymentDetail(insurer.cardPaymentRecurringAvailable)}
          />
        </div>
        {insurer.cardPaymentNote ? (
          <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
            {insurer.cardPaymentNote}
          </p>
        ) : null}
      </div>
    </PremiumCard>
  );
}

function ExternalAction({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (!href) {
    return (
      <span className="inline-flex items-center justify-center border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-center text-sm font-semibold text-[#8b7660]">
        {label} {MISSING_TEXT}
      </span>
    );
  }

  return (
    <a
      className="inline-flex items-center justify-center border border-[#173f36] px-3 py-2 text-center text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function InfoRow({
  label,
  value,
  telValue,
  hint,
}: {
  label: string;
  value?: string | null;
  telValue?: string | null;
  hint?: string | null;
}) {
  const displayValue = telValue ?? value ?? null;
  let valueNode: ReactNode;

  if (displayValue && telValue) {
    valueNode = (
      <a
        className="whitespace-nowrap font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
        href={`tel:${telValue.replace(/[^0-9+]/g, "")}`}
        rel="noopener noreferrer"
      >
        {telValue}
      </a>
    );
  } else if (displayValue) {
    valueNode = <span className="break-keep">{displayValue}</span>;
  } else {
    valueNode = <EmptyValue label={MISSING_TEXT} />;
  }

  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="mt-1 break-keep text-[#4f5661]">{valueNode}</dd>
      {hint ? (
        <p className="mt-1 text-xs leading-5 text-[#8b7660]">{hint}</p>
      ) : null}
    </div>
  );
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <p className="font-semibold text-[#303845]">{label}</p>
      <p className="mt-1 break-keep text-[#4f5661]">{value}</p>
    </div>
  );
}
