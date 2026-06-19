import Link from "next/link";
import {
  WORK_TOOLS_PUBLIC_ADMIN_NOTICE,
  WORK_TOOLS_PUBLIC_COMPLETION_NOTICE,
  WORK_TOOLS_PUBLIC_OPEN_SUMMARY,
  WORK_TOOLS_PUBLIC_PII_NOTICE,
  WORK_TOOLS_PUBLIC_REFERENCE_NOTICE,
  WORK_TOOLS_PUBLIC_FRESHNESS_NOTICE,
} from "@/lib/work-tools/work-tools-public-copy";
import { notices, surfaces, spacing, textStyles } from "@/lib/design-system";

export function WorkToolsPublicNotice() {
  return (
    <aside
      aria-label="업무 도구 공개 이용 안내"
      className={`${surfaces.card} ${spacing.cardPadding} space-y-3 border-[#16382C]/10`}
    >
      <p className={notices.safetyTitle}>공개 참고 도구 안내</p>
      <ul className={`space-y-2 ${textStyles.small} text-[#3D4A57]`}>
        <li>{WORK_TOOLS_PUBLIC_OPEN_SUMMARY}</li>
        <li>{WORK_TOOLS_PUBLIC_COMPLETION_NOTICE}</li>
        <li>
          {WORK_TOOLS_PUBLIC_ADMIN_NOTICE}{" "}
          <Link className="font-semibold text-[#16382C] underline-offset-2 hover:underline" href="/admin">
            Admin
          </Link>
        </li>
        <li>{WORK_TOOLS_PUBLIC_PII_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_REFERENCE_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_FRESHNESS_NOTICE}</li>
      </ul>
    </aside>
  );
}
