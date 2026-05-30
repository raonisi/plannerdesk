import {
  ADMIN_PAGE_STATE_COPY,
  type AdminPageStateKind,
} from "@/lib/admin/dashboard-status";
import { borders, surfaces } from "@/lib/design-system";

const toneClass: Record<AdminPageStateKind, string> = {
  empty: "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]",
  setupRequired: "border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]",
  comingSoon: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
  error: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
};

export default function AdminPageStateNotice({
  kind,
  detail,
  className = "",
}: {
  kind: AdminPageStateKind;
  detail?: string;
  className?: string;
}) {
  const copy = ADMIN_PAGE_STATE_COPY[kind];

  return (
    <div
      className={`rounded-lg border px-4 py-4 ${toneClass[kind]} ${surfaces.card} ${borders.default} ${className}`}
      role="status"
    >
      <p className="text-sm font-semibold">{copy.title}</p>
      <p className="mt-2 text-xs leading-relaxed opacity-90">{copy.body}</p>
      {detail ? (
        <p className="mt-2 text-xs leading-relaxed font-medium">{detail}</p>
      ) : null}
    </div>
  );
}
