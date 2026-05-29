import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { shadows } from "@/lib/design-system";

export function HomeMiniToolCard({
  href,
  title,
  description,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex min-h-[104px] flex-col justify-between rounded-xl border border-[#E3DED4] bg-white p-4 ${shadows.card} transition hover:border-[#B9975B] hover:shadow-[0_8px_24px_rgba(15,29,46,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2`}
    >
      <div>
        <h3 className="text-sm font-bold text-[#0F1D2E]">{title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5B6470]">
          {description}
        </p>
      </div>
      <span className="mt-3 inline-flex min-h-9 items-center gap-1 text-xs font-bold text-[#16382C] group-hover:text-[#0F1D2E]">
        바로가기
        <ArrowRight aria-hidden className="h-3.5 w-3.5 text-[#B9975B]" />
      </span>
    </Link>
  );
}
