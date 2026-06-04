import Link from "next/link";

const HUB_LINKS = [
  { label: "보험사 디렉터리", href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: "지식 아카이브", href: "/knowledge" },
  { label: "통합 검색", href: "/search" },
  { label: "공시·약관", href: "/disclosure-links" },
  { label: "고객문구", href: "/message-templates" },
] as const;

export function BrowseNextSteps({
  className = "mt-4",
  title = "다음에 확인할 수 있는 메뉴",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <p className="text-xs font-semibold text-[#102235]">{title}</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {HUB_LINKS.map((hub) => (
          <li key={hub.href}>
            <Link
              className="text-sm font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7a612d]"
              href={hub.href}
            >
              {hub.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
