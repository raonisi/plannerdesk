import Link from "next/link";
import {
  WORK_LINK_INFO_TYPE_LABELS,
  WORK_LINK_REVIEW_EMPTY_DESCRIPTION,
  WORK_LINK_REVIEW_EMPTY_TITLE,
  WORK_LINK_REVIEW_FILTER_LABELS,
  WORK_LINK_REVIEW_POLICY_LINES,
  WORK_LINK_REVIEW_SCOPE_NOTICE,
  WORK_LINK_REVIEW_STATUS_LABELS,
  WORK_LINK_RISK_LEVEL_LABELS,
  WORK_LINK_VISIBILITY_SCOPE_LABELS,
} from "@/lib/work-links/review-copy";
import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "@/lib/work-links/review-mock-candidates";
import { filterWorkLinkReviewCandidates } from "@/lib/work-links/review-filters";
import {
  hasOfficialSourceUrl,
  isWorkLinkPublicPublishCandidate,
} from "@/lib/work-links/review-rules";
import type { WorkLinkReviewFilter } from "@/lib/work-links/review-types";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function riskTone(level: "medium" | "high"): "gold" | "red" {
  return level === "high" ? "red" : "gold";
}

function statusTone(
  status: import("@/lib/work-links/review-types").WorkLinkReviewStatus,
): "green" | "gold" | "gray" | "red" {
  if (status === "verified" || status === "published") return "green";
  if (status === "needs_review" || status === "stale") return "gold";
  if (status === "rejected" || status === "retired") return "red";
  return "gray";
}

interface WorkLinkReviewDraftPanelProps {
  filter: WorkLinkReviewFilter;
}

export function WorkLinkReviewDraftPanel({ filter }: WorkLinkReviewDraftPanelProps) {
  const rows = filterWorkLinkReviewCandidates(WORK_LINK_REVIEW_MOCK_CANDIDATES, filter);

  return (
    <>
      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 rounded-lg border-l-4 border-l-[#aa8137] p-5`}
        aria-labelledby="work-link-review-notice"
      >
        <h2
          id="work-link-review-notice"
          className="text-sm font-bold uppercase tracking-wide text-[#aa8137]"
        >
          업무 링크 검수 안내
        </h2>
        <p className={`mt-2 max-w-3xl ${textStyles.small}`}>{WORK_LINK_REVIEW_SCOPE_NOTICE}</p>
        <ul className={`mt-3 max-w-3xl list-disc space-y-1 pl-5 ${textStyles.small}`}>
          {WORK_LINK_REVIEW_POLICY_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <form
        className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 flex flex-wrap items-end gap-3 rounded-lg p-4`}
        method="get"
      >
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="work-link-filter" className="mb-1 block text-xs font-semibold text-[#4f5661]">
            필터
          </label>
          <select
            id="work-link-filter"
            name="filter"
            defaultValue={filter}
            className="min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          >
            {(Object.keys(WORK_LINK_REVIEW_FILTER_LABELS) as WorkLinkReviewFilter[]).map(
              (key) => (
                <option key={key} value={key}>
                  {WORK_LINK_REVIEW_FILTER_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#10243E] px-4 text-sm font-semibold text-[#F7F3E8]"
        >
          적용
        </button>
        <Link
          href="/admin/work-links"
          className="min-h-11 inline-flex items-center rounded-md border border-[#d9c9a8] px-4 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
        >
          초기화
        </Link>
      </form>

      <section
        className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        aria-labelledby="work-link-review-list"
      >
        <h2 id="work-link-review-list" className="sr-only">
          업무 링크 후보 목록
        </h2>
        {rows.length === 0 ? (
          <div className="p-8">
            <p className="text-lg font-semibold text-[#102235]">{WORK_LINK_REVIEW_EMPTY_TITLE}</p>
            <p className={`mt-2 max-w-xl ${textStyles.small}`}>
              {WORK_LINK_REVIEW_EMPTY_DESCRIPTION}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
              <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                <tr>
                  <th className="px-4 py-3">제목 · 보험사</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3">위험도</th>
                  <th className="px-4 py-3">검수 · 공개</th>
                  <th className="px-4 py-3">확인일 · 출처</th>
                  <th className="px-4 py-3">Admin 메모</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ddc9]">
                {rows.map((row) => {
                  const publicCandidate = isWorkLinkPublicPublishCandidate(row);
                  const hasOfficial = hasOfficialSourceUrl(row);

                  return (
                    <tr key={row.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#102235]">{row.title}</div>
                        <div className="mt-1 text-xs text-[#4f5661]">{row.insurerName}</div>
                        <div className="mt-1 font-mono text-[10px] text-[#8a9199]">{row.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={badgeClass("navy")}>
                          {WORK_LINK_INFO_TYPE_LABELS[row.infoType]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={badgeClass(riskTone(row.riskLevel))}>
                          {WORK_LINK_RISK_LEVEL_LABELS[row.riskLevel]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={badgeClass(statusTone(row.reviewStatus))}>
                            {WORK_LINK_REVIEW_STATUS_LABELS[row.reviewStatus]}
                          </span>
                          <span className={badgeClass("gray")}>
                            {WORK_LINK_VISIBILITY_SCOPE_LABELS[row.visibilityScope]}
                          </span>
                          <span
                            className={badgeClass(publicCandidate ? "green" : "gray")}
                          >
                            {publicCandidate ? "public 후보" : "public 비대상"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#4f5661]">
                        <div>{row.lastVerifiedAt ?? "미확인"}</div>
                        <div className="mt-1 text-xs">
                          {hasOfficial ? (
                            <span className={badgeClass("green")}>공식 출처 있음</span>
                          ) : (
                            <span className={badgeClass("gold")}>공식 출처 없음</span>
                          )}
                        </div>
                        {row.sourceLabel ? (
                          <p className="mt-1 max-w-xs text-xs">{row.sourceLabel}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-xs text-[#4f5661]">
                        {row.reviewNotePrivate ? (
                          <p className="max-w-xs rounded border border-[#d9c9a8] bg-[#faf8f3] p-2">
                            <span className="font-semibold text-[#7b5b19]">비공개 검수 메모</span>
                            <br />
                            {row.reviewNotePrivate}
                          </p>
                        ) : (
                          "—"
                        )}
                        {row.adminMemo ? (
                          <p className="mt-2 max-w-xs rounded border border-[#e8c4c4] bg-[#fdf2f2] p-2">
                            <span className="font-semibold text-[#8b2e2e]">Admin-only</span>
                            <br />
                            {row.adminMemo}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className={`mt-4 max-w-3xl ${textStyles.small}`}>
        mock 후보 {WORK_LINK_REVIEW_MOCK_CANDIDATES.length}건 · 필터 결과 {rows.length}건.
        저장·게시 기능은 PR-BS-15 이후에 연결합니다.
      </p>
    </>
  );
}
