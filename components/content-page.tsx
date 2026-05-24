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
        <p className={textStyles.heroEyebrow}>
          {eyebrow}
        </p>
        <h1 className={`mt-4 max-w-4xl ${textStyles.heroTitle}`}>
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#d8d0c3] sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <main className={`min-h-screen ${surfaces.page}`}>
      {children}
    </main>
  );
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
      <h2 className={`mt-2 ${textStyles.sectionTitle}`}>{title}</h2>
      {description ? (
        <p className={`mt-4 ${textStyles.body}`}>{description}</p>
      ) : null}
    </div>
  );
}

export function PremiumCard({ children }: { children: ReactNode }) {
  return (
    <article className={`${borders.default} ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}>
      {children}
    </article>
  );
}

export function ContentGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}
    >
      {verificationLabels[status]}
    </span>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return <StatusBadge status={status} />;
}

export function LastVerified({ value }: { value: string | null }) {
  return (
    <span className="whitespace-nowrap text-sm text-[#5f6670]">
      최종 확인: {value ?? "미검증"}
    </span>
  );
}

export function EmptyValue({ label = "공개 전 확인 필요" }: { label?: string }) {
  return <span className="text-[#8b7660]">{label}</span>;
}

export function EmptyState({
  title = "준비 중입니다",
  description = "공식 출처 검증 후 공개할 예정입니다."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className={`${borders.default} ${surfaces.card} p-6 text-center`}>
      <p className="text-lg font-semibold text-[#102235]">{title}</p>
      <p className={`mt-2 ${textStyles.small}`}>{description}</p>
    </div>
  );
}

export function ExternalSourceLink({
  href,
  children = "공식 링크"
}: {
  href: string | null;
  children?: ReactNode;
}) {
  if (!href) {
    return <EmptyValue label="링크 미검증" />;
  }

  return (
    <a
      className="font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4"
      href={href}
      rel="noreferrer"
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
      ? "inline-flex items-center justify-center bg-[#aa8137] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#c19b58]"
      : "inline-flex items-center justify-center border border-[#102235] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#102235] hover:text-[#fbf7ee]";

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

export function SafetyNotice({ variant = "general" }: { variant?: "general" | "claim" | "message" }) {
  const message =
    variant === "message"
      ? "메시지 템플릿은 초안이며 사용 전 상황과 고객 맥락에 맞게 검토해야 합니다. 보장, 승인, 지급 결과를 보장하는 표현은 사용할 수 없습니다."
      : "이 MVP는 초안 플레이스홀더 데이터를 사용합니다. 공식 링크, 연락처, 팩스번호, 주소, 문서 링크는 공개 전 반드시 검증해야 합니다.";

  return (
    <aside className={`${borders.default} ${surfaces.card} p-5`}>
      <p className="text-sm font-semibold text-[#102235]">검증 및 안전 안내</p>
      <p className="mt-3 text-sm leading-6 text-[#4f5661]">{message}</p>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#4f5661] sm:grid-cols-2">
        <li>PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.</li>
        <li>PlannerDesk는 보험금 액수를 추정하지 않습니다.</li>
        <li>PlannerDesk는 손해사정 업무를 수행하지 않습니다.</li>
        <li>PlannerDesk는 이 MVP에서 고객 의료 문서를 처리하지 않습니다.</li>
      </ul>
      {variant === "claim" ? (
        <p className="mt-4 text-sm font-medium text-[#7a612d]">
          청구 관련 정보는 실무 참고용이며 보험사 공식 안내가 우선합니다.
        </p>
      ) : null}
    </aside>
  );
}

export function RelatedPageLinks() {
  const links = [
    { href: "/directory", label: "보험사 디렉터리" },
    { href: "/claim-documents", label: "청구 서류" },
    { href: "/disclosure-links", label: "공시 링크" },
    { href: "/message-templates", label: "메시지 템플릿" }
  ];

  return (
    <div className={`border-y ${borders.divider} ${surfaces.card}`}>
      <div className={`mx-auto flex max-w-7xl gap-2 overflow-x-auto ${spacing.pageX} py-4`}>
        {links.map((link) => (
          <Link
            key={link.href}
            className="shrink-0 border border-[#d9c9a8] px-3 py-2 text-sm font-semibold text-[#303845] transition hover:border-[#aa8137] hover:text-[#7a612d]"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
