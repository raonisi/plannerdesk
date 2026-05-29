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
  workTools: "업무 도구",
  claim: "청구서류",
  disclosure: "공시·약관",
  message: "고객 문구",
  findMessage: "문구 찾기",
  mainMenu: "주요 메뉴",
  mobileMenu: "모바일 주요 메뉴",
};

const navItems = [
  { label: label.directory, shortLabel: label.directoryShort, href: "/directory" },
  { label: label.workTools, shortLabel: label.workTools, href: "/work-tools" },
  { label: label.claim, shortLabel: label.claim, href: "/claim-documents" },
  { label: label.disclosure, shortLabel: label.disclosure, href: "/disclosure-links" },
  { label: label.message, shortLabel: label.message, href: "/message-templates" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          className="flex min-w-0 shrink-0 items-center gap-3 transition-transform hover:scale-105"
          href="/"
          aria-label="플래너데스크 홈"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-sm font-black tracking-[0.02em] text-white shadow-md shadow-indigo-600/20">
            PD
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-tight text-slate-900 sm:text-xl tracking-tight">
              {label.brand}
            </span>
            <span className="block break-keep text-xs font-semibold leading-5 text-slate-500">
              {label.tagline}
            </span>
          </span>
        </Link>

        <nav
          aria-label={label.mainMenu}
          className="hidden items-center gap-1.5 text-sm font-bold text-slate-600 lg:flex"
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
          className="hidden min-h-10 items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-bold !text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
          href="/message-templates"
          style={{ color: "white" }}
        >
          {label.findMessage}
        </Link>
      </div>

      <nav
        aria-label={label.mobileMenu}
        className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white/50 px-5 py-3 text-sm font-bold text-slate-600 lg:hidden"
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
      className={`whitespace-nowrap rounded-full px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        isActive
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        isActive
          ? "border-slate-900 bg-slate-900 !text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
