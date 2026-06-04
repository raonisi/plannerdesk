import Link from "next/link";
import type { AdminReviewQueueSummary } from "@/lib/admin/dashboard-status";
import {
  ADMIN_OPS_ISSUES_NOTE,
  ADMIN_REVIEW_QUEUE_INTRO,
} from "@/lib/dashboard/work-hub-copy";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

function QueueStat({
  label,
  value,
  href,
  actionLabel,
}: {
  label: string;
  value: number | null;
  href: string;
  actionLabel: string;
}) {
  const display = value === null ? "—" : String(value);

  return (
    <div
      className={`rounded-lg border border-[#d6d8dc] bg-white px-4 py-4 ${shadows.card}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[#102235]">{display}</p>
      <Link
        href={href}
        className="mt-3 inline-flex min-h-9 items-center text-xs font-semibold text-[#aa8137] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7b5b19]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default function AdminReviewQueuePanel({
  reviewQueue,
}: {
  reviewQueue: AdminReviewQueueSummary;
}) {
  return (
    <section className="mb-8" aria-labelledby="admin-review-queue">
      <h2
        id="admin-review-queue"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        검수·운영 큐 요약
      </h2>
      <p className={`mb-4 max-w-3xl ${textStyles.small}`}>{ADMIN_REVIEW_QUEUE_INTRO}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QueueStat
          label="신규 정정 제보"
          value={reviewQueue.correctionNew}
          href="/admin/corrections"
          actionLabel="제보함 열기"
        />
        <QueueStat
          label="설계사 검증 대기"
          value={reviewQueue.plannerVerificationPending}
          href="/admin/planner-verifications"
          actionLabel="검증 큐 열기"
        />
        <QueueStat
          label="관리 기능 확인 필요"
          value={reviewQueue.adminFeaturesNeedingAttention}
          href="/admin/search"
          actionLabel="통합 검색"
        />
        <div
          className={`rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-4 py-4 ${borders.default}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
            운영 이슈
          </p>
          <p className={`mt-2 ${textStyles.small}`}>{ADMIN_OPS_ISSUES_NOTE}</p>
          <p className="mt-3 text-xs text-[#4f5661]">
            Critical·High 우선 처리. 공개 화면에는 노출하지 않습니다.
          </p>
        </div>
      </div>
      <p className={`mt-4 ${surfaces.muted} rounded-lg px-4 py-3 text-xs text-[#4f5661]`}>
        답변 보조(베타) 관찰·allowlist 변경은 별도 운영 PR에서만 수행합니다. 이 화면에서는
        접근 범위를 확대하지 않습니다.
      </p>
    </section>
  );
}
