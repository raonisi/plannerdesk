"use client";

import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { DIRECTORY_TEXT, claimFaxDisplay } from "@/lib/directory/formatting";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerClaimGuidePanel({
  insurer,
  claimItems,
}: {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
}) {
  const claimFax = claimFaxDisplay(insurer);
  const panelId = `claim-guide-${insurer.id}`;

  // Check if there is any claim-related information available
  const hasClaimInfo =
    claimItems.length > 0 ||
    Boolean(insurer.claimPageUrl) ||
    Boolean(insurer.claimFormUrl) ||
    Boolean(insurer.claimFaxNumber) ||
    Boolean(insurer.mailingAddress);

  return (
    <div
      className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-inner"
      id={panelId}
      role="region"
      aria-label={`${insurer.name} 청구 안내`}
    >
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">
        {insurer.name} 청구안내
      </h3>

      {!hasClaimInfo ? (
        <div className="py-4 text-center">
          <p className="text-sm font-bold text-slate-400">
            공식 청구안내 확인 후 업데이트 예정입니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 접수방법 및 채널 */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
              접수 방법 및 경로
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* 모바일/홈페이지 접수 */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">모바일/홈페이지 청구</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">공식 웹 또는 모바일 앱 접수</span>
                </div>
                {insurer.claimPageUrl ? (
                  <div className="mt-3">
                    <ExternalTabAnchor
                      className="inline-flex min-h-8 w-full items-center justify-between gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                      href={insurer.claimPageUrl}
                    >
                      <span>공식 청구 경로</span>
                      <span aria-hidden="true" className="text-xs leading-none">{"\u2197"}</span>
                    </ExternalTabAnchor>
                  </div>
                ) : (
                  <p className="mt-2.5 text-xs text-slate-400 italic font-medium">
                    {DIRECTORY_TEXT.missing}
                  </p>
                )}
              </div>

              {/* 팩스 접수 */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">팩스 접수</span>
                  <p className="mt-1 text-sm font-bold text-slate-900">{claimFax.primary}</p>
                </div>
                {claimFax.secondary ? (
                  <p className="mt-2 text-[11px] font-semibold text-indigo-500">{claimFax.secondary}</p>
                ) : null}
              </div>

              {/* 우편 접수 */}
              {insurer.mailingAddress ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2 shadow-sm">
                  <span className="text-xs font-bold text-slate-900 block">우편 접수 (등기우편)</span>
                  <p className="mt-1 text-sm text-slate-900 break-keep leading-relaxed font-bold">
                    {insurer.mailingAddress}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* 청구 서류 목록 */}
          <div className="border-t border-slate-200 pt-4 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                청구서류 및 공식 양식 ({claimItems.length}건)
              </h4>
              {claimItems.length > 0 ? (
                <Link
                  className="text-xs font-bold text-slate-500 underline-offset-4 hover:underline hover:text-slate-900"
                  href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
                >
                  전체 검색에서 보기
                </Link>
              ) : null}
            </div>

            {claimItems.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {claimItems.map((item) => (
                  <ClaimFormListItem
                    item={item}
                    key={item.kind === "pdf" ? item.id : item.document.id}
                  />
                ))}
              </ul>
            ) : (
              <div className="text-xs leading-relaxed text-slate-500 break-keep font-medium">
                <span>이 보험사에 연결된 정적 청구서류 양식이 아직 없습니다.</span>
                {insurer.claimFormUrl ? (
                  <div className="mt-3">
                    <ExternalTabAnchor
                      className="inline-flex min-h-9 items-center justify-between gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
                      href={insurer.claimFormUrl}
                    >
                      <span>공식 청구양식 다운로드</span>
                      <span aria-hidden="true" className="text-xs leading-none">{"\u2197"}</span>
                    </ExternalTabAnchor>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 고지 문구 */}
      <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] font-medium leading-relaxed text-slate-400 break-keep">
        보험사별 서류와 접수 기준은 변경될 수 있습니다. 최종 제출 전 해당 보험사 공식 안내를 함께 확인해 주세요.
      </div>
    </div>
  );
}
