"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  Home,
  Search,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { buttons } from "@/lib/design-system";
import {
  isNavItemActive,
  mobileQuickTabItems,
} from "@/lib/navigation/public-nav";

const quickTabIcons: Record<(typeof mobileQuickTabItems)[number]["href"], LucideIcon> =
  {
    "/": Home,
    "/directory": Building2,
    "/claim-documents": FileText,
    "/work-tools": Wrench,
    "/search": Search,
  };

export function PublicMobileQuickTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="핵심 업무 빠른 이동"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E3DED4] bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-5">
        {mobileQuickTabItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = quickTabIcons[item.href];

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-center text-[10px] font-bold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F1D2E]/35 sm:text-[11px] ${
                  isActive ? buttons.navActive : buttons.navIdle
                }`}
                href={item.href}
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="max-w-full whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
