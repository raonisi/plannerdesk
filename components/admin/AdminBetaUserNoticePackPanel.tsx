import {
  BETA_USER_NOTICES,
  CODEX_EXCLUDED_SCOPE,
  CODEX_REVIEW_SCOPE,
  NOTICE_FORBIDDEN_EXPRESSIONS,
  NOTICE_PACK_COMPOSITION,
  NOTICE_PACK_FORBIDDEN_PHRASES,
  PR153_ENTRY_CONDITIONS,
  PR153_FORBIDDEN_DOC_CONTENT,
  PR153_LINKED_HUBS,
  PR153_OPEN_CRITICAL_COUNT,
  PR153_PACK_VERDICTS,
  PR153_SCOPE_NOTICE,
  PR154_FOLLOW_UP_PRS,
} from "@/lib/ops/beta-user-notice-pack";
import {
  OPERATOR_READINESS_LABEL,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const READINESS_TONE: Record<OperatorReadiness, string> = {
  ready: "bg-[#edf7f2] text-[#1f6b55]",
  conditional_ready: "bg-[#fff7e6] text-[#7a612d]",
  not_ready: "bg-[#fdf2f2] text-[#8b2e2e]",
};

export default function AdminBetaUserNoticePackPanel() {
  return (
    <section className="mb-8" aria-labelledby="admin-beta-user-notice-pack">
      <h2
        id="admin-beta-user-notice-pack"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        베타 사용자 안내문 (PR153)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{PR153_SCOPE_NOTICE}</p>
      <p className="mb-3 max-w-3xl text-xs text-[#4f5661]">
        {PR153_FORBIDDEN_DOC_CONTENT}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Notice Pack"
          value={OPERATOR_READINESS_LABEL[PR153_PACK_VERDICTS.noticePackPrepared]}
          tone="warn"
        />
        <StatTile label="발송" value="Not Ready" tone="ok" />
        <StatTile label="Open Critical" value={String(PR153_OPEN_CRITICAL_COUNT)} tone="ok" />
        <StatTile label="안내문 수" value={String(BETA_USER_NOTICES.length)} tone="ok" />
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        PR153 진입 조건
      </h3>
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
            {PR153_ENTRY_CONDITIONS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2">{row.condition}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.result}</td>
                <td className="px-3 py-2">{row.met ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Notice Pack 구성
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[36rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">안내문</th>
              <th className="px-3 py-2">목적</th>
              <th className="px-3 py-2">시점</th>
            </tr>
          </thead>
          <tbody>
            {NOTICE_PACK_COMPOSITION.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-2">{row.id}</td>
                <td className="px-3 py-2 font-semibold">{row.name}</td>
                <td className="px-3 py-2">{row.purpose}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.whenToUse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        안내문 템플릿 (발송 없음)
      </h3>
      <div className="mb-4 space-y-4">
        {BETA_USER_NOTICES.map((notice) => (
          <details
            className={`rounded-lg border ${borders.default} bg-white px-4 py-3`}
            key={notice.id}
          >
            <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
              {notice.title}
            </summary>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#4f5661]">
              {notice.body}
            </pre>
          </details>
        ))}
      </div>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        금지 표현 체크리스트
      </h3>
      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[32rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">금지 표현</th>
              <th className="px-3 py-2">이유</th>
              <th className="px-3 py-2">패키지 포함</th>
            </tr>
          </thead>
          <tbody>
            {NOTICE_FORBIDDEN_EXPRESSIONS.map((row) => {
              const included = getAllNoticeTextForPanel().includes(row.phrase);
              return (
                <tr
                  className="border-b border-[#e8eaed] last:border-b-0"
                  key={row.phrase}
                >
                  <td className="px-3 py-2">{row.phrase}</td>
                  <td className="px-3 py-2 text-[#4f5661]">{row.reason}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-semibold ${
                        included
                          ? "bg-[#fdf2f2] text-[#8b2e2e]"
                          : "bg-[#edf7f2] text-[#1f6b55]"
                      }`}
                    >
                      {included ? "포함됨" : "없음"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mb-4 text-xs text-[#4f5661]">
        정적 금지 구문 {NOTICE_PACK_FORBIDDEN_PHRASES.length}건 — 테스트에서 전문 스캔.
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        판단 · PR154+
      </h3>
      <ul className="mb-4 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        <li>
          Pack 준비:{" "}
          <ReadinessBadge readiness={PR153_PACK_VERDICTS.noticePackPrepared} />
        </li>
        <li>
          PR154: <ReadinessBadge readiness={PR153_PACK_VERDICTS.pr154Entry} />
        </li>
        <li>
          외부 발송: <ReadinessBadge readiness={PR153_PACK_VERDICTS.externalSend} />
        </li>
      </ul>

      <div className={`mb-4 overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[28rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">Codex</th>
            </tr>
          </thead>
          <tbody>
            {PR154_FOLLOW_UP_PRS.slice(0, 5).map((row) => (
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

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Codex 제한검수 (조건부 권장)
      </h3>
      <ul className="mb-2 list-disc space-y-0.5 pl-5 text-xs text-[#4f5661]">
        {CODEX_REVIEW_SCOPE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mb-4 text-xs text-[#4f5661]">
        제외: {CODEX_EXCLUDED_SCOPE.join(", ")}
      </p>

      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        연계 허브
      </h3>
      <ul className="list-disc space-y-0.5 pl-5 text-xs">
        {PR153_LINKED_HUBS.map((doc) => (
          <li key={doc}>
            <a className="text-[#1f6b55] underline" href={`/${DOC_BASE}${doc}`}>
              {doc}
            </a>
          </li>
        ))}
        <li>
          <a
            className="text-[#1f6b55] underline"
            href={`/${DOC_BASE}PR-153-BETA-USER-NOTICE-PACK-OPS.md`}
          >
            PR-153-BETA-USER-NOTICE-PACK-OPS.md
          </a>
        </li>
      </ul>
    </section>
  );
}

function getAllNoticeTextForPanel(): string {
  return BETA_USER_NOTICES.map((n) => `${n.title}\n${n.body}`).join("\n");
}

function ReadinessBadge({ readiness }: { readiness: OperatorReadiness }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-semibold ${READINESS_TONE[readiness]}`}
    >
      {OPERATOR_READINESS_LABEL[readiness]}
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
      <p className="mt-1 text-sm font-bold text-[#102235]">{value}</p>
    </div>
  );
}
