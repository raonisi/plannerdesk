"use client";

import Link from "next/link";
import type { CustomerMessageTemplate, MessageSituation, MessageTone } from "@/lib/content";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import {
  inferMessageTemplateIsPublished,
  inferMessageTemplateVerificationStatus,
} from "@/lib/admin/static-message-template-admin";
import {
  messageSituationLabels,
  messageToneLabels,
} from "@/lib/message-templates/display";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import { executeMessageTemplateBulkAction } from "./actions";
import {
  PUBLICATION_LABEL,
  VERIFICATION_STATUS_LABEL,
  VISIBILITY_LABEL,
  isMessageTemplateAdminVisible,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export type MessageTemplateListRow = {
  id: string;
  title: string;
  situationCategory: MessageSituation;
  tone: MessageTone;
  situation: string;
  body: string;
  lastUpdatedAt: string;
  verificationStatus: ReturnType<typeof inferMessageTemplateVerificationStatus>;
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
  status: MessageTemplateListRow["verificationStatus"],
): "green" | "gold" | "gray" {
  if (status === "verified") return "green";
  if (status === "needs_review") return "gold";
  return "gray";
}

function toBulkItems(rows: MessageTemplateListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.verificationStatus,
    isPublished: row.isPublished,
  }));
}

export default function MessageTemplatesAdminList({
  templates,
  role,
}: {
  templates: MessageTemplateListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(templates);
  const bulkNotice =
    "일괄 검수·게시 변경은 MessageTemplate DB 모델 도입 후 저장됩니다. 현재는 UI·정책만 준비되어 있습니다.";

  return (
    <AdminBulkActionPanel
      domain="messageTemplates"
      items={bulkItems}
      role={role}
      className="mb-5"
      extraConfirmNotice={bulkNotice}
      executeAction={(actionId: AdminBulkActionId, ids: string[]) =>
        executeMessageTemplateBulkAction(actionId, ids)
      }
    >
      {(selection) => (
        <section
          className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
        >
          {templates.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-[#102235]">
                조건에 맞는 고객 안내 문구가 없습니다.
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
                    <th className="px-4 py-3">제목 / 상황</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">수정일</th>
                    <th className="px-4 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ddc9]">
                  {templates.map((template) => {
                    const fullTemplate = {
                      id: template.id,
                      title: template.title,
                      situationCategory: template.situationCategory,
                      situation: template.situation,
                      tone: template.tone,
                      body: template.body,
                      safetyNote: "",
                      lastUpdatedAt: template.lastUpdatedAt,
                    } as CustomerMessageTemplate;
                    const publiclyVisible =
                      isMessageTemplateAdminVisible(fullTemplate);

                    return (
                      <tr key={template.id} className="align-top">
                        <td className="px-3 py-4">
                          <BulkRowCheckbox
                            id={template.id}
                            label={template.title}
                            selection={selection}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#102235]">
                            {template.title}
                          </div>
                          <p className="mt-1 text-xs text-[#5f6875]">
                            {messageSituationLabels[template.situationCategory]} ·{" "}
                            {messageToneLabels[template.tone]}
                          </p>
                          <p className="mt-2 line-clamp-2 text-xs text-[#4f5661]">
                            {template.body}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={badgeClass(
                                statusTone(template.verificationStatus),
                              )}
                            >
                              {VERIFICATION_STATUS_LABEL[template.verificationStatus]}
                            </span>
                            <span
                              className={badgeClass(
                                template.isPublished ? "green" : "gray",
                              )}
                            >
                              {template.isPublished
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
                          {template.lastUpdatedAt}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/message-templates/${template.id}`}
                            className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                          >
                            상세
                          </Link>
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

export function serializeMessageTemplateRows(
  templates: CustomerMessageTemplate[],
): MessageTemplateListRow[] {
  return templates.map((template) => ({
    id: template.id,
    title: template.title,
    situationCategory: template.situationCategory,
    tone: template.tone,
    situation: template.situation,
    body: template.body,
    lastUpdatedAt: template.lastUpdatedAt,
    verificationStatus: inferMessageTemplateVerificationStatus(template),
    isPublished: inferMessageTemplateIsPublished(template),
  }));
}
