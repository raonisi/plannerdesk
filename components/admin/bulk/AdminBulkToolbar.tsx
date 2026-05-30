"use client";

import type {
  AdminBulkActionId,
  AdminBulkActionPolicy,
  AdminBulkDomain,
  AdminBulkEligibilityResult,
  AdminBulkSelectableItem,
} from "@/lib/admin/bulk-policies";
import {
  evaluateBulkActionEligibility,
  getBulkDomainPolicy,
  isBulkActionImplemented,
  listBulkActionsForDomain,
} from "@/lib/admin/bulk-policies";
import type { PlannerDeskRole } from "@/lib/auth/rbac";
import { borders, surfaces } from "@/lib/design-system";

export interface AdminBulkToolbarProps {
  domain: AdminBulkDomain;
  role: PlannerDeskRole;
  selectedItems: AdminBulkSelectableItem[];
  onActionRequest: (actionId: AdminBulkActionId, policy: AdminBulkActionPolicy) => void;
  disabled?: boolean;
}

function riskButtonClass(risk: AdminBulkActionPolicy["riskLevel"]): string {
  const base =
    "rounded px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  if (risk === "high") {
    return `${base} border border-[#c45c5c] bg-[#fdf2f2] text-[#8b2e2e] hover:bg-[#fae4e4]`;
  }
  if (risk === "medium") {
    return `${base} border border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19] hover:bg-[#efe4cf]`;
  }
  if (risk === "blocked") {
    return `${base} border border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
  }
  return `${base} border border-[#c8d2dc] bg-white text-[#102235] hover:bg-[#eef3f7]`;
}

function eligibilityTitle(result: AdminBulkEligibilityResult): string | undefined {
  return result.allowed ? undefined : result.reason;
}

export default function AdminBulkToolbar({
  domain,
  role,
  selectedItems,
  onActionRequest,
  disabled = false,
}: AdminBulkToolbarProps) {
  const domainPolicy = getBulkDomainPolicy(domain);

  if (!domainPolicy.enabled) {
    return (
      <div
        className={`rounded-lg border px-4 py-3 text-sm text-[#4f5661] ${surfaces.muted} ${borders.subtle}`}
      >
        {domainPolicy.futureNotice ?? "일괄 작업은 준비 중입니다."}
      </div>
    );
  }

  const actions = listBulkActionsForDomain(domain);

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 ${surfaces.card} ${borders.default}`}
    >
      <span className="mr-1 text-xs font-bold uppercase tracking-wide text-[#aa8137]">
        일괄 작업
      </span>
      {actions.map((policy) => {
        const eligibility = evaluateBulkActionEligibility(
          domain,
          policy.id,
          role,
          selectedItems,
        );
        const isDisabled =
          disabled ||
          !eligibility.allowed ||
          policy.implementationStatus === "planned" ||
          (policy.implementationStatus === "foundation" &&
            !isBulkActionImplemented(domain, policy.id));

        return (
          <button
            key={policy.id}
            type="button"
            disabled={isDisabled}
            title={eligibilityTitle(eligibility)}
            onClick={() => onActionRequest(policy.id, policy)}
            className={riskButtonClass(policy.riskLevel)}
          >
            {policy.label}
          </button>
        );
      })}
    </div>
  );
}
