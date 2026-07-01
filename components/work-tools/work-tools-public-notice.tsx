import {
  WORK_TOOLS_PUBLIC_ADMIN_NOTICE,
  WORK_TOOLS_PUBLIC_COMPLETION_NOTICE,
  WORK_TOOLS_PUBLIC_OPEN_SUMMARY,
  WORK_TOOLS_PUBLIC_SCOPE_NOTICE,
  WORK_TOOLS_PUBLIC_PII_NOTICE,
  WORK_TOOLS_PUBLIC_REFERENCE_NOTICE,
  WORK_TOOLS_PUBLIC_FRESHNESS_NOTICE,
} from "@/lib/work-tools/work-tools-public-copy";
import { CollapsibleNotice } from "@/components/content-page";

export function WorkToolsPublicNotice() {
  return (
    <CollapsibleNotice
      title="공개 참고 도구 안내"
      summary={WORK_TOOLS_PUBLIC_OPEN_SUMMARY}
    >
      <ul className="space-y-2 list-inside list-disc text-[#3D4A57]">
        <li>{WORK_TOOLS_PUBLIC_COMPLETION_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_ADMIN_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_SCOPE_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_PII_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_REFERENCE_NOTICE}</li>
        <li>{WORK_TOOLS_PUBLIC_FRESHNESS_NOTICE}</li>
      </ul>
    </CollapsibleNotice>
  );
}
