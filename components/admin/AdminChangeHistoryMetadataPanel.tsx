import {
  CHANGE_HISTORY_LIMITATION_NOTE,
  CHANGE_HISTORY_REASON_GUIDANCE,
  type ChangeHistoryMetadataSnapshot,
} from "@/lib/admin/change-history-metadata";
import { borders, surfaces, textStyles } from "@/lib/design-system";

export default function AdminChangeHistoryMetadataPanel({
  snapshot,
}: {
  snapshot: ChangeHistoryMetadataSnapshot;
}) {
  return (
    <section
      className={`mb-5 rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-4 py-4 sm:px-5 ${borders.default}`}
      aria-labelledby="admin-change-history-metadata"
    >
      <h2
        id="admin-change-history-metadata"
        className="text-sm font-bold text-[#102235]"
      >
        운영 메타데이터 · {snapshot.entityTypeLabel}
      </h2>
      <p className={`mt-2 ${textStyles.small}`}>{CHANGE_HISTORY_LIMITATION_NOTE}</p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {snapshot.rows.map((row) => (
          <div
            key={row.label}
            className="min-w-0 rounded-md border border-[#d6d8dc]/80 bg-white px-3 py-2.5"
          >
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[#5f6670]">
              {row.label}
            </dt>
            <dd className="mt-1 break-keep text-sm font-medium text-[#102235]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className={`mt-4 ${textStyles.small}`}>{CHANGE_HISTORY_REASON_GUIDANCE}</p>
      <p className="mt-2 text-[10px] text-[#5f6670]">
        내부 ID: {snapshot.entityId.slice(0, 8)}… (관리자 전용 · public 미노출)
      </p>
    </section>
  );
}
