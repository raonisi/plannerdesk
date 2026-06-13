"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/navigation/mobile-nav-drawer";
import { buttons } from "@/lib/design-system";
import { desktopNavItems, isNavItemActive } from "@/lib/navigation/public-nav";
import { uiLabels } from "@/lib/ui-labels";

export { MobileNavigation } from "@/components/navigation/mobile-nav-drawer";
export { desktopNavItems as navItems, isNavItemActive } from "@/lib/navigation/public-nav";

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

        <div className="flex shrink-0 items-center gap-2">
          <Link
            className={`hidden min-h-10 sm:inline-flex ${buttons.base} ${buttons.primary} rounded-full px-5`}
            href="/message-templates"
          >
            {uiLabels.findMessage}
          </Link>
          <MobileNavigation pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

export function MainNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label={uiLabels.mainMenu}
      className="hidden items-center gap-1.5 text-sm font-bold lg:flex"
    >
      {desktopNavItems.map((item) => (
        <NavLink
          href={item.href}
          isActive={isNavItemActive(pathname, item.href)}
          key={item.href}
        >
          {item.label}
        </NavLink>
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
