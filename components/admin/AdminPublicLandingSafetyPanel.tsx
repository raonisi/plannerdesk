import {
  COPY_REVIEW_ROWS,
  CTA_FORBIDDEN,
  CTA_SAFE,
  FEATURE_PUBLIC_DISPLAY_LABEL,
  LANDING_SAFETY_CHECKLIST,
  LIABILITY_NOTICE_FORBIDDEN,
  LIABILITY_NOTICE_GOOD,
  PR144_DEFERRED_IMPLEMENTATION,
  PR144_FORBIDDEN_DOC_CONTENT,
  PR144_LINKED_DOCS,
  PR144_SCOPE_NOTICE,
  PUBLIC_ADMIN_SPLIT_ROWS,
  PUBLIC_FEATURE_ROWS,
  type ChecklistStatus,
} from "@/lib/ops/public-landing-safety";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CHECKLIST_TONE: Record<ChecklistStatus, string> = {
  met: "bg-[#edf7f2] text-[#1f6b55]",
  partial: "bg-[#fff7e6] text-[#7a612d]",
  gap: "bg-[#fdf2f2] text-[#8b2e2e]",
};

const CHECKLIST_LABEL: Record<ChecklistStatus, string> = {
  met: "충족",
  partial: "부분",
  gap: "미충족",
};

export default function AdminPublicLandingSafetyPanel() {
  const metCount = LANDING_SAFETY_CHECKLIST.filter((c) => c.status === "met").length;
  const gapCount = LANDING_SAFETY_CHECKLIST.filter((c) => c.status === "gap").length;

  return (
    <section className="mb-8" aria-labelledby="admin-public-landing-safety">
      <h2
        id="admin-public-landing-safety"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        Public Landing 안전성 검수 (PR144)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR144_SCOPE_NOTICE}</p>
      <p className={`mb-3 max-w-3xl text-xs text-[#4f5661]`}>
        {PR144_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="체크리스트 충족" value={String(metCount)} />
        <StatTile label="미충족" value={String(gapCount)} tone={gapCount > 0 ? "warn" : "ok"} />
        <StatTile label="외부 공개 실행" value="없음" tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Landing Safety Checklist
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">기준</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {LANDING_SAFETY_CHECKLIST.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold text-[#102235]">{row.item}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 font-semibold ${CHECKLIST_TONE[row.status]}`}
                  >
                    {CHECKLIST_LABEL[row.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        문구 검수 기준
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[44rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">영역</th>
              <th className="px-3 py-2">권장</th>
              <th className="px-3 py-2">금지</th>
            </tr>
          </thead>
          <tbody>
            {COPY_REVIEW_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.area}
              >
                <td className="px-3 py-2 font-semibold">{row.area}</td>
                <td className="px-3 py-2 text-[#1f6b55]">{row.good}</td>
                <td className="px-3 py-2 text-[#8b2e2e]">{row.forbidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        공개 기능 / 보류
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">기능</th>
              <th className="px-3 py-2">표시</th>
              <th className="px-3 py-2">기준</th>
            </tr>
          </thead>
          <tbody>
            {PUBLIC_FEATURE_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2 font-semibold">{row.feature}</td>
                <td className="px-3 py-2">
                  {FEATURE_PUBLIC_DISPLAY_LABEL[row.display]}
                </td>
                <td className="px-3 py-2 text-[#4f5661]">{row.criterion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        CTA (권장 / 금지)
      </h3>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <ul className="list-disc space-y-1 rounded-lg border border-[#b9d5c9] bg-[#edf7f2] px-4 py-3 pl-8 text-xs">
          {CTA_SAFE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="list-disc space-y-1 rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 pl-8 text-xs text-[#8b2e2e]">
          {CTA_FORBIDDEN.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        책임 고지
      </h3>
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <ul className="list-disc space-y-1 rounded-lg border border-[#b9d5c9] bg-[#edf7f2] px-4 py-3 pl-8 text-xs">
          {LIABILITY_NOTICE_GOOD.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="list-disc space-y-1 rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3 pl-8 text-xs text-[#8b2e2e]">
          {LIABILITY_NOTICE_FORBIDDEN.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        public / admin 분리
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">정보</th>
              <th className="px-3 py-2">public</th>
              <th className="px-3 py-2">admin</th>
            </tr>
          </thead>
          <tbody>
            {PUBLIC_ADMIN_SPLIT_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.info}
              >
                <td className="px-3 py-2">{row.info}</td>
                <td className="px-3 py-2">{row.publicOk ? "가능" : "금지"}</td>
                <td className="px-3 py-2">{row.adminOk ? "가능" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        보류 구현
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {PR144_DEFERRED_IMPLEMENTATION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 문서
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR144_LINKED_DOCS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-144-PUBLIC-LANDING-SAFETY-OPS.md`}
          >
            PR-144-PUBLIC-LANDING-SAFETY-OPS.md
          </a>
        </li>
      </ul>
    </section>
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
        tone === "ok"
          ? "bg-[#edf7f2]"
          : tone === "warn"
            ? "bg-[#fff7e6]"
            : "bg-white"
      } ${shadows.card}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[#102235]">{value}</p>
    </div>
  );
}
