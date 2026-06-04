"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { buttons } from "@/lib/design-system";
import { getDisclosureLinksForInsurer } from "@/lib/content/disclosure-match";
import {
  WORK_LINK_ACTION_LABELS,
  WORK_LINK_COPY,
  WORK_LINK_GROUP_LABELS,
  disclosureLinkStatus,
  plannerSystemAccessNote,
  resolveSystemLinks,
} from "@/lib/directory/work-links";
import { telHref } from "@/lib/directory/formatting";
import type { PublicInsurer } from "@/lib/public/insurers";

function MissingLinkSlot({ label }: { label: string }) {
  return (
    <span
      aria-label={`${label} — ${WORK_LINK_COPY.missing}`}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-4 text-sm font-semibold text-[#5B6470] break-keep"
    >
      {WORK_LINK_COPY.missing}
    </span>
  );
}

function CardSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-[#B9975B]">
      {children}
    </h3>
  );
}

function PhoneActionButton({
  label,
  phone,
}: {
  label: string;
  phone: string | null;
}) {
  const href = telHref(phone);

  if (href) {
    return (
      <a
        aria-label={`${label} ${phone}`}
        className={`${buttons.base} ${buttons.outline} w-full break-all px-3 text-xs`}
        href={href}
      >
        {label}
      </a>
    );
  }

  return <MissingLinkSlot label={label} />;
}

export function InsurerPrimaryWorkLinks({ insurer }: { insurer: PublicInsurer }) {
  const { primary, secondary, primaryLabel, secondaryLabel } =
    resolveSystemLinks(insurer);
  const systemNote = plannerSystemAccessNote(primary);
  const disclosure = getDisclosureLinksForInsurer(insurer.id);
  const disclosureState = disclosureLinkStatus(disclosure);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <CardSectionTitle>{WORK_LINK_GROUP_LABELS.system}</CardSectionTitle>
        {primary ? (
          <>
            <ExternalTabAnchor
              aria-label={`${insurer.name} ${primaryLabel}`}
              className={`${buttons.base} ${buttons.primary} w-full gap-2`}
              href={primary}
            >
              {primaryLabel} ↗
            </ExternalTabAnchor>
            {systemNote ? (
              <p className="text-center text-[11px] font-medium leading-5 text-[#5B6470]">
                {systemNote}
              </p>
            ) : null}
            {secondary ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} ${secondaryLabel}`}
                className={`${buttons.base} ${buttons.outline} w-full text-sm`}
                href={secondary}
              >
                {secondaryLabel} ↗
              </ExternalTabAnchor>
            ) : null}
          </>
        ) : (
          <MissingLinkSlot label={WORK_LINK_ACTION_LABELS.system} />
        )}
        {insurer.supportedBrowsers && insurer.supportedBrowsers.length > 0 ? (
          <p className="text-center text-[11px] font-medium text-[#5B6470]">
            (
            {insurer.supportedBrowsers
              .map((b) => (b === "chrome" ? "크롬" : "엣지"))
              .join("/")}{" "}
            권장)
          </p>
        ) : null}
      </section>

      <section className="space-y-2">
        <CardSectionTitle>{WORK_LINK_GROUP_LABELS.official}</CardSectionTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {insurer.officialWebsiteUrl ? (
            <ExternalTabAnchor
              aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.homepage}`}
              className={`${buttons.base} ${buttons.outline} w-full text-sm`}
              href={insurer.officialWebsiteUrl}
            >
              {WORK_LINK_ACTION_LABELS.homepage} ↗
            </ExternalTabAnchor>
          ) : (
            <MissingLinkSlot label={WORK_LINK_ACTION_LABELS.homepage} />
          )}
          {insurer.termsUrl ? (
            <ExternalTabAnchor
              aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.terms}`}
              className={`${buttons.base} ${buttons.outline} w-full text-sm`}
              href={insurer.termsUrl}
            >
              {WORK_LINK_ACTION_LABELS.terms} ↗
            </ExternalTabAnchor>
          ) : disclosure.productDisclosure?.sourceUrl ? (
            <ExternalTabAnchor
              aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.productDisclosure}`}
              className={`${buttons.base} ${buttons.outline} w-full text-sm`}
              href={disclosure.productDisclosure.sourceUrl}
            >
              {WORK_LINK_ACTION_LABELS.productDisclosure} ↗
            </ExternalTabAnchor>
          ) : (
            <MissingLinkSlot label={WORK_LINK_ACTION_LABELS.productDisclosure} />
          )}
        </div>
        {disclosureState === "partial" ? (
          <p className="text-[11px] font-medium leading-5 text-[#5B6470]">
            {WORK_LINK_COPY.disclosureUnverified}
          </p>
        ) : null}
        <Link
          className={`${buttons.base} ${buttons.ghost} w-full text-xs`}
          href="/disclosure-links"
        >
          {WORK_LINK_ACTION_LABELS.disclosureHub}
        </Link>
      </section>

      <section className="space-y-2">
        <CardSectionTitle>{WORK_LINK_GROUP_LABELS.support}</CardSectionTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          <PhoneActionButton
            label={WORK_LINK_ACTION_LABELS.customerCenter}
            phone={insurer.customerCenterPhone}
          />
          <PhoneActionButton
            label={WORK_LINK_ACTION_LABELS.helpdesk}
            phone={insurer.helpdeskPhone}
          />
        </div>
      </section>
    </div>
  );
}
