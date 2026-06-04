/**
 * Admin operations reminder copy (PR-138). Manual checklists only — no send, no PII.
 */

export const ADMIN_OPS_REMINDER_INTRO =
  "운영자가 놓치면 안 되는 항목을 수동으로 확인하는 리마인더 기준입니다. 이메일·문자·푸시·Slack·cron 자동 발송은 제공하지 않습니다.";

export const ADMIN_OPS_REMINDER_MANUAL_NOTICE =
  "상태는 운영 일지·PR-136 리포트 템플릿·PR-129 이슈 Registry에 수동 기록합니다. 이 화면은 알림을 발송하지 않습니다.";

export const ADMIN_OPS_REMINDER_PUBLIC_BOUNDARY =
  "리마인더·운영 이슈·검수 대기·변경 이력·일괄작업 상태는 public·일반 planner 화면에 표시하지 않습니다.";

export const ADMIN_OPS_REMINDER_FORBIDDEN_CONTENT =
  "리마인더에 고객정보·상담 원문·secret·token·env·API key·운영 DB 오류 원문을 포함하지 않습니다.";

export type ReminderSeverity = "critical" | "high" | "medium" | "low";

export const REMINDER_SEVERITY_LABEL: Record<ReminderSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export type AdminOpsReminderRow = {
  id: string;
  label: string;
  description: string;
  severity: ReminderSeverity;
  cadence: string;
  adminHref: string;
  docAnchor: string;
};

export const ADMIN_OPS_REMINDER_ROWS: readonly AdminOpsReminderRow[] = [
  {
    id: "review-queue",
    label: "검수 대기",
    description: "공개 전 보험사·청구서류·지식·링크 검수",
    severity: "medium",
    cadence: "매일 또는 배포 전",
    adminHref: "/admin/corrections",
    docAnchor: "PR-138-REMINDER-TYPE-CRITERIA.md#검수-대기-리마인더",
  },
  {
    id: "data-needs-check",
    label: "확인 필요 데이터",
    description: "출처·최신성·문구·링크 상태",
    severity: "medium",
    cadence: "주간",
    adminHref: "/admin/search",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md",
  },
  {
    id: "data-needs-fix",
    label: "수정 필요 데이터",
    description: "오류·누락·만료 링크·문구 위험",
    severity: "high",
    cadence: "발견 시 즉시",
    adminHref: "/admin/insurers",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md",
  },
  {
    id: "ops-critical",
    label: "운영 이슈 Critical",
    description: "visibility·권한·secret·운영 DB·민감정보",
    severity: "critical",
    cadence: "즉시",
    adminHref: "/admin/search",
    docAnchor: "PR-129-OPERATIONAL-ISSUES-OPS.md",
  },
  {
    id: "ops-high",
    label: "운영 이슈 High",
    description: "핵심 route·청구정보·AA safety",
    severity: "high",
    cadence: "24시간 이내",
    adminHref: "/admin/search",
    docAnchor: "PR-129-ISSUE-SEVERITY.md",
  },
  {
    id: "link-check",
    label: "링크 점검 주기",
    description: "전산·청구안내·공시·헬프데스크 수동 점검",
    severity: "medium",
    cadence: "PR-134 월간·분기",
    adminHref: "/admin/insurers",
    docAnchor: "PR-134-LINK-STATUS-OPS.md",
  },
  {
    id: "monthly-report",
    label: "월간 운영 리포트",
    description: "PR-130·PR-136 템플릿 수동 작성",
    severity: "medium",
    cadence: "월 1회",
    adminHref: "/admin",
    docAnchor: "PR-130-MONTHLY-REPORT-TEMPLATE.md",
  },
  {
    id: "aa-restriction",
    label: "Answer Assistant 제한 운영",
    description: "allowlist·output safety·audit·rate limit",
    severity: "critical",
    cadence: "베타 운영 중 주간",
    adminHref: "/admin/answer-assistant",
    docAnchor: "PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md",
  },
  {
    id: "admin-bulk",
    label: "Admin bulk 주의",
    description: "일괄 검수·게시 실행 전 확인",
    severity: "critical",
    cadence: "실행 직전",
    adminHref: "/admin",
    docAnchor: "PR-123-BULK-OPERATIONS.md",
  },
  {
    id: "visibility",
    label: "public visibility",
    description: "미검수·비공개 public 미노출",
    severity: "critical",
    cadence: "배포·데이터 PR 전",
    adminHref: "/admin/search",
    docAnchor: "PR-138-REMINDER-DISPLAY-MATRIX.md",
  },
] as const;

export const REMINDER_STATUS_VALUES = [
  "예정",
  "확인 필요",
  "진행 중",
  "보류",
  "완료",
  "재확인 완료",
  "긴급",
  "정보 부족",
] as const;

export const AUTOMATION_DEFERRED_ITEMS = [
  "이메일 알림",
  "SMS/문자",
  "카카오/Slack/webhook",
  "cron/queue/scheduler",
  "notification DB table",
  "사용자별 알림 설정",
  "자동 링크 HTTP 점검",
  "Answer Assistant 자동 알림",
] as const;
