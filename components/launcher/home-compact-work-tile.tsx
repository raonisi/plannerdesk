import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function HomeCompactWorkTile({
  href,
  title,
  description,
  icon: Icon,
  iconToneClass,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconToneClass: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex min-h-[4.25rem] items-center gap-3 rounded-xl border border-[#E3DED4] bg-white px-4 py-3 shadow-sm transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
    >
      <div
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconToneClass}`}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#0F1D2E]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#5B6470]">
          {description}
        </p>
      </div>
      <ArrowRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-[#B9975B] opacity-70 transition group-hover:opacity-100"
      />
    </Link>
  );
}
