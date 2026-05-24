import Link from "next/link";
import type { ReactNode } from "react";
import type { VerificationStatus } from "@/lib/content";

const statusLabels: Record<VerificationStatus, string> = {
  draft: "초안",
  verified: "검증 완료",
  needs_review: "재검토 필요"
};

const statusStyles: Record<VerificationStatus, string> = {
  draft: "border-[#d9c9a8] bg-[#f7f1e5] text-[#7a612d]",
  verified: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  needs_review: "border-[#c5b08a] bg-[#fbf7ee] text-[#5d4630]"
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
    <section className="border-b border-[#d9c9a8] bg-[#102235] text-[#fbf7ee]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
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
    <main className="min-h-screen bg-[#f7f1e5] text-[#18202b]">
      {children}
    </main>
  );
}

export function ContentSection({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
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

export function SafetyNotice({ variant = "general" }: { variant?: "general" | "claim" | "message" }) {
  const message =
    variant === "message"
      ? "메시지 템플릿은 초안이며 사용 전 상황과 고객 맥락에 맞게 검토해야 합니다. 보장, 승인, 지급 결과를 보장하는 표현은 사용할 수 없습니다."
      : "이 MVP는 초안 플레이스홀더 데이터를 사용합니다. 공식 링크, 연락처, 팩스번호, 주소, 문서 링크는 공개 전 반드시 검증해야 합니다.";

  return (
    <aside className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
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
    <div className="border-y border-[#d9c9a8] bg-[#fbf7ee]">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-4 sm:px-8 lg:px-10">
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
