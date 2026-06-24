import { uiLabels } from "@/lib/ui-labels";

export type PublicNavItem = {
  label: string;
  href: string;
};

/** Desktop horizontal nav (lg+). */
export const desktopNavItems: readonly PublicNavItem[] = [
  { label: uiLabels.insurerPortal, href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: uiLabels.workTools, href: "/work-tools" },
  { label: uiLabels.disclosure, href: "/disclosure-links" },
  { label: uiLabels.customerMessages, href: "/message-templates" },
  { label: uiLabels.knowledgeArchive, href: "/knowledge" },
  { label: uiLabels.unifiedSearch, href: "/search" },
];

/** Mobile drawer quick-action chips. */
export const mobileDrawerQuickActions: readonly PublicNavItem[] = [
  { label: uiLabels.insurerPortal, href: "/directory" },
  { label: "청구서류", href: "/claim-documents" },
  { label: uiLabels.workTools, href: "/work-tools" },
  { label: uiLabels.customerMessages, href: "/message-templates" },
  { label: uiLabels.knowledgeArchive, href: "/knowledge" },
  { label: uiLabels.unifiedSearch, href: "/search" },
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
      { label: uiLabels.insurerPortal, href: "/directory" },
      { label: uiLabels.workTools, href: "/work-tools" },
      { label: uiLabels.unifiedSearch, href: "/search" },
    ],
  },
  {
    title: "청구·자료",
    items: [
      { label: "청구서류", href: "/claim-documents" },
      { label: uiLabels.disclosure, href: "/disclosure-links" },
      { label: uiLabels.knowledgeArchive, href: "/knowledge" },
    ],
  },
  {
    title: "고객 응대",
    items: [{ label: uiLabels.customerMessages, href: "/message-templates" }],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}
