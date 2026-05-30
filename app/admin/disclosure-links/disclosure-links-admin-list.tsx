"use client";

import Link from "next/link";
import type { DisclosureCategory, DisclosureLinkEntry } from "@/lib/content";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import { disclosureCategoryLabels } from "@/lib/disclosure-display";
import { inferDisclosureIsPublished } from "@/lib/admin/static-disclosure-admin";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import { executeDisclosureLinkBulkAction } from "./actions";
import {
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isDisclosureAdminVisible,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export type DisclosureLinkListRow = {
  id: string;
  title: string;
  category: DisclosureCategory;
  sourceUrl: string | null;
  description: string;
  lastVerifiedAt: string | null;
  verificationStatus: DisclosureLinkEntry["verificationStatus"];
  isPublished: boolean;
};

function badgeClass(tone: "green" | "gold" | "gray" | "navy") {
  if (tone === "green") {
    return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  }
  if (tone === "gold") {
    return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  }
  if (tone === "navy") {
    return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  }
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(
  status: DisclosureLinkEntry["verificationStatus"],
): "green" | "gold" | "gray" {
  if (status === "verified") return "green";
  if (status === "needs_review") return "gold";
  return "gray";
}

function toBulkItems(rows: DisclosureLinkListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.verificationStatus,
    isPublished: row.isPublished,
  }));
}

export default function DisclosureLinksAdminList({
  entries,
  role,
}: {
  entries: DisclosureLinkListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(entries);
  const bulkNotice =
    "일괄 검수·게시 변경은 DisclosureLink DB 모델 도입 후 저장됩니다. 현재는 UI·정책만 준비되어 있습니다.";

  return (
    <AdminBulkActionPanel
      domain="disclosureLinks"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      executeAction={(actionId: AdminBulkActionId, ids: string[]) =>
        executeDisclosureLinkBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                조건에 맞는 공시·약관 링크가 없습니다.
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                필터를 조정하거나 DB 연동 후 신규 등록을 사용해 주세요.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d9c9a8] text-sm">
                <thead className="bg-[#f7f1e5] text-left text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <BulkHeaderCheckbox selection={selection} />
                    </th>
                    <th className="px-4 py-3">제목 / 링크</th>
                    <th className="px-4 py-3">분류·상태</th>
                    <th className="px-4 py-3">출처 확인일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {entries.map((entry) => {
                    const rowForVisibility = {
                      id: entry.id,
                      title: entry.title,
                      category: entry.category,
                      sourceUrl: entry.sourceUrl,
                      description: entry.description,
                      lastVerifiedAt: entry.lastVerifiedAt,
                      verificationStatus: entry.verificationStatus,
                    } as DisclosureLinkEntry;
                    const publiclyVisible =
                      isDisclosureAdminVisible(rowForVisibility);

                    return (
                      <tr key={entry.id} className="align-top">
                        <td className="px-3 py-4">
                          <BulkRowCheckbox
                            id={entry.id}
                            label={entry.title}
                            selection={selection}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {entry.title}
                          </div>
                          {entry.sourceUrl ? (
                            <a
                              href={entry.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block break-all font-mono text-xs text-[#1f6b55] hover:underline"
                            >
                              {entry.sourceUrl}
                            </a>
                          ) : (
                            <span className="mt-1 text-xs text-[#8a909a]">
                              출처 URL 없음
                            </span>
                          )}
                          <p className="mt-2 line-clamp-2 text-xs text-[#4f5661]">
                            {entry.description}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass("navy")}>
                              {disclosureCategoryLabels[entry.category]}
                            </span>
                            <span
                              className={badgeClass(
                                statusTone(entry.verificationStatus),
                              )}
                            >
                              {VERIFICATION_STATUS_LABEL[entry.verificationStatus]}
                            </span>
                            <span
                              className={badgeClass(
                                entry.isPublished ? "green" : "gray",
                              )}
                            >
                              {entry.isPublished
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
                          {entry.lastVerifiedAt ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:items-end">
                            <Link
                              href={`/admin/disclosure-links/${entry.id}`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                            >
                              상세
                            </Link>
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

export function serializeDisclosureRows(
  entries: DisclosureLinkEntry[],
): DisclosureLinkListRow[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    sourceUrl: entry.sourceUrl,
    description: entry.description,
    lastVerifiedAt: entry.lastVerifiedAt,
    verificationStatus: entry.verificationStatus,
    isPublished: inferDisclosureIsPublished(entry.verificationStatus),
  }));
}
