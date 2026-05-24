import type { VerificationStatus } from "@/lib/content";

export const colors = {
  navy: "#102235",
  deepGreen: "#173f36",
  ivory: "#fbf7ee",
  cream: "#f7f1e5",
  border: "#d9c9a8",
  gold: "#aa8137",
  deepGray: "#303845",
  bodyGray: "#4f5661"
} as const;

export const surfaces = {
  page: "bg-[#f7f1e5] text-[#18202b]",
  hero: "bg-[#102235] text-[#fbf7ee]",
  card: "bg-[#fbf7ee]",
  inset: "bg-white",
  muted: "bg-[#f7f1e5]"
} as const;

export const borders = {
  default: "border border-[#d9c9a8]",
  subtle: "border border-[#e3d5b8]",
  divider: "border-[#d9c9a8]"
} as const;

export const shadows = {
  card: "shadow-[0_18px_40px_rgba(16,34,53,0.05)]",
  elevated: "shadow-[0_30px_80px_rgba(16,34,53,0.12)]"
} as const;

export const textStyles = {
  eyebrow:
    "text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]",
  heroEyebrow:
    "text-sm font-semibold uppercase tracking-[0.14em] text-[#d8c08f]",
  heroTitle: "text-4xl font-semibold leading-tight sm:text-5xl",
  sectionTitle: "text-3xl font-semibold leading-tight text-[#102235] sm:text-4xl",
  cardTitle: "text-2xl font-semibold text-[#102235]",
  body: "text-base leading-7 text-[#4f5661]",
  small: "text-sm leading-6 text-[#4f5661]",
  label: "text-sm font-semibold text-[#303845]",
  accent: "text-sm font-semibold text-[#7a612d]"
} as const;

export const spacing = {
  pageX: "px-5 sm:px-8 lg:px-10",
  sectionY: "py-10",
  heroY: "py-12",
  cardPadding: "p-6",
  stack: "space-y-8"
} as const;

export const verificationLabels: Record<VerificationStatus, string> = {
  draft: "초안",
  verified: "검수 완료",
  needs_review: "검수 필요"
};

export const statusBadgeClasses: Record<VerificationStatus, string> = {
  draft: "border-[#d9c9a8] bg-[#f7f1e5] text-[#7a612d]",
  verified: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  needs_review: "border-[#c5b08a] bg-[#fbf7ee] text-[#5d4630]"
};
