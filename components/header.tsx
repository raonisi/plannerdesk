import Link from "next/link";

const navItems = [
  { label: "홈", href: "/" },
  { label: "보험사", href: "/directory" },
  { label: "청구 서류", href: "/claim-documents" },
  { label: "공시 링크", href: "/disclosure-links" },
  { label: "메시지", href: "/message-templates" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d9c9a8] bg-[#fbf7ee]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link className="text-xl font-semibold text-[#102235]" href="/">
          플래너데스크
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#303845] md:flex">
          {navItems.map((item) => (
            <Link key={item.label} className="transition hover:text-[#7a612d]" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          className="inline-flex items-center justify-center border border-[#102235] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#102235] hover:text-[#fbf7ee]"
          href="mailto:hello@plannerdesk.app"
        >
          문의
        </a>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-[#e6d8bd] px-5 py-3 text-sm font-medium text-[#303845] md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.label}
            className="shrink-0 border border-[#d9c9a8] px-3 py-2 transition hover:border-[#aa8137] hover:text-[#7a612d]"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
