/**
 * Beta incident drill ops standards (PR-159). Rehearsal docs only — no rollback, send, or DB.
 */

import { PR156_RED_TEAM_VERDICTS } from "@/lib/ops/answer-assistant-red-team";
import { PR155_REGRESSION_VERDICTS } from "@/lib/ops/admin-access-regression";
import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";
import {
  PR158_FEEDBACK_VERDICTS,
  PR158_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-feedback-loop";
import {
  IN_FLIGHT_HALT_CRITERIA,
  PR157_LAUNCH_VERDICTS,
  PR157_OPEN_CRITICAL_COUNT,
  PR157_OPEN_HIGH_COUNT,
} from "@/lib/ops/beta-launch-decision";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR159_SCOPE_NOTICE =
  "제한 베타 운영 중 Critical/High 장애 발생 시 운영자 **리허설·대응 기준**입니다. 실제 rollback·공지 발송·Slack/webhook·role·allowlist·운영 DB·provider 호출은 포함하지 않습니다.";

export const PR159_FORBIDDEN_DOC_CONTENT =
  "장애 기록에 고객명·주민번호·연락처·계약번호·상담 원문·prompt/response 원문·stack trace·secret·allowlist 실값을 넣지 않습니다.";

export type IncidentDrillStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const INCIDENT_DRILL_STATUS_LABEL: Record<IncidentDrillStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR159_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr158",
    condition: "PR158 Conditional Ready 이상",
    result: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared,
    met: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared !== "not_ready",
  },
  {
    id: "pr157",
    condition: "PR157 Conditional Launch 이상",
    result: PR157_LAUNCH_VERDICTS.limitedBetaLaunch,
    met: PR157_LAUNCH_VERDICTS.limitedBetaLaunch !== "no_go",
  },
  {
    id: "crit",
    condition: "Critical(정적) 0",
    result: String(PR157_OPEN_CRITICAL_COUNT),
    met: PR157_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "halt",
    condition: "PR157 즉시 중단 기준",
    result: `${IN_FLIGHT_HALT_CRITERIA.length}건`,
    met: IN_FLIGHT_HALT_CRITERIA.length > 0,
  },
  {
    id: "pr143",
    condition: "PR143 고객지원·장애 연계",
    result: "playbook",
    met: true,
  },
  {
    id: "smoke",
    condition: "PR154 public smoke 반영",
    result: PR154_SMOKE_VERDICTS.smokeExpansionReady,
    met: PR154_SMOKE_VERDICTS.smokeExpansionReady !== "not_ready",
  },
  {
    id: "admin",
    condition: "PR155 admin regression 반영",
    result: PR155_REGRESSION_VERDICTS.regressionReady,
    met: PR155_REGRESSION_VERDICTS.regressionReady !== "not_ready",
  },
  {
    id: "aa",
    condition: "PR156 AI red-team 반영",
    result: PR156_RED_TEAM_VERDICTS.redTeamReady,
    met: PR156_RED_TEAM_VERDICTS.redTeamReady !== "not_ready",
  },
  {
    id: "doc",
    condition: "실행 없이 문서·리허설만",
    result: "가능",
    met: true,
  },
] as const;

export const INCIDENT_DRILL_PRINCIPLES: readonly {
  principle: string;
  rule: string;
}[] = [
  { principle: "안전 우선", rule: "Critical 의심 시 기능 또는 베타 운영 중단 검토" },
  { principle: "최소 기록", rule: "장애 해결에 필요한 metadata만" },
  { principle: "비식별 처리", rule: "고객정보·민감정보·상담 원문 제거" },
  { principle: "원문 저장 금지", rule: "prompt/response/상담 원문 금지" },
  { principle: "secret 보호", rule: "env/token/API key 포함 시 즉시 제거·보고" },
  { principle: "공식 확인", rule: "청구·보험사 오류는 공식 출처 확인 전 확정 금지" },
  { principle: "권한 우선", rule: "public/admin/planner 경계는 Critical 우선" },
  { principle: "AI 안전 우선", rule: "지급 확정·PII 유도·injection은 Critical" },
  { principle: "실행 분리", rule: "PR159에서 rollback·공지·발송 자동화 금지" },
  { principle: "후속 PR 분리", rule: "코드·DB·권한 변경은 별도 PR" },
] as const;

export const INCIDENT_SEVERITY_GRADES: readonly {
  grade: IssueSeverity;
  criteria: string;
  example: string;
  defaultAction: string;
}[] = [
  {
    grade: "critical",
    criteria: "보안·권한·PII·AI safety·secret·운영 DB",
    example: "admin public 노출, secret, AI 지급 확정",
    defaultAction: "즉시 중단 또는 기능 disable",
  },
  {
    grade: "high",
    criteria: "업무 오류·데이터·청구·반복 route",
    example: "청구서류 오류, 링크 반복, 안내 부족",
    defaultAction: "임시 보류·우선 보완 PR",
  },
  {
    grade: "medium",
    criteria: "사용성·검색·일부 화면",
    example: "검색 누락, 버튼 위치",
    defaultAction: "backlog",
  },
  {
    grade: "low",
    criteria: "오타·표현·경미 디자인",
    example: "띄어쓰기, polish",
    defaultAction: "polish PR",
  },
] as const;

export const CRITICAL_INCIDENT_SCENARIOS: readonly {
  scenario: string;
  detection: string;
  immediate: string;
  followUp: string;
}[] = [
  { scenario: "public admin 접근", detection: "외부 사용자 admin 화면", immediate: "즉시 중단", followUp: "PR159-C Admin Access Hotfix" },
  { scenario: "public planner 접근", detection: "비로그인 planner 노출", immediate: "즉시 중단", followUp: "PR159-D Planner Guard Hotfix" },
  { scenario: "비공개·미검수 public 노출", detection: "public 목록/검색", immediate: "즉시 중단", followUp: "PR159-B Public Visibility Hotfix" },
  { scenario: "관리자 정보 public 노출", detection: "운영 이슈·변경·리포트", immediate: "즉시 중단", followUp: "Admin Data Exposure Hotfix" },
  { scenario: "allowlist 없는 AI 접근", detection: "미허용 AI 사용", immediate: "AI 기능 중단", followUp: "AI Access Hotfix" },
  { scenario: "AI 지급 확정", detection: "지급/부지급 단정", immediate: "AI 중단 검토", followUp: "PR159-E AI Safety Hotfix" },
  { scenario: "AI PII 입력 유도", detection: "고객정보 입력 요청", immediate: "AI 중단 검토", followUp: "Privacy Safety Hotfix" },
  { scenario: "prompt injection", detection: "정책 우회", immediate: "AI 기능 중단", followUp: "Prompt Safety Hotfix" },
  { scenario: "secret/env/token 노출", detection: "키·env 노출", immediate: "즉시 중단", followUp: "PR159-G Secret Exposure Review" },
  { scenario: "고객정보 저장 위험", detection: "PII 기록 가능성", immediate: "즉시 중단", followUp: "PR159-F Privacy Handling Hotfix" },
  { scenario: "build/CI 운영 DB", detection: "migrate/deploy 무단", immediate: "즉시 중단", followUp: "PR159-H Deployment Safety Hotfix" },
  { scenario: "결제/회원가입 노출", detection: "의도치 않은 가입·결제", immediate: "즉시 중단", followUp: "External Exposure Cleanup" },
] as const;

export const HIGH_INCIDENT_SCENARIOS: readonly {
  scenario: string;
  detection: string;
  action: string;
  followUp: string;
}[] = [
  { scenario: "청구서류 오류", detection: "공식 정보 불일치 가능", action: "임시 보류·공식 확인", followUp: "PR161 Data Freshness" },
  { scenario: "보험사 정보 오류", detection: "연락처·링크 오류", action: "공식 출처 확인", followUp: "Insurer Data Correction" },
  { scenario: "업무 링크 만료 반복", detection: "404·권한 오류 반복", action: "링크 점검", followUp: "Link Freshness Review" },
  { scenario: "사용자 안내 부족", detection: "PII·책임 고지 부족", action: "문구 보완", followUp: "PR153-B Notice Update" },
  { scenario: "반복 route 오류", detection: "특정 route 반복", action: "재현 후 우선 보완", followUp: "Route Stability PR" },
  { scenario: "검색 결과 오류", detection: "공개 정보 누락", action: "검색 점검", followUp: "Search Quality PR" },
  { scenario: "AI safety warning 반복", detection: "red-team 유형 반복", action: "제한 강화", followUp: "PR164 AI Hardening" },
  { scenario: "고객지원 지연", detection: "제보 flow 불명확", action: "운영 flow 보완", followUp: "Support Workflow PR" },
] as const;

export const INCIDENT_RESPONSE_FLOW: readonly {
  phase: string;
  detail: string;
}[] = [
  { phase: "1. 감지", detail: "제보·운영자·smoke·red-team·metadata 로그; PII·secret 확인" },
  { phase: "2. 격리", detail: "Critical 의심 시 중단 검토; 원문·PII·secret 미저장" },
  { phase: "3. 등급 분류", detail: "Critical/High/Medium/Low; public/admin/AA/PII/secret 보수적 Critical" },
  { phase: "4. 초기 조치", detail: "Critical 중단·High 보류·Medium/Low backlog" },
  { phase: "5. 사용자 안내", detail: "비식별 일반 안내문; 내부 오류명·stack·secret 미노출" },
  { phase: "6. 후속 PR", detail: "권한 hotfix·AI safety·PR161·PR163" },
  { phase: "7. 종료", detail: "metadata 요약 기록; PR160 확대 판단 반영" },
] as const;

export const INCIDENT_RECORD_ALLOW_DENY: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "발생 시간", allowed: "날짜·시간", forbidden: "고객 식별 정보" },
  { field: "발생 영역", allowed: "public/admin/planner/AI", forbidden: "상담 원문" },
  { field: "장애 유형", allowed: "등급·유형", forbidden: "고객명·주민번호·연락처" },
  { field: "재현 요약", allowed: "비식별 행동", forbidden: "상담 원문 전체" },
  { field: "route", allowed: "일반 route명", forbidden: "secret URL" },
  { field: "AI 이슈", allowed: "safety 유형·등급", forbidden: "prompt/response 원문" },
  { field: "데이터 오류", allowed: "보험사명·문서 유형", forbidden: "고객 사고 상세" },
  { field: "조치", allowed: "중단/보류/후속 PR", forbidden: "내부 secret·token" },
  { field: "담당", allowed: "역할명", forbidden: "불필요 PII" },
  { field: "후속 PR", allowed: "PR 후보명", forbidden: "민감 로그 전문" },
] as const;

export const INCIDENT_USER_NOTICE_GUIDANCE: readonly {
  situation: string;
  direction: string;
  forbidden: string;
}[] = [
  { situation: "일시 점검", direction: "일부 기능 안정성 확인 중", forbidden: "내부 오류명" },
  { situation: "기능 제한", direction: "운영 안정성 기준 제한", forbidden: "책임 회피 과장" },
  { situation: "데이터 확인 중", direction: "공식 출처 확인 후 반영", forbidden: "오류 확정 전 단정" },
  { situation: "AI 일시 제한", direction: "safety 기준 점검 중", forbidden: "provider 내부 정보" },
  { situation: "접근 제한", direction: "보안·권한 확인 중", forbidden: "계정 정보 노출" },
  { situation: "베타 일시 중단", direction: "재개 여부 안내", forbidden: "정식 출시 약속" },
  { situation: "오류 제보 요청", direction: "PII 제외 제보", forbidden: "고객정보 입력 요청" },
] as const;

export const INCIDENT_USER_NOTICE_DRAFT = {
  title: "PlannerDesk 제한 베타 점검 안내",
  body: `현재 일부 기능의 안정성 확인을 위해 제한 베타 이용이 일시적으로 제한될 수 있습니다.
확인 중인 내용은 운영 안정성, 정보 정확성, 개인정보 보호 기준에 따라 점검됩니다.

오류 제보 시 고객명, 주민번호, 연락처, 계약번호, 병력, 상담 원문 등 개인정보와 민감정보는 포함하지 말아 주세요.
확인된 내용은 검수 후 반영되며, 필요한 경우 일부 기능은 일시 중단될 수 있습니다.`,
} as const;

export type DrillChecklistStatus = "met" | "partial" | "pending";

export const INCIDENT_DRILL_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: DrillChecklistStatus;
}[] = [
  { id: "crit-grade", item: "Critical 등급", criterion: "명확", status: "met" },
  { id: "high-grade", item: "High 등급", criterion: "명확", status: "met" },
  { id: "pubvis", item: "public visibility", criterion: "즉시 중단", status: "met" },
  { id: "admin", item: "admin access", criterion: "즉시 중단", status: "met" },
  { id: "aa", item: "Answer Assistant", criterion: "AI 중단 검토", status: "met" },
  { id: "pii", item: "개인정보 incident", criterion: "원문 금지·격리", status: "met" },
  { id: "secret", item: "secret incident", criterion: "즉시 중단", status: "met" },
  { id: "data", item: "데이터 오류", criterion: "공식 확인", status: "met" },
  { id: "notice", item: "사용자 안내문", criterion: "내부 정보 미노출", status: "met" },
  { id: "record", item: "장애 기록", criterion: "metadata 중심", status: "met" },
  { id: "follow", item: "후속 PR", criterion: "유형별 분리", status: "met" },
  { id: "noroll", item: "rollback 실행 없음", criterion: "필수", status: "met" },
  { id: "nosend", item: "외부 알림 발송 없음", criterion: "필수", status: "met" },
  { id: "nodb", item: "운영 DB 접근 없음", criterion: "필수", status: "met" },
  { id: "live", item: "실제 장애 리허설 실행", criterion: "PR159-A 문서만", status: "pending" },
] as const;

export const INCIDENT_FOLLOW_UP_PRS: readonly {
  incidentType: string;
  prCandidate: string;
  risk: string;
  codex: string;
}[] = [
  { incidentType: "public visibility", prCandidate: "PR159-B Public Visibility Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "admin access", prCandidate: "PR159-C Admin Access Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "planner guard", prCandidate: "PR159-D Planner Guard Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "Answer Assistant safety", prCandidate: "PR159-E AI Safety Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "개인정보 handling", prCandidate: "PR159-F Privacy Handling Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "secret exposure", prCandidate: "PR159-G Secret Exposure Review", risk: "Critical", codex: "필요" },
  { incidentType: "build/CI deployment", prCandidate: "PR159-H Deployment Safety Hotfix", risk: "Critical", codex: "필요" },
  { incidentType: "청구서류 오류", prCandidate: "PR161 Data Freshness Review", risk: "High", codex: "조건부" },
  { incidentType: "보험사 정보 오류", prCandidate: "PR161 Insurer Data Correction", risk: "High", codex: "조건부" },
  { incidentType: "링크 오류 반복", prCandidate: "PR161 Link Freshness Review", risk: "Medium~High", codex: "조건부" },
  { incidentType: "사용자 안내 부족", prCandidate: "PR153-B Notice Update", risk: "Medium~High", codex: "조건부" },
  { incidentType: "UI/UX 불편", prCandidate: "PR163 Public UX Polish", risk: "Medium", codex: "불필요" },
] as const;

export const PR160_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
  { id: "PR161", title: "Data Freshness Review", purpose: "최신성 점검", risk: "High", codex: "조건부" },
  { id: "PR162", title: "User Support Inbox Plan", purpose: "제보 운영", risk: "High", codex: "조건부" },
  { id: "PR163", title: "Public UX Polish", purpose: "사용성", risk: "Medium", codex: "불필요" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
] as const;

export const PR159_INCIDENT_VERDICTS = {
  incidentDrillPrepared: "conditional" as IncidentDrillStatus,
  criticalResponse: "ready" as IncidentDrillStatus,
  highResponse: "conditional" as IncidentDrillStatus,
  /** live drill execution — deferred */
  liveDrillExecution: "not_ready" as IncidentDrillStatus,
  recordSafety: "ready" as IncidentDrillStatus,
  userNoticeSafety: "ready" as IncidentDrillStatus,
} as const;

export const PR159_OPEN_CRITICAL_COUNT = PR157_OPEN_CRITICAL_COUNT;

export const PR159_OPEN_HIGH_COUNT = PR157_OPEN_HIGH_COUNT + 1;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "장애 등급 기준",
  "Critical/High incident 분류",
  "public/admin/AA/privacy/secret 대응",
  "즉시 중단 기준",
  "장애 기록 metadata-only",
  "prompt/response/상담 원문 금지",
  "사용자 안내문 내부 정보 미노출",
  "청구·보험사 공식 확인",
  "후속 PR 연결",
  "rollback·알림·DB/schema 부재",
  "PR160 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR159_LINKED_HUBS = [
  "PR-158-BETA-FEEDBACK-LOOP-OPS.md",
  "PR-157-BETA-LAUNCH-DECISION-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
  "PR-155-ADMIN-ACCESS-REGRESSION-OPS.md",
  "PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md",
] as const;

export const PR159_TEST_FILES = [
  "tests/ops/pr159-beta-incident-drill.test.ts",
  "tests/ops/pr158-beta-feedback-loop.test.ts",
] as const;

export const PR158_CRITICAL_BASELINE = PR158_OPEN_CRITICAL_COUNT;
