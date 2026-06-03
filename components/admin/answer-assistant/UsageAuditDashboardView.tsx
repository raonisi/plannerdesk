import Link from "next/link";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import type { UsageAuditDashboardData } from "@/lib/answer-assistant/usage-audit-dashboard";
import {
  USAGE_AUDIT_BLOCKED_REASON_FILTER_OPTIONS,
  USAGE_AUDIT_HIGH_BLOCK_THRESHOLD,
  usageAuditDashboardFilterQuery,
} from "@/lib/answer-assistant/usage-audit-dashboard";
import { BLOCKED_REASON_LABEL } from "@/lib/answer-assistant/labels";
import type { UsageAuditDashboardSearchParams } from "@/lib/answer-assistant/usage-audit-dashboard";

function MetricTile({
  label,
  value,
  tone = "navy",
}: {
  label: string;
  value: number;
  tone?: "navy" | "green" | "gold" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]"
      : tone === "gold"
        ? "border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]"
        : tone === "red"
          ? "border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]"
          : "border-[#c8d2dc] bg-[#eef3f7] text-[#102235]";

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function CountTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: { label: string; count: number }[];
  emptyLabel: string;
}) {
  return (
    <section
      className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
    >
      <h2 className="text-sm font-bold text-[#102235]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#4f5661]">{emptyLabel}</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
              <th className="pb-2 font-semibold">항목</th>
              <th className="pb-2 text-right font-semibold">건수</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[#f0ebe3]">
                <td className="py-2 pr-2 text-[#102235]">{row.label}</td>
                <td className="py-2 text-right tabular-nums font-semibold">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function StatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-[#edf7f2] text-[#1f6b55] ring-1 ring-[#b9d5c9]"
          : "bg-[#f4f5f6] text-[#4f5661] ring-1 ring-[#d6d8dc]"
      }`}
    >
      {label}
    </span>
  );
}

export default function UsageAuditDashboardView({
  data,
  filters,
}: {
  data: UsageAuditDashboardData;
  filters: UsageAuditDashboardSearchParams;
}) {
  const { operational, summary } = data;
  const filterQs = (overrides: Partial<UsageAuditDashboardSearchParams> = {}) =>
    usageAuditDashboardFilterQuery(filters, overrides);

  return (
    <>
      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
        aria-labelledby="audit-ops-status"
      >
        <h2
          id="audit-ops-status"
          className="text-sm font-bold uppercase tracking-wide text-[#aa8137]"
        >
          Beta · gate · audit 상태
        </h2>
        <p className={`${textStyles.body} mt-2 max-w-3xl text-sm`}>
          집계 전용 대시보드입니다. 요청 원문·생성 초안·고객정보·의료정보는 저장·표시하지
          않습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge
            label={`Beta gate env: ${operational.betaGateEnabled ? "ON" : "OFF"}`}
            active={operational.betaGateEnabled}
          />
          <StatusBadge
            label={`Beta enabled: ${operational.betaEnvEnabled ? "ON" : "OFF"}`}
            active={operational.betaEnvEnabled}
          />
          <StatusBadge
            label={`Allowlist pilots: ${operational.allowlistPilotCount}`}
            active={operational.allowlistPilotCount > 0}
          />
          <StatusBadge
            label={`Beta status: ${operational.allowlistBetaStatus}`}
            active={operational.allowlistBetaStatus === "operational"}
          />
          <StatusBadge
            label={`Verified generation: ${operational.verifiedGenerationEnabled ? "ON" : "OFF"}`}
            active={operational.verifiedGenerationEnabled}
          />
          <StatusBadge
            label={`Audit backend: ${operational.auditBackend}`}
            active={operational.auditBackend === "durable"}
          />
          <StatusBadge
            label={`Rate limit backend: ${operational.rateLimitBackend}`}
            active={operational.rateLimitBackend === "durable"}
          />
        </div>
        {!data.durableAuditEnabled ? (
          <p className="mt-3 rounded-md border border-[#d9c9a8] bg-[#fff8ec] px-3 py-2 text-sm text-[#5c4520]">
            현재 usage audit 백엔드가 memory입니다. 운영 환경에서는 durable로 설정해야
            이 대시보드에 기록이 누적됩니다.
          </p>
        ) : null}
      </section>

      <section
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        aria-labelledby="audit-summary"
      >
        <h2 id="audit-summary" className="sr-only">
          집계 요약
        </h2>
        <MetricTile label="전체 이벤트" value={summary.total} />
        <MetricTile label="성공" value={summary.success} tone="green" />
        <MetricTile label="차단" value={summary.blocked} tone="red" />
        <MetricTile
          label="Rate limit 차단"
          value={summary.rateLimitBlocked}
          tone="gold"
        />
        <MetricTile
          label="Output safety 차단"
          value={summary.outputSafetyBlocked}
          tone="red"
        />
        <MetricTile
          label="Provider 오류"
          value={summary.providerErrors}
          tone="gold"
        />
        <MetricTile
          label="Prompt injection"
          value={summary.promptInjectionBlocks}
          tone="red"
        />
        <MetricTile
          label="관리자 테스트"
          value={summary.adminTesterEvents}
          tone="navy"
        />
      </section>

      <form
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 grid gap-3 rounded-lg p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6`}
        method="get"
      >
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="audience"
          defaultValue={filters.audience ?? "all"}
        >
          <option value="all">대상 전체</option>
          <option value="admin">관리자</option>
          <option value="verified_planner">검증 설계사</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="outcome"
          defaultValue={filters.outcome ?? "all"}
        >
          <option value="all">결과 전체</option>
          <option value="success">성공</option>
          <option value="blocked">차단</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm lg:col-span-2"
          name="blockedReason"
          defaultValue={filters.blockedReason ?? "all"}
        >
          <option value="all">차단 사유 전체</option>
          {USAGE_AUDIT_BLOCKED_REASON_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {BLOCKED_REASON_LABEL[value]}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="rateLimitBlocked"
          defaultValue={filters.rateLimitBlocked ?? "all"}
        >
          <option value="all">Rate limit 전체</option>
          <option value="true">Rate limit 차단만</option>
          <option value="false">Rate limit 제외</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="outputSafetyBlocked"
          defaultValue={filters.outputSafetyBlocked ?? "all"}
        >
          <option value="all">Output safety 전체</option>
          <option value="true">Output safety 차단만</option>
          <option value="false">Output safety 제외</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="providerError"
          defaultValue={filters.providerError ?? "all"}
        >
          <option value="all">Provider 오류 전체</option>
          <option value="true">Provider 오류만</option>
          <option value="false">Provider 오류 제외</option>
        </select>
        <select
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="isAdminTester"
          defaultValue={filters.isAdminTester ?? "all"}
        >
          <option value="all">테스트 모드 전체</option>
          <option value="true">관리자 테스트만</option>
          <option value="false">일반 사용만</option>
        </select>
        <input
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="createdFrom"
          type="date"
          defaultValue={filters.createdFrom ?? ""}
          aria-label="기간 시작"
        />
        <input
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          name="createdTo"
          type="date"
          defaultValue={filters.createdTo ?? ""}
          aria-label="기간 종료"
        />
        <input
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-3 text-sm lg:col-span-2"
          name="userIdPrefix"
          placeholder="userId 접두사 (전체 ID 미표시)"
          defaultValue={filters.userIdPrefix ?? ""}
          maxLength={32}
        />
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
        >
          필터 적용
        </button>
        <Link
          href="/admin/answer-assistant/audit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d9c9a8] px-4 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
        >
          초기화
        </Link>
      </form>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <CountTable
          title="Outcome별"
          rows={data.byOutcome}
          emptyLabel="선택 기간에 이벤트가 없습니다."
        />
        <CountTable
          title="차단 사유별"
          rows={data.byBlockedReason}
          emptyLabel="차단 이벤트가 없습니다."
        />
        <CountTable
          title="대상(audience)별"
          rows={data.byAudience}
          emptyLabel="선택 기간에 이벤트가 없습니다."
        />
      </div>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-6 rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">
          과도한 차단 요청 (userId 접두사 · 기간 내 {USAGE_AUDIT_HIGH_BLOCK_THRESHOLD}
          회 이상)
        </h2>
        {data.highBlockUsers.length === 0 ? (
          <p className="mt-3 text-sm text-[#4f5661]">
            임계치 이상 사용자가 없습니다.
          </p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
                <th className="pb-2 font-semibold">userId (접두)</th>
                <th className="pb-2 text-right font-semibold">차단 건수</th>
              </tr>
            </thead>
            <tbody>
              {data.highBlockUsers.map((row) => (
                <tr key={row.userIdPrefix} className="border-b border-[#f0ebe3]">
                  <td className="py-2 font-mono text-xs text-[#102235]">
                    {row.userIdPrefix}
                  </td>
                  <td className="py-2 text-right tabular-nums font-semibold text-[#8b2e2e]">
                    {row.blockedCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4`}
      >
        <h2 className="text-sm font-bold text-[#102235]">최근 이벤트 (메타데이터만)</h2>
        <p className="mt-1 text-xs text-[#4f5661]">
          CSV보내기 없음 · 원문·초안·근거 본문 미표시
        </p>
        {data.recentEvents.length === 0 ? (
          <p className="mt-4 text-sm text-[#4f5661]">표시할 이벤트가 없습니다.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e0d0] text-left text-xs text-[#4f5661]">
                  <th className="px-2 py-2 font-semibold">시각 (UTC)</th>
                  <th className="px-2 py-2 font-semibold">대상</th>
                  <th className="px-2 py-2 font-semibold">결과</th>
                  <th className="px-2 py-2 font-semibold">차단 사유</th>
                  <th className="px-2 py-2 font-semibold">RL</th>
                  <th className="px-2 py-2 font-semibold">OS</th>
                  <th className="px-2 py-2 font-semibold">Provider</th>
                  <th className="px-2 py-2 font-semibold">userId</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEvents.map((row) => (
                  <tr key={row.id} className="border-b border-[#f0ebe3]">
                    <td className="whitespace-nowrap px-2 py-2 text-xs">
                      {row.createdAt.slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="px-2 py-2">
                      {row.audience === "admin" ? "관리자" : "검증 설계사"}
                    </td>
                    <td className="px-2 py-2">
                      {row.outcome === "success" ? "성공" : "차단"}
                    </td>
                    <td className="max-w-[12rem] px-2 py-2 text-xs">
                      {row.blockedReasonLabel ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {row.rateLimitBlocked ? "Y" : "—"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {row.outputSafetyBlocked ? "Y" : "—"}
                    </td>
                    <td className="px-2 py-2 text-xs">
                      {row.providerErrorCode ?? "—"}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">
                      {row.userIdPrefix}
                      {row.isAdminTester ? " · test" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#4f5661]">
          <p>
            총 {data.totalEvents}건 · {data.page}/{data.pageCount} 페이지
          </p>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link
                href={`/admin/answer-assistant/audit${filterQs({
                  page: String(data.page - 1),
                })}`}
                className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
              >
                이전
              </Link>
            ) : null}
            {data.page < data.pageCount ? (
              <Link
                href={`/admin/answer-assistant/audit${filterQs({
                  page: String(data.page + 1),
                })}`}
                className="rounded border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f7f1e5]"
              >
                다음
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
