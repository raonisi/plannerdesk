"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buttons, touchTargets } from "@/lib/design-system";
import {
  isNavItemActive,
  mobileDrawerGroups,
  mobileDrawerQuickActions,
} from "@/lib/navigation/public-nav";
import { uiLabels } from "@/lib/ui-labels";

const DRAWER_ID = "mobile-nav-drawer-panel";

const drawerFooterNotices = [
  "개인정보와 의료자료는 입력하지 마세요.",
  "보험금 지급 판단·금액 산정 기능을 제공하지 않습니다.",
] as const;

export function MobileNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const titleId = useId();

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDrawer, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
      return;
    }
    if (wasOpenRef.current) {
      menuButtonRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={menuButtonRef}
        aria-controls={DRAWER_ID}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={uiLabels.mobileMenuOpen}
        className={`${touchTargets.iconButton} border border-[#E3DED4] bg-white text-[#0F1D2E] shadow-sm`}
        onClick={openDrawer}
        type="button"
      >
        <MenuIcon />
      </button>

      {open ? (
        <>
          <button
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-[#0F1D2E]/40 backdrop-blur-[1px]"
            onClick={closeDrawer}
            tabIndex={-1}
            type="button"
          />

          <aside
            aria-labelledby={titleId}
            aria-modal="true"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(360px,100vw)] flex-col border-l border-[#E3DED4] bg-white shadow-2xl"
            id={DRAWER_ID}
            role="dialog"
          >
            <DrawerHeader
              closeButtonRef={closeButtonRef}
              onClose={closeDrawer}
              titleId={titleId}
            />

            <nav
              aria-label={uiLabels.mobileMenu}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-4"
            >
              <section aria-label="빠른 이동" className="mb-6">
                <h3 className="mb-3 text-xs font-bold tracking-wide text-[#4A5565]">
                  빠른 이동
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {mobileDrawerQuickActions.map((item) => (
                    <QuickActionLink
                      href={item.href}
                      isActive={isNavItemActive(pathname, item.href)}
                      key={item.href}
                      onNavigate={closeDrawer}
                    >
                      {item.label}
                    </QuickActionLink>
                  ))}
                </div>
              </section>

              {mobileDrawerGroups.map((group) => (
                <section className="mb-6" key={group.title}>
                  <h3 className="mb-2 text-xs font-bold tracking-wide text-[#4A5565]">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <DrawerNavLink
                          href={item.href}
                          isActive={isNavItemActive(pathname, item.href)}
                          onNavigate={closeDrawer}
                        >
                          {item.label}
                        </DrawerNavLink>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>

            <footer className="border-t border-[#E3DED4] bg-[#F8F7F3] px-5 py-4">
              {drawerFooterNotices.map((line) => (
                <p
                  className="break-keep text-xs leading-relaxed text-[#4A5565]"
                  key={line}
                >
                  {line}
                </p>
              ))}
            </footer>
          </aside>
        </>
      ) : null}
    </div>
  );
}

function DrawerHeader({
  closeButtonRef,
  onClose,
  titleId,
}: {
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  titleId: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#E3DED4] px-5 py-4">
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight text-[#0F1D2E]" id={titleId}>
          {uiLabels.brand}
        </p>
        <p className="mt-1 break-keep text-xs font-semibold leading-5 text-[#4A5565]">
          {uiLabels.brandTagline}
        </p>
      </div>
      <button
        ref={closeButtonRef}
        aria-label={uiLabels.mobileMenuClose}
        className={`${touchTargets.iconButton} shrink-0 text-[#4A5565] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]`}
        onClick={onClose}
        type="button"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function QuickActionLink({
  children,
  href,
  isActive,
  onNavigate,
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-bold leading-snug transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 ${
        isActive ? buttons.mobileActive : buttons.mobileIdle
      }`}
      href={href}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}

function DrawerNavLink({
  children,
  href,
  isActive,
  onNavigate,
}: {
  children: ReactNode;
  href: string;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 ${
        isActive ? buttons.navActive : buttons.navIdle
      }`}
      href={href}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
