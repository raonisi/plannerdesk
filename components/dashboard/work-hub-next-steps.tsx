import Link from "next/link";
import { WORK_HUB_LINKS } from "@/lib/dashboard/work-hub-copy";
import { sectionEyebrow } from "@/lib/design-system";

export function WorkHubNextSteps({
  className = "mt-6",
  title = "업무 흐름별 바로가기",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <p className={sectionEyebrow}>{title}</p>
      <ul className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {WORK_HUB_LINKS.map((hub) => (
          <li key={hub.href}>
            <Link
              href={hub.href}
              className="flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-[#E3DED4] bg-white px-4 py-3 shadow-sm transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
            >
              <span className="text-sm font-bold text-[#0F1D2E]">{hub.label}</span>
              <span className="mt-1 text-xs text-[#5B6470]">{hub.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
