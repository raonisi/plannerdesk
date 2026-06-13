import type { VerificationStatus } from "@/lib/content";

export const colors = {
  navy: "#0F1D2E",       // 딥 네이비
  deepGreen: "#16382C",  // 차분한 그린
  ivory: "#F8F7F3",      // 아이보리
  cream: "#F7F4EE",      // 아이보리 2
  border: "#E3DED4",     // 테두리
  gold: "#B9975B",       // 절제된 골드 포인트
  deepGray: "#17202A",   // 메인 텍스트
  bodyGray: "#5B6470"    // 서브 텍스트
} as const;

export const surfaces = {
  page: "bg-[#F8F7F3] text-[#17202A]",
  hero: "bg-[#0F1D2E] text-white",
  card: "bg-white border border-[#E3DED4] rounded-xl shadow-sm",
  inset: "bg-[#F7F4EE]",
  muted: "bg-slate-100"
} as const;

export const borders = {
  default: "border border-[#E3DED4]",
  subtle: "border border-slate-100",
  divider: "border-[#E3DED4]"
} as const;

export const shadows = {
  card: "shadow-[0_4px_20px_rgba(15,29,46,0.04)] transition-all hover:shadow-[0_10px_30px_rgba(15,29,46,0.08)] hover:-translate-y-0.5",
  elevated: "shadow-[0_15px_40px_rgba(15,29,46,0.12)]"
} as const;

export const sectionEyebrow =
  "text-[11px] font-bold tracking-[0.12em] text-[#B9975B]";

export const textStyles = {
  eyebrow: sectionEyebrow,
  heroEyebrow:
    "inline-flex border border-[#B9975B]/40 px-3 py-1 text-sm font-medium text-[#F7F4EE]/90 rounded-md bg-[#F7F4EE]/5",
  heroTitle: "text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-white tracking-tight",
  sectionTitle: "text-3xl font-bold leading-tight text-[#0F1D2E] sm:text-4xl tracking-tight",
  cardTitle: "text-2xl font-bold text-[#0F1D2E]",
  body: "text-base leading-7 text-[#5B6470]",
  small: "text-sm leading-6 text-[#5B6470]",
  label: "text-sm font-bold text-[#17202A]",
  accent: "text-sm font-bold text-[#B9975B]"
} as const;

export const spacing = {
  pageX: "px-5 sm:px-8 lg:px-10",
  sectionY: "py-10",
  heroY: "py-12 sm:py-16",
  cardPadding: "p-6",
  stack: "space-y-8"
} as const;

export const verificationLabels: Record<VerificationStatus, string> = {
  draft: "초안",
  verified: "공식 확인",
  needs_review: "검수 대기"
};

export const statusBadgeClasses: Record<VerificationStatus, string> = {
  draft: "border-[#E3DED4] bg-slate-50 text-slate-500 rounded-md text-xs px-2 py-0.5",
  verified: "border-emerald-200 bg-emerald-50 text-emerald-800 rounded-md text-xs px-2 py-0.5",
  needs_review: "border-amber-200 bg-amber-50 text-amber-700 rounded-md text-xs px-2 py-0.5"
};

const buttonFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2";

export const buttons = {
  base: `inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2 text-sm font-bold transition-all ${buttonFocus}`,
  primary: `bg-[#0F1D2E] text-white shadow-sm hover:bg-[#17202A] hover:shadow-md`,
  secondary: `bg-[#16382C] text-white shadow-sm hover:bg-[#1f4a3b] hover:shadow-md`,
  outline: `border border-[#E3DED4] bg-white text-[#0F1D2E] shadow-sm hover:border-[#B9975B] hover:bg-[#F7F4EE]`,
  ghost: `text-[#5B6470] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]`,
  navActive: "bg-[#F7F4EE] text-[#0F1D2E]",
  navIdle: "text-[#5B6470] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]",
  mobileActive: "border-[#0F1D2E] bg-[#0F1D2E] !text-white shadow-sm",
  mobileIdle:
    "border-[#E3DED4] bg-white text-[#5B6470] hover:border-[#B9975B] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]"
} as const;

/** Shared 44px touch targets for mobile field usability (PR-BS-30). */
export const touchTargets = {
  minHeight: "min-h-11",
  minSquare: "min-h-11 min-w-11",
  iconButton: `inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg ${buttonFocus}`,
  paginationButton:
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-xs font-semibold transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
} as const;

export const notices = {
  box: "rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-5 sm:p-6 shadow-sm",
  boxTitle: "text-sm font-bold text-[#0F1D2E]",
  boxBody: "mt-2 break-keep text-sm leading-relaxed text-[#5B6470]",
  safety: "rounded-xl border-l-4 border-[#B9975B] bg-[#F7F4EE] p-5 sm:p-6 shadow-sm",
  safetyTitle: "text-sm font-bold text-[#0F1D2E]",
  safetyBody: "mt-2 break-keep text-sm leading-relaxed text-[#5B6470]"
} as const;

export const launcherIconTone = {
  navy: "text-[#0F1D2E] bg-[#F7F4EE] border-[#E3DED4]",
  green: "text-[#16382C] bg-emerald-50/80 border-emerald-100",
  gold: "text-[#7a612d] bg-amber-50/70 border-amber-100"
} as const;
