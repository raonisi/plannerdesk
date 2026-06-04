import Link from "next/link";
import type { AdminDashboardSnapshot } from "@/lib/admin/dashboard-status";
import {
  ADMIN_OPS_REMINDER_FORBIDDEN_CONTENT,
  ADMIN_OPS_REMINDER_INTRO,
  ADMIN_OPS_REMINDER_MANUAL_NOTICE,
  ADMIN_OPS_REMINDER_PUBLIC_BOUNDARY,
  ADMIN_OPS_REMINDER_ROWS,
  AUTOMATION_DEFERRED_ITEMS,
  REMINDER_SEVERITY_LABEL,
  REMINDER_STATUS_VALUES,
  type ReminderSeverity,
} from "@/lib/admin/operations-reminder-copy";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const SEVERITY_TONE: Record<
  ReminderSeverity,
  string
> = {
  critical: "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]",
  high: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  medium: "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]",
  low: "border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]",
};

export default function AdminOperationsReminderPanel({
  dashboard,
}: {
  dashboard: AdminDashboardSnapshot;
}) {
  const { reviewQueue } = dashboard;
  const criticalCount = ADMIN_OPS_REMINDER_ROWS.filter(
    (r) => r.severity === "critical",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-ops-reminders">
      <h2
        id="admin-ops-reminders"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        운영 리마인더 (수동 확인)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{ADMIN_OPS_REMINDER_INTRO}</p>
      <p className={`mb-4 max-w-3xl text-xs text-[#4f5661]`}>
        {ADMIN_OPS_REMINDER_MANUAL_NOTICE}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QueueHint label="신규 정정 제보" value={reviewQueue.correctionNew} />
        <QueueHint label="검증 대기" value={reviewQueue.plannerVerificationPending} />
        <div className="rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8b2e2e]">
            Critical 리마인더 항목
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#102235]">
            {criticalCount}
          </p>
          <p className="mt-1 text-[10px] text-[#4f5661]">체크리스트 기준 (자동 집계 아님)</p>
        </div>
        <div className="rounded-lg border border-[#d6d8dc] bg-white px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
            상태값 (수동)
          </p>
          <p className="mt-1 text-xs text-[#102235]">
            {REMINDER_STATUS_VALUES.slice(0, 4).join(" · ")} …
          </p>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2 font-semibold text-[#102235]">항목</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">심각도</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">주기</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">확인</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_OPS_REMINDER_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-[#102235]">{row.label}</p>
                  <p className="mt-0.5 text-xs text-[#4f5661]">{row.description}</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_TONE[row.severity]}`}
                  >
                    {REMINDER_SEVERITY_LABEL[row.severity]}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-[#4f5661]">{row.cadence}</td>
                <td className="px-3 py-3">
                  <Link
                    className="inline-flex min-h-9 items-center text-xs font-semibold text-[#aa8137] underline decoration-[#d9c9a8] underline-offset-2"
                    href={row.adminHref}
                  >
                    관리 화면
                  </Link>
                  <p className="mt-1 font-mono text-[10px] text-[#5f6670]">
                    {DOC_BASE}
                    {row.docAnchor}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className={`mt-4 rounded-lg border ${borders.default} bg-[#f7f4ee] px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          자동화는 별도 PR (PR138-A에서 미도입)
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {AUTOMATION_DEFERRED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-[#5f6670]">
          docs/PR-138-B-NOTIFICATION-AUTOMATION-DESIGN.md
        </p>
      </details>

      <div className={`mt-4 space-y-2 rounded-lg px-4 py-3 ${shadows.card} border ${borders.default} bg-white`}>
        <p className="text-xs text-[#4f5661]">{ADMIN_OPS_REMINDER_PUBLIC_BOUNDARY}</p>
        <p className="text-xs text-[#4f5661]">{ADMIN_OPS_REMINDER_FORBIDDEN_CONTENT}</p>
      </div>
    </section>
  );
}

function QueueHint({
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
