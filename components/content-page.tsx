import Link from "next/link";
import type { ReactNode } from "react";
import type { VerificationStatus } from "@/lib/content";
import {
  borders,
  shadows,
  spacing,
  statusBadgeClasses,
  surfaces,
  textStyles,
  verificationLabels
} from "@/lib/design-system";

const uiText = {
  missing: "\uacf5\uc2dd \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8 \uc608\uc815",
  emptyTitle: "\uc870\uac74\uc5d0 \ub9de\ub294 \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  emptyDescription:
    "\uac80\uc0c9\uc5b4\ub97c \uc904\uc774\uac70\ub098 \ud544\ud130\ub97c \ubcc0\uacbd\ud574 \uc8fc\uc138\uc694.",
  officialSource: "\uacf5\uc2dd \ucd9c\ucc98 \uc5f4\uae30",
  lastVerified: "\ucd5c\uadfc \uac80\uc218",
  safetyTitle: "\uac80\uc218 \ubc0f \uc548\uc804 \uc548\ub0b4",
  generalSafety:
    "\uc774 MVP\ub294 \ud544\uc694\ud55c \uacbd\uc6b0 \ucd08\uc548 placeholder \ub370\uc774\ud130\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4. \uacf5\uc2dd \ub9c1\ud06c, \uc5f0\ub77d\ucc98, \ud329\uc2a4\ubc88\ud638, \uc8fc\uc18c, \uc11c\ub958 \uae30\uc900\uc740 \uacf5\uac1c \uc804 \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
  messageSafety:
    "\uba54\uc2dc\uc9c0 \ud15c\ud50c\ub9bf\uc740 \uc2e4\ubb34 \ucc38\uace0\uc6a9 \ucd08\uc548\uc785\ub2c8\ub2e4. \ubc1c\uc1a1 \uc804 \uace0\uac1d \uc0c1\ud669, \uc0c1\ud488 \uae30\uc900, \ubcf4\ud5d8\uc0ac \uae30\uc900\uc5d0 \ub9de\uac8c \uac80\ud1a0\ud558\uace0 \uc218\uc815\ud574\uc57c \ud569\ub2c8\ub2e4.",
  noPayoutJudge:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \ubcf4\ud5d8\uae08 \uc9c0\uae09 \uc5ec\ubd80\ub97c \ud310\ub2e8\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noPayoutEstimate:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \ubcf4\ud5d8\uae08 \uc9c0\uae09 \uae08\uc561\uc744 \uc0b0\uc815\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noAdjusting:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \uc190\ud574\uc0ac\uc815 \uc5c5\ubb34\ub97c \uc218\ud589\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noMedicalDocs:
    "\ud604\uc7ac MVP\uc5d0\uc11c\ub294 \uace0\uac1d \uc758\ub8cc\uc11c\ub958\ub97c \ucc98\ub9ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  referenceOnly:
    "\ubcf8 \uc790\ub8cc\ub294 \uc2e4\ubb34 \ucc38\uace0\uc640 \uc5c5\ubb34 \uc815\ub9ac\ub97c \uc704\ud55c \uc6a9\ub3c4\uc785\ub2c8\ub2e4.",
  directory: "\ubcf4\ud5d8\uc0ac \ubc14\ub85c\uac00\uae30",
  claim: "\uccad\uad6c\uc11c\ub958",
  disclosure: "\uacf5\uc2dc\u00b7\uc57d\uad00",
  message: "\uace0\uac1d \ubb38\uad6c"
};

export function PageHero({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className={`border-b ${borders.divider} ${surfaces.hero}`}>
      <div className={`mx-auto max-w-7xl ${spacing.pageX} ${spacing.heroY}`}>
        <p className={textStyles.heroEyebrow}>{eyebrow}</p>
        <h1 className={`mt-4 max-w-4xl break-keep ${textStyles.heroTitle}`}>
          {title}
        </h1>
        <p className="mt-5 max-w-3xl break-keep text-base leading-7 text-[#d8d0c3] sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <main className={`min-h-screen ${surfaces.page}`}>{children}</main>;
}

export function PageShell({ children }: { children: ReactNode }) {
  return <PageFrame>{children}</PageFrame>;
}

export function ContentSection({ children }: { children: ReactNode }) {
  return (
    <section className={`mx-auto max-w-7xl ${spacing.pageX} ${spacing.sectionY}`}>
      {children}
    </section>
  );
}

export function MobileFriendlyPageHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return <PageHero {...props} />;
}

export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className={textStyles.eyebrow}>{eyebrow}</p> : null}
      <h2 className={`mt-2 break-keep ${textStyles.sectionTitle}`}>{title}</h2>
      {description ? (
        <p className={`mt-4 break-keep ${textStyles.body}`}>{description}</p>
      ) : null}
    </div>
  );
}

export function PremiumCard({ children }: { children: ReactNode }) {
  return (
    <article
      className={`${borders.default} ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}
    >
      {children}
    </article>
  );
}

export function ContentGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  return <VerificationStatusBadge status={status} />;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return <VerificationStatusBadge status={status} />;
}

export function VerificationStatusBadge({
  status
}: {
  status: VerificationStatus;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}
    >
      {verificationLabels[status]}
    </span>
  );
}

export function LastVerified({ value }: { value: string | null }) {
  return <LastVerifiedText value={value} />;
}

export function LastVerifiedText({ value }: { value: string | null }) {
  return (
    <span className="whitespace-nowrap text-sm text-[#5f6670]">
      {uiText.lastVerified}: {formatVerifiedDate(value)}
    </span>
  );
}

export function formatVerifiedDate(value: string | null | undefined) {
  if (!value) {
    return uiText.missing;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}

export function EmptyValue({ label = uiText.missing }: { label?: string }) {
  return <MissingFieldText label={label} />;
}

export function MissingFieldText({ label = uiText.missing }: { label?: string }) {
  return <span className="break-keep text-[#8b7660]">{label}</span>;
}

export function EmptyState({
  title = uiText.emptyTitle,
  description = uiText.emptyDescription
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className={`${borders.default} ${surfaces.card} p-6 text-center`}>
      <p className="break-keep text-lg font-semibold text-[#102235]">{title}</p>
      <p className={`mt-2 break-keep ${textStyles.small}`}>{description}</p>
    </div>
  );
}

export function ExternalSourceLink({
  href,
  children = uiText.officialSource
}: {
  href: string | null;
  children?: ReactNode;
}) {
  if (!href) {
    return <MissingFieldText />;
  }

  return (
    <a
      className="font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export function LinkButton({
  href,
  children,
  variant = "outline"
}: {
  href: string;
  children: ReactNode;
  variant?: "outline" | "solid";
}) {
  const className =
    variant === "solid"
      ? "inline-flex min-h-11 items-center justify-center bg-[#aa8137] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58]"
      : "inline-flex min-h-11 items-center justify-center border border-[#102235] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#102235] hover:text-[#fbf7ee]";

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function ActionButton({
  href,
  children,
  variant
}: {
  href: string;
  children: ReactNode;
  variant?: "outline" | "solid";
}) {
  return (
    <LinkButton href={href} variant={variant}>
      {children}
    </LinkButton>
  );
}

export function DraftDataNotice({ children }: { children?: ReactNode }) {
  return (
    <aside className={`${borders.default} ${surfaces.card} p-5`}>
      <p className="text-sm font-semibold text-[#102235]">{uiText.safetyTitle}</p>
      <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
        {children ?? uiText.generalSafety}
      </p>
    </aside>
  );
}

export function OfficialSourceNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="break-keep border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
      {children ?? uiText.generalSafety}
    </p>
  );
}

export function SafetyNotice({
  variant = "general"
}: {
  variant?: "general" | "claim" | "message";
}) {
  const message =
    variant === "message" ? uiText.messageSafety : uiText.generalSafety;

  return (
    <aside className={`${borders.default} ${surfaces.card} p-5`}>
      <p className="text-sm font-semibold text-[#102235]">{uiText.safetyTitle}</p>
      <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
        {message}
      </p>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#4f5661] sm:grid-cols-2">
        <li>{uiText.noPayoutJudge}</li>
        <li>{uiText.noPayoutEstimate}</li>
        <li>{uiText.noAdjusting}</li>
        <li>{uiText.noMedicalDocs}</li>
      </ul>
      {variant === "claim" ? (
        <p className="mt-4 break-keep text-sm font-medium text-[#7a612d]">
          {uiText.referenceOnly}
        </p>
      ) : null}
    </aside>
  );
}

export function RelatedPageLinks() {
  const links = [
    { href: "/directory", label: uiText.directory },
    { href: "/claim-documents", label: uiText.claim },
    { href: "/disclosure-links", label: uiText.disclosure },
    { href: "/message-templates", label: uiText.message }
  ];

  return (
    <div className={`border-y ${borders.divider} ${surfaces.card}`}>
      <div
        className={`mx-auto flex max-w-7xl gap-2 overflow-x-auto ${spacing.pageX} py-4`}
      >
        {links.map((link) => (
          <Link
            className="shrink-0 whitespace-nowrap border border-[#d9c9a8] px-3 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] hover:text-[#7a612d]"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
