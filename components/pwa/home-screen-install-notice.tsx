import {
  PWA_INSTALL_AUTH_NOTICE,
  PWA_INSTALL_HOW_TO_HINT,
  PWA_INSTALL_NO_OFFLINE_NOTICE,
  PWA_INSTALL_NOTICE_BODY,
  PWA_INSTALL_NOTICE_TITLE,
  PWA_INSTALL_PII_NOTICE,
  PWA_INSTALL_PLANNER_REPEAT_HINT,
} from "@/lib/pwa/install-ux-copy";
import { notices, surfaces, spacing, textStyles } from "@/lib/design-system";

export function HomeScreenInstallNotice({
  variant = "public",
  className = "",
}: {
  variant?: "public" | "planner";
  className?: string;
}) {
  return (
    <details
      className={`group ${surfaces.card} ${spacing.cardPadding} ${className}`.trim()}
    >
      <summary className="cursor-pointer list-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={notices.safetyTitle}>{PWA_INSTALL_NOTICE_TITLE}</p>
            <p className={`mt-1 break-keep ${textStyles.small}`}>
              {PWA_INSTALL_NOTICE_BODY}
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
            펼치기
          </span>
          <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
            접기
          </span>
        </div>
      </summary>
      <ul
        className={`mt-4 space-y-2 border-t border-[#E3DED4] pt-4 break-keep ${textStyles.small}`}
      >
        <li>{PWA_INSTALL_HOW_TO_HINT}</li>
        <li>{PWA_INSTALL_AUTH_NOTICE}</li>
        <li>{PWA_INSTALL_PII_NOTICE}</li>
        <li>{PWA_INSTALL_NO_OFFLINE_NOTICE}</li>
        {variant === "planner" ? (
          <li>{PWA_INSTALL_PLANNER_REPEAT_HINT}</li>
        ) : null}
      </ul>
    </details>
  );
}
