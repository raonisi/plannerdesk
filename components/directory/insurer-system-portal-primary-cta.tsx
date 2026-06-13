"use client";

import { ExternalTabAnchor } from "@/components/content-page";
import { DIRECTORY_SYSTEM_PORTAL_UNAVAILABLE_LABEL } from "@/lib/directory/directory-workbench-copy";
import {
  insurerWorkbenchSystemPortalDisabled,
  insurerWorkbenchSystemPrimaryCta,
} from "@/lib/directory/insurer-workbench-ui";
import { resolveSystemLinks } from "@/lib/directory/work-links";
import type { PublicInsurer } from "@/lib/public/insurers";

type InsurerSystemPortalPrimaryCtaProps = {
  insurer: PublicInsurer;
  className?: string;
};

export function InsurerSystemPortalPrimaryCta({
  insurer,
  className = "",
}: InsurerSystemPortalPrimaryCtaProps) {
  const systemLinks = resolveSystemLinks(insurer);

  if (systemLinks.primary) {
    return (
      <ExternalTabAnchor
        aria-label={`${insurer.name} 전산 바로가기`}
        className={`${insurerWorkbenchSystemPrimaryCta} ${className}`.trim()}
        href={systemLinks.primary}
      >
        <span>전산 바로가기</span>
        <span aria-hidden="true" className="ml-auto text-xs opacity-80">
          ↗
        </span>
      </ExternalTabAnchor>
    );
  }

  return (
    <div
      aria-disabled="true"
      aria-label={`${insurer.name} ${DIRECTORY_SYSTEM_PORTAL_UNAVAILABLE_LABEL}`}
      className={`${insurerWorkbenchSystemPortalDisabled} ${className}`.trim()}
      role="status"
    >
      {DIRECTORY_SYSTEM_PORTAL_UNAVAILABLE_LABEL}
    </div>
  );
}
