import {
  getInstallGuideBody,
  getInstallGuidePiiNotice,
  PWA_INSTALL_AUTH_NOTICE,
  PWA_INSTALL_HOW_TO_HINT,
  PWA_INSTALL_MOBILE_HINT,
  PWA_INSTALL_NO_OFFLINE_NOTICE,
  PWA_INSTALL_NOTICE_TITLE,
  PWA_INSTALL_NOTICE_TITLE_COMPACT,
  PWA_INSTALL_PLANNER_ACCESS_NOTICE,
  PWA_INSTALL_PLANNER_REPEAT_HINT,
} from "@/lib/pwa/install-ux-copy";
import { notices, surfaces, spacing, textStyles } from "@/lib/design-system";

export type InstallGuideVariant = "public" | "planner";

export type HomeScreenInstallGuideProps = {
  variant?: InstallGuideVariant;
  compact?: boolean;
  className?: string;
};

/** PR-BS-16 alias — same component as HomeScreenInstallNotice. */
export function HomeScreenInstallGuide(props: HomeScreenInstallGuideProps) {
  return <HomeScreenInstallNotice {...props} />;
}

export function HomeScreenInstallNotice({
  variant = "public",
  compact = false,
  className = "",
}: HomeScreenInstallGuideProps) {
  const title = compact ? PWA_INSTALL_NOTICE_TITLE_COMPACT : PWA_INSTALL_NOTICE_TITLE;
  const body = getInstallGuideBody(variant);
  const piiNotice = getInstallGuidePiiNotice(variant);

  return (
    <details
      className={`group ${surfaces.card} ${compact ? "p-4" : spacing.cardPadding} ${className}`.trim()}
    >
      <summary className="cursor-pointer list-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={compact ? `${textStyles.small} font-bold text-[#0F1D2E]` : notices.safetyTitle}>
              {title}
            </p>
            <p className={`mt-1 break-keep ${textStyles.small}`}>{body}</p>
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
        <li>{PWA_INSTALL_MOBILE_HINT}</li>
        <li>{PWA_INSTALL_AUTH_NOTICE}</li>
        {variant === "planner" ? (
          <>
            <li>{PWA_INSTALL_PLANNER_ACCESS_NOTICE}</li>
            <li>{PWA_INSTALL_PLANNER_REPEAT_HINT}</li>
          </>
        ) : null}
        <li>{piiNotice}</li>
        <li>{PWA_INSTALL_NO_OFFLINE_NOTICE}</li>
      </ul>
    </details>
  );
}
