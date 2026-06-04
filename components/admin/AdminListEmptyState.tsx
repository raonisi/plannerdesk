import Link from "next/link";
import { textStyles } from "@/lib/design-system";

export interface AdminListEmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  resetHref?: string;
  resetLabel?: string;
}

export default function AdminListEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  resetHref,
  resetLabel = "필터 초기화",
}: AdminListEmptyStateProps) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-lg font-semibold text-[#102235]">{title}</h2>
      <p className={`${textStyles.body} mt-2`}>{description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F]"
          >
            {actionLabel}
          </Link>
        ) : null}
        {resetHref ? (
          <Link
            href={resetHref}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
          >
            {resetLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
