/**
 * Admin bulk action policies — UI and server-action guardrails (foundation only).
 * No database writes in PR-ADMIN-BULK-00; policies drive labels, confirm copy, and eligibility hints.
 */

import {
  ROLE_CONTENT_ADMIN,
  ROLE_SUPER_ADMIN,
  type PlannerDeskRole,
} from "@/lib/auth/rbac";

export const ADMIN_BULK_DOMAINS = [
  "insurers",
  "claimDocuments",
  "knowledgeArticles",
  "disclosureLinks",
  "messageTemplates",
] as const;

export type AdminBulkDomain = (typeof ADMIN_BULK_DOMAINS)[number];

export const ADMIN_BULK_ACTION_IDS = [
  "markNeedsReview",
  "markVerified",
  "setPublishedFalse",
  "setPublishedTrue",
  "archive",
  "importDrafts",
] as const;

export type AdminBulkActionId = (typeof ADMIN_BULK_ACTION_IDS)[number];

export type AdminBulkRiskLevel = "low" | "medium" | "high" | "blocked";

export type AdminBulkPermission = "manageContent" | "publishContent" | "superAdmin";

export interface AdminBulkActionPolicy {
  id: AdminBulkActionId;
  label: string;
  riskLevel: AdminBulkRiskLevel;
  requiredPermission: AdminBulkPermission;
  confirmMessage: string;
  resultSummaryLabel: string;
  /** Human-readable publish / visibility rules shown in confirm UI. */
  publishRules: string;
  /** Status or field combinations that must block this action in server actions (next PR). */
  forbiddenConditions: readonly string[];
  /** Foundation PR: actions are preview-only until domain server actions ship. */
  implementationStatus: "foundation" | "planned";
}

export interface AdminBulkDomainPolicy {
  domain: AdminBulkDomain;
  label: string;
  /** When false, UI shows “준비 중” and hides bulk toolbar actions. */
  enabled: boolean;
  futureNotice?: string;
  statusFieldLabel: string;
  supportedActionIds: readonly AdminBulkActionId[];
  /** Verification/status values that must not be bulk-published. */
  forbiddenStatusesForPublish: readonly string[];
  /** Status values that must not be bulk-marked verified without review. */
  forbiddenStatusesForVerify: readonly string[];
}

/** Global bulk operations that must never ship without explicit review PRs. */
export const GLOBAL_FORBIDDEN_BULK_OPERATIONS = [
  "aiUsableBulkTrue",
  "customerPiiBulkImport",
  "medicalRecordBulkImport",
  "insurancePayoutJudgmentBulkImport",
  "lossAdjustmentBulkImport",
  "fileUploadBulkImport",
  "productionAutoPublish",
] as const;

export type GlobalForbiddenBulkOperation =
  (typeof GLOBAL_FORBIDDEN_BULK_OPERATIONS)[number];

export const GLOBAL_FORBIDDEN_BULK_LABELS: Record<
  GlobalForbiddenBulkOperation,
  string
> = {
  aiUsableBulkTrue: "AI 참조 가능(aiUsable) 일괄 true",
  customerPiiBulkImport: "고객 개인정보 포함 데이터 일괄 등록",
  medicalRecordBulkImport: "의료자료·진단서·처방전 일괄 등록",
  insurancePayoutJudgmentBulkImport: "보험금 지급 판단·예상액 데이터 일괄 등록",
  lossAdjustmentBulkImport: "손해사정 오인 가능 데이터 일괄 등록",
  fileUploadBulkImport: "파일 업로드 기반 일괄 import",
  productionAutoPublish: "검수 없이 production 자동 공개",
};

export const SHARED_PUBLISH_RULES = {
  draftBlocked:
    "초안(draft) 상태는 공개할 수 없습니다. 검수 필요 또는 검수 완료로 변경한 뒤 공개하세요.",
  archivedRejectedBlocked:
    "보관(archived)·반려(rejected) 상태는 공개할 수 없습니다.",
  needsReviewBadge:
    "검수 필요(needs_review)는 공개 가능하나 공개 화면에 검수 필요 배지가 표시됩니다.",
  verifiedPublish:
    "검수 완료(verified) 상태에서 공개할 수 있습니다.",
} as const;

const ACTION_POLICIES: Record<AdminBulkActionId, AdminBulkActionPolicy> = {
  markNeedsReview: {
    id: "markNeedsReview",
    label: "일괄 검수 필요로 변경",
    riskLevel: "low",
    requiredPermission: "manageContent",
    confirmMessage:
      "선택한 항목의 검수 상태를 “검수 필요”로 변경합니다. 공개 화면 표시 여부는 기존 게시 설정을 따릅니다. 계속할까요?",
    resultSummaryLabel: "검수 필요로 변경",
    publishRules: "게시 중인 항목은 검수 필요 배지와 함께 공개될 수 있습니다.",
    forbiddenConditions: [],
    implementationStatus: "foundation",
  },
  markVerified: {
    id: "markVerified",
    label: "일괄 검수 완료로 변경",
    riskLevel: "medium",
    requiredPermission: "manageContent",
    confirmMessage:
      "선택한 항목을 “검수 완료”로 표시합니다. 공식 출처 확인이 끝난 항목만 선택했는지 다시 확인해 주세요. 계속할까요?",
    resultSummaryLabel: "검수 완료로 변경",
    publishRules: SHARED_PUBLISH_RULES.verifiedPublish,
    forbiddenConditions: [
      "status 또는 verificationStatus가 draft인 항목",
      "status가 archived 또는 rejected인 항목",
    ],
    implementationStatus: "foundation",
  },
  setPublishedFalse: {
    id: "setPublishedFalse",
    label: "일괄 비공개",
    riskLevel: "low",
    requiredPermission: "manageContent",
    confirmMessage:
      "선택한 항목을 비공개로 전환합니다. 공개 화면에서 즉시 내려갑니다. 계속할까요?",
    resultSummaryLabel: "비공개 처리",
    publishRules: "isPublished=false 로 공개 화면 노출이 중단됩니다.",
    forbiddenConditions: [],
    implementationStatus: "foundation",
  },
  setPublishedTrue: {
    id: "setPublishedTrue",
    label: "일괄 공개",
    riskLevel: "high",
    requiredPermission: "publishContent",
    confirmMessage:
      "선택한 항목을 공개합니다. 초안·보관·반려 상태는 공개할 수 없습니다. 공식 출처 검수를 완료했는지 확인해 주세요. 계속할까요?",
    resultSummaryLabel: "공개 처리",
    publishRules: [
      SHARED_PUBLISH_RULES.draftBlocked,
      SHARED_PUBLISH_RULES.archivedRejectedBlocked,
      SHARED_PUBLISH_RULES.needsReviewBadge,
      SHARED_PUBLISH_RULES.verifiedPublish,
    ].join(" "),
    forbiddenConditions: [
      "verificationStatus 또는 status가 draft",
      "status가 archived 또는 rejected",
      "공개 조건 미충족(isPublished=true 불가 조합)",
    ],
    implementationStatus: "foundation",
  },
  archive: {
    id: "archive",
    label: "일괄 보관",
    riskLevel: "medium",
    requiredPermission: "manageContent",
    confirmMessage:
      "선택한 항목을 보관 상태로 이동합니다. 보관된 항목은 공개할 수 없습니다. 계속할까요?",
    resultSummaryLabel: "보관 처리",
    publishRules: "보관 후 비공개를 권장합니다. 공개 화면에 노출되지 않아야 합니다.",
    forbiddenConditions: ["이미 archived 상태인 항목은 건너뜀"],
    implementationStatus: "foundation",
  },
  importDrafts: {
    id: "importDrafts",
    label: "일괄 등록(초안)",
    riskLevel: "blocked",
    requiredPermission: "superAdmin",
    confirmMessage:
      "초안 데이터 일괄 등록은 별도 import PR에서만 구현합니다. 이 버튼은 기반 PR에서 비활성화됩니다.",
    resultSummaryLabel: "초안 일괄 등록",
    publishRules: "등록 시 status=draft, isPublished=false, aiUsable=false 강제.",
    forbiddenConditions: [
      "production 자동 실행",
      "파일 업로드 import",
      GLOBAL_FORBIDDEN_BULK_LABELS.customerPiiBulkImport,
    ],
    implementationStatus: "planned",
  },
};

const VERIFICATION_FORBIDDEN_PUBLISH = ["draft", "unverified", "pending"] as const;
const VERIFICATION_FORBIDDEN_VERIFY = ["draft", "unverified"] as const;

const KNOWLEDGE_FORBIDDEN_PUBLISH = ["draft", "archived", "rejected"] as const;
const KNOWLEDGE_FORBIDDEN_VERIFY = ["draft", "archived", "rejected"] as const;

export const ADMIN_BULK_DOMAIN_POLICIES: Record<
  AdminBulkDomain,
  AdminBulkDomainPolicy
> = {
  insurers: {
    domain: "insurers",
    label: "보험사 디렉토리",
    enabled: true,
    statusFieldLabel: "검수 상태(verificationStatus)",
    supportedActionIds: [
      "markNeedsReview",
      "markVerified",
      "setPublishedFalse",
      "setPublishedTrue",
    ],
    forbiddenStatusesForPublish: [...VERIFICATION_FORBIDDEN_PUBLISH],
    forbiddenStatusesForVerify: [...VERIFICATION_FORBIDDEN_VERIFY],
  },
  claimDocuments: {
    domain: "claimDocuments",
    label: "청구서류 창고",
    enabled: true,
    statusFieldLabel: "검수 상태(verificationStatus)",
    supportedActionIds: [
      "markNeedsReview",
      "markVerified",
      "setPublishedFalse",
      "setPublishedTrue",
    ],
    forbiddenStatusesForPublish: [...VERIFICATION_FORBIDDEN_PUBLISH],
    forbiddenStatusesForVerify: [...VERIFICATION_FORBIDDEN_VERIFY],
  },
  knowledgeArticles: {
    domain: "knowledgeArticles",
    label: "지식 아카이브",
    enabled: true,
    statusFieldLabel: "검수 상태(status)",
    supportedActionIds: [
      "markNeedsReview",
      "markVerified",
      "setPublishedFalse",
      "setPublishedTrue",
      "archive",
    ],
    forbiddenStatusesForPublish: [...KNOWLEDGE_FORBIDDEN_PUBLISH],
    forbiddenStatusesForVerify: [...KNOWLEDGE_FORBIDDEN_VERIFY],
  },
  disclosureLinks: {
    domain: "disclosureLinks",
    label: "공시·약관 링크",
    enabled: false,
    futureNotice: "공시·약관 관리 화면은 준비 중입니다. bulk action은 정책만 정의합니다.",
    statusFieldLabel: "검수 상태(예정)",
    supportedActionIds: [],
    forbiddenStatusesForPublish: [...VERIFICATION_FORBIDDEN_PUBLISH],
    forbiddenStatusesForVerify: [...VERIFICATION_FORBIDDEN_VERIFY],
  },
  messageTemplates: {
    domain: "messageTemplates",
    label: "고객 안내 문구",
    enabled: false,
    futureNotice: "고객 안내 문구 관리 화면은 준비 중입니다. bulk action은 정책만 정의합니다.",
    statusFieldLabel: "검수 상태(예정)",
    supportedActionIds: [],
    forbiddenStatusesForPublish: [...VERIFICATION_FORBIDDEN_PUBLISH],
    forbiddenStatusesForVerify: [...VERIFICATION_FORBIDDEN_VERIFY],
  },
};

export function getBulkActionPolicy(
  actionId: AdminBulkActionId,
): AdminBulkActionPolicy {
  return ACTION_POLICIES[actionId];
}

export function getBulkDomainPolicy(domain: AdminBulkDomain): AdminBulkDomainPolicy {
  return ADMIN_BULK_DOMAIN_POLICIES[domain];
}

export function listBulkActionsForDomain(
  domain: AdminBulkDomain,
): AdminBulkActionPolicy[] {
  const domainPolicy = getBulkDomainPolicy(domain);
  return domainPolicy.supportedActionIds.map((id) => getBulkActionPolicy(id));
}

export interface AdminBulkSelectableItem {
  id: string;
  title: string;
  status: string;
  isPublished: boolean;
  aiUsable?: boolean;
}

export interface AdminBulkEligibilityResult {
  allowed: boolean;
  reason?: string;
}

function roleHasPermission(
  role: PlannerDeskRole,
  permission: AdminBulkPermission,
): boolean {
  if (permission === "superAdmin") {
    return role === ROLE_SUPER_ADMIN;
  }
  if (permission === "publishContent" || permission === "manageContent") {
    return role === ROLE_SUPER_ADMIN || role === ROLE_CONTENT_ADMIN;
  }
  return false;
}

/** Client-side hint only — server actions must re-check in domain PRs. */
export function evaluateBulkActionEligibility(
  domain: AdminBulkDomain,
  actionId: AdminBulkActionId,
  role: PlannerDeskRole,
  selectedItems: AdminBulkSelectableItem[],
): AdminBulkEligibilityResult {
  const domainPolicy = getBulkDomainPolicy(domain);
  const action = getBulkActionPolicy(actionId);

  if (!domainPolicy.enabled) {
    return { allowed: false, reason: domainPolicy.futureNotice ?? "준비 중" };
  }

  if (!domainPolicy.supportedActionIds.includes(actionId)) {
    return { allowed: false, reason: "이 도메인에서 지원하지 않는 작업입니다." };
  }

  if (action.implementationStatus === "planned") {
    return { allowed: false, reason: "별도 PR에서 구현 예정입니다." };
  }

  if (!roleHasPermission(role, action.requiredPermission)) {
    return {
      allowed: false,
      reason:
        action.requiredPermission === "publishContent"
          ? "공개 권한이 필요합니다."
          : "콘텐츠 관리 권한이 필요합니다.",
    };
  }

  if (selectedItems.length === 0) {
    return { allowed: false, reason: "선택된 항목이 없습니다." };
  }

  if (actionId === "setPublishedTrue") {
    const blocked = selectedItems.filter((item) =>
      domainPolicy.forbiddenStatusesForPublish.includes(item.status),
    );
    if (blocked.length > 0) {
      return {
        allowed: false,
        reason: `공개할 수 없는 상태가 ${blocked.length}건 포함되어 있습니다.`,
      };
    }
  }

  if (actionId === "markVerified") {
    const blocked = selectedItems.filter((item) =>
      domainPolicy.forbiddenStatusesForVerify.includes(item.status),
    );
    if (blocked.length === selectedItems.length) {
      return {
        allowed: false,
        reason: "선택 항목을 검수 완료로 변경할 수 없습니다.",
      };
    }
  }

  if (
    selectedItems.some((item) => item.aiUsable === true) &&
    actionId === "importDrafts"
  ) {
    return { allowed: false, reason: "AI 일괄 활성화는 금지됩니다." };
  }

  return { allowed: true };
}

export const ADMIN_BULK_FOUNDATION_NOTICE =
  "PR-ADMIN-BULK-00: UI·정책 기반만 제공합니다. 확인 후에도 DB에 반영되지 않으며, 다음 PR에서 server action이 연결됩니다.";

const IMPLEMENTED_BULK_DOMAINS: Partial<
  Record<AdminBulkDomain, readonly AdminBulkActionId[]>
> = {
  insurers: [
    "markNeedsReview",
    "markVerified",
    "setPublishedFalse",
    "setPublishedTrue",
  ],
  claimDocuments: [
    "markNeedsReview",
    "markVerified",
    "setPublishedFalse",
    "setPublishedTrue",
  ],
  knowledgeArticles: [
    "markNeedsReview",
    "markVerified",
    "setPublishedFalse",
    "setPublishedTrue",
    "archive",
  ],
};

/** Domains with wired server actions (PR-ADMIN-BULK-01+). */
export function isBulkActionImplemented(
  domain: AdminBulkDomain,
  actionId: AdminBulkActionId,
): boolean {
  const live = IMPLEMENTED_BULK_DOMAINS[domain];
  return live?.includes(actionId) ?? false;
}
