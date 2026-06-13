import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  formatVerifiedDate as formatVerifiedDateValue,
} from "@/lib/public/data-freshness";
import type { VerificationStatus } from "@/lib/content";
import {
  externalLinkAriaLabel,
  externalLinkTabProps,
} from "@/lib/ui/external-link";
import {
  borders,
  buttons,
  notices,
  sectionEyebrow,
  shadows,
  spacing,
  statusBadgeClasses,
  surfaces,
  textStyles,
  verificationLabels
} from "@/lib/design-system";

const uiText = {
  missing: "준비 중",
  emptyTitle: "조건에 맞는 항목이 없습니다.",
  emptyDescription:
    "검색어를 줄이거나 필터를 변경해 주세요.",
  officialSource: "공식 출처 열기",
  lastVerified: "최근 확인일",
  safetyTitle: "안전 안내",
  generalSafety:
    "일부 항목은 준비 중일 수 있습니다. 공식 링크, 연락처, 팩스번호, 주소, 서류 기준은 고객 안내 전 공식 출처를 확인해 주세요.",
  messageSafety:
    "메시지 템플릿은 실무 참고용 초안입니다. 발송 전 고객 상황, 상품 기준, 보험사 기준에 맞게 검토하고 수정해야 합니다.",
  noPayoutJudge:
    "플래너데스크는 보험금 지급 여부를 판단하지 않습니다.",
  noPayoutEstimate:
    "플래너데스크는 보험금 지급 금액을 산정하지 않습니다.",
  noAdjusting:
    "플래너데스크는 손해사정 업무를 수행하지 않습니다.",
  noMedicalDocs:
    "고객 의료서류를 수집·저장하지 않습니다.",
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
        <h1 className={`mt-6 max-w-4xl break-keep tracking-tight ${textStyles.heroTitle}`}>
          {title}
        </h1>
        <p className="mt-6 max-w-3xl break-keep text-lg leading-relaxed text-slate-300 sm:text-xl">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className={`min-h-screen overflow-x-hidden ${surfaces.page}`}>{children}</div>;
}

export function PageShell({ children }: { children: ReactNode }) {
  return <main className={`min-h-screen ${surfaces.page}`}>{children}</main>;
}

export function ContentSection({ children }: { children: ReactNode }) {
  return (
    <section
      className={`mx-auto max-w-7xl min-w-0 ${spacing.pageX} ${spacing.sectionY} pb-14 sm:pb-16`}
    >
      {children}
    </section>
  );
}

export function WorkflowStepsSection({
  eyebrow = "설계사 실무 흐름",
  title,
  steps,
  columnsClass = "sm:grid-cols-2 lg:grid-cols-4"
}: {
  eyebrow?: string;
  title: string;
  steps: string[];
  columnsClass?: string;
}) {
  return (
    <section className={`${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}>
      <p className={sectionEyebrow}>{eyebrow}</p>
      <h2 className={`mt-2 break-keep text-base font-bold text-[#0F1D2E] sm:text-lg`}>
        {title}
      </h2>
      <div className={`mt-5 grid gap-4 ${columnsClass}`}>
        {steps.map((step, index) => (
          <div
            className="rounded-lg border border-[#E3DED4] bg-[#F8F7F3] p-4"
            key={step}
          >
            <p className={sectionEyebrow}>{index + 1}단계</p>
            <p className={`mt-2 break-keep text-xs font-semibold leading-relaxed text-[#5B6470]`}>
              {step}
            </p>
          </div>
        ))}
      </div>
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
    <span className="whitespace-nowrap text-sm font-medium text-slate-500">
      {uiText.lastVerified}: {formatVerifiedDate(value)}
    </span>
  );
}

export function formatVerifiedDate(value: string | null | undefined) {
  return formatVerifiedDateValue(value);
}

export function EmptyValue({ label = uiText.missing }: { label?: string }) {
  return <MissingFieldText label={label} />;
}

export function MissingFieldText({ label = uiText.missing }: { label?: string }) {
  return <span className="break-keep text-slate-400 font-medium italic">{label}</span>;
}

export function EmptyState({
  title = uiText.emptyTitle,
  description = uiText.emptyDescription
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[#E3DED4] bg-[#F7F4EE] p-8 text-center sm:p-10`}
      role="status"
    >
      <p className="break-keep text-lg font-bold text-[#0F1D2E] sm:text-xl">{title}</p>
      <p className={`mt-3 break-keep ${textStyles.small}`}>{description}</p>
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
      className="font-bold text-[#16382C] underline decoration-[#B9975B]/50 underline-offset-4 transition-colors hover:text-[#0F1D2E] hover:decoration-[#B9975B]"
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
  "aria-label": ariaLabel,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">) {
  const resolvedAriaLabel =
    ariaLabel ??
    (typeof children === "string"
      ? externalLinkAriaLabel(children)
      : externalLinkAriaLabel(uiText.officialSource));

  return (
    <a
      aria-label={resolvedAriaLabel}
      className={className}
      href={href}
      {...externalLinkTabProps}
      {...rest}
    >
      {children}
    </a>
  );
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

function buttonClassName(variant: ButtonVariant) {
  const map: Record<ButtonVariant, string> = {
    primary: `${buttons.base} ${buttons.primary}`,
    secondary: `${buttons.base} ${buttons.secondary}`,
    outline: `${buttons.base} ${buttons.outline}`,
    ghost: `${buttons.base} ${buttons.ghost}`
  };
  return map[variant];
}

export function LinkButton({
  href,
  children,
  variant = "outline"
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant | "solid";
}) {
  const resolved: ButtonVariant =
    variant === "solid" ? "primary" : variant;

  return (
    <Link className={buttonClassName(resolved)} href={href}>
      {children}
    </Link>
  );
}

export function ActionButton({
  href,
  children,
  variant = "outline"
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant | "solid";
}) {
  return (
    <LinkButton href={href} variant={variant}>
      {children}
    </LinkButton>
  );
}

export function PrimaryButton(
  props: Omit<Parameters<typeof LinkButton>[0], "variant">
) {
  return <LinkButton {...props} variant="primary" />;
}

export function SecondaryButton(
  props: Omit<Parameters<typeof LinkButton>[0], "variant">
) {
  return <LinkButton {...props} variant="secondary" />;
}

export function OutlineButton(
  props: Omit<Parameters<typeof LinkButton>[0], "variant">
) {
  return <LinkButton {...props} variant="outline" />;
}

export function GhostButton(
  props: Omit<Parameters<typeof LinkButton>[0], "variant">
) {
  return <LinkButton {...props} variant="ghost" />;
}

export function ExternalLinkButton({
  href,
  children = uiText.officialSource,
  className = ""
}: {
  href: string | null;
  children?: ReactNode;
  className?: string;
}) {
  if (!href) {
    return <MissingFieldText />;
  }

  return (
    <ExternalTabAnchor
      className={`${buttonClassName("outline")} ${className}`.trim()}
      href={href}
    >
      {children}
    </ExternalTabAnchor>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  onClear,
  className = "",
  id,
  ariaLabel
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className={`flex min-h-12 min-w-0 items-center rounded-xl border border-[#E3DED4] bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-[#B9975B]/40 ${className}`.trim()}
    >
      <input
        aria-label={ariaLabel ?? placeholder}
        className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#17202A] outline-none placeholder:text-[#5B6470] focus-visible:outline-none"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value && onClear ? (
        <button
          aria-label="검색어 지우기"
          className="ml-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[#5B6470] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
          onClick={onClear}
          type="button"
        >
          지우기
        </button>
      ) : null}
    </div>
  );
}

export function QuickActionCard({
  href,
  title,
  description,
  iconToneClass = "text-[#16382C] bg-emerald-50/80 border-emerald-100"
}: {
  href: string;
  title: string;
  description: string;
  iconToneClass?: string;
}) {
  return (
    <Link
      className={`flex flex-col rounded-xl border border-[#E3DED4] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#B9975B] hover:shadow-md ${shadows.card}`}
      href={href}
    >
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${iconToneClass}`}
        aria-hidden
      />
      <h3 className="mt-4 text-sm font-bold text-[#0F1D2E]">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-[#5B6470]">{description}</p>
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className={`${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}>
      <p className={sectionEyebrow}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F1D2E]">{value}</p>
      {hint ? <p className={`mt-2 ${textStyles.small}`}>{hint}</p> : null}
    </article>
  );
}

export function FeatureCard({
  title,
  description,
  href,
  actionLabel = "바로가기"
}: {
  title: string;
  description: string;
  href: string;
  actionLabel?: string;
}) {
  return (
    <PremiumCard>
      <h3 className={textStyles.cardTitle}>{title}</h3>
      <p className={`mt-3 ${textStyles.body}`}>{description}</p>
      <div className="mt-5">
        <OutlineButton href={href}>{actionLabel}</OutlineButton>
      </div>
    </PremiumCard>
  );
}

export function NoticeBox({
  title,
  children
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={notices.box}>
      <p className={notices.boxTitle}>{title ?? uiText.safetyTitle}</p>
      <div className={notices.boxBody}>{children}</div>
    </aside>
  );
}

export function CollapsibleNotice({
  title,
  summary,
  children,
  defaultOpen = false
}: {
  title: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={`group ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}
      open={defaultOpen}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={notices.safetyTitle}>{title}</p>
            <p className={`mt-1 ${textStyles.small}`}>{summary}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
            펼치기
          </span>
          <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
            접기
          </span>
        </div>
      </summary>
      <div className={`mt-4 border-t border-[#E3DED4] pt-4 ${textStyles.small}`}>
        {children}
      </div>
    </details>
  );
}

export function DraftDataNotice({ children }: { children?: ReactNode }) {
  return (
    <NoticeBox title="안내">
      <p>{children ?? uiText.generalSafety}</p>
    </NoticeBox>
  );
}

export function OfficialSourceNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="break-keep border-l-2 border-[#B9975B] pl-4 text-sm font-medium leading-relaxed text-[#5B6470]">
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
    <aside className={notices.safety}>
      <p className={notices.safetyTitle}>{uiText.safetyTitle}</p>
      <p className={`${notices.safetyBody} font-medium`}>{message}</p>
      <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-[#5B6470] sm:grid-cols-2 list-inside list-disc">
        <li>{uiText.noPayoutJudge}</li>
        <li>{uiText.noPayoutEstimate}</li>
        <li>{uiText.noAdjusting}</li>
        <li>{uiText.noMedicalDocs}</li>
      </ul>
      {variant === "claim" ? (
        <p className="mt-4 break-keep text-sm font-bold text-[#0F1D2E]">
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
        className={`mx-auto flex max-w-7xl flex-wrap gap-2 ${spacing.pageX} py-4`}
      >
        {links.map((link) => (
          <Link
            className={`shrink-0 whitespace-nowrap ${buttons.base} ${buttons.outline} px-4`}
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
