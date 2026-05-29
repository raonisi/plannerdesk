"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { buttons } from "@/lib/design-system";
import { uiLabels } from "@/lib/ui-labels";

const navItems = [
  { label: "보험사 바로가기", shortLabel: "보험사", href: "/directory" },
  { label: uiLabels.workTools, shortLabel: uiLabels.workTools, href: "/work-tools" },
  { label: "청구서류", shortLabel: "청구서류", href: "/claim-documents" },
  { label: uiLabels.disclosure, shortLabel: uiLabels.disclosure, href: "/disclosure-links" },
  { label: uiLabels.customerMessages, shortLabel: "고객 문구", href: "/message-templates" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[#E3DED4] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          aria-label={`${uiLabels.brand} 홈`}
          className="flex min-w-0 shrink-0 items-center gap-3 transition-transform hover:scale-[1.02]"
          href="/"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0F1D2E] text-sm font-black tracking-[0.02em] text-white shadow-md shadow-[#0F1D2E]/15">
            PD
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-tight text-[#0F1D2E] sm:text-xl tracking-tight">
              {uiLabels.brand}
            </span>
            <span className="block break-keep text-xs font-semibold leading-5 text-[#5B6470]">
              {uiLabels.brandTagline}
            </span>
          </span>
        </Link>

        <MainNavigation pathname={pathname} />

        <Link
          className={`hidden min-h-10 sm:inline-flex ${buttons.base} ${buttons.primary} rounded-full px-5`}
          href="/message-templates"
        >
          {uiLabels.findMessage}
        </Link>
      </div>

      <MobileNavigation pathname={pathname} />
    </header>
  );
}

export function MainNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label={uiLabels.mainMenu}
      className="hidden items-center gap-1.5 text-sm font-bold lg:flex"
    >
      {navItems.map((item) => (
        <NavLink href={item.href} isActive={pathname === item.href} key={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label={uiLabels.mobileMenu}
      className="flex gap-2 overflow-x-auto border-t border-[#E3DED4] bg-[#F8F7F3]/80 px-5 py-3 text-sm font-bold lg:hidden"
    >
      <MobileNavLink href="/" isActive={pathname === "/"}>
        홈
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
      className={`whitespace-nowrap rounded-full px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
        isActive ? buttons.navActive : buttons.navIdle
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
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
        isActive ? buttons.mobileActive : buttons.mobileIdle
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}
