import {
  AA_FINAL_AUDIT,
  BUILD_CI_AUDIT,
  PAYMENT_SIGNUP_BLOCK_AUDIT,
  PII_FINAL_AUDIT,
  PR149_CRITICAL_RISKS,
  PR149_DEFERRED_IMPLEMENTATION,
  PR149_DEFERRED_PRS,
  PR149_FORBIDDEN_DOC_CONTENT,
  PR149_HIGH_RISKS,
  PR149_LINKED_DOCS,
  PR149_READINESS_CONDITIONS,
  PR149_SCOPE_NOTICE,
  PR149_SECURITY_VERDICT,
  PUBLIC_VISIBILITY_AUDIT,
  ROLE_FINAL_AUDIT_ROWS,
  ROUTE_ACCESS_AUDIT_ROWS,
  SECRET_AUDIT,
  SECURITY_FINAL_CHECKLIST,
  SECURITY_GO_CRITERIA,
  type AuditCheckStatus,
} from "@/lib/ops/security-final-audit";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECK_TONE: Record<AuditCheckStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
  na: "bg-[#f4f5f6] text-[#4f5661]",
};

const CHECK_LABEL: Record<AuditCheckStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
  na: "해당없음",
};

const VERDICT_LABEL: Record<string, string> = {
  go: "Go",
  conditional_go: "Conditional Go",
  no_go: "No-Go",
};

export default function AdminSecurityFinalAuditPanel() {
  const gapCount = SECURITY_FINAL_CHECKLIST.filter((c) => c.status === "gap").length;
  const partialCount = SECURITY_FINAL_CHECKLIST.filter(
    (c) => c.status === "partial",
  ).length;

  return (
    <section className="mb-8" aria-labelledby="admin-security-final-audit">
      <h2
        id="admin-security-final-audit"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        권한·보안 최종 감사 (PR149)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR149_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR149_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Security"
          value={VERDICT_LABEL[PR149_SECURITY_VERDICT.securityReadiness] ?? "—"}
          tone="warn"
        />
        <StatTile
          label="PR150 진입"
          value={VERDICT_LABEL[PR149_SECURITY_VERDICT.pr150Entry] ?? "—"}
          tone="warn"
        />
        <StatTile label="체크 gap" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
        <StatTile
          label="체크 partial"
          value={String(partialCount)}
          tone={partialCount > 0 ? "warn" : "ok"}
        />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Go / Conditional Go / No-Go
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {SECURITY_GO_CRITERIA.map((row) => (
          <li key={row.verdict}>
            <span className="font-semibold">{VERDICT_LABEL[row.verdict]}:</span>{" "}
            {row.criteria}
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Critical / High (PR150 전)
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#8b2e2e]">
        {PR149_CRITICAL_RISKS.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">리스크</th>
              <th className="px-3 py-2">후속</th>
            </tr>
          </thead>
          <tbody>
            {PR149_HIGH_RISKS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.id}</td>
                <td className="px-3 py-2">{row.risk}</td>
                <td className="px-3 py-2">{row.pr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleAuditTable />
      <RouteAuditTable />
      <SimpleAuditTable title="Public Visibility" rows={PUBLIC_VISIBILITY_AUDIT} />
      <SimpleAuditTable title="Answer Assistant" rows={AA_FINAL_AUDIT} />
      <StatusOnlyTable title="개인정보·민감정보" rows={PII_FINAL_AUDIT} />
      <StatusOnlyTable title="Secret / Env" rows={SECRET_AUDIT} />
      <SimpleAuditTable title="Build / CI" rows={BUILD_CI_AUDIT} />
      <StatusOnlyTable title="결제·회원가입·발송" rows={PAYMENT_SIGNUP_BLOCK_AUDIT} />

      <FinalChecklistTable />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR150 조건
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR149_READINESS_CONDITIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <DeferredSection />
    </section>
  );
}

function RoleAuditTable() {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        역할별 접근
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">역할</th>
              <th className="px-3 py-2">허용</th>
              <th className="px-3 py-2">금지</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {ROLE_FINAL_AUDIT_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.role}
              >
                <td className="px-3 py-2 font-semibold">{row.role}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.allowed}</td>
                <td className="px-3 py-2">{row.forbidden}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RouteAuditTable() {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Route 접근
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[48rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">route</th>
              <th className="px-3 py-2">public</th>
              <th className="px-3 py-2">planner</th>
              <th className="px-3 py-2">verified</th>
              <th className="px-3 py-2">content_admin</th>
              <th className="px-3 py-2">super_admin</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_ACCESS_AUDIT_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.route}
              >
                <td className="px-3 py-2 font-semibold">{row.route}</td>
                <td className="px-3 py-2">{row.public}</td>
                <td className="px-3 py-2">{row.planner}</td>
                <td className="px-3 py-2">{row.verified}</td>
                <td className="px-3 py-2">{row.content_admin}</td>
                <td className="px-3 py-2">{row.super_admin}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SimpleAuditTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly { item: string; criterion: string; status: AuditCheckStatus; evidence: string }[];
}) {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        {title}
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">근거</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2">{row.criterion}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2 font-mono text-[10px]">{row.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusOnlyTable({
  title,
  rows,
}: {
  title: string;
  rows: readonly { item: string; criterion: string; status: AuditCheckStatus }[];
}) {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        {title}
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[28rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.item}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2">{row.criterion}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FinalChecklistTable() {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Security Final Audit Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_FINAL_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-3 py-2">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DeferredSection() {
  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        후속 PR (실행 없음)
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">Codex</th>
            </tr>
          </thead>
          <tbody>
            {PR149_DEFERRED_PRS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.id}</td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2">{row.codex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR149_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR149_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-149-SECURITY-FINAL-AUDIT-OPS.md`}
          >
            PR-149-SECURITY-FINAL-AUDIT-OPS.md
          </a>
        </li>
      </ul>
    </>
  );
}

function StatusBadge({ status }: { status: AuditCheckStatus }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${CHECK_TONE[status]}`}
    >
      {CHECK_LABEL[status]}
    </span>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${borders.default} ${
        tone === "ok" ? "bg-[#edf7f2]" : tone === "warn" ? "bg-[#fff7e6]" : "bg-white"
      } ${shadows.card}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
