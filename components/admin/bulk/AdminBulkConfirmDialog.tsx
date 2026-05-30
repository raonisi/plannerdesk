"use client";

import type { AdminBulkActionPolicy } from "@/lib/admin/bulk-policies";
import { ADMIN_BULK_FOUNDATION_NOTICE } from "@/lib/admin/bulk-policies";
import { borders, shadows, surfaces } from "@/lib/design-system";

export interface AdminBulkConfirmDialogProps {
  open: boolean;
  action: AdminBulkActionPolicy | null;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  previewMode?: boolean;
}

export default function AdminBulkConfirmDialog({
  open,
  action,
  selectedCount,
  onCancel,
  onConfirm,
  previewMode = true,
}: AdminBulkConfirmDialogProps) {
  if (!open || !action) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102235]/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-bulk-confirm-title"
    >
      <div
        className={`max-w-lg w-full ${surfaces.card} ${borders.default} ${shadows.elevated} rounded-lg overflow-hidden`}
      >
        <div className="h-1.5 bg-[#aa8137]" />
        <div className="p-6">
          <h2
            id="admin-bulk-confirm-title"
            className="text-lg font-bold text-[#102235] mb-2"
          >
            {action.label}
          </h2>
          <p className="text-sm text-[#4f5661] mb-4 leading-relaxed">
            {action.confirmMessage}
          </p>
          <p className="text-xs text-[#4f5661] mb-2">
            대상: <strong>{selectedCount}건</strong>
          </p>
          <p className="text-xs text-[#4f5661] mb-4 leading-relaxed">
            <span className="font-semibold text-[#303845]">공개·검수 기준: </span>
            {action.publishRules}
          </p>
          {action.forbiddenConditions.length > 0 ? (
            <ul className="mb-4 list-disc pl-4 text-xs text-[#4f5661] space-y-1">
              {action.forbiddenConditions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {previewMode ? (
            <p className="mb-4 rounded-md bg-[#f7f1e5] border border-[#d9c9a8] px-3 py-2 text-xs text-[#7b5b19] leading-relaxed">
              {ADMIN_BULK_FOUNDATION_NOTICE}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-[#d9c9a8] bg-white px-4 py-2 text-sm font-semibold text-[#102235] hover:bg-[#f4efe5]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded bg-[#10243e] px-4 py-2 text-sm font-semibold text-[#f7f3e8] hover:bg-[#17324f]"
            >
              {previewMode ? "미리보기 확인" : "실행"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
