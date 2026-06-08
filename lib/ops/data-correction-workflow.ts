/**
 * Data correction workflow ops standards (PR-168). Workflow/docs only — no DB edit, crawl, or bulk.
 */

import {
  CLAIM_DOCUMENT_CHECK,
  DATA_ERROR_GRADES,
  FRESHNESS_CODE_REFERENCES,
  INSURER_DIRECTORY_CHECK,
  KNOWLEDGE_ARCHIVE_CHECK,
  OFFICIAL_SOURCE_PRIORITY,
  PR161_FRESHNESS_VERDICTS,
  PR161_OPEN_CRITICAL_COUNT,
  PR161_OPEN_HIGH_COUNT,
  PUBLIC_HOLD_CRITERIA,
  PUBLIC_SEARCH_FRESHNESS_CHECK,
  WORK_LINK_CHECK,
} from "@/lib/ops/data-freshness-review";
import { PR167_METRICS_VERDICTS } from "@/lib/ops/beta-metrics-review";
import {
  DATA_ERROR_REPORT_HANDLING,
  PR162_INBOX_VERDICTS,
} from "@/lib/ops/user-support-inbox-plan";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR168_SCOPE_NOTICE =
  "데이터 오류 **접수·검수·보류·후속 수정 PR 연결 workflow**입니다. 운영 DB 수정·대량 변경·크롤링·자동 동기화·외부 API·bulk 실행은 포함하지 않습니다.";

export const PR168_FORBIDDEN_DOC_CONTENT =
  "workflow 문서·요청 기록에 고객정보·상담 원문·증권·진단서·크롤 원문·secret·지급 확정 표현을 넣지 않습니다.";

export type CorrectionWorkflowStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const CORRECTION_WORKFLOW_STATUS_LABEL: Record<CorrectionWorkflowStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR168_OPEN_CRITICAL_COUNT = PR161_OPEN_CRITICAL_COUNT;
export const PR168_OPEN_HIGH_COUNT = PR161_OPEN_HIGH_COUNT;

export const PR168_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr161",
    condition: "PR161 Data Freshness Review",
    result: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared,
    met: PR161_FRESHNESS_VERDICTS.officialSourcePolicy === "ready",
  },
  {
    id: "pr162",
    condition: "PR162 데이터 오류 제보",
    result: PR162_INBOX_VERDICTS.inboxPlanPrepared,
    met: DATA_ERROR_REPORT_HANDLING.length > 0,
  },
  {
    id: "pr167",
    condition: "PR167 데이터 오류 지표",
    result: PR167_METRICS_VERDICTS.metricDefinitions,
    met: PR167_METRICS_VERDICTS.metadataOnlyPolicy === "ready",
  },
  {
    id: "crit",
    condition: "Critical 리스크(정적)",
    result: String(PR168_OPEN_CRITICAL_COUNT),
    met: PR168_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "doc",
    condition: "문서화만·DB 수정 불필요",
    result: "가능",
    met: true,
  },
] as const;

export const CORRECTION_WORKFLOW_PRINCIPLES: readonly {
  id: string;
  principle: string;
  rule: string;
}[] = [
  { id: "official", principle: "공식 출처 우선", rule: "보험사 공식·공시·약관 우선" },
  { id: "review", principle: "수정 전 검수", rule: "제보만으로 확정 수정 금지" },
  { id: "deid", principle: "비식별 처리", rule: "PII·상담 원문 제거" },
  { id: "pub-safe", principle: "public 안전", rule: "비공개·미검수 public 금지" },
  { id: "no-payout", principle: "지급 확정 금지", rule: "지급·부지급 확정 표현 금지" },
  { id: "pr-split", principle: "변경 이력 분리", rule: "실제 수정은 별도 PR" },
  { id: "no-bulk", principle: "대량 수정 금지", rule: "별도 승인·검수" },
  { id: "no-auto", principle: "자동화 금지", rule: "크롤링·자동 동기화 금지" },
  { id: "hold", principle: "보류 가능", rule: "공식 확인 불가 시 보류" },
  { id: "disclaimer", principle: "책임 고지", rule: "고객 안내 전 공식 확인" },
] as const;

export const CORRECTION_INTAKE_RULES: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "오류 유형", allowed: "보험사·청구·링크·검색·지식", forbidden: "상담 원문" },
  { field: "대상 데이터", allowed: "보험사명·문서 유형·화면", forbidden: "고객명·계약번호" },
  { field: "제보 내용", allowed: "비식별 요약", forbidden: "PII·민감정보" },
  { field: "근거", allowed: "공식 링크·문서명·확인일", forbidden: "블로그·카페 단독" },
  { field: "긴급도", allowed: "Critical/High/Medium/Low", forbidden: "감정만" },
  { field: "조치 요청", allowed: "확인·보류·수정 후보", forbidden: "즉시 DB 수정" },
  { field: "첨부", allowed: "원칙적 금지", forbidden: "증권·신분증·진단서" },
  { field: "후속 PR", allowed: "후보명·위험도", forbidden: "민감 로그 전문" },
] as const;

/** Re-export PR161 official source priority for PR168 docs/tests. */
export const CORRECTION_OFFICIAL_SOURCES = OFFICIAL_SOURCE_PRIORITY;

export const CORRECTION_ERROR_GRADES = DATA_ERROR_GRADES;

export type WorkflowStep = { phase: string; detail: string };

export const INSURER_DIRECTORY_WORKFLOW: readonly WorkflowStep[] = [
  { phase: "1. 오류 접수", detail: "보험사명·항목·요약·공식 근거 후보(비식별)" },
  { phase: "2. 공식 확인", detail: "공식 홈·안내 확인·불가 시 확인 필요 보류" },
  { phase: "3. 등급 분류", detail: "연락처·청구 High+ · secret URL Critical" },
  { phase: "4. 조치 판단", detail: "Critical→hotfix · High→Directory Correction PR" },
  { phase: "5. 종료", detail: "PR168에서 수정 안 함·후속 PR에 출처 연결" },
] as const;

export const CLAIM_DOCUMENT_WORKFLOW: readonly WorkflowStep[] = [
  { phase: "1. 오류 접수", detail: "보험사·서류 유형·요약·공식 확인 필요 여부" },
  { phase: "2. 공식 확인", detail: "보험사 공식 청구·약관·공시" },
  { phase: "3. 등급 분류", detail: "청구 High · 지급 확정 Critical · 이 서류만 High+" },
  { phase: "4. 조치 판단", detail: "확정 수정 금지·보류 후보·Claim Correction PR" },
  { phase: "5. 종료", detail: "지급 확정 없음·확인일·근거 후속 PR" },
] as const;

export const WORK_LINK_WORKFLOW: readonly WorkflowStep[] = [
  { phase: "1. 오류 접수", detail: "링크 유형·화면·오류·secret URL→Critical" },
  { phase: "2. 공식 확인", detail: "공식 페이지·권한 필요 링크 안내" },
  { phase: "3. 등급 분류", detail: "청구 High · 404 Medium~High · admin Critical" },
  { phase: "4. 조치 판단", detail: "Link Correction PR·안내 문구 보완" },
] as const;

export const KNOWLEDGE_ARCHIVE_WORKFLOW: readonly WorkflowStep[] = [
  { phase: "1. 오류 접수", detail: "문서·주제·유형·공식 근거 여부" },
  { phase: "2. 공식 확인", detail: "약관·공시·보험사·공공기관" },
  { phase: "3. 등급 분류", detail: "지급·가입·공포 Critical~High · 미검수 public Critical" },
  { phase: "4. 조치 판단", detail: "Knowledge Source Review·Visibility Hotfix" },
] as const;

export const PUBLIC_SEARCH_WORKFLOW: readonly WorkflowStep[] = [
  { phase: "1. 오류 접수", detail: "검색어·화면·결과 유형·요약(PII 검색어 금지)" },
  { phase: "2. 확인", detail: "공개·검수 데이터만·admin/bulk 노출 여부" },
  { phase: "3. 등급 분류", detail: "미검수 노출 Critical · 청구/보험사 High · 누락 Medium" },
  { phase: "4. 조치 판단", detail: "Visibility Hotfix·Search Quality PR" },
] as const;

export const CORRECTION_REQUEST_TEMPLATE: readonly {
  field: string;
  guidance: string;
}[] = [
  { field: "요청 유형", guidance: "보험사/청구/링크/지식/검색" },
  { field: "오류 등급", guidance: "Critical/High/Medium/Low" },
  { field: "대상 화면", guidance: "route 또는 화면명" },
  { field: "대상 데이터", guidance: "보험사명·문서·링크 유형" },
  { field: "오류 요약", guidance: "비식별 요약" },
  { field: "공식 출처 후보", guidance: "공식 링크·문서명" },
  { field: "확인 상태", guidance: "미확인/확인 필요/공식 확인 완료" },
  { field: "public 보류", guidance: "필요/불필요/판단 보류" },
  { field: "후속 PR 후보", guidance: "Hotfix/Correction/Polish" },
  { field: "금지 정보 확인", guidance: "PII·secret·지급 확정 없음" },
] as const;

export const CORRECTION_TRIAGE_DECISIONS: readonly {
  decision: string;
  criteria: string;
  action: string;
}[] = [
  { decision: "승인 후보", criteria: "공식 확인·오류 명확·PII 없음", action: "후속 수정 PR" },
  { decision: "보류", criteria: "출처 충돌·확인 불가", action: "정보 부족 표시" },
  { decision: "반려", criteria: "비공식 단독 근거", action: "추가 근거 요청" },
  { decision: "긴급", criteria: "public·PII·secret·지급 확정", action: "hotfix PR" },
  { decision: "재분류", criteria: "UX/문구 문제", action: "UX/Copy PR" },
  { decision: "폐기", criteria: "중복·근거 없음", action: "기록만 유지" },
] as const;

export const CORRECTION_FOLLOW_UP_PRS: readonly {
  issueType: string;
  prCandidate: string;
  risk: IssueSeverity | "critical" | "high" | "medium" | "low";
  codex: string;
}[] = [
  { issueType: "비공개·미검수 public", prCandidate: "PR168-B Public Visibility Hotfix", risk: "critical", codex: "필요" },
  { issueType: "보험금 지급 확정 문구", prCandidate: "PR168-C Claim Wording Hotfix", risk: "critical", codex: "필요" },
  { issueType: "청구서류 오류", prCandidate: "PR168-D Claim Document Correction", risk: "high", codex: "조건부" },
  { issueType: "보험사 정보 오류", prCandidate: "PR168-E Insurer Directory Correction", risk: "high", codex: "조건부" },
  { issueType: "업무 링크 오류", prCandidate: "PR168-F Link Correction Workflow", risk: "medium", codex: "조건부" },
  { issueType: "지식 출처 불명", prCandidate: "PR168-G Knowledge Source Review", risk: "high", codex: "조건부" },
  { issueType: "public 검색 오류", prCandidate: "PR168-H Public Search Quality", risk: "medium", codex: "조건부" },
  { issueType: "단순 오탈자", prCandidate: "PR163-B Copy Polish", risk: "low", codex: "불필요" },
] as const;

export const PR169_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR169", title: "Terms & Privacy Draft Plan", purpose: "약관·개인정보 초안", risk: "Critical", codex: "필수" },
  { id: "PR170", title: "Payment Architecture Plan", purpose: "결제 구조", risk: "Critical", codex: "필수" },
  { id: "PR171", title: "Refund & Support Policy Plan", purpose: "환불·지원", risk: "Critical", codex: "필수" },
  { id: "PR172", title: "Beta Review Summary", purpose: "베타 종합 보고", risk: "High", codex: "조건부" },
  { id: "PR173", title: "Public Release Readiness Review", purpose: "공개 베타 검토", risk: "Critical", codex: "필수" },
] as const;

export type CorrectionChecklistStatus = "met" | "partial" | "pending" | "gap";

export const CORRECTION_WORKFLOW_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: CorrectionChecklistStatus;
}[] = [
  { id: "principles", item: "workflow 원칙", criterion: "10 principles", status: "met" },
  { id: "intake", item: "접수 기준", criterion: "허용/금지", status: "met" },
  { id: "source", item: "공식 출처", criterion: "PR161 연계", status: "met" },
  { id: "grades", item: "오류 등급", criterion: "Critical~Low", status: "met" },
  { id: "insurer", item: "보험사 workflow", criterion: "5단계", status: "met" },
  { id: "claim", item: "청구 workflow", criterion: "5단계", status: "met" },
  { id: "link", item: "링크 workflow", criterion: "4단계", status: "met" },
  { id: "knowledge", item: "지식 workflow", criterion: "4단계", status: "met" },
  { id: "search", item: "검색 workflow", criterion: "4단계", status: "met" },
  { id: "template", item: "요청 템플릿", criterion: "10 fields", status: "met" },
  { id: "triage", item: "검수·보류·반려", criterion: "6 decisions", status: "met" },
  { id: "nodb", item: "운영 DB 수정", criterion: "PR168 미실행", status: "met" },
  { id: "nocrawl", item: "크롤링·동기화", criterion: "없음", status: "met" },
  { id: "live-fix", item: "live 데이터 수정", criterion: "후속 PR만", status: "pending" },
] as const;

export const PR168_CORRECTION_VERDICTS = {
  correctionWorkflowPrepared: "conditional" as CorrectionWorkflowStatus,
  officialSourcePolicy: "ready" as CorrectionWorkflowStatus,
  domainWorkflows: "ready" as CorrectionWorkflowStatus,
  actualDataModification: "blocked" as CorrectionWorkflowStatus,
} as const;

export const CORRECTION_DOMAIN_CHECKS = {
  insurer: INSURER_DIRECTORY_CHECK,
  claim: CLAIM_DOCUMENT_CHECK,
  link: WORK_LINK_CHECK,
  knowledge: KNOWLEDGE_ARCHIVE_CHECK,
  search: PUBLIC_SEARCH_FRESHNESS_CHECK,
  publicHold: PUBLIC_HOLD_CRITERIA,
} as const;

export const CORRECTION_CODE_REFERENCES = {
  ...FRESHNESS_CODE_REFERENCES,
  inboxPlan: "lib/ops/user-support-inbox-plan.ts",
  metricsReview: "lib/ops/beta-metrics-review.ts",
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "운영 DB 수정 부재",
  "크롤링·동기화 부재",
  "공식 출처 확인",
  "오류 등급표",
  "청구·디렉터리·검색 workflow",
  "public visibility Critical",
  "지급 확정 차단",
  "후속 PR 연결",
  "PR169 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "템플릿 필드명",
  "Low 오탈자",
] as const;

export const PR168_LINKED_HUBS = [
  "PR-161-DATA-FRESHNESS-REVIEW-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-167-BETA-METRICS-REVIEW-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
] as const;

export const PR168_TEST_FILES = [
  "tests/ops/pr168-data-correction-workflow.test.ts",
  "tests/ops/pr161-data-freshness-review.test.ts",
  "tests/ops/pr167-beta-metrics-review.test.ts",
] as const;
