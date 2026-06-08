import Link from "next/link";
import {
  PUBLIC_UX_ACCESS_RESTRICTED_BODY,
  PUBLIC_UX_ACCESS_RESTRICTED_TITLE,
} from "@/lib/public/public-ux-copy";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

export function AccessRestrictedPanel({
  title = PUBLIC_UX_ACCESS_RESTRICTED_TITLE,
  description,
  homeHref = "/",
}: {
  title?: string;
  description?: string;
  homeHref?: string;
}) {
  return (
    <main className={`min-h-[60vh] flex items-center justify-center ${surfaces.page} px-4 py-10`}>
      <div
        className={`max-w-md w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}
      >
        <div className="h-1.5 bg-[#aa8137]" />
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-[#102235]">{title}</h1>
          <p className={`mt-4 ${textStyles.body} text-sm break-keep`}>
            {description ?? PUBLIC_UX_ACCESS_RESTRICTED_BODY}
          </p>
          <Link
            href={homeHref}
            className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#10243e] px-4 text-sm font-semibold text-[#f7f3e8] transition hover:bg-[#17324f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8924a]"
          >
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
