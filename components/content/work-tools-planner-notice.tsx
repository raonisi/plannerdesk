import { WORK_TOOLS_PLANNER_ACCESS_NOTICE } from "@/lib/public/public-ux-copy";

export function WorkToolsPlannerNotice({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={`break-keep text-[#5B6470] ${compact ? "text-xs" : "text-sm"} ${className}`}
    >
      {WORK_TOOLS_PLANNER_ACCESS_NOTICE}
    </p>
  );
}

export function WorkToolsPlannerNoticeCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-h-[5.5rem] flex-col rounded-lg border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4 ${className}`}
    >
      <span className="text-sm font-bold text-[#0F1D2E]">업무 도구</span>
      <WorkToolsPlannerNotice className="mt-1" compact />
    </div>
  );
}
