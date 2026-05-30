"use client";

import Link from "next/link";
import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
} from "@prisma/client";
import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AdminBulkActionPanel, {
  BulkHeaderCheckbox,
  BulkRowCheckbox,
} from "@/components/admin/bulk/AdminBulkActionPanel";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import type { AdminBulkSelectableItem } from "@/lib/admin/bulk-policies";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";
import type {
  StarterImportApplyResult,
  StarterImportPreviewResult,
} from "@/lib/admin/knowledge-starter-import";
import {
  archiveKnowledgeArticle,
  executeKnowledgeBulkAction,
  importKnowledgeStarterDraftsAction,
  previewKnowledgeStarterDraftsAction,
  setKnowledgeArticlePublished,
  setKnowledgeArticleStatus,
} from "./actions";
import {
  ADMIN_KNOWLEDGE_COPY,
  CATEGORY_LABEL,
  PUBLICATION_LABEL,
  RISK_LABEL,
  SOURCE_TYPE_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  VISIBILITY_LABEL,
  isKnowledgeArticlePubliclyVisible,
  wouldPublishBlocked,
} from "./visibility";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

const KNOWLEDGE_CONFIRM_OVERRIDES: Partial<Record<AdminBulkActionId, string>> = {
  markVerified:
    "선택한 문서를 검수 완료 상태로 변경합니다. 공식 출처와 금지 표현을 확인한 뒤 진행하세요.",
  setPublishedTrue:
    "선택한 문서를 public 지식 아카이브에 노출할 수 있습니다. draft, archived, rejected 문서는 공개되지 않습니다. 보험금 판단, 손해사정 오인, 의료자료 입력 문구가 없는지 확인하세요.",
  archive:
    "선택한 문서를 보관 상태로 변경하고 public 노출을 차단합니다.",
};

const STARTER_IMPORT_CONFIRM =
  "30개의 지식 콘텐츠 초안을 draft 상태로 등록합니다. 등록된 문서는 public 화면에 노출되지 않으며, isPublished=false, aiUsable=false로 저장됩니다.";

export type KnowledgeListRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: KnowledgeArticleCategory;
  type: KnowledgeArticleType;
  status: KnowledgeArticleStatus;
  isPublished: boolean;
  aiUsable: boolean;
  riskLevel: KnowledgeRiskLevel;
  sourceType: KnowledgeSourceType;
  updatedAt: string;
};

function formatDate(value: string) {
  return value.slice(0, 10);
}

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") {
    return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  }
  if (tone === "gold") {
    return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  }
  if (tone === "navy") {
    return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  }
  if (tone === "red") {
    return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  }
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

function statusTone(status: KnowledgeArticleStatus): "green" | "gold" | "gray" | "red" {
  if (status === KnowledgeArticleStatus.verified) return "green";
  if (status === KnowledgeArticleStatus.needs_review) return "gold";
  if (status === KnowledgeArticleStatus.rejected) return "red";
  return "gray";
}

function toBulkItems(rows: KnowledgeListRow[]): AdminBulkSelectableItem[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    isPublished: row.isPublished,
    aiUsable: row.aiUsable,
  }));
}

function StarterImportPanel() {
  const router = useRouter();
  const [preview, setPreview] = useState<StarterImportPreviewResult | null>(null);
  const [applyResult, setApplyResult] = useState<StarterImportApplyResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runPreview = useCallback(() => {
    startTransition(async () => {
      setError(null);
      setApplyResult(null);
      const result = await previewKnowledgeStarterDraftsAction();
      if (!result.ok) {
        setError(result.message);
        setPreview(null);
        return;
      }
      setPreview(result);
    });
  }, []);

  const runImport = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await importKnowledgeStarterDraftsAction();
      setImportDialogOpen(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setApplyResult(result);
      if (result.created > 0) {
        router.refresh();
      }
    });
  }, [router]);

  return (
    <section
      className={`${surfaces.card} ${borders.default} ${shadows.card} mb-5 rounded-lg p-4`}
    >
      <h2 className="text-sm font-bold text-[#102235]">초안 일괄 등록 (30건)</h2>
      <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">
        starter 데이터는 draft · 비게시 · AI 참조 불가로만 등록됩니다. 중복 슬러그는
        건너뜁니다.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={runPreview}
          className="rounded-md border border-[#c8d2dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#102235] hover:bg-[#eef3f7] disabled:opacity-50"
        >
          30개 초안 미리보기
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setImportDialogOpen(true)}
          className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1.5 text-xs font-semibold text-[#7b5b19] hover:bg-[#efe4cf] disabled:opacity-50"
        >
          30개 초안 등록
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-xs text-[#8b2e2e]">{error}</p>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-md border border-[#b9d5c9] bg-[#edf7f2] px-3 py-3 text-xs text-[#4f5661]">
          <p className="font-semibold text-[#102235]">미리보기 결과</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>총 문서: {preview.totalDocuments}건</li>
            <li>신규 등록 예정: {preview.readyToCreate}건</li>
            <li>중복 슬러그(skip): {preview.duplicateSlugCount}건</li>
            <li>유효성 오류: {preview.invalidCount}건</li>
            <li>
              데이터 기본값 — status=draft:{" "}
              {preview.allStatusDraft ? "예" : "아니오"}, isPublished=false:{" "}
              {preview.allIsPublishedFalse ? "예" : "아니오"}, aiUsable=false:{" "}
              {preview.allAiUsableFalse ? "예" : "아니오"}
            </li>
          </ul>
          {preview.invalidReasons.length > 0 ? (
            <ul className="mt-2 max-h-32 overflow-y-auto list-disc pl-4 text-[#8b2e2e]">
              {preview.invalidReasons.map((item) => (
                <li key={`${item.slug}-${item.reason}`}>
                  {item.slug}: {item.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {applyResult ? (
        <div className="mt-4 rounded-md border border-[#b9d5c9] bg-[#edf7f2] px-3 py-3 text-xs text-[#4f5661]">
          <p className="font-semibold text-[#102235]">등록 결과</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>요청: {applyResult.requested}건</li>
            <li>생성: {applyResult.created}건</li>
            <li>중복 skip: {applyResult.skippedExistingSlug}건</li>
            <li>실패: {applyResult.failed}건</li>
          </ul>
          {applyResult.failures.length > 0 ? (
            <ul className="mt-2 max-h-32 overflow-y-auto list-disc pl-4 text-[#8b2e2e]">
              {applyResult.failures.map((item) => (
                <li key={`${item.slug}-${item.reason}`}>
                  {item.slug}: {item.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {importDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102235]/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`max-w-lg w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg p-6`}
          >
            <h3 className="text-lg font-bold text-[#102235]">30개 초안 등록</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#4f5661]">
              {STARTER_IMPORT_CONFIRM}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setImportDialogOpen(false)}
                className="rounded border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235]"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={runImport}
                className="rounded bg-[#10243e] px-4 py-2 text-sm font-semibold text-[#f7f3e8]"
              >
                등록 실행
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function KnowledgeAdminList({
  articles,
  role,
}: {
  articles: KnowledgeListRow[];
  role: string | null;
}) {
  const bulkItems = toBulkItems(articles);

  const bulkNotice =
    "선택한 지식 문서의 검수·게시 상태를 일괄 변경합니다. 공개 전 공식 출처와 금지 표현을 확인하세요. aiUsable은 변경하지 않습니다.";

  return (
    <>
      <StarterImportPanel />

      <AdminBulkActionPanel
        domain="knowledgeArticles"
        items={bulkItems}
        role={role}
        className="mb-5"
        extraConfirmNotice={bulkNotice}
        confirmMessageOverrides={KNOWLEDGE_CONFIRM_OVERRIDES}
        executeAction={(actionId: AdminBulkActionId, ids: string[]) =>
          executeKnowledgeBulkAction(actionId, ids)
        }
      >
        {(selection) => (
          <section
            className={`${surfaces.card} ${borders.default} ${shadows.card} overflow-hidden rounded-lg`}
          >
            {articles.length === 0 ? (
              <div className="p-8 text-center">
                <h2 className="text-lg font-semibold text-[#102235]">
                  조건에 맞는 지식 문서가 없습니다.
                </h2>
                <p className={`${textStyles.body} mt-2`}>
                  새 문서를 작성하거나 필터를 조정해 주세요.
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
                      <th className="px-4 py-3">문서</th>
                      <th className="px-4 py-3">분류·상태</th>
                      <th className="px-4 py-3">수정일</th>
                      <th className="px-4 py-3 text-right">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7ddc9]">
                    {articles.map((article) => {
                      const publiclyVisible = isKnowledgeArticlePubliclyVisible({
                        isPublished: article.isPublished,
                        status: article.status,
                      });
                      const togglePublishTarget = !article.isPublished;
                      const publishBlocked = wouldPublishBlocked({
                        isPublished: togglePublishTarget,
                        status: article.status,
                      });
                      const canArchive =
                        article.status !== KnowledgeArticleStatus.archived;

                      return (
                        <tr key={article.id} className="align-top">
                          <td className="px-3 py-4">
                            <BulkRowCheckbox
                              id={article.id}
                              label={article.title}
                              selection={selection}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-[#102235]">
                              {article.title}
                            </div>
                            <div className="mt-1 font-mono text-xs text-[#5f6875]">
                              {article.slug}
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs text-[#4f5661]">
                              {article.summary}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <span className={badgeClass("navy")}>
                                {CATEGORY_LABEL[article.category]}
                              </span>
                              <span className={badgeClass("navy")}>
                                {TYPE_LABEL[article.type]}
                              </span>
                              <span
                                className={badgeClass(statusTone(article.status))}
                              >
                                {STATUS_LABEL[article.status]}
                              </span>
                              <span
                                className={badgeClass(
                                  article.isPublished ? "green" : "gray",
                                )}
                              >
                                {article.isPublished
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
                              {article.aiUsable ? (
                                <span className={badgeClass("gold")}>AI 참조</span>
                              ) : null}
                              <span className={badgeClass("gray")}>
                                {RISK_LABEL[article.riskLevel]}
                              </span>
                              <span className={badgeClass("gray")}>
                                {SOURCE_TYPE_LABEL[article.sourceType]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[#4f5661]">
                            {formatDate(article.updatedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2 sm:items-end">
                              <Link
                                href={`/admin/knowledge/${article.id}/edit`}
                                className="rounded-md border border-[#d9c9a8] px-3 py-1.5 text-center text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                              >
                                수정
                              </Link>
                              {article.status !==
                              KnowledgeArticleStatus.needs_review ? (
                                <form
                                  action={setKnowledgeArticleStatus.bind(
                                    null,
                                    article.id,
                                    KnowledgeArticleStatus.needs_review,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#4f5661] hover:bg-[#f7f1e5]"
                                  >
                                    검수 필요
                                  </button>
                                </form>
                              ) : null}
                              {article.status !==
                              KnowledgeArticleStatus.verified ? (
                                <form
                                  action={setKnowledgeArticleStatus.bind(
                                    null,
                                    article.id,
                                    KnowledgeArticleStatus.verified,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold text-[#1f6b55] hover:bg-[#edf7f2]"
                                  >
                                    검수 완료
                                  </button>
                                </form>
                              ) : null}
                              <form
                                action={setKnowledgeArticlePublished.bind(
                                  null,
                                  article.id,
                                  togglePublishTarget,
                                )}
                              >
                                <button
                                  type="submit"
                                  disabled={publishBlocked}
                                  title={
                                    publishBlocked
                                      ? ADMIN_KNOWLEDGE_COPY.draftPublishBlocked
                                      : undefined
                                  }
                                  className="w-full rounded-md border border-[#d9c9a8] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                                >
                                  {article.isPublished ? "비게시" : "공개 전환"}
                                </button>
                              </form>
                              {canArchive ? (
                                <form
                                  action={archiveKnowledgeArticle.bind(
                                    null,
                                    article.id,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    className="w-full rounded-md border border-[#e8c4c4] px-3 py-1.5 text-xs font-semibold text-[#8b2e2e] hover:bg-[#fdf2f2]"
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
    </>
  );
}
