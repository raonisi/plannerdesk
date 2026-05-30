import { STATIC_CONTENT_ADMIN_NOTICE } from "@/lib/admin/static-content-guard";
import { borders, surfaces } from "@/lib/design-system";

export default function AdminStaticContentNotice({
  dbPrLabel,
}: {
  dbPrLabel: string;
}) {
  return (
    <div
      className={`mb-5 rounded-lg border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 ${surfaces.card} ${borders.default}`}
    >
      <p className="text-sm font-semibold text-[#7b5b19]">정적 데이터 관리 모드</p>
      <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">
        {STATIC_CONTENT_ADMIN_NOTICE}
      </p>
      <p className="mt-2 text-xs text-[#4f5661]">
        DB 연동 예정: <span className="font-semibold text-[#102235]">{dbPrLabel}</span>
      </p>
    </div>
  );
}
