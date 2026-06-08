import {
  ACCESS_DENIED_UX,
  CLAIM_UX_CRITERIA,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  PR163_ENTRY_CONDITIONS,
  PR163_FORBIDDEN_DOC_CONTENT,
  PR163_LINKED_HUBS,
  PR163_OPEN_CRITICAL_COUNT,
  PR163_SCOPE_NOTICE,
  PR163_TEST_FILES,
  PR163_TOUCHED_ROUTES,
  PR163_UX_VERDICTS,
  PR164_FOLLOW_UP_PRS,
  SCREEN_UX_CRITERIA,
  UX_POLISH_CHECKLIST,
  UX_POLISH_PRINCIPLES,
  UX_POLISH_STATUS_LABEL,
  type UxPolishChecklistStatus,
} from "@/lib/ops/public-ux-polish";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_LABEL: Record<UxPolishChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  pending: "대기",
};

export default function AdminPublicUxPolishPanel() {
  const verdict = PR163_UX_VERDICTS.uxPolishPrepared;

  return (
    <section className="mb-8" aria-labelledby="admin-public-ux-polish">
      <h2
        id="admin-public-ux-polish"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Public UX Polish (PR163)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR163_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR163_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="UX Polish" value={UX_POLISH_STATUS_LABEL[verdict]} tone="warn" />
        <StatTile label="Critical" value={String(PR163_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="Guards" value="Ready" tone="ok" />
        <StatTile label="Codex" value="불필요(조건부)" tone="warn" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        진입 · 원칙 · 화면 · 청구
      </h3>
      <EntryTable rows={PR163_ENTRY_CONDITIONS} />
      <SimpleTable
        headers={["원칙", "기준"]}
        rows={UX_POLISH_PRINCIPLES.map((r) => [r.principle, r.rule])}
      />
      <SimpleTable
        headers={["화면", "개선", "금지"]}
        rows={SCREEN_UX_CRITERIA.map((r) => [r.screen, r.direction, r.forbidden])}
      />
      <SimpleTable
        headers={["청구", "기준"]}
        rows={CLAIM_UX_CRITERIA.map((r) => [r.item, r.criterion])}
      />

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        접근 차단 · Checklist · Codex
      </h3>
      <SimpleTable
        headers={["시나리오", "안내", "금지"]}
        rows={ACCESS_DENIED_UX.map((r) => [r.scenario, r.guidance, r.forbidden])}
      />
      <ChecklistTable rows={UX_POLISH_CHECKLIST} />
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs font-mono text-[#4f5661]">
        {PR163_TOUCHED_ROUTES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR164_FOLLOW_UP_PRS.map((r) => (
          <li key={r.id}>
            {r.id}: {r.title}
          </li>
        ))}
      </ul>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR163_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EntryTable({
  rows,
}: {
  rows: readonly {
    condition: string;
    result: string;
    met: boolean;
    id: string;
  }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">조건</th>
            <th className="px-3 py-2">결과</th>
            <th className="px-3 py-2">충족</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={row.id}>
              <td className="px-3 py-2">{row.condition}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.result}</td>
              <td className="px-3 py-2">{row.met ? "✓" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            {headers.map((h) => (
              <th className="px-3 py-2" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={i}>
              {row.map((cell, j) => (
                <td className="px-3 py-2" key={j}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChecklistTable({
  rows,
}: {
  rows: readonly {
    item: string;
    criterion: string;
    status: UxPolishChecklistStatus;
    id: string;
  }[];
}) {
  return (
    <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
      <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
            <th className="px-3 py-2">항목</th>
            <th className="px-3 py-2">기준</th>
            <th className="px-3 py-2">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-[#e8eaed] last:border-b-0" key={row.id}>
              <td className="px-3 py-2">{row.item}</td>
              <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
              <td className="px-3 py-2">{CHECKLIST_LABEL[row.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${borders.default} ${shadows.card} ${
        tone === "ok" ? "bg-[#edf7f2]" : "bg-[#fff7e6]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="text-sm font-semibold text-[#2d3439]">{value}</p>
    </div>
  );
}
