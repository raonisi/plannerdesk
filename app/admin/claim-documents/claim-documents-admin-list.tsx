"use client";

import Link from "next/link";
import {
  ClaimDocumentCategory,
  VerificationStatus,
} from "@prisma/client";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import {
  executeClaimDocumentBulkAction,
  setClaimDocumentPublished,
} from "./actions";
import {
  ADMIN_CLAIM_DOC_COPY,
  CLAIM_DOCUMENT_CATEGORY_LABEL,
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isClaimDocumentPubliclyVisible,
  wouldPublishDraft,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export type ClaimDocumentListRow = {
  id: string;
  title: string;
  slug: string;
  category: ClaimDocumentCategory;
  verificationStatus: VerificationStatus;
  isPublished: boolean;
  lastVerifiedAt: string | null;
  updatedAt: string;
  summary: string | null;
  insurerName: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "검수 이력 없음";
  return value.slice(0, 10);
}

function categoryLabel(category: ClaimDocumentCategory) {
  return CLAIM_DOCUMENT_CATEGORY_LABEL[category];
}

function statusLabel(status: VerificationStatus) {
  return VERIFICATION_STATUS_LABEL[status];
}

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

function statusTone(status: VerificationStatus): "green" | "gold" | "gray" {
  if (status === VerificationStatus.verified) return "green";
  if (status === VerificationStatus.needs_review) return "gold";
  return "gray";
}

function toBulkItems(rows: ClaimDocumentListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.verificationStatus,
    isPublished: row.isPublished,
  }));
}

export default function ClaimDocumentsAdminList({
  claimDocuments,
  role,
}: {
  claimDocuments: ClaimDocumentListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(claimDocuments);

  const bulkNotice =
    "선택한 항목의 상태를 일괄 변경합니다. 게시로 전환하면 public 화면(/claim-documents)에 노출될 수 있습니다. 검수 상태와 공개 조건을 반드시 확인하세요.";

  return (
    <AdminBulkActionPanel
      domain="claimDocuments"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      claimSafetyNotice
      executeAction={(actionId: AdminBulkActionId, ids: string[]) =>
        executeClaimDocumentBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} mt-5 overflow-hidden rounded-lg`}
        >
          {claimDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                필터 조건에 맞는 청구서류가 없습니다.
              </h2>
              <p className={`${textStyles.body} mt-2`}>
                초안 청구서류를 등록하거나 필터 조건을 다시 확인해 주세요.
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
                    <th className="px-4 py-3">제목 / 보험사</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">최종 검수일</th>
                    <th className="px-4 py-3">수정일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {claimDocuments.map((claimDocument) => {
                    const publiclyVisible = isClaimDocumentPubliclyVisible({
                      isPublished: claimDocument.isPublished,
                      verificationStatus: claimDocument.verificationStatus,
                    });
                    const togglePublishTarget = !claimDocument.isPublished;
                    const publishWouldBeBlocked = wouldPublishDraft({
                      isPublished: togglePublishTarget,
                      verificationStatus: claimDocument.verificationStatus,
                    });
                    return (
                      <tr key={claimDocument.id} className="align-top">
                        <td className="px-3 py-4">
                          <BulkRowCheckbox
                            id={claimDocument.id}
                            label={claimDocument.title}
                            selection={selection}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {claimDocument.title}
                          </div>
                          <div className="mt-1 text-xs text-[#5f6875]">
                            <span className="font-mono">{claimDocument.slug}</span>
                            {" · "}
                            {claimDocument.insurerName ?? "일반 청구 안내"}
                          </div>
                          {claimDocument.summary ? (
                            <p className="mt-2 line-clamp-2 break-words text-xs text-[#4f5661]">
                              {claimDocument.summary}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span className={badgeClass("navy")}>
                              {categoryLabel(claimDocument.category)}
                            </span>
                            <span
                              className={badgeClass(
                                statusTone(claimDocument.verificationStatus),
                              )}
                            >
                              {statusLabel(claimDocument.verificationStatus)}
                            </span>
                            <span
                              className={badgeClass(
                                claimDocument.isPublished ? "green" : "gray",
                              )}
                            >
                              {claimDocument.isPublished
                                ? PUBLICATION_LABEL.published
                                : PUBLICATION_LABEL.unpublished}
                            </span>
                            <span
                              className={badgeClass(
                                publiclyVisible ? "green" : "gray",
                              )}
                              title={
                                publiclyVisible
                                  ? ADMIN_CLAIM_DOC_COPY.policySummary
                                  : `${ADMIN_CLAIM_DOC_COPY.policySummary} ${ADMIN_CLAIM_DOC_COPY.draftRule}`
                              }
                            >
                              {publiclyVisible
                                ? VISIBILITY_LABEL.visible
                                : VISIBILITY_LABEL.hidden}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(claimDocument.lastVerifiedAt)}
                        </td>
                        <td className="px-4 py-4 text-[#4f5661]">
                          {formatDate(claimDocument.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Link
                              href={`/admin/claim-documents/${claimDocument.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
                            >
                              수정
                            </Link>
                            <form
                              action={setClaimDocumentPublished.bind(
                                null,
                                claimDocument.id,
                                togglePublishTarget,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={publishWouldBeBlocked}
                                title={
                                  publishWouldBeBlocked
                                    ? ADMIN_CLAIM_DOC_COPY.draftPublishBlocked
                                    : undefined
                                }
                                className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] transition hover:bg-[#f7f1e5] disabled:cursor-not-allowed disabled:border-[#d6d8dc] disabled:bg-[#f4f5f6] disabled:text-[#8a909a] disabled:hover:bg-[#f4f5f6]"
                              >
                                {claimDocument.isPublished
                                  ? "비게시로 전환"
                                  : "공개로 전환"}
                              </button>
                            </form>
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
