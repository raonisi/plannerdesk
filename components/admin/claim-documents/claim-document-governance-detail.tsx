"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import {
  fetchClaimDocumentGovernanceAuditLogsAction,
  saveClaimDocumentGovernanceAction,
} from "@/app/admin/claim-documents/governance/actions";
import {
  CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE,
  CLAIM_DOCUMENT_REVIEW_STATUS_LABELS,
} from "@/lib/claim-documents/governance-defaults";
import { CLAIM_DOCUMENT_REVIEW_STATUS_VALUES } from "@/lib/claim-documents/governance-validation";
import type {
  ClaimDocumentGovernanceAuditLogEntry,
  ClaimDocumentWithGovernance,
} from "@/lib/claim-documents/governance-types";
import {
  PUBLIC_CTA_PDF_DOWNLOAD,
  PUBLIC_CTA_PDF_OPEN,
} from "@/lib/public/public-cta-labels";
import { ClaimDocumentGovernanceStatusBadge } from "./claim-document-governance-status-badge";

const actionButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

const AUDIT_FIELD_LABELS: Record<string, string> = {
  officialSourceUrl: "공식 URL",
  officialSourceLabel: "공식 URL 라벨",
  lastVerifiedAt: "검수일",
  nextReviewDueAt: "다음 검수 예정일",
  reviewStatus: "검수 상태",
  isVisible: "노출 여부",
  isDownloadEnabled: "다운로드 허용",
  cautionText: "안내 문구",
  adminMemo: "관리자 메모",
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[120px_1fr] sm:gap-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-slate-900">{value}</dd>
    </div>
  );
}

function toDateInputValue(value?: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatAuditValue(fieldName: string, value?: string): string {
  if (!value) return "—";
  if (fieldName === "reviewStatus") {
    return (
      CLAIM_DOCUMENT_REVIEW_STATUS_LABELS[
        value as keyof typeof CLAIM_DOCUMENT_REVIEW_STATUS_LABELS
      ] ?? value
    );
  }
  if (fieldName === "isVisible") {
    return value === "true" ? "표시" : "숨김";
  }
  if (fieldName === "isDownloadEnabled") {
    return value === "true" ? "허용" : "비활성";
  }
  if (fieldName === "lastVerifiedAt" || fieldName === "nextReviewDueAt") {
    return value.slice(0, 10);
  }
  return value;
}

function formatChangedBy(changedBy?: string): string {
  if (changedBy?.trim()) return changedBy.trim();
  return "정보 부족";
}

export function ClaimDocumentGovernanceDetail({
  item,
  onClose,
  onSaved,
}: {
  item: ClaimDocumentWithGovernance;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const { governance, href } = item;
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [auditLogs, setAuditLogs] = useState<
    ClaimDocumentGovernanceAuditLogEntry[]
  >(item.recentAuditLogs ?? []);
  const [auditLoading, setAuditLoading] = useState(
    () => (item.recentAuditLogs?.length ?? 0) === 0,
  );

  useEffect(() => {
    let cancelled = false;

    void fetchClaimDocumentGovernanceAuditLogsAction(governance.documentKey)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          setAuditLogs(result.logs);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAuditLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [governance.documentKey]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await saveClaimDocumentGovernanceAction(formData);
      setMessage(result.message);
      setMessageTone(result.ok ? "success" : "error");
      if (result.ok) {
        const logsResult = await fetchClaimDocumentGovernanceAuditLogsAction(
          governance.documentKey,
        );
        if (logsResult.ok) {
          setAuditLogs(logsResult.logs);
        }
        onSaved?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        aria-labelledby="governance-detail-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg"
        role="dialog"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2
              className="break-words text-lg font-bold text-slate-950"
              id="governance-detail-title"
            >
              청구서류 상세 보기
            </h2>
            <p className="mt-1 text-sm text-slate-500">{governance.documentTitle}</p>
          </div>
          <button
            aria-label="상세 보기 닫기"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
            {CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE}
          </p>

          <dl className="mt-4">
            <DetailRow label="보험사명" value={governance.insurerName} />
            <DetailRow label="문서명" value={governance.documentTitle} />
            <DetailRow label="파일명" value={governance.fileName} />
            <DetailRow label="파일 경로" value={governance.filePath} />
            <DetailRow label="documentKey" value={governance.documentKey} />
            <DetailRow
              label="현재 검수 상태"
              value={
                <ClaimDocumentGovernanceStatusBadge status={governance.reviewStatus} />
              }
            />
          </dl>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input name="documentKey" type="hidden" value={governance.documentKey} />
            <input name="insurerName" type="hidden" value={governance.insurerName} />
            <input
              name="documentTitle"
              type="hidden"
              value={governance.documentTitle}
            />
            <input name="fileName" type="hidden" value={governance.fileName} />
            <input name="filePath" type="hidden" value={governance.filePath} />
            {governance.insurerId ? (
              <input name="insurerId" type="hidden" value={governance.insurerId} />
            ) : null}

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">공식 URL</span>
              <input
                className={inputClass}
                defaultValue={governance.officialSourceUrl ?? ""}
                name="officialSourceUrl"
                placeholder="https://"
                type="url"
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">공식 URL 라벨</span>
              <input
                className={inputClass}
                defaultValue={governance.officialSourceLabel ?? ""}
                name="officialSourceLabel"
                type="text"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">검수일</span>
                <input
                  className={inputClass}
                  defaultValue={toDateInputValue(governance.lastVerifiedAt)}
                  name="lastVerifiedAt"
                  type="date"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">다음 검수 예정일</span>
                <input
                  className={inputClass}
                  defaultValue={toDateInputValue(governance.nextReviewDueAt)}
                  name="nextReviewDueAt"
                  type="date"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">검수 상태</span>
              <select
                className={inputClass}
                defaultValue={governance.reviewStatus}
                name="reviewStatus"
              >
                {CLAIM_DOCUMENT_REVIEW_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {CLAIM_DOCUMENT_REVIEW_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">노출 여부</span>
                <select
                  className={inputClass}
                  defaultValue={governance.isVisible ? "true" : "false"}
                  name="isVisible"
                >
                  <option value="true">표시</option>
                  <option value="false">숨김</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-slate-700">다운로드 허용</span>
                <select
                  className={inputClass}
                  defaultValue={governance.isDownloadEnabled ? "true" : "false"}
                  name="isDownloadEnabled"
                >
                  <option value="true">허용</option>
                  <option value="false">비활성</option>
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">안내 문구</span>
              <textarea
                className={`${inputClass} min-h-[88px]`}
                defaultValue={governance.cautionText ?? ""}
                name="cautionText"
                rows={3}
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">관리자 메모</span>
              <textarea
                className={`${inputClass} min-h-[88px]`}
                defaultValue={governance.adminMemo ?? ""}
                name="adminMemo"
                rows={3}
              />
            </label>

            <label className="block text-sm">
              <span className="font-semibold text-slate-700">변경 사유</span>
              <input
                className={inputClass}
                name="changeReason"
                placeholder="변경 사유를 입력해 주세요"
                type="text"
              />
            </label>

            {message ? (
              <p
                className={`rounded-xl px-4 py-3 text-sm ${
                  messageTone === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-rose-200 bg-rose-50 text-rose-800"
                }`}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "저장 중…" : "검수 정보 저장"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">최근 변경 이력</h3>
            {auditLoading ? (
              <p className="mt-2 text-sm text-slate-500">변경 이력을 불러오는 중…</p>
            ) : auditLogs.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">저장된 변경 이력이 없습니다.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{log.changedAt.slice(0, 10)}</span>
                      <span>·</span>
                      <span>{formatChangedBy(log.changedBy)}</span>
                    </div>
                    <p className="mt-1 font-semibold text-slate-800">
                      {AUDIT_FIELD_LABELS[log.fieldName] ?? log.fieldName}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {formatAuditValue(log.fieldName, log.previousValue)} →{" "}
                      {formatAuditValue(log.fieldName, log.nextValue)}
                    </p>
                    {log.changeReason ? (
                      <p className="mt-1 text-xs text-slate-500">
                        사유: {log.changeReason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              aria-label={`${governance.documentTitle} ${PUBLIC_CTA_PDF_DOWNLOAD}`}
              className={`${actionButtonClass} bg-slate-900 text-white hover:bg-slate-800`}
              download={governance.fileName}
              href={href}
            >
              {PUBLIC_CTA_PDF_DOWNLOAD}
            </a>
            <ExternalTabAnchor
              aria-label={`${governance.documentTitle} ${PUBLIC_CTA_PDF_OPEN}`}
              className={actionButtonClass}
              href={href}
            >
              {PUBLIC_CTA_PDF_OPEN}
            </ExternalTabAnchor>
          </div>
        </div>
      </div>
    </div>
  );
}
