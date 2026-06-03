import Link from "next/link";
import {
  ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE,
} from "@/lib/answer-assistant/retention-config";
import {
  BETA_SAFETY_REVIEW_OPERATOR_RULES,
} from "@/lib/answer-assistant/beta-feedback-review-criteria";
import type { RetentionCleanupPreview } from "@/lib/answer-assistant/retention-cleanup";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  executeRetentionCleanupAction,
  refreshRetentionCleanupPreviewAction,
} from "@/app/admin/answer-assistant/cleanup/actions";

function CountRow({
  label,
  eligible,
  total,
}: {
  label: string;
  eligible: number;
  total: number;
}) {
  return (
    <tr className="border-b border-[#f0ebe3]">
      <td className="py-2 pr-4 text-[#102235]">{label}</td>
      <td className="py-2 text-right tabular-nums font-semibold">{total}</td>
      <td
        className={`py-2 text-right tabular-nums font-semibold ${eligible > 0 ? "text-[#8b2e2e]" : "text-[#4f5661]"}`}
      >
        {eligible}
      </td>
    </tr>
  );
}

export default function RetentionCleanupView({
  preview,
  recentLogs,
}: {
  preview: RetentionCleanupPreview;
  recentLogs: Array<{
    id: string;
    mode: string;
    createdAt: string;
    rateLimitDeleted: number;
    usageAuditDeleted: number;
    feedbackDeleted: number;
    cleanupLogDeleted: number;
  }>;
}) {
  const { config, eligible, cutoffs } = preview;
  const totalEligible =
    eligible.rateLimitState +
    eligible.usageAudit +
    eligible.feedbackStandard +
    eligible.feedbackCritical +
    eligible.cleanupLog;

  return (
    <>
      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">보관기간 정책</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">
          운영 데이터는 필요 최소 기간만 보관합니다. raw prompt/output·생성 초안·고객·의료·계약
          정보는 저장하지 않으며, cleanup은 **건수만** 미리보기한 뒤 ADMIN이 명시적으로
          실행합니다.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          <li>
            Rate limit state (AnswerAssistantRateLimitState):{" "}
            {config.rateLimitStateDays}일 · 비활성·쿨다운 종료 후보
          </li>
          <li>Usage audit: {config.usageAuditDays}일</li>
          <li>
            Beta feedback (일반): {config.feedbackDays}일 · 인시던트 후보/HIGH:{" "}
            {config.feedbackCriticalDays}일
          </li>
          <li>Cleanup log: {config.cleanupLogDays}일</li>
        </ul>
      </section>

      {preview.warnings.length > 0 ? (
        <section className="mb-6 rounded-lg border border-[#d9c9a8] bg-[#fff8ec] px-4 py-3 text-sm text-[#5c4520]">
          <p className="font-semibold">주의</p>
          <ul className="mt-2 list-disc pl-5 text-xs">
            {preview.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#102235]">Cleanup preview (dry-run)</h2>
          <form action={refreshRetentionCleanupPreviewAction}>
            <button
              type="submit"
              className="min-h-9 rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
            >
              preview 새로고침
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-[#4f5661]">
          아래 삭제 후보 건수만 표시합니다. row 내용·원문은 조회하지 않습니다.
        </p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
              <th className="pb-2 font-semibold">대상</th>
              <th className="pb-2 text-right font-semibold">현재 DB 건수</th>
              <th className="pb-2 text-right font-semibold">삭제 후보</th>
            </tr>
          </thead>
          <tbody>
            <CountRow
              label="Rate limit state"
              eligible={eligible.rateLimitState}
              total={preview.totals.rateLimitState}
            />
            <CountRow
              label="Usage audit"
              eligible={eligible.usageAudit}
              total={preview.totals.usageAudit}
            />
            <CountRow
              label="Feedback (일반)"
              eligible={eligible.feedbackStandard}
              total={preview.totals.feedback}
            />
            <CountRow
              label="Feedback (인시던트/HIGH)"
              eligible={eligible.feedbackCritical}
              total={preview.totals.feedback}
            />
            <CountRow
              label="Cleanup log (이전)"
              eligible={eligible.cleanupLog}
              total={preview.totals.cleanupLog}
            />
          </tbody>
        </table>
        <details className="mt-4 text-xs text-[#4f5661]">
          <summary className="cursor-pointer font-semibold text-[#102235]">
            cutoff 시각 (UTC)
          </summary>
          <ul className="mt-2 space-y-1 font-mono">
            <li>rateLimit: {cutoffs.rateLimitStateBefore}</li>
            <li>audit: {cutoffs.usageAuditBefore}</li>
            <li>feedback: {cutoffs.feedbackStandardBefore}</li>
            <li>feedback critical: {cutoffs.feedbackCriticalBefore}</li>
            <li>cleanup log: {cutoffs.cleanupLogBefore}</li>
          </ul>
        </details>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">Execute (ADMIN · 명시적 확인)</h2>
        <p className="mt-2 text-xs text-[#4f5661]">
          실행 전 preview 건수와 일치해야 합니다. 자동 스케줄 삭제·allowlist 변경·gate OFF는
          수행하지 않습니다.
        </p>
        {!config.cleanupExecuteEnabled ? (
          <p className="mt-3 rounded-md border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-2 text-xs text-[#8b2e2e]">
            ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED=true 설정 후에만 실행할 수 있습니다.
          </p>
        ) : totalEligible === 0 ? (
          <p className="mt-3 text-xs text-[#4f5661]">삭제 후보가 없습니다.</p>
        ) : (
          <form action={executeRetentionCleanupAction} className="mt-4 space-y-3">
            <input
              name="rateLimitState"
              type="hidden"
              value={eligible.rateLimitState}
            />
            <input name="usageAudit" type="hidden" value={eligible.usageAudit} />
            <input
              name="feedbackStandard"
              type="hidden"
              value={eligible.feedbackStandard}
            />
            <input
              name="feedbackCritical"
              type="hidden"
              value={eligible.feedbackCritical}
            />
            <input name="cleanupLog" type="hidden" value={eligible.cleanupLog} />
            <label className="block text-xs text-[#102235]">
              확인 문구 입력:{" "}
              <code className="rounded bg-[#f4f6f8] px-1">
                {ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE}
              </code>
              <input
                className="mt-1 min-h-10 w-full max-w-md rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                name="confirm"
                required
                autoComplete="off"
              />
            </label>
            <button
              type="submit"
              className="min-h-10 rounded-md bg-[#8b2e2e] px-4 text-sm font-semibold text-white hover:bg-[#6f2424] disabled:opacity-50"
              disabled={!config.cleanupExecuteEnabled}
            >
              만료 데이터 삭제 실행 ({totalEligible}건)
            </button>
          </form>
        )}
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {BETA_SAFETY_REVIEW_OPERATOR_RULES.slice(0, 3).map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">최근 cleanup 기록</h2>
        {recentLogs.length === 0 ? (
          <p className="mt-3 text-sm text-[#4f5661]">기록이 없습니다.</p>
        ) : (
          <table className="mt-3 w-full text-xs">
            <thead>
              <tr className="border-b text-left text-[#4f5661]">
                <th className="py-2">시각</th>
                <th className="py-2">mode</th>
                <th className="py-2 text-right">RL</th>
                <th className="py-2 text-right">audit</th>
                <th className="py-2 text-right">feedback</th>
                <th className="py-2 text-right">log</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-[#f0ebe3]">
                  <td className="py-2">
                    {log.createdAt.slice(0, 19).replace("T", " ")}
                  </td>
                  <td className="py-2">{log.mode}</td>
                  <td className="py-2 text-right tabular-nums">
                    {log.rateLimitDeleted}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {log.usageAuditDeleted}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {log.feedbackDeleted}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {log.cleanupLogDeleted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-[#4f5661]">
          <Link href="/admin/answer-assistant/audit" className="font-semibold text-[#aa8137]">
            Usage Audit
          </Link>
          {" · "}
          <Link
            href="/admin/answer-assistant/feedback"
            className="font-semibold text-[#aa8137]"
          >
            Beta 피드백
          </Link>
        </p>
      </section>
    </>
  );
}
