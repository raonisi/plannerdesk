import { uiLabels } from "@/lib/ui-labels";

export type PublicNavItem = {
  label: string;
  href: string;
};

/** Desktop horizontal nav (lg+). Includes integrated search. */
export const desktopNavItems: readonly PublicNavItem[] = [
  { label: "통합 검색", href: "/search" },
  { label: "보험사 바로가기", href: "/directory" },
  { label: uiLabels.workTools, href: "/work-tools" },
  { label: "청구서류", href: "/claim-documents" },
  { label: uiLabels.disclosure, href: "/disclosure-links" },
  { label: uiLabels.customerMessages, href: "/message-templates" },
];

/** Mobile drawer quick-action chips. */
export const mobileDrawerQuickActions: readonly PublicNavItem[] = [
  { label: "보험사 바로가기", href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: "고객 문구", href: "/message-templates" },
  { label: uiLabels.workTools, href: "/work-tools" },
];

export type MobileNavGroup = {
  title: string;
  items: readonly PublicNavItem[];
};

/** Mobile drawer grouped navigation. */
export const mobileDrawerGroups: readonly MobileNavGroup[] = [
  {
    title: "주요 업무",
    items: [
      { label: "홈", href: "/" },
      { label: "보험사 바로가기", href: "/directory" },
      { label: uiLabels.workTools, href: "/work-tools" },
    ],
  },
  {
    title: "청구·자료",
    items: [
      { label: "청구서류", href: "/claim-documents" },
      { label: uiLabels.disclosure, href: "/disclosure-links" },
    ],
  },
  {
    title: "고객 응대",
    items: [{ label: "고객 문구", href: "/message-templates" }],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}
