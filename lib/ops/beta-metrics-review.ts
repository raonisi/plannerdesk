/**
 * Beta Metrics Review ops standards (PR-167). Metric definitions/docs only — no analytics, DB, or dashboards.
 */

import { PR160_OPEN_CRITICAL_COUNT, PR160_OPEN_HIGH_COUNT } from "@/lib/ops/beta-expansion-decision";
import { PR158_FEEDBACK_VERDICTS } from "@/lib/ops/beta-feedback-loop";
import { PR159_INCIDENT_VERDICTS } from "@/lib/ops/beta-incident-drill";
import { PR166_COHORT_VERDICTS, PR166_OPEN_HIGH_COUNT } from "@/lib/ops/beta-cohort-control";
import {
  PR162_INBOX_VERDICTS,
  PR162_OPEN_HIGH_COUNT,
} from "@/lib/ops/user-support-inbox-plan";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR167_SCOPE_NOTICE =
  "제한 베타 **운영 지표 검토·정의(metadata 중심)**입니다. analytics SDK·행동 추적·대시보드·지표 DB·schema·운영 DB 조회·role/allowlist·결제 구현은 포함하지 않습니다.";

export const PR167_FORBIDDEN_DOC_CONTENT =
  "지표 문서·기록에 고객명·연락처·상담 원문·prompt/response 원문·stack trace 전문·secret·allowlist 실값·GA/Mixpanel 키를 넣지 않습니다.";

export type MetricsReviewStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const METRICS_REVIEW_STATUS_LABEL: Record<MetricsReviewStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR167_OPEN_CRITICAL_COUNT = PR160_OPEN_CRITICAL_COUNT;
export const PR167_OPEN_HIGH_COUNT = Math.max(
  PR160_OPEN_HIGH_COUNT,
  PR162_OPEN_HIGH_COUNT,
  PR166_OPEN_HIGH_COUNT,
);

export const PR167_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr166",
    condition: "PR166 Beta Cohort Control",
    result: PR166_COHORT_VERDICTS.cohortControlPrepared,
    met: PR166_COHORT_VERDICTS.cohortControlPrepared !== "not_ready",
  },
  {
    id: "pr162",
    condition: "PR162 오류 제보 운영",
    result: PR162_INBOX_VERDICTS.inboxPlanPrepared,
    met: PR162_INBOX_VERDICTS.inboxPlanPrepared !== "not_ready",
  },
  {
    id: "pr158",
    condition: "PR158 Beta Feedback Loop",
    result: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared,
    met: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared !== "not_ready",
  },
  {
    id: "pr159",
    condition: "PR159 Beta Incident Drill",
    result: PR159_INCIDENT_VERDICTS.incidentDrillPrepared,
    met: PR159_INCIDENT_VERDICTS.incidentDrillPrepared !== "not_ready",
  },
  {
    id: "crit",
    condition: "Critical 리스크(정적)",
    result: String(PR167_OPEN_CRITICAL_COUNT),
    met: PR167_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "meta",
    condition: "metadata 중심 지표 설계",
    result: "가능",
    met: true,
  },
] as const;

export const METRICS_CLASSIFICATION: readonly {
  id: string;
  group: string;
  purpose: string;
  allowed: string;
  forbidden: string;
}[] = [
  { id: "ux", group: "사용성 지표", purpose: "화면 이용 불편 파악", allowed: "화면명·불편 유형·빈도", forbidden: "실명·고객정보" },
  { id: "error", group: "오류 지표", purpose: "기능 오류 파악", allowed: "route·오류 유형·등급", forbidden: "stack trace 전문·secret" },
  { id: "feedback", group: "피드백 지표", purpose: "제보 흐름 파악", allowed: "제보 유형·처리 상태", forbidden: "상담 원문·사례 전문" },
  { id: "data", group: "데이터 지표", purpose: "보험사·청구 오류", allowed: "보험사명·문서 유형·공식 확인 상태", forbidden: "고객 사고 상세" },
  { id: "ai", group: "AI safety 지표", purpose: "위험 응답·차단", allowed: "safety 유형·차단·등급", forbidden: "prompt/response 원문" },
  { id: "support", group: "고객지원 지표", purpose: "대응 속도·누락", allowed: "접수/확인/보류/완료", forbidden: "연락처·개인식별" },
  { id: "cohort", group: "cohort 지표", purpose: "대상군 안정성", allowed: "대상군 유형·상태·위험 유형", forbidden: "주민번호·연락처" },
  { id: "access", group: "권한 지표", purpose: "접근 통제 이상", allowed: "시나리오·차단 여부", forbidden: "내부 권한 구조 상세" },
] as const;

export const CORE_METRICS: readonly {
  id: string;
  metric: string;
  description: string;
  judgmentRule: string;
}[] = [
  { id: "crit-inc", metric: "Critical incident count", description: "Critical 등급 이슈 수", judgmentRule: "≥1이면 확대 금지" },
  { id: "high-repeat", metric: "High issue repeat count", description: "High 이슈 반복", judgmentRule: "반복 시 확대 보류" },
  { id: "pub-vis", metric: "Public visibility failure", description: "미검수 public 노출", judgmentRule: "≥1 Critical" },
  { id: "admin-fail", metric: "Admin access failure", description: "admin 우회 가능", judgmentRule: "≥1 Critical" },
  { id: "planner-fail", metric: "Planner access failure", description: "public→planner", judgmentRule: "≥1 Critical" },
  { id: "ai-fail", metric: "AI safety failure", description: "지급 확정·PII·injection 성공", judgmentRule: "≥1 Critical" },
  { id: "pii-attempt", metric: "PII input attempt", description: "고객정보 입력 시도", judgmentRule: "반복 시 cohort 제한" },
  { id: "data-cand", metric: "Data correction candidate", description: "데이터 오류 후보", judgmentRule: "공식 확인 전 확정 금지" },
  { id: "link-fail", metric: "Link failure count", description: "링크 만료·오류", judgmentRule: "반복 시 보완 PR" },
  { id: "support-open", metric: "Support unresolved count", description: "미처리 제보", judgmentRule: "누적 시 운영 부담" },
  { id: "ux-friction", metric: "UX friction count", description: "사용성 불편 제보", judgmentRule: "반복 시 UX polish" },
  { id: "cohort-excl", metric: "Cohort exclusion candidate", description: "제외 후보 수", judgmentRule: "반복 시 축소" },
] as const;

export const METRIC_SEVERITY_ROWS: readonly {
  grade: IssueSeverity;
  criteria: string;
  examples: string;
  action: string;
}[] = [
  { grade: "critical", criteria: "권한·보안·PII·secret·AI·DB 위험", examples: "public admin 노출·AI 지급 확정", action: "즉시 중단 또는 hotfix" },
  { grade: "high", criteria: "데이터 신뢰·지원·반복 오류", examples: "청구 오류 반복·미처리 누적", action: "확대 보류·우선 보완" },
  { grade: "medium", criteria: "사용성·검색·링크 품질", examples: "검색 누락·모바일 불편", action: "UX/검색 PR" },
  { grade: "low", criteria: "오탈자·경미 polish", examples: "문구 수정", action: "polish PR" },
] as const;

export const METRICS_OPERATION_DECISIONS: readonly {
  decision: string;
  criteria: string;
}[] = [
  { decision: "확대 가능", criteria: "Critical 0·High 반복 없음·지원 관리 가능·AI safety 실패 없음" },
  { decision: "조건부 확대", criteria: "Critical 0·High 일부·후속 PR 통제 가능" },
  { decision: "유지", criteria: "Critical 0·확대 근거 부족·UX/데이터 보완 필요" },
  { decision: "축소", criteria: "High 반복·지원 부담·데이터 오류·PII 시도 반복" },
  { decision: "중단", criteria: "Critical≥1·권한 우회·PII 저장·secret·AI safety failure" },
] as const;

export const AA_METRICS_RULES: readonly {
  id: string;
  metric: string;
  allowed: string;
  forbidden: string;
  judgment: string;
}[] = [
  { id: "req", metric: "AI request allowed/blocked", allowed: "허용/차단 여부", forbidden: "prompt 원문", judgment: "metadata-only" },
  { id: "cat", metric: "Safety category", allowed: "PII·지급·가입 유도 등", forbidden: "response 원문", judgment: "유형 중심" },
  { id: "sev", metric: "Safety severity", allowed: "Critical/High/Medium/Low", forbidden: "고객정보", judgment: "등급 중심" },
  { id: "inject", metric: "Prompt injection attempt", allowed: "공격 유형", forbidden: "공격 원문 전문", judgment: "비식별 요약" },
  { id: "secret", metric: "Secret request attempt", allowed: "요청 유형", forbidden: "secret/token/env 값", judgment: "즉시 차단" },
  { id: "claim", metric: "Claim certainty attempt", allowed: "지급 확정 요청 유형", forbidden: "고객 사고 상세", judgment: "차단" },
  { id: "pii", metric: "PII input attempt", allowed: "개인정보 유형", forbidden: "실제 개인정보", judgment: "입력 금지" },
  { id: "out", metric: "Output blocked", allowed: "차단 여부", forbidden: "출력 원문", judgment: "유형·상태만" },
] as const;

export const SUPPORT_METRICS_RULES: readonly {
  id: string;
  metric: string;
  description: string;
  judgment: string;
}[] = [
  { id: "total", metric: "접수 건수", description: "오류 제보 총량", judgment: "과도하면 운영 부담" },
  { id: "crit", metric: "Critical 제보 수", description: "즉시 대응 필요", judgment: "≥1 확대 금지" },
  { id: "high", metric: "High 제보 수", description: "우선 보완", judgment: "반복 시 확대 보류" },
  { id: "open", metric: "미처리 건수", description: "미완료 제보", judgment: "누적 시 확대 보류" },
  { id: "done", metric: "처리 완료 건수", description: "비식별 요약 완료", judgment: "안정성 근거" },
  { id: "recur", metric: "재발 건수", description: "동일 유형 반복", judgment: "hotfix 후보" },
  { id: "pii-report", metric: "개인정보 포함 제보", description: "PII 제거 필요", judgment: "반복 시 cohort 교육" },
  { id: "data-cand", metric: "데이터 오류 후보", description: "공식 확인 필요", judgment: "PR168 연결" },
] as const;

export const METRICS_RECORD_RULES: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "화면", allowed: "route명·화면명", forbidden: "고객 화면 원본 캡처" },
  { field: "사용자", allowed: "대상군 유형", forbidden: "실명·연락처·주민번호" },
  { field: "오류", allowed: "오류 유형·등급", forbidden: "stack trace 전문·secret" },
  { field: "AI", allowed: "safety 유형·차단 여부", forbidden: "prompt/response 원문" },
  { field: "데이터", allowed: "보험사명·문서 유형", forbidden: "고객 사고 상세" },
  { field: "지원", allowed: "처리 상태·후속 PR", forbidden: "고객 상담 원문" },
  { field: "시간", allowed: "발생일·처리일", forbidden: "불필요 개인 활동 로그" },
  { field: "링크", allowed: "링크 유형", forbidden: "secret 포함 URL" },
  { field: "cohort", allowed: "대상군 상태", forbidden: "개인정보" },
  { field: "결론", allowed: "확대/유지/축소/중단", forbidden: "개인 식별 근거" },
] as const;

export const METRICS_FOLLOW_UP_PRS: readonly {
  issue: string;
  prCandidate: string;
  risk: IssueSeverity | "critical" | "high" | "medium";
  codex: string;
}[] = [
  { issue: "Critical incident", prCandidate: "Hotfix PR", risk: "critical", codex: "필요" },
  { issue: "AI safety failure 반복", prCandidate: "PR164-B AI Safety Follow-up", risk: "critical", codex: "필요" },
  { issue: "데이터 오류 반복", prCandidate: "PR168 Data Correction Workflow", risk: "high", codex: "조건부" },
  { issue: "청구서류 오류 반복", prCandidate: "PR168 Claim Data Correction", risk: "high", codex: "조건부" },
  { issue: "링크 오류 반복", prCandidate: "PR168 Link Correction", risk: "medium", codex: "조건부" },
  { issue: "지원 미처리 누적", prCandidate: "PR162-B Support Workflow Update", risk: "high", codex: "조건부" },
  { issue: "UX 불편 반복", prCandidate: "PR163-B UX Follow-up", risk: "medium", codex: "불필요" },
  { issue: "cohort 제외 후보 증가", prCandidate: "PR166-B Cohort Rule Update", risk: "high", codex: "조건부" },
  { issue: "유료화 문의 증가", prCandidate: "PR165-B Payment Notice Update", risk: "high", codex: "필요" },
] as const;

export const PR168_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR168", title: "Data Correction Workflow", purpose: "데이터 수정 workflow", risk: "High", codex: "조건부" },
  { id: "PR169", title: "Terms & Privacy Draft Plan", purpose: "약관·개인정보 초안", risk: "Critical", codex: "필수" },
  { id: "PR170", title: "Payment Architecture Plan", purpose: "결제 구조 설계", risk: "Critical", codex: "필수" },
  { id: "PR171", title: "Refund & Support Policy Plan", purpose: "환불·지원 정책", risk: "Critical", codex: "필수" },
  { id: "PR172", title: "Beta Review Summary", purpose: "제한 베타 종합 보고", risk: "High", codex: "조건부" },
] as const;

export const ANALYTICS_FORBIDDEN: readonly string[] = [
  "google-analytics",
  "gtag",
  "mixpanel",
  "amplitude",
  "posthog",
  "segment",
  "hotjar",
  "fullstory",
  "plausible",
  "heap",
] as const;

export type MetricsChecklistStatus = "met" | "partial" | "pending" | "gap";

export const METRICS_REVIEW_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: MetricsChecklistStatus;
}[] = [
  { id: "classify", item: "지표 분류", criterion: "8 groups", status: "met" },
  { id: "core", item: "핵심 지표", criterion: "12 metrics", status: "met" },
  { id: "severity", item: "등급 기준", criterion: "Critical~Low", status: "met" },
  { id: "decision", item: "운영 판단", criterion: "확대~중단", status: "met" },
  { id: "aa", item: "AA metrics", criterion: "metadata-only", status: "met" },
  { id: "support", item: "지원 metrics", criterion: "PR162 연계", status: "met" },
  { id: "record", item: "기록 허용/금지", criterion: "PII·원문 금지", status: "met" },
  { id: "no-sdk", item: "analytics SDK", criterion: "PR167 미설치", status: "met" },
  { id: "no-db", item: "지표 DB/schema", criterion: "변경 없음", status: "met" },
  { id: "no-dash", item: "대시보드", criterion: "미구현", status: "met" },
  { id: "live-data", item: "live 운영 지표 집계", criterion: "별도 PR·DB 금지", status: "pending" },
  { id: "pr168", item: "PR168 연결", criterion: "데이터 correction", status: "met" },
] as const;

export const PR167_METRICS_VERDICTS = {
  metricsReviewPrepared: "conditional" as MetricsReviewStatus,
  metricDefinitions: "ready" as MetricsReviewStatus,
  metadataOnlyPolicy: "ready" as MetricsReviewStatus,
  operationDecisionRules: "ready" as MetricsReviewStatus,
  analyticsImplementation: "blocked" as MetricsReviewStatus,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "지표 metadata-only",
  "PII·원문 저장 금지",
  "Critical/High 분류",
  "AA safety 지표",
  "확대·중단 판단",
  "analytics/DB/schema 부재",
  "PR168 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "지표 이름 네이밍",
  "표 포맷",
  "Low 오탈자",
] as const;

export const PR167_LINKED_HUBS = [
  "PR-158-BETA-FEEDBACK-LOOP-OPS.md",
  "PR-159-BETA-INCIDENT-DRILL-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-166-BETA-COHORT-CONTROL-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
] as const;

export const PR167_CODE_REFERENCES = {
  usageLog: "lib/answer-assistant/usage-log.ts",
  forbiddenAuditFields: String(FORBIDDEN_USAGE_AUDIT_FIELDS.length),
  feedbackLoop: "lib/ops/beta-feedback-loop.ts",
  incidentDrill: "lib/ops/beta-incident-drill.ts",
  cohortControl: "lib/ops/beta-cohort-control.ts",
  inboxPlan: "lib/ops/user-support-inbox-plan.ts",
} as const;

export const PR167_TEST_FILES = [
  "tests/ops/pr167-beta-metrics-review.test.ts",
  "tests/ops/pr158-beta-feedback-loop.test.ts",
  "tests/answer-assistant/durable-rate-limit-audit.test.ts",
] as const;
