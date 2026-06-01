"use client";

import Link from "next/link";
import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
} from "@prisma/client";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId, AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
} from "@/lib/message-template/safety";
import { validatePublishRules } from "@/lib/validators/message-template";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  archiveMessageTemplate,
  executeMessageTemplateBulkAction,
  setMessageTemplatePublished,
  setMessageTemplateStatus,
} from "./actions";
import {
  AUDIENCE_LABEL,
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  INTERNAL_LABEL,
  isMessageTemplatePubliclyVisible,
  PUBLICATION_LABEL,
  RISK_LABEL,
  STATUS_LABEL,
  TONE_LABEL,
  VISIBILITY_LABEL,
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

function statusTone(status: MessageTemplateStatus): "green" | "gold" | "gray" | "red" {
  if (status === MessageTemplateStatus.published) return "green";
  if (status === MessageTemplateStatus.needs_review) return "gold";
  if (status === MessageTemplateStatus.archived) return "red";
  return "gray";
}

function riskTone(risk: MessageTemplateRiskLevel): "green" | "gold" | "gray" | "red" {
  if (risk === MessageTemplateRiskLevel.high) return "red";
  if (risk === MessageTemplateRiskLevel.medium) return "gold";
  return "gray";
}

export type MessageTemplateListRow = {
  id: string;
  title: string;
  useCase: string;
  category: MessageTemplateCategory;
  channel: MessageTemplateChannel;
  audienceType: MessageTemplateAudienceType;
  tone: MessageTemplateTone;
  riskLevel: MessageTemplateRiskLevel;
  status: MessageTemplateStatus;
  isPublished: boolean;
  isInternalOnly: boolean;
  safeCopy: string | null;
  reviewedAt: string | null;
};

const MESSAGE_CONFIRM_OVERRIDES: Partial<Record<AdminBulkActionId, string>> = {
  setPublishedTrue:
    "선택한 항목에 일괄 공개 처리를 실행합니다. 고객문구는 검수 완료된 safeCopy만 public에 노출됩니다. 내부 전용, 미검수, 금지 표현·민감 변수 포함 문구는 공개 처리되지 않습니다.",
  archive:
    "선택한 항목을 보관하고 비공개 처리합니다. body·complianceNote는 public에 노출되지 않으며, 수정 화면에서 복구할 수 있습니다.",
};

function toBulkItems(rows: MessageTemplateListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    isPublished: row.isPublished,
  }));
}

export default function MessageTemplatesAdminList({
  rows,
  role,
}: {
  rows: MessageTemplateListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(rows);
  const bulkNotice =
    "현재 페이지에서 선택한 문구만 일괄 처리합니다. body·forbiddenClaims·complianceNote는 변경하지 않습니다.";

  return (
    <AdminBulkActionPanel
      domain="messageTemplates"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      confirmMessageOverrides={MESSAGE_CONFIRM_OVERRIDES}
      executeAction={(actionId, ids) =>
        executeMessageTemplateBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#4f5661]">
              조건에 맞는 문구가 없습니다.
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
                    <th className="px-4 py-3">분류·채널</th>
                    <th className="px-4 py-3">상태·공개</th>
                    <th className="px-4 py-3">검수일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {rows.map((row) => {
                    const publiclyVisible = isMessageTemplatePubliclyVisible({
                      isPublished: row.isPublished,
                      status: row.status,
                      isInternalOnly: row.isInternalOnly,
                    });
                    const togglePublish = !row.isPublished;
                    const publishBlocked =
                      wouldPublishBlocked({
                        isPublished: togglePublish,
                        status: row.status,
                      }) ||
                      validatePublishRules({
                        isPublished: togglePublish,
                        status: row.status,
                        isInternalOnly: row.isInternalOnly,
                        safeCopy: row.safeCopy,
                        riskLevel: row.riskLevel,
                      }) !== null;
                    const canArchive =
                      row.status !== MessageTemplateStatus.archived;
                    const missingSafeCopy = !row.safeCopy?.trim();
                    const prohibitedHit = findProhibitedPhrase(row.safeCopy);
                    const sensitiveHit = findSensitiveVariable(row.safeCopy);

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
                          <p className="mt-1 line-clamp-2 text-xs text-[#4f5661]">
                            {row.useCase}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {missingSafeCopy ? (
                              <span className={badgeClass("gold")}>
                                안전 문구 없음
                              </span>
                            ) : null}
                            {prohibitedHit ? (
                              <span className={badgeClass("red")}>금지 표현</span>
                            ) : null}
                            {sensitiveHit ? (
                              <span className={badgeClass("red")}>민감 변수</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={badgeClass("navy")}>
                            {CATEGORY_LABEL[row.category]}
                          </span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className={badgeClass("gray")}>
                              {CHANNEL_LABEL[row.channel]}
                            </span>
                            <span className={badgeClass("gray")}>
                              {TONE_LABEL[row.tone]}
                            </span>
                            <span className={badgeClass(riskTone(row.riskLevel))}>
                              위험 {RISK_LABEL[row.riskLevel]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#4f5661]">
                            {AUDIENCE_LABEL[row.audienceType]}
                          </p>
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
                                row.isInternalOnly ? "gold" : "gray",
                              )}
                            >
                              {row.isInternalOnly
                                ? INTERNAL_LABEL.internal
                                : INTERNAL_LABEL.external}
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
                          {row.reviewedAt ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 sm:items-end">
                            <Link
                              href={`/admin/message-templates/${row.id}/edit`}
                              className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                            >
                              수정
                            </Link>
                            {row.status !== MessageTemplateStatus.needs_review ? (
                              <form
                                action={setMessageTemplateStatus.bind(
                                  null,
                                  row.id,
                                  MessageTemplateStatus.needs_review,
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
                            {row.status !== MessageTemplateStatus.published ? (
                              <form
                                action={setMessageTemplateStatus.bind(
                                  null,
                                  row.id,
                                  MessageTemplateStatus.published,
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
                              action={setMessageTemplatePublished.bind(
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
                                action={archiveMessageTemplate.bind(null, row.id)}
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
