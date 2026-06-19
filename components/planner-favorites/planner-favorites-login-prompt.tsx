import Link from "next/link";
import { getAdminSignInHref } from "@/lib/auth/env";
import { PLANNER_FAVORITES_LOGIN_PROMPT } from "@/lib/planner-favorites/copy";
import { textStyles } from "@/lib/design-system";

export function PlannerFavoritesLoginPrompt({
  callbackPath = "/",
  compact = false,
  className = "",
}: {
  callbackPath?: string;
  compact?: boolean;
  className?: string;
}) {
  const signInHref = getAdminSignInHref(callbackPath);

  if (compact) {
    return (
      <Link
        className={`inline-flex min-h-9 items-center rounded-md border border-[#E3DED4] bg-white px-2.5 text-[11px] font-semibold text-[#4A5565] transition hover:border-[#B9975B] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 ${className}`}
        href={signInHref}
      >
        로그인 후 저장
      </Link>
    );
  }

  return (
    <div
      className={`rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4 ${className}`}
    >
      <p className={`break-keep font-semibold text-[#0F1D2E] ${textStyles.small}`}>
        설계사 업무 즐겨찾기
      </p>
      <p className={`mt-1 break-keep ${textStyles.small}`}>
        {PLANNER_FAVORITES_LOGIN_PROMPT}
      </p>
      <Link
        className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#0F1D2E] px-4 text-sm font-semibold text-white transition hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
        href={signInHref}
      >
        로그인하고 즐겨찾기 사용
      </Link>
    </div>
  );
}
