"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const label = {
  brand: "플래너데스크",
  tagline: "보험설계사의 실무 포털",
  home: "홈",
  directory: "보험사 바로가기",
  directoryShort: "보험사",
  claim: "청구서류",
  disclosure: "공시·약관",
  message: "고객 문구",
  findMessage: "문구 찾기",
  mainMenu: "주요 메뉴",
  mobileMenu: "모바일 주요 메뉴",
};

const navItems = [
  { label: label.directory, shortLabel: label.directoryShort, href: "/directory" },
  { label: label.claim, shortLabel: label.claim, href: "/claim-documents" },
  { label: label.disclosure, shortLabel: label.disclosure, href: "/disclosure-links" },
  { label: label.message, shortLabel: label.message, href: "/message-templates" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[#d9c9a8] bg-[#fbf7ee]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          className="flex min-w-0 shrink-0 items-center gap-3"
          href="/"
          aria-label="플래너데스크 홈"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d6b06b] bg-[#102235] text-sm font-black tracking-[0.02em] text-[#fbf7ee] shadow-[0_10px_22px_rgba(16,34,53,0.16)]">
            PD
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold leading-tight text-[#102235] sm:text-xl">
              {label.brand}
            </span>
            <span className="block break-keep text-xs font-medium leading-5 text-[#5f6670]">
              {label.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label={label.mainMenu}
          className="hidden items-center gap-1 text-sm font-semibold text-[#303845] lg:flex"
        >
          {navItems.map((item) => (
            <NavLink
              href={item.href}
              isActive={pathname === item.href}
              key={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          className="hidden min-h-10 items-center justify-center rounded-full border border-[#102235] px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#102235] hover:text-[#fbf7ee] sm:inline-flex"
          href="/message-templates"
        >
          {label.findMessage}
        </Link>
      </div>

      <nav
        aria-label={label.mobileMenu}
        className="flex gap-2 overflow-x-auto border-t border-[#e6d8bd] px-5 py-3 text-sm font-semibold text-[#303845] lg:hidden"
      >
        <MobileNavLink href="/" isActive={pathname === "/"}>
          {label.home}
        </MobileNavLink>
        {navItems.map((item) => (
          <MobileNavLink
            href={item.href}
            isActive={pathname === item.href}
            key={item.href}
          >
            {item.shortLabel}
          </MobileNavLink>
        ))}
      </nav>
    </header>
  );
}

function NavLink({
  children,
  href,
  isActive,
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`whitespace-nowrap rounded-full px-3 py-2 transition focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden ${
        isActive
          ? "bg-[#234b3b] !text-[#f7f3e8]"
          : "!text-[#10243e] hover:bg-[#f4efe5] hover:!text-[#10243e]"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  children,
  href,
  isActive,
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-2 transition focus-visible:ring-2 focus-visible:ring-[#b8924a] focus-visible:outline-hidden ${
        isActive
          ? "border-[#234b3b] bg-[#234b3b] !text-[#f7f3e8]"
          : "border-[#d9c9a8] bg-white !text-[#10243e] hover:border-[#b8924a] hover:bg-[#f4efe5] hover:!text-[#10243e]"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
