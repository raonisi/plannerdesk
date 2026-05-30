"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminBulkActionId,
  AdminBulkActionPolicy,
  AdminBulkDomain,
  AdminBulkSelectableItem,
} from "@/lib/admin/bulk-policies";
import { normalizeRole, type PlannerDeskRole } from "@/lib/auth/rbac";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import AdminBulkConfirmDialog from "./AdminBulkConfirmDialog";
import AdminBulkResultSummary, {
  type AdminBulkResultSummaryData,
} from "./AdminBulkResultSummary";
import AdminBulkSelectionBar from "./AdminBulkSelectionBar";
import AdminBulkToolbar from "./AdminBulkToolbar";

export type BulkRowSelectionProps = {
  selectedIds: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  allSelected: boolean;
  selectionDisabled?: boolean;
};

export interface AdminBulkActionPanelProps {
  domain: AdminBulkDomain;
  items: AdminBulkSelectableItem[];
  role?: string | null;
  className?: string;
  extraConfirmNotice?: string;
  claimSafetyNotice?: boolean;
  executeAction: (
    actionId: AdminBulkActionId,
    ids: string[],
  ) => Promise<BulkRunResponse>;
  children: (selection: BulkRowSelectionProps) => ReactNode;
}

export function BulkRowCheckbox({
  id,
  label,
  selection,
}: {
  id: string;
  label: string;
  selection: BulkRowSelectionProps;
}) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-[#d9c9a8] text-[#10243e] focus:ring-[#b8924a]"
      checked={selection.selectedIds.has(id)}
      disabled={selection.selectionDisabled}
      onChange={(event) => selection.onToggleItem(id, event.target.checked)}
      aria-label={`${label} 선택`}
    />
  );
}

export function BulkHeaderCheckbox({
  selection,
}: {
  selection: BulkRowSelectionProps;
}) {
  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-[#d9c9a8] text-[#10243e] focus:ring-[#b8924a]"
      checked={selection.allSelected}
      disabled={selection.selectionDisabled}
      onChange={(event) => selection.onToggleAll(event.target.checked)}
      aria-label="현재 목록 전체 선택"
    />
  );
}

export default function AdminBulkActionPanel({
  domain,
  items,
  role: roleInput,
  className = "",
  extraConfirmNotice,
  claimSafetyNotice = false,
  executeAction,
  children,
}: AdminBulkActionPanelProps) {
  const role = normalizeRole(roleInput) as PlannerDeskRole;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pendingAction, setPendingAction] = useState<AdminBulkActionPolicy | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<AdminBulkResultSummaryData | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleItem = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(
    (checked: boolean) => {
      if (checked) handleSelectAll();
      else handleClearSelection();
    },
    [handleClearSelection, handleSelectAll],
  );

  const handleActionRequest = useCallback(
    (_actionId: AdminBulkActionId, policy: AdminBulkActionPolicy) => {
      setPendingAction(policy);
      setDialogOpen(true);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    const ids = [...selectedIds];
    startTransition(async () => {
      const response = await executeAction(pendingAction.id, ids);
      if (!response.ok) {
        setResult({
          actionLabel: pendingAction.resultSummaryLabel,
          requested: ids.length,
          succeeded: 0,
          skipped: 0,
          failed: ids.length,
          preview: false,
          message: response.message,
        });
      } else {
        setResult({
          actionLabel: response.actionLabel,
          requested: response.requested,
          succeeded: response.succeeded,
          skipped: response.skipped,
          failed: response.failed,
          preview: false,
          message: `처리가 완료되었습니다. (성공 ${response.succeeded}건, 건너뜀 ${response.skipped}건, 실패 ${response.failed}건)`,
        });
        setSelectedIds(new Set());
        if (response.ok && response.succeeded > 0) {
          router.refresh();
        }
      }
      setDialogOpen(false);
      setPendingAction(null);
    });
  }, [executeAction, pendingAction, router, selectedIds]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const selection: BulkRowSelectionProps = {
    selectedIds,
    onToggleItem: toggleItem,
    onToggleAll: toggleAllVisible,
    allSelected,
    selectionDisabled: isPending,
  };

  return (
    <div className={className}>
      <AdminBulkSelectionBar
        selectedCount={selectedIds.size}
        totalCount={items.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        disabled={items.length === 0 || isPending}
      />

      <div className="mt-3">
        <AdminBulkToolbar
          domain={domain}
          role={role}
          selectedItems={selectedItems}
          onActionRequest={handleActionRequest}
          disabled={items.length === 0 || isPending}
        />
      </div>

      {extraConfirmNotice ? (
        <p className="mt-3 text-xs leading-relaxed text-[#4f5661]">
          {extraConfirmNotice}
        </p>
      ) : null}

      {claimSafetyNotice ? (
        <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">
          PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다. 청구서류
          정보는 실무 참고용이며 보험사 공식 기준 확인이 필요합니다.
        </p>
      ) : null}

      <div className="mt-3">
        <AdminBulkResultSummary result={result} onDismiss={() => setResult(null)} />
      </div>

      {children(selection)}

      <AdminBulkConfirmDialog
        open={dialogOpen}
        action={pendingAction}
        selectedCount={selectedItems.length}
        onCancel={() => {
          if (isPending) return;
          setDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirm}
        previewMode={false}
      />
    </div>
  );
}
