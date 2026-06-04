/** Admin operations report copy (PR-136). Metadata-only — no PII, secrets, or customer data. */

export const ADMIN_OPS_REPORT_INTRO =
  "월간·주간 운영 점검용 리포트 기준입니다. 자동 통계 테이블 없이 기존 관리 화면·문서·큐 요약을 바탕으로 운영자가 수동으로 기입합니다.";

export const ADMIN_OPS_REPORT_MANUAL_NOTICE =
  "수치·상태는 저장소 문서 템플릿에 기입하세요. 운영 DB 직접 집계·일괄 수정은 이 화면에서 수행하지 않습니다.";

export const ADMIN_OPS_REPORT_PUBLIC_BOUNDARY =
  "이 리포트와 검수 대기·운영 이슈·변경 이력·일괄작업 상태는 공개·설계사 화면에 노출하지 않습니다.";

export const ADMIN_OPS_REPORT_AA_NOTICE =
  "답변 보조(베타) allowlist·접근 범위·usage audit 정책은 변경하지 않습니다. 관찰 결과는 PR-126·PR-130 기준으로 별도 기록합니다.";

export type AdminOpsReportDomainRow = {
  id: string;
  label: string;
  purpose: string;
  adminHref: string;
  docAnchor: string;
};

/** Checklist rows for the admin panel — counts filled manually per template. */
export const ADMIN_OPS_REPORT_DOMAINS: readonly AdminOpsReportDomainRow[] = [
  {
    id: "insurers",
    label: "보험사 데이터",
    purpose: "공개/비공개, 확인 필요, 링크·연락처",
    adminHref: "/admin/insurers",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md#보험사-데이터-리포트-기준",
  },
  {
    id: "claim-documents",
    label: "청구서류 데이터",
    purpose: "보험사 연결, 검수, 누락·중복",
    adminHref: "/admin/claim-documents",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md#청구서류-데이터-리포트-기준",
  },
  {
    id: "knowledge",
    label: "지식 아카이브",
    purpose: "검수대기, 보류, 문구 안정성",
    adminHref: "/admin/knowledge",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md#지식-아카이브-리포트-기준",
  },
  {
    id: "work-links",
    label: "업무 링크·전산",
    purpose: "전산·청구안내·공시·헬프데스크",
    adminHref: "/admin/insurers",
    docAnchor: "PR-136-DOMAIN-REPORT-CRITERIA.md#업무-링크-리포트-기준",
  },
  {
    id: "link-check",
    label: "링크 상태 점검",
    purpose: "수동 점검·확인 필요·수정 필요",
    adminHref: "/admin/insurers",
    docAnchor: "PR-134-LINK-STATUS-OPS.md",
  },
  {
    id: "issues",
    label: "운영 이슈",
    purpose: "Critical/High/Medium/Low",
    adminHref: "/admin/search",
    docAnchor: "PR-129-OPERATIONAL-ISSUES-OPS.md",
  },
  {
    id: "change-history",
    label: "데이터 변경 이력",
    purpose: "메타데이터·검수·게시 상태",
    adminHref: "/admin/insurers",
    docAnchor: "PR-133-CHANGE-HISTORY-OPS.md",
  },
  {
    id: "bulk",
    label: "Admin bulk",
    purpose: "일괄작업 실행 전 확인",
    adminHref: "/admin",
    docAnchor: "PR-123-BULK-OPERATIONS.md",
  },
  {
    id: "answer-assistant",
    label: "Answer Assistant 베타",
    purpose: "allowlist·output safety·audit",
    adminHref: "/planner/answer-assistant",
    docAnchor: "PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md",
  },
  {
    id: "visibility",
    label: "public visibility",
    purpose: "미검수·비공개 public 미노출",
    adminHref: "/admin/search",
    docAnchor: "PR-136-PUBLIC-ADMIN-MATRIX.md",
  },
] as const;

export const ADMIN_OPS_REPORT_STATUS_LABELS = [
  "정상",
  "확인 필요",
  "수정 필요",
  "보류",
  "비공개",
  "긴급",
  "정보 부족",
] as const;
