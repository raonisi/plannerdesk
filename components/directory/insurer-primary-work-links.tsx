"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { PublicLinkCheckNotice } from "@/components/directory/public-link-check-notice";
import { getDisclosureLinksForInsurer } from "@/lib/content/disclosure-match";
import { publicContentTrustHint } from "@/lib/directory/formatting";
import { telHref } from "@/lib/directory/formatting";
import {
  insurerCardMissingSlot,
  insurerCardOutlineButton,
  insurerCardPrimaryButton,
  insurerCardSectionTitle,
  insurerCardSubtleButton,
  insurerCardTrustNote,
} from "@/lib/directory/insurer-card-ui";
import { publicDisclosureCheckHint } from "@/lib/directory/link-check-status";
import {
  WORK_LINK_ACTION_LABELS,
  WORK_LINK_COPY,
  WORK_LINK_GROUP_LABELS,
  disclosureLinkStatus,
  plannerSystemAccessNote,
  resolveSystemLinks,
} from "@/lib/directory/work-links";
import type { PublicInsurer } from "@/lib/public/insurers";

type InsurerWorkLinkSection = "system" | "official" | "support";

function MissingLinkSlot({
  label,
  hidden = false,
}: {
  label: string;
  hidden?: boolean;
}) {
  if (hidden) return null;

  return (
    <span
      aria-label={`${label} — ${WORK_LINK_COPY.missing}`}
      className={insurerCardMissingSlot}
    >
      {WORK_LINK_COPY.missing}
    </span>
  );
}

function CardSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className={insurerCardSectionTitle}>{children}</h3>;
}

function PhoneActionButton({
  label,
  phone,
  hideMissingSlots = false,
}: {
  label: string;
  phone: string | null;
  hideMissingSlots?: boolean;
}) {
  const href = telHref(phone);

  if (href) {
    return (
      <a
        aria-label={`${label} ${phone}`}
        className={`${insurerCardSubtleButton} break-words whitespace-normal px-3 text-left text-sm`}
        href={href}
      >
        {label}
      </a>
    );
  }

  return <MissingLinkSlot hidden={hideMissingSlots} label={label} />;
}

export function InsurerPrimaryWorkLinks({
  insurer,
  sections = ["system", "official", "support"],
  showTrustHint = true,
  showLinkCheckNotice = true,
  hideMissingSlots = false,
  showActionHints = true,
}: {
  insurer: PublicInsurer;
  sections?: InsurerWorkLinkSection[];
  showTrustHint?: boolean;
  showLinkCheckNotice?: boolean;
  /** Hide placeholder slots such as "공식 확인 후 업데이트 예정" on public directory cards. */
  hideMissingSlots?: boolean;
  showActionHints?: boolean;
}) {
  const { primary, secondary, primaryLabel, secondaryLabel } =
    resolveSystemLinks(insurer);
  const systemNote = plannerSystemAccessNote(primary);
  const disclosure = getDisclosureLinksForInsurer(insurer.id);
  const disclosureState = disclosureLinkStatus(disclosure);

  const trustHint = publicContentTrustHint(insurer.verificationStatus);
  const disclosureHint = publicDisclosureCheckHint(disclosureState);

  const showSystem = sections.includes("system");
  const showOfficial = sections.includes("official");
  const showSupport = sections.includes("support");

  return (
    <div className="space-y-5">
      {showTrustHint && trustHint ? (
        <p className={insurerCardTrustNote}>{trustHint}</p>
      ) : null}

      {showSystem ? (
        <section className="space-y-2">
          <CardSectionTitle>{WORK_LINK_GROUP_LABELS.system}</CardSectionTitle>
          {primary ? (
            <>
              <ExternalTabAnchor
                aria-label={`${insurer.name} ${primaryLabel}`}
                className={insurerCardPrimaryButton}
                href={primary}
              >
                {primaryLabel} ↗
              </ExternalTabAnchor>
              {showActionHints ? (
                <>
                  <p className="text-center text-xs font-medium text-slate-500">
                    {WORK_LINK_COPY.externalOpenHint}
                  </p>
                  {systemNote ? (
                    <p className="text-center text-xs font-medium leading-relaxed text-slate-500">
                      {systemNote}
                    </p>
                  ) : null}
                </>
              ) : null}
              {secondary ? (
                <ExternalTabAnchor
                  aria-label={`${insurer.name} ${secondaryLabel}`}
                  className={insurerCardOutlineButton}
                  href={secondary}
                >
                  {secondaryLabel} ↗
                </ExternalTabAnchor>
              ) : null}
            </>
          ) : (
            <MissingLinkSlot
              hidden={hideMissingSlots}
              label={WORK_LINK_ACTION_LABELS.system}
            />
          )}
          {showActionHints &&
          insurer.supportedBrowsers &&
          insurer.supportedBrowsers.length > 0 ? (
            <p className="text-center text-xs font-medium text-slate-500">
              (
              {insurer.supportedBrowsers
                .map((b) => (b === "chrome" ? "크롬" : "엣지"))
                .join("/")}{" "}
              권장)
            </p>
          ) : null}
        </section>
      ) : null}

      {showSupport ? (
        <section className="space-y-2">
          <CardSectionTitle>{WORK_LINK_GROUP_LABELS.support}</CardSectionTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <PhoneActionButton
              hideMissingSlots={hideMissingSlots}
              label={WORK_LINK_ACTION_LABELS.customerCenter}
              phone={insurer.customerCenterPhone}
            />
            <PhoneActionButton
              hideMissingSlots={hideMissingSlots}
              label={WORK_LINK_ACTION_LABELS.helpdesk}
              phone={insurer.helpdeskPhone}
            />
          </div>
        </section>
      ) : null}

      {showOfficial ? (
        <section className="space-y-2">
          <CardSectionTitle>{WORK_LINK_GROUP_LABELS.official}</CardSectionTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {insurer.officialWebsiteUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.homepage}`}
                className={insurerCardOutlineButton}
                href={insurer.officialWebsiteUrl}
              >
                {WORK_LINK_ACTION_LABELS.homepage} ↗
              </ExternalTabAnchor>
            ) : (
              <MissingLinkSlot
                hidden={hideMissingSlots}
                label={WORK_LINK_ACTION_LABELS.homepage}
              />
            )}
            {insurer.termsUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.terms}`}
                className={insurerCardOutlineButton}
                href={insurer.termsUrl}
              >
                {WORK_LINK_ACTION_LABELS.terms} ↗
              </ExternalTabAnchor>
            ) : disclosure.productDisclosure?.sourceUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.productDisclosure}`}
                className={insurerCardOutlineButton}
                href={disclosure.productDisclosure.sourceUrl}
              >
                {WORK_LINK_ACTION_LABELS.productDisclosure} ↗
              </ExternalTabAnchor>
            ) : (
              <MissingLinkSlot
                hidden={hideMissingSlots}
                label={WORK_LINK_ACTION_LABELS.productDisclosure}
              />
            )}
          </div>
          {showActionHints && disclosureState === "partial" ? (
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              {disclosureHint ?? WORK_LINK_COPY.disclosureUnverified}
            </p>
          ) : null}
          <Link
            className={`${insurerCardSubtleButton} text-sm`}
            href="/disclosure-links"
          >
            {WORK_LINK_ACTION_LABELS.disclosureHub}
          </Link>
        </section>
      ) : null}

      {showLinkCheckNotice && showOfficial ? <PublicLinkCheckNotice /> : null}
    </div>
  );
}
