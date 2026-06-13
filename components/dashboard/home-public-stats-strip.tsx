import { PUBLIC_WORK_HUB_VISIBILITY_NOTICE } from "@/lib/dashboard/work-hub-copy";
import { sectionEyebrow, textStyles } from "@/lib/design-system";

export type HomePublicStats = {
  insurerCount: number;
  claimDocumentCount: number;
  knowledgeArticleCount: number;
};

export function HomePublicStatsStrip({ stats }: { stats: HomePublicStats }) {
  const items = [
    { label: "공개 보험사", value: stats.insurerCount },
    { label: "공개 청구서류", value: stats.claimDocumentCount },
    { label: "공개 지식", value: stats.knowledgeArticleCount },
  ];

  return (
    <section
      className="mt-6 rounded-xl border border-[#E3DED4] bg-white/80 px-4 py-4 sm:px-5"
      aria-label="공개 콘텐츠 요약"
    >
      <p className={sectionEyebrow}>공개 콘텐츠 요약</p>
      <div className="mt-3 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[#E3DED4]/80 bg-[#F7F4EE] px-3 py-2.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#5B6470]">
              {item.label}
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-[#0F1D2E]">
              {item.value}
              <span className="ml-1 text-xs font-semibold text-[#5B6470]">건</span>
            </p>
          </div>
        ))}
      </div>
      <p className={`mt-3 break-keep ${textStyles.small}`}>{PUBLIC_WORK_HUB_VISIBILITY_NOTICE}</p>
    </section>
  );
}
