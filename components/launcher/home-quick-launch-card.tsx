import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttons, shadows } from "@/lib/design-system";

export function HomeQuickLaunchCard({
  href,
  title,
  description,
  actionLabel,
  icon: Icon,
  iconToneClass,
  emphasis = "default",
}: {
  href: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  iconToneClass: string;
  emphasis?: "primary" | "default";
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card} transition hover:-translate-y-0.5 hover:border-[#B9975B]`}
    >
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border ${iconToneClass}`}
      >
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#0F1D2E]">{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-[#4A5565]">
        {description}
      </p>
      <Link
        className={`mt-5 w-full ${buttons.base} ${
          emphasis === "primary" ? buttons.primary : buttons.secondary
        }`}
        href={href}
      >
        {actionLabel}
      </Link>
    </article>
  );
}
