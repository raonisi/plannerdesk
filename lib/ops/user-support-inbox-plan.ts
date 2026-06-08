/**
 * User Support Inbox Plan ops standards (PR-162). Plan/docs only — no inbox, form, DB, or alerts.
 */

import {
  FEEDBACK_LOOP_CHECKLIST,
  PR158_FEEDBACK_VERDICTS,
  PR158_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-feedback-loop";
import {
  PR159_INCIDENT_VERDICTS,
  PR159_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-incident-drill";
import {
  PR161_FRESHNESS_VERDICTS,
  PR161_OPEN_CRITICAL_COUNT,
  PR161_OPEN_HIGH_COUNT,
} from "@/lib/ops/data-freshness-review";
import type { RiskGrade } from "@/lib/ops/external-release-decision";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR162_SCOPE_NOTICE =
  "제한 베타 운영 중 오류 제보를 **metadata 중심**으로 접수·분류·후속 PR 연결하는 User Support Inbox **운영 계획**입니다. 실제 인박스·피드백 폼·DB 테이블·Slack/webhook·이메일/SMS/카카오·파일 첨부·고객정보 저장은 포함하지 않습니다.";

export const PR162_FORBIDDEN_DOC_CONTENT =
  "제보 기록에 고객명·주민번호·연락처·계약번호·상담 원문·prompt/response 원문·secret·allowlist 실값·증권·신분증·진단서 이미지를 넣지 않습니다.";

export type InboxPlanStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const INBOX_PLAN_STATUS_LABEL: Record<InboxPlanStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR162_OPEN_CRITICAL_COUNT = PR161_OPEN_CRITICAL_COUNT;

export const PR162_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr158",
    condition: "PR158 Beta Feedback Loop 기준",
    result: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared,
    met: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared !== "not_ready",
  },
  {
    id: "pr159",
    condition: "PR159 Beta Incident Drill 기준",
    result: PR159_INCIDENT_VERDICTS.incidentDrillPrepared,
    met: PR159_INCIDENT_VERDICTS.incidentDrillPrepared !== "not_ready",
  },
  {
    id: "pr161",
    condition: "PR161 Data Freshness Review 기준",
    result: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared,
    met: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared !== "not_ready",
  },
  {
    id: "crit",
    condition: "Critical(정적) 0",
    result: String(PR162_OPEN_CRITICAL_COUNT),
    met: PR162_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "doc",
    condition: "인박스 구현 없이 문서·체크list",
    result: "가능",
    met: true,
  },
  {
    id: "pii",
    condition: "제보 기록 PII·secret 저장 위험 완화",
    result: "metadata-only 정책",
    met: true,
  },
] as const;

export const INBOX_OPERATING_PRINCIPLES: readonly {
  principle: string;
  rule: string;
}[] = [
  { principle: "최소 수집", rule: "문제 해결에 필요한 최소 정보만 기록" },
  { principle: "비식별 우선", rule: "고객정보·민감정보·상담 원문 제거" },
  { principle: "metadata 중심", rule: "화면명·오류 유형·등급·상태·후속 PR 중심" },
  { principle: "원문 저장 금지", rule: "prompt/response/상담 원문 전체 저장 금지" },
  { principle: "파일 수집 금지", rule: "증권·신분증·진단서 등 첨부 수집 금지" },
  { principle: "secret 보호", rule: "env/token/API key 포함 시 즉시 제거·보고" },
  { principle: "공식 확인", rule: "청구서류·보험사 정보 오류는 공식 출처 확인 전 확정 금지" },
  { principle: "즉시 중단", rule: "Critical 제보는 기능 중단 또는 hotfix 검토" },
  { principle: "자동화 보류", rule: "PR162에서 인박스·폼·알림 자동화 구현 금지" },
  { principle: "후속 PR 분리", rule: "코드·DB·권한 변경은 별도 PR로 처리" },
] as const;

export const REPORT_RECORD_ALLOW_DENY: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "발생 화면", allowed: "route명·화면명", forbidden: "개인정보 포함 캡처 원본" },
  { field: "오류 유형", allowed: "선택형 분류", forbidden: "고객정보 포함 자유서술" },
  { field: "재현 조건", allowed: "비식별 행동 요약", forbidden: "상담 원문 전체" },
  { field: "기대 결과", allowed: "일반 업무 기준", forbidden: "고객 개인 사례 상세" },
  { field: "실제 결과", allowed: "오류 요약", forbidden: "주민번호·연락처·계약번호" },
  { field: "사용자 구분", allowed: "public/planner/admin 역할명", forbidden: "실명·연락처" },
  { field: "Answer Assistant", allowed: "safety 유형·등급", forbidden: "prompt/response 원문" },
  { field: "청구서류 오류", allowed: "보험사명·문서 유형", forbidden: "고객 사고 상세" },
  { field: "링크 오류", allowed: "링크 유형·화면명", forbidden: "secret 포함 URL" },
  { field: "조치 상태", allowed: "접수/확인중/보류/완료", forbidden: "민감 로그 전문" },
  { field: "후속 PR", allowed: "PR 후보명·위험도", forbidden: "고객정보 포함 로그" },
] as const;

export const REPORT_TYPE_CLASSIFICATION: readonly {
  type: string;
  example: string;
  defaultGrade: IssueSeverity | "critical~high";
}[] = [
  { type: "public visibility 오류", example: "비공개·미검수 데이터 public 노출", defaultGrade: "critical" },
  { type: "admin access 오류", example: "public/planner가 admin 접근", defaultGrade: "critical" },
  { type: "planner access 오류", example: "public이 planner 화면 접근", defaultGrade: "critical" },
  { type: "Answer Assistant 접근 오류", example: "allowlist 없는 사용자 접근", defaultGrade: "critical" },
  { type: "AI safety 오류", example: "지급 확정·PII 유도·injection", defaultGrade: "critical" },
  { type: "개인정보 포함 제보", example: "고객명·주민번호·계약번호 포함", defaultGrade: "critical~high" },
  { type: "secret 노출 의심", example: "env/token/API key 노출", defaultGrade: "critical" },
  { type: "청구서류 오류", example: "잘못된 서류 안내 가능성", defaultGrade: "high" },
  { type: "보험사 정보 오류", example: "전화번호·팩스·업무 링크 오류", defaultGrade: "high" },
  { type: "업무 링크 오류", example: "404·권한 오류·잘못된 리다이렉트", defaultGrade: "medium" },
  { type: "검색 결과 오류", example: "공개 정보 누락·오표시", defaultGrade: "medium" },
  { type: "화면 오류", example: "레이아웃·버튼 동작 문제", defaultGrade: "medium" },
  { type: "문구 오류", example: "오탈자·표현 개선", defaultGrade: "low" },
  { type: "기능 제안", example: "신규 기능 요청", defaultGrade: "low" },
  { type: "성능 지연", example: "반복 로딩·응답 지연", defaultGrade: "high" },
] as const;

export const REPORT_GRADE_RESPONSE: readonly {
  grade: RiskGrade;
  criteria: string;
  handling: string;
}[] = [
  { grade: "critical", criteria: "권한·보안·PII·secret·AI safety·public 노출", handling: "즉시 중단 또는 hotfix PR 검토" },
  { grade: "high", criteria: "업무 판단·데이터 신뢰도 영향", handling: "공식 확인 후 우선 보완 PR" },
  { grade: "medium", criteria: "사용성·검색·링크·화면 안정성", handling: "backlog 또는 개선 PR" },
  { grade: "low", criteria: "문구·오탈자·표현", handling: "polish PR" },
] as const;

export const AA_REPORT_HANDLING: readonly {
  reportType: string;
  recordMethod: string;
  grade: IssueSeverity | "high~critical";
}[] = [
  { reportType: "보험금 지급 확정 출력", recordMethod: "safety 유형·요약·등급 (원문 없음)", grade: "critical" },
  { reportType: "개인정보 입력 유도", recordMethod: "입력 유도 유형만", grade: "critical" },
  { reportType: "가입·해지 유도", recordMethod: "유형·위험도·비식별 재현 요약", grade: "critical" },
  { reportType: "공포 조장", recordMethod: "유형·위험도·비식별 재현 요약", grade: "high" },
  { reportType: "법률·의료·세무 확정", recordMethod: "전문 판단 유형", grade: "high" },
  { reportType: "투자 권유", recordMethod: "투자 권유 유형", grade: "high" },
  { reportType: "prompt injection 성공", recordMethod: "공격 유형·차단 실패 여부", grade: "critical" },
  { reportType: "secret 요청 응답", recordMethod: "secret leakage 유형", grade: "critical" },
  { reportType: "답변 품질 낮음", recordMethod: "주제·개선 방향 요약", grade: "medium" },
  { reportType: "응답 지연", recordMethod: "시간대·상황 metadata", grade: "medium" },
] as const;

export const DATA_ERROR_REPORT_HANDLING: readonly {
  data: string;
  verify: string;
  action: string;
}[] = [
  { data: "보험사 정보", verify: "공식 홈페이지·공시·공식 안내", action: "공식 확인 전 확정 금지" },
  { data: "청구서류", verify: "보험사 공식 청구 안내", action: "오류 가능 시 임시 보류 후보" },
  { data: "업무 링크", verify: "정상 접근·권한 필요 여부", action: "링크 보정 PR 후보" },
  { data: "전산 링크", verify: "내부 전산·권한 필요 여부", action: "public 안내 문구 보완" },
  { data: "지식 아카이브", verify: "공식 근거·검수 상태", action: "미검수 전환 후보" },
  { data: "검색 결과", verify: "공개·검수 상태", action: "검색 품질 개선 후보" },
  { data: "안내문", verify: "개인정보 금지·책임 고지", action: "문구 보완 후보" },
] as const;

export const INBOX_WORKFLOW_STEPS: readonly {
  phase: string;
  detail: string;
}[] = [
  { phase: "1. 접수", detail: "PII·secret 포함 여부 확인 → 포함 시 원문 미저장·즉시 비식별화" },
  { phase: "2. 분류", detail: "Critical/High/Medium/Low; public/admin/AA/PII/secret은 보수적 Critical" },
  { phase: "3. 초기 조치", detail: "Critical 즉시 중단·High 공식 확인 후 보완·Medium/Low backlog" },
  { phase: "4. 확인", detail: "데이터는 공식 출처 확인 전 확정 금지; AA는 safety 유형·비식별 요약만" },
  { phase: "5. 후속 PR", detail: "권한 hotfix·데이터 PR168·AI PR164·UI PR163" },
  { phase: "6. 종료", detail: "PII 없는 metadata 요약만; 고객정보·secret 미기록" },
] as const;

export const USER_REPORT_NOTICE = {
  title: "PlannerDesk 오류 제보 안내",
  intro:
    "PlannerDesk 이용 중 잘못된 정보, 만료된 링크, 화면 오류, 접근 오류, AI 답변 오류를 발견하면 운영 기준에 따라 제보해 주세요.",
  includeHeading: "제보 시 포함하면 좋은 정보",
  includeItems: [
    "발생 화면",
    "문제 유형",
    "어떤 행동 후 발생했는지",
    "기대한 결과",
    "실제 발생한 문제",
    "고객정보를 제거한 비식별 요약",
  ] as const,
  excludeHeading: "제보 시 포함하면 안 되는 정보",
  excludeItems: [
    "고객명",
    "주민번호",
    "연락처",
    "주소",
    "계약번호",
    "보험증권 번호",
    "병력",
    "진단명 원문",
    "검사 결과 원문",
    "상담 원문 전체",
    "카카오톡 대화 원문",
    "계좌정보",
    "결제정보",
    "신분증 이미지",
    "보험증권 이미지",
    "secret, token, env, API key",
  ] as const,
  footer: [
    "보험사 정보, 청구서류, 업무 링크 오류는 공식 출처 확인 후 반영됩니다.",
    "보험금 지급 여부는 PlannerDesk에서 확정하지 않습니다.",
  ] as const,
} as const;

export const INBOX_FOLLOW_UP_PRS: readonly {
  reportType: string;
  prCandidate: string;
  risk: string;
  codex: string;
}[] = [
  { reportType: "public visibility 오류", prCandidate: "PR162-B Public Visibility Hotfix", risk: "Critical", codex: "필요" },
  { reportType: "admin access 오류", prCandidate: "PR162-C Admin Access Hotfix", risk: "Critical", codex: "필요" },
  { reportType: "planner access 오류", prCandidate: "PR162-D Planner Guard Hotfix", risk: "Critical", codex: "필요" },
  { reportType: "Answer Assistant safety", prCandidate: "PR164 AI Safety Hardening", risk: "Critical", codex: "필요" },
  { reportType: "개인정보 handling 위험", prCandidate: "PR162-E Privacy Handling Hotfix", risk: "Critical", codex: "필요" },
  { reportType: "secret 노출 위험", prCandidate: "PR162-F Secret Exposure Review", risk: "Critical", codex: "필요" },
  { reportType: "청구서류 오류", prCandidate: "PR168 Data Correction Workflow", risk: "High", codex: "조건부" },
  { reportType: "보험사 정보 오류", prCandidate: "PR168 Data Correction Workflow", risk: "High", codex: "조건부" },
  { reportType: "업무 링크 오류", prCandidate: "PR168 Link Correction Workflow", risk: "Medium~High", codex: "조건부" },
  { reportType: "검색 결과 오류", prCandidate: "PR163 Public UX Polish 또는 Search Quality PR", risk: "Medium", codex: "조건부" },
  { reportType: "UI 오류", prCandidate: "PR163 Public UX Polish", risk: "Medium", codex: "불필요" },
  { reportType: "문구 오탈자", prCandidate: "PR163 Copy Polish", risk: "Low", codex: "불필요" },
] as const;

export type InboxChecklistStatus = "met" | "partial" | "pending";

export const INBOX_PLAN_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: InboxChecklistStatus;
}[] = [
  { id: "principle", item: "오류 제보 수집 원칙", criterion: "최소 수집·비식별", status: "met" },
  { id: "pii", item: "고객정보 입력 금지", criterion: "명확", status: "met" },
  { id: "secret", item: "secret/env/token 기록 금지", criterion: "명확", status: "met" },
  { id: "noraw", item: "prompt/response 원문 저장 금지", criterion: "명확", status: "met" },
  { id: "nofile", item: "파일 첨부 수집 금지", criterion: "명확", status: "met" },
  { id: "crit", item: "Critical 분류 기준", criterion: "명확", status: "met" },
  { id: "high", item: "High 분류 기준", criterion: "명확", status: "met" },
  { id: "aa", item: "Answer Assistant 제보", criterion: "metadata 중심", status: "met" },
  { id: "data", item: "데이터 오류 처리", criterion: "공식 출처 확인", status: "met" },
  { id: "claim", item: "청구서류 오류 대응", criterion: "확정 전 보류 가능", status: "met" },
  { id: "notice", item: "사용자 안내문", criterion: "PII 입력 금지 포함", status: "met" },
  { id: "follow", item: "후속 PR 연결", criterion: "유형별 분리", status: "met" },
  { id: "noinbox", item: "실제 인박스 구현 없음", criterion: "필수", status: "met" },
  { id: "noalert", item: "실제 외부 알림 없음", criterion: "필수", status: "met" },
  { id: "nodb", item: "운영 DB 접근 없음", criterion: "필수", status: "met" },
  { id: "live", item: "실제 수집 채널(inbox UI)", criterion: "PR162-A 문서만", status: "pending" },
] as const;

export const PR163_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR163", title: "Public UX Polish", purpose: "사용성", risk: "Medium", codex: "불필요" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
  { id: "PR166", title: "Beta Cohort Control", purpose: "대상군 관리", risk: "High", codex: "조건부" },
  { id: "PR167", title: "Beta Metrics Review", purpose: "지표 검토", risk: "High", codex: "조건부" },
  { id: "PR168", title: "Data Correction Workflow", purpose: "수정 workflow", risk: "High", codex: "조건부" },
] as const;

export const PR162_INBOX_VERDICTS = {
  inboxPlanPrepared: "conditional" as InboxPlanStatus,
  /** actual inbox UI/form/DB — deferred */
  inboxImplementation: "not_ready" as InboxPlanStatus,
  deidentificationSafety: "ready" as InboxPlanStatus,
  severityClassification: "ready" as InboxPlanStatus,
} as const;

export const PR162_OPEN_HIGH_COUNT = PR161_OPEN_HIGH_COUNT;

export const INBOX_CODE_REFERENCES = {
  publicVisibility: "lib/public/visibility.ts",
  auth: "lib/auth/",
  aaRoute: "app/planner/answer-assistant/",
  aaUsageLog: "lib/answer-assistant/usage-log.ts · FORBIDDEN_USAGE_AUDIT_FIELDS",
  aaFeedback: "lib/answer-assistant/beta-feedback-validation.ts",
  publicSearch: "lib/search/public.ts",
  adminSearch: "lib/search/admin.ts",
  pr158InboxPending: FEEDBACK_LOOP_CHECKLIST.find((c) => c.id === "inbox")?.status ?? "pending",
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "최소 수집·비식별 기준",
  "PII·secret·원문 저장 금지",
  "Critical/High/Medium/Low 분류",
  "AA metadata-only 제보 처리",
  "청구서류·보험사 공식 확인",
  "사용자 안내문 PII 금지",
  "인박스·폼·DB·알림 변경 부재",
  "PR163 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR162_LINKED_HUBS = [
  "PR-161-DATA-FRESHNESS-REVIEW-OPS.md",
  "PR-158-BETA-FEEDBACK-LOOP-OPS.md",
  "PR-159-BETA-INCIDENT-DRILL-OPS.md",
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
] as const;

export const PR162_TEST_FILES = [
  "tests/ops/pr162-user-support-inbox-plan.test.ts",
  "tests/ops/pr161-data-freshness-review.test.ts",
] as const;

export const PR158_CRITICAL_BASELINE = PR158_OPEN_CRITICAL_COUNT;
export const PR159_CRITICAL_BASELINE = PR159_OPEN_CRITICAL_COUNT;
export const PR161_FRESHNESS_BASELINE = PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared;
