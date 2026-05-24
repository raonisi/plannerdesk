import Link from "next/link";

const navItems = [
  { label: "업무 모듈", href: "#modules" },
  { label: "로드맵", href: "#roadmap" },
  { label: "보안 원칙", href: "#security" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d9c9a8] bg-[#fbf7ee]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link className="text-xl font-semibold text-[#102235]" href="/">
          플래너데스크
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#303845] sm:flex">
          {navItems.map((item) => (
            <a key={item.label} className="transition hover:text-[#7a612d]" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className="inline-flex items-center justify-center border border-[#102235] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#102235] hover:text-[#fbf7ee]"
          href="mailto:hello@plannerdesk.app"
        >
          문의
        </a>
      </div>
    </header>
  );
}
