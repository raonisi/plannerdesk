import Link from "next/link";
import type { AdminDashboardSnapshot } from "@/lib/admin/dashboard-status";
import {
  ADMIN_OPS_REPORT_AA_NOTICE,
  ADMIN_OPS_REPORT_DOMAINS,
  ADMIN_OPS_REPORT_INTRO,
  ADMIN_OPS_REPORT_MANUAL_NOTICE,
  ADMIN_OPS_REPORT_PUBLIC_BOUNDARY,
  ADMIN_OPS_REPORT_STATUS_LABELS,
} from "@/lib/admin/operations-report-copy";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

export default function AdminOperationsReportPanel({
  dashboard,
}: {
  dashboard: AdminDashboardSnapshot;
}) {
  const { reviewQueue, summary } = dashboard;

  return (
    <section
      className="mb-8"
      aria-labelledby="admin-ops-report"
    >
      <h2
        id="admin-ops-report"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        운영 리포트 기준
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{ADMIN_OPS_REPORT_INTRO}</p>
      <p className={`mb-4 max-w-3xl text-xs text-[#4f5661]`}>
        {ADMIN_OPS_REPORT_MANUAL_NOTICE}
      </p>

      <div
        className={`mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 ${shadows.card}`}
      >
        <SnapshotHint
          label="기능 운영 중"
          value={summary.active}
        />
        <SnapshotHint
          label="기능 확인 필요"
          value={summary.activeWithWarning}
        />
        <SnapshotHint
          label="신규 정정 제보"
          value={reviewQueue.correctionNew}
        />
        <SnapshotHint
          label="검증 대기"
          value={reviewQueue.plannerVerificationPending}
        />
      </div>
      <p className="mb-4 text-xs text-[#4f5661]">
        위 숫자는 관리 데스크 스냅샷 참고용이며 월간 리포트 본문을 대체하지 않습니다.
      </p>

      <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2 font-semibold text-[#102235]">영역</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">확인 목적</th>
              <th className="hidden px-3 py-2 font-semibold text-[#102235] sm:table-cell">
                상태 (수동)
              </th>
              <th className="px-3 py-2 font-semibold text-[#102235]">관리·문서</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_OPS_REPORT_DOMAINS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-3 font-semibold text-[#102235]">
                  {row.label}
                </td>
                <td className="px-3 py-3 text-[#4f5661]">{row.purpose}</td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <span className="text-xs text-[#5f6670]">
                    {ADMIN_OPS_REPORT_STATUS_LABELS.slice(0, 3).join(" · ")} …
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <Link
                      className="inline-flex min-h-9 w-fit items-center text-xs font-semibold text-[#aa8137] underline decoration-[#d9c9a8] underline-offset-2"
                      href={row.adminHref}
                    >
                      관리 화면
                    </Link>
                    <span className="text-[10px] text-[#5f6670]">
                      {DOC_BASE}
                      {row.docAnchor}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 space-y-2 rounded-lg px-4 py-3 ${surfaces.muted}`}>
        <p className="text-xs text-[#4f5661]">{ADMIN_OPS_REPORT_PUBLIC_BOUNDARY}</p>
        <p className="text-xs text-[#4f5661]">{ADMIN_OPS_REPORT_AA_NOTICE}</p>
        <p className="text-xs text-[#4f5661]">
          월간 본문 템플릿:{" "}
          <span className="font-mono text-[10px]">docs/PR-136-REPORT-TEMPLATE.md</span>
          {" · "}
          <span className="font-mono text-[10px]">docs/PR-130-MONTHLY-REPORT-TEMPLATE.md</span>
        </p>
      </div>
    </section>
  );
}

function SnapshotHint({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg border border-[#d6d8dc] bg-white px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-[#102235]">
        {value === null ? "—" : value}
      </p>
    </div>
  );
}
