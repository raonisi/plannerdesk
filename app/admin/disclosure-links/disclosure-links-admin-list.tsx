"use client";

import Link from "next/link";
import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
} from "@prisma/client";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId, AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  archiveDisclosureLink,
  executeDisclosureLinkBulkAction,
  setDisclosureLinkPublished,
  setDisclosureLinkStatus,
} from "./actions";
import {
  CATEGORY_LABEL,
  PUBLICATION_LABEL,
  STATUS_LABEL,
  TARGET_TYPE_LABEL,
  VISIBILITY_LABEL,
  isDisclosureLinkPubliclyVisible,
  wouldPublishBlocked,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: DisclosureLinkStatus): "green" | "gold" | "gray" | "red" {
  if (status === DisclosureLinkStatus.published) return "green";
  if (status === DisclosureLinkStatus.needs_review) return "gold";
  if (status === DisclosureLinkStatus.archived) return "red";
  return "gray";
}

export type DisclosureLinkListRow = {
  id: string;
  title: string;
  url: string;
  category: DisclosureLinkCategory;
  targetType: DisclosureLinkTargetType;
  status: DisclosureLinkStatus;
  isPublished: boolean;
  isOfficialSource: boolean;
  insurerName: string | null;
  lastVerifiedAt: string | null;
};

const DISCLOSURE_CONFIRM_OVERRIDES: Partial<Record<AdminBulkActionId, string>> = {
  setPublishedTrue:
    "선택한 항목에 일괄 공개 처리를 실행합니다. 검수 완료·검수일·안전 URL 조건을 충족하지 않는 항목은 처리되지 않습니다.",
  archive:
    "선택한 항목을 보관하고 비공개 처리합니다. 보관 항목은 public에 노출되지 않으며, 수정 화면에서 상태를 변경해 복구할 수 있습니다.",
};

function toBulkItems(rows: DisclosureLinkListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    isPublished: row.isPublished,
  }));
}

export default function DisclosureLinksAdminList({
  rows,
  role,
}: {
  rows: DisclosureLinkListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(rows);
  const bulkNotice =
    "현재 페이지에서 선택한 링크만 일괄 처리됩니다. 검색 결과 전체 선택은 지원하지 않습니다. adminMemo·URL은 변경하지 않습니다.";

  return (
    <AdminBulkActionPanel
      domain="disclosureLinks"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      confirmMessageOverrides={DISCLOSURE_CONFIRM_OVERRIDES}
      executeAction={(actionId, ids) =>
        executeDisclosureLinkBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#4f5661]">
              조건에 맞는 링크가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <BulkHeaderCheckbox selection={selection} />
                    </th>
                    <th className="px-4 py-3">제목</th>
                    <th className="px-4 py-3">분류</th>
                    <th className="px-4 py-3">대상</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">검증일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {rows.map((row) => {
                    const publiclyVisible = isDisclosureLinkPubliclyVisible({
                      isPublished: row.isPublished,
                      status: row.status,
                    });
                    const togglePublish = !row.isPublished;
                    const publishBlocked = wouldPublishBlocked({
                      isPublished: togglePublish,
                      status: row.status,
                    });
                    const canArchive =
                      row.status !== DisclosureLinkStatus.archived;

                    return (
                      <tr key={row.id} className="align-top">
                        <td className="px-3 py-4">
                          <BulkRowCheckbox
                            id={row.id}
                            label={row.title}
                            selection={selection}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {row.title}
                          </div>
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-xs text-[#1f6b55] hover:underline"
                          >
                            URL 열기
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <span className={badgeClass("navy")}>
                            {CATEGORY_LABEL[row.category]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {row.insurerName ?? "공통"}
                          <div className="mt-1 text-xs">
                            {TARGET_TYPE_LABEL[row.targetType]}
                            {row.isOfficialSource ? (
                              <span className={`${badgeClass("green")} ml-1`}>
                                공식
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass(statusTone(row.status))}>
                              {STATUS_LABEL[row.status]}
                            </span>
                            <span
                              className={badgeClass(
                                row.isPublished ? "green" : "gray",
                              )}
                            >
                              {row.isPublished
                                ? PUBLICATION_LABEL.published
                                : PUBLICATION_LABEL.unpublished}
                            </span>
                            <span
                              className={badgeClass(
                                publiclyVisible ? "green" : "gray",
                              )}
                            >
                              {publiclyVisible
                                ? VISIBILITY_LABEL.visible
                                : VISIBILITY_LABEL.hidden}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {row.lastVerifiedAt ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:items-end">
                            <Link
                              href={`/admin/disclosure-links/${row.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                            >
                              수정
                            </Link>
                            {row.status !== DisclosureLinkStatus.needs_review ? (
                              <form
                                action={setDisclosureLinkStatus.bind(
                                  null,
                                  row.id,
                                  DisclosureLinkStatus.needs_review,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661]"
                                >
                                  검수 필요
                                </button>
                              </form>
                            ) : null}
                            {row.status !== DisclosureLinkStatus.published ? (
                              <form
                                action={setDisclosureLinkStatus.bind(
                                  null,
                                  row.id,
                                  DisclosureLinkStatus.published,
                                )}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#1f6b55]"
                                >
                                  검수 완료
                                </button>
                              </form>
                            ) : null}
                            <form
                              action={setDisclosureLinkPublished.bind(
                                null,
                                row.id,
                                togglePublish,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={publishBlocked}
                                className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                              >
                                {row.isPublished ? "비게시" : "게시"}
                              </button>
                            </form>
                            {canArchive ? (
                              <form
                                action={archiveDisclosureLink.bind(null, row.id)}
                              >
                                <button
                                  type="submit"
                                  className="w-full rounded-md border border-[#e8c4c4] px-3 py-1.5 text-xs font-semibold text-[#8b2e2e]"
                                >
                                  보관
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AdminBulkActionPanel>
  );
}
