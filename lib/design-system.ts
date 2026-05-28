import type { VerificationStatus } from "@/lib/content";

export const colors = {
  navy: "#0f172a",       // slate-900
  deepGreen: "#3730a3",  // indigo-800
  ivory: "#f8fafc",      // slate-50
  cream: "#f1f5f9",      // slate-100
  border: "#e2e8f0",     // slate-200
  gold: "#4f46e5",       // indigo-600
  deepGray: "#334155",   // slate-700
  bodyGray: "#64748b"    // slate-500
} as const;

export const surfaces = {
  page: "bg-slate-50 text-slate-900",
  hero: "bg-slate-900 text-white",
  card: "bg-white",
  inset: "bg-slate-50",
  muted: "bg-slate-100"
} as const;

export const borders = {
  default: "border border-slate-200",
  subtle: "border border-slate-100",
  divider: "border-slate-200"
} as const;

export const shadows = {
  card: "shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
  elevated: "shadow-lg"
} as const;

export const textStyles = {
  eyebrow:
    "text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600",
  heroEyebrow:
    "inline-flex border border-indigo-500/50 px-3 py-1 text-sm font-medium text-indigo-200",
  heroTitle: "text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-white",
  sectionTitle: "text-3xl font-bold leading-tight text-slate-900 sm:text-4xl",
  cardTitle: "text-2xl font-bold text-slate-900",
  body: "text-base leading-7 text-slate-600",
  small: "text-sm leading-6 text-slate-500",
  label: "text-sm font-bold text-slate-900",
  accent: "text-sm font-bold text-indigo-600"
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
  verified: "검수 완료",
  needs_review: "검수 필요"
};

export const statusBadgeClasses: Record<VerificationStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-500 rounded-md",
  verified: "border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md",
  needs_review: "border-amber-200 bg-amber-50 text-amber-700 rounded-md"
};
