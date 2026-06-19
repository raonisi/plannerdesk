import { PUBLIC_HOME_FRESHNESS_NOTICE } from "@/lib/public/freshness";
import { PUBLIC_WORK_HUB_VISIBILITY_NOTICE } from "@/lib/dashboard/work-hub-copy";
import {
  HOME_DATA_STATUS_COPY,
  type HomeLoadState,
  type HomePublicStats,
} from "@/lib/dashboard/home-data-state";
import { sectionEyebrow, textStyles } from "@/lib/design-system";

export type { HomePublicStats } from "@/lib/dashboard/home-data-state";

function renderStatValue(value: HomePublicStats["insurers"]) {
  if (value.kind === "unavailable") {
    return (
      <p className="mt-0.5 text-sm font-semibold leading-snug text-[#4A5565]">
        {HOME_DATA_STATUS_COPY.statUnavailable}
      </p>
    );
  }

  return (
    <p className="mt-0.5 text-xl font-bold tabular-nums text-[#0F1D2E]">
      {value.value}
      <span className="ml-1 text-xs font-semibold text-[#4A5565]">건</span>
    </p>
  );
}

export function HomePublicStatsStrip({
  stats,
  loadState,
}: {
  stats: HomePublicStats;
  loadState: HomeLoadState;
}) {
  if (loadState === "error") {
    return (
      <section
        className="mt-6 rounded-xl border border-[#e8c4c4] bg-white/80 px-4 py-4 sm:px-5"
        aria-label="공개 콘텐츠 요약"
      >
        <p className={sectionEyebrow}>공개 콘텐츠 요약</p>
        <p className="mt-3 break-keep text-sm font-semibold text-[#4A5565]">
          {HOME_DATA_STATUS_COPY.statUnavailable}
        </p>
        <p className={`mt-2 break-keep ${textStyles.small}`}>
          {HOME_DATA_STATUS_COPY.errorDescription}
        </p>
      </section>
    );
  }

  const items = [
    { key: "insurers" as const, label: "공개 보험사", value: stats.insurers },
    {
      key: "claimDocuments" as const,
      label: "공개 청구서류",
      value: stats.claimDocuments,
    },
    {
      key: "disclosureLinks" as const,
      label: "공시·약관",
      value: stats.disclosureLinks,
    },
    {
      key: "messageTemplates" as const,
      label: "고객 문구",
      value: stats.messageTemplates,
    },
    { key: "workTools" as const, label: "업무 도구", value: stats.workTools },
    { key: "knowledge" as const, label: "공개 지식", value: stats.knowledge },
  ];

  return (
    <section
      className="mt-6 rounded-xl border border-[#E3DED4] bg-white/80 px-4 py-4 sm:px-5"
      aria-label="공개 콘텐츠 요약"
    >
      <p className={sectionEyebrow}>공개 콘텐츠 요약</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-[#E3DED4]/80 bg-[#F7F4EE] px-3 py-2.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#4A5565]">
              {item.label}
            </p>
            {renderStatValue(item.value)}
          </div>
        ))}
      </div>
      <p className={`mt-3 break-keep ${textStyles.small}`}>
        {PUBLIC_WORK_HUB_VISIBILITY_NOTICE}
      </p>
      <p className={`mt-2 break-keep text-[11px] leading-relaxed text-[#4A5565]`}>
        {PUBLIC_HOME_FRESHNESS_NOTICE}
      </p>
    </section>
  );
}
