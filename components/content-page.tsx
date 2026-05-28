import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { VerificationStatus } from "@/lib/content";
import { externalLinkTabProps } from "@/lib/ui/external-link";
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
  missing: "공식 확인 후 업데이트 예정",
  emptyTitle: "조건에 맞는 항목이 없습니다.",
  emptyDescription:
    "검색어를 줄이거나 필터를 변경해 주세요.",
  officialSource: "공식 출처 열기",
  lastVerified: "최근 검수",
  safetyTitle: "검수 및 안전 안내",
  generalSafety:
    "이 MVP는 필요한 경우 초안 placeholder 데이터를 사용합니다. 공식 링크, 연락처, 팩스번호, 주소, 서류 기준은 공개 전 공식 출처 확인이 필요합니다.",
  messageSafety:
    "메시지 템플릿은 실무 참고용 초안입니다. 발송 전 고객 상황, 상품 기준, 보험사 기준에 맞게 검토하고 수정해야 합니다.",
  noPayoutJudge:
    "플래너데스크는 보험금 지급 여부를 판단하지 않습니다.",
  noPayoutEstimate:
    "플래너데스크는 보험금 지급 금액을 산정하지 않습니다.",
  noAdjusting:
    "플래너데스크는 손해사정 업무를 수행하지 않습니다.",
  noMedicalDocs:
    "현재 MVP에서는 고객 의료서류를 처리하지 않습니다.",
  referenceOnly:
    "본 자료는 실무 참고와 업무 정리를 위한 용도입니다.",
  directory: "보험사 바로가기",
  claim: "청구서류",
  disclosure: "공시·약관",
  message: "고객 문구"
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
    <ExternalTabAnchor
      className="font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
      href={href}
    >
      {children}
    </ExternalTabAnchor>
  );
}

export function ExternalTabAnchor({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">) {
  return (
    <a className={className} href={href} {...externalLinkTabProps} {...rest}>
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
