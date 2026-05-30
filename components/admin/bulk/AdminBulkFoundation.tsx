"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  AdminBulkActionId,
  AdminBulkActionPolicy,
  AdminBulkDomain,
  AdminBulkSelectableItem,
} from "@/lib/admin/bulk-policies";
import {
  ADMIN_BULK_FOUNDATION_NOTICE,
  getBulkDomainPolicy,
} from "@/lib/admin/bulk-policies";
import { normalizeRole, type PlannerDeskRole } from "@/lib/auth/rbac";
import AdminBulkConfirmDialog from "./AdminBulkConfirmDialog";
import AdminBulkResultSummary, {
  type AdminBulkResultSummaryData,
} from "./AdminBulkResultSummary";
import AdminBulkSelectionBar from "./AdminBulkSelectionBar";
import AdminBulkToolbar from "./AdminBulkToolbar";

export interface AdminBulkFoundationProps {
  domain: AdminBulkDomain;
  items: AdminBulkSelectableItem[];
  role?: string | null;
  className?: string;
  /** When true (default), confirm runs preview summary only — no server action. */
  previewMode?: boolean;
}

export default function AdminBulkFoundation({
  domain,
  items,
  role: roleInput,
  className = "",
  previewMode = true,
}: AdminBulkFoundationProps) {
  const role = normalizeRole(roleInput) as PlannerDeskRole;
  const domainPolicy = getBulkDomainPolicy(domain);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pendingAction, setPendingAction] = useState<AdminBulkActionPolicy | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<AdminBulkResultSummaryData | null>(null);

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

  const handleActionRequest = useCallback(
    (_actionId: AdminBulkActionId, policy: AdminBulkActionPolicy) => {
      setPendingAction(policy);
      setDialogOpen(true);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    const count = selectedItems.length;
    setResult({
      actionLabel: pendingAction.resultSummaryLabel,
      requested: count,
      succeeded: 0,
      skipped: count,
      failed: 0,
      preview: previewMode,
      message: previewMode
        ? `${ADMIN_BULK_FOUNDATION_NOTICE} (요청 ${count}건)`
        : `처리 완료 (요청 ${count}건)`,
    });
    setDialogOpen(false);
    setPendingAction(null);
  }, [pendingAction, previewMode, selectedItems.length]);

  if (!domainPolicy.enabled) {
    return (
      <div
        className={`rounded-lg border border-[#d9c9a8] bg-[#f7f1e5] px-4 py-3 text-sm text-[#7b5b19] ${className}`}
      >
        {domainPolicy.futureNotice ?? "일괄 작업 UI는 준비 중입니다."}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <AdminBulkSelectionBar
        selectedCount={selectedIds.size}
        totalCount={items.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        disabled={items.length === 0}
      />

      <AdminBulkToolbar
        domain={domain}
        role={role}
        selectedItems={selectedItems}
        onActionRequest={handleActionRequest}
        disabled={items.length === 0}
      />

      {items.length > 0 ? (
        <div className="rounded-lg border border-[#E3DED4] bg-white overflow-hidden">
          <ul className="divide-y divide-[#E3DED4] max-h-48 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#d9c9a8] text-[#10243e] focus:ring-[#b8924a]"
                  checked={selectedIds.has(item.id)}
                  onChange={(event) => toggleItem(item.id, event.target.checked)}
                  aria-label={`${item.title} 선택`}
                />
                <span className="flex-1 truncate text-[#102235]">{item.title}</span>
                <span className="text-xs text-[#4f5661]">{item.status}</span>
                <span className="text-xs text-[#4f5661]">
                  {item.isPublished ? "게시" : "비게시"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AdminBulkResultSummary result={result} onDismiss={() => setResult(null)} />

      <AdminBulkConfirmDialog
        open={dialogOpen}
        action={pendingAction}
        selectedCount={selectedItems.length}
        onCancel={() => {
          setDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirm}
        previewMode={previewMode}
      />
    </div>
  );
}
