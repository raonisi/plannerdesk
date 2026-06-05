/**
 * Beta operator execution checklist (PR-152). Checklist/docs only — no launch or role changes.
 */

import {
  PR151_DRY_RUN_VERDICTS,
  PR151_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/external-beta-dry-run";
import { PR150_FINAL_VERDICTS } from "@/lib/ops/external-release-decision";

export const PR152_SCOPE_NOTICE =
  "PR151 dry-run 이후 제한 베타 실제 실행 전 운영자 확인 체크리스트입니다. 실제 배포·외부 공개·beta user·role·allowlist·운영 DB 변경은 포함하지 않습니다.";

export const PR152_FORBIDDEN_DOC_CONTENT =
  "체크리스트·운영 기록에 고객정보·민감정보·secret·allowlist 실값·prompt/response 원문을 넣지 않습니다.";

export type OperatorCheckStatus = "ready" | "conditional" | "pending" | "blocked";

export const OPERATOR_CHECK_STATUS_LABEL: Record<OperatorCheckStatus, string> = {
  ready: "준비됨",
  conditional: "조건부",
  pending: "대기",
  blocked: "차단",
};

export type OperatorReadiness = "ready" | "conditional_ready" | "not_ready";

export const OPERATOR_READINESS_LABEL: Record<OperatorReadiness, string> = {
  ready: "Ready",
  conditional_ready: "Conditional Ready",
  not_ready: "Not Ready",
};

export const PR152_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr151",
    condition: "PR151 dry-run Conditional Go 이상",
    result: PR151_DRY_RUN_VERDICTS.externalBetaDryRun,
    met: PR151_DRY_RUN_VERDICTS.externalBetaDryRun !== "no_go",
  },
  {
    id: "crit",
    condition: "PR151 Critical(정적) 0개",
    result: String(PR151_OPEN_CRITICAL_COUNT),
    met: PR151_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "high",
    condition: "High 리스크 공개 전 보완 분리",
    result: "PR142·PR148-B~H·bulk·데이터",
    met: true,
  },
  {
    id: "pr150",
    condition: "PR150 외부 제한 베타 No-Go 아님",
    result: PR150_FINAL_VERDICTS.limitedExternalBeta,
    met: PR150_FINAL_VERDICTS.limitedExternalBeta !== "no_go",
  },
  {
    id: "pr149",
    condition: "PR149 visibility·RBAC·AA",
    result: "conditional_go",
    met: true,
  },
  {
    id: "pr143",
    condition: "PR143 지원·장애 playbook",
    result: "준비",
    met: true,
  },
  {
    id: "doc",
    condition: "실행 없이 체크리스트만",
    result: "문서·정적",
    met: true,
  },
] as const;

export const PRE_LAUNCH_CHECKLIST: readonly {
  category: string;
  item: string;
  criterion: string;
  required: boolean;
  status: OperatorCheckStatus;
}[] = [
  { category: "보안", item: "Critical 리스크 0개", criterion: "필수", required: true, status: "ready" },
  { category: "권한", item: "public/planner/admin 분리", criterion: "필수", required: true, status: "ready" },
  { category: "public visibility", item: "미검수·비공개·관리자 정보 미노출", criterion: "필수", required: true, status: "ready" },
  { category: "Answer Assistant", item: "verified planner + allowlist 유지", criterion: "필수", required: true, status: "conditional" },
  { category: "베타 접근", item: "Answer Assistant 접근과 분리", criterion: "필수", required: true, status: "ready" },
  { category: "개인정보", item: "고객정보·민감정보 입력 금지 안내", criterion: "필수", required: true, status: "ready" },
  { category: "데이터 책임", item: "공식 출처 확인 필요 고지", criterion: "필수", required: true, status: "ready" },
  { category: "청구서류", item: "보험금 지급 확정 아님 고지", criterion: "필수", required: true, status: "ready" },
  { category: "고객지원", item: "오류 제보·장애 대응 기준 준비", criterion: "필수", required: true, status: "ready" },
  { category: "중단 기준", item: "Critical 발생 시 즉시 중단", criterion: "필수", required: true, status: "ready" },
  { category: "build/CI", item: "운영 DB migration 무단 실행 없음", criterion: "필수", required: true, status: "ready" },
  { category: "결제", item: "결제·PG·구독·가격표 없음", criterion: "필수", required: true, status: "ready" },
  { category: "회원가입", item: "회원가입 확대 없음", criterion: "필수", required: true, status: "ready" },
  { category: "외부 발송", item: "이메일/SMS/카카오/Slack/webhook 없음", criterion: "필수", required: true, status: "ready" },
  { category: "기록", item: "고객정보·secret 없는 metadata 중심", criterion: "필수", required: true, status: "ready" },
  { category: "안내문", item: "베타 사용자 안내 세트", criterion: "PR153", required: true, status: "conditional" },
  { category: "Codex", item: "제한검수(조건부)", criterion: "권장", required: false, status: "pending" },
] as const;

export const DURING_LAUNCH_CHECKLIST: readonly {
  category: string;
  item: string;
  criterion: string;
  haltCondition: string;
}[] = [
  { category: "접근", item: "public → admin 차단", criterion: "정상 차단", haltCondition: "접근 가능 시 Critical" },
  { category: "접근", item: "planner → admin 차단", criterion: "정상 차단", haltCondition: "접근 가능 시 Critical" },
  { category: "접근", item: "일반 planner → AA 차단", criterion: "정상 차단", haltCondition: "접근 가능 시 Critical" },
  { category: "데이터", item: "비공개·미검수 노출 없음", criterion: "정상", haltCondition: "노출 시 Critical" },
  { category: "관리자 정보", item: "운영 이슈·변경 이력·bulk 미노출", criterion: "정상", haltCondition: "노출 시 Critical" },
  { category: "개인정보", item: "고객정보 입력 유도 없음", criterion: "정상", haltCondition: "유도 시 Critical" },
  { category: "청구서류", item: "지급 확정 문구 없음", criterion: "정상", haltCondition: "확정 문구 High~Critical" },
  { category: "Answer Assistant", item: "PII·지급 확정·가입/해지 유도 없음", criterion: "정상", haltCondition: "발생 시 Critical" },
  { category: "고객지원", item: "오류 제보 접수 기준", criterion: "정상", haltCondition: "고객정보 포함 시 비식별" },
  { category: "성능", item: "주요 route 오류 없음", criterion: "정상", haltCondition: "반복 오류 High" },
  { category: "로그", item: "secret/env/API key 노출 없음", criterion: "정상", haltCondition: "노출 시 Critical" },
] as const;

export const POST_LAUNCH_CHECKLIST: readonly {
  category: string;
  item: string;
  criterion: string;
  status: OperatorCheckStatus;
}[] = [
  { category: "접근 로그", item: "비정상 접근 시도", criterion: "metadata 중심 확인", status: "ready" },
  { category: "오류 제보", item: "청구·링크·검색 오류", criterion: "PR143 분류", status: "ready" },
  { category: "개인정보", item: "입력·저장 위험", criterion: "즉시 차단·비식별", status: "ready" },
  { category: "Answer Assistant", item: "safety failure", criterion: "Critical/High 분류", status: "conditional" },
  { category: "public visibility", item: "비공개 데이터 노출", criterion: "0건", status: "ready" },
  { category: "관리자 정보", item: "public 노출", criterion: "0건", status: "ready" },
  { category: "사용성", item: "반복 불편", criterion: "Medium 이하", status: "ready" },
  { category: "데이터 품질", item: "잘못된 정보 제보", criterion: "High 가능", status: "conditional" },
  { category: "중단 필요성", item: "Critical/High 누적", criterion: "조건 시 중단", status: "ready" },
  { category: "후속 PR", item: "개선·보완 정리", criterion: "PR153~160 분리", status: "ready" },
] as const;

export const OPERATOR_ROLE_CHECKLIST: readonly {
  role: string;
  responsibilities: string;
  forbidden: string;
}[] = [
  { role: "owner/operator", responsibilities: "전체 실행 판단·중단 결정", forbidden: "운영 DB 직접 수정" },
  { role: "super_admin", responsibilities: "관리자 화면 최종 확인", forbidden: "secret 열람·출력" },
  { role: "content_admin", responsibilities: "콘텐츠 검수 상태 확인", forbidden: "권한·allowlist 변경" },
  { role: "support operator", responsibilities: "오류 제보 분류", forbidden: "고객정보 원문 저장" },
  { role: "security reviewer", responsibilities: "접근·visibility 확인", forbidden: "실제 role 변경" },
  { role: "AI safety reviewer", responsibilities: "AA 출력 안전성", forbidden: "allowlist 확대" },
  { role: "release reviewer", responsibilities: "PR150~151 조건 충족", forbidden: "실제 배포 실행" },
] as const;

export const CRITICAL_HALT_CRITERIA: readonly {
  situation: string;
  action: string;
}[] = [
  { situation: "public에서 admin 화면 접근 가능", action: "즉시 중단" },
  { situation: "public에서 planner 화면 접근 가능", action: "즉시 중단" },
  { situation: "미검수·비공개 데이터 public 노출", action: "즉시 중단" },
  { situation: "관리자 정보 public 노출", action: "즉시 중단" },
  { situation: "운영 이슈·변경 이력 public 노출", action: "즉시 중단" },
  { situation: "일반 planner가 Answer Assistant 접근 가능", action: "즉시 중단" },
  { situation: "allowlist 없는 사용자가 AA 접근 가능", action: "즉시 중단" },
  { situation: "고객정보·민감정보 저장 위험", action: "즉시 중단" },
  { situation: "prompt/response 원문 저장 위험", action: "즉시 중단 검토" },
  { situation: "secret/env/API key 노출", action: "즉시 중단" },
  { situation: "build/CI가 운영 DB migration 실행", action: "즉시 중단" },
  { situation: "결제/회원가입 의도치 않게 노출", action: "즉시 중단" },
  { situation: "보험금 지급 확정·가입/해지 유도 출력", action: "즉시 AI 중단 검토" },
] as const;

export const OPERATION_RECORD_RULES: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "실행 일시", allowed: "허용", forbidden: "—" },
  { field: "실행자", allowed: "역할명 중심", forbidden: "불필요한 개인정보" },
  { field: "확인 route", allowed: "허용", forbidden: "secret 포함 URL" },
  { field: "결과", allowed: "정상/주의/중단", forbidden: "고객정보 원문" },
  { field: "이슈 등급", allowed: "Critical/High/Medium/Low", forbidden: "—" },
  { field: "조치 요약", allowed: "비식별 요약", forbidden: "상담 원문 전체" },
  { field: "후속 PR", allowed: "허용", forbidden: "secret/token 포함" },
  { field: "고객 제보", allowed: "비식별 요약만", forbidden: "고객명·주민번호·계약번호" },
  { field: "AA 이슈", allowed: "safety flag 중심", forbidden: "prompt/response 원문" },
  { field: "로그", allowed: "metadata 중심", forbidden: "env/API key/token" },
] as const;

export const USER_NOTICE_CRITERIA: readonly {
  topic: string;
  criterion: string;
}[] = [
  { topic: "제한 베타 단계", criterion: "정식 출시가 아님을 명확히" },
  { topic: "기능 범위", criterion: "공개 가능·보류 기능 안내" },
  { topic: "개인정보", criterion: "고객정보·민감정보 입력 금지" },
  { topic: "청구서류", criterion: "보험사·사고별 상이" },
  { topic: "보험금 지급", criterion: "확정하지 않음" },
  { topic: "업무 링크", criterion: "접근·변경 가능성" },
  { topic: "Answer Assistant", criterion: "별도 허용 사용자만 제한 제공" },
  { topic: "오류 제보", criterion: "고객정보 제외 후 제보" },
  { topic: "중단 가능성", criterion: "리스크 시 일시 중단 가능" },
  { topic: "유료화", criterion: "현재 결제·유료화 실행 아님" },
] as const;

export const OPERATOR_EXECUTION_CRITERIA: readonly {
  verdict: OperatorReadiness;
  criteria: string;
}[] = [
  { verdict: "ready", criteria: "Critical·High 0, PR151 통과, 안내문·중단 준비, Codex 완료" },
  { verdict: "conditional_ready", criteria: "Critical 0, High·안내문 일부 보완, 수동 제한 운영" },
  { verdict: "not_ready", criteria: "Critical·통제 불가·권한·PII·AA·build 위험" },
] as const;

export const PR152_OPERATOR_VERDICTS = {
  checklistPrepared: "conditional_ready" as OperatorReadiness,
  preLaunchReady: "conditional_ready" as OperatorReadiness,
  pr153Entry: "conditional_ready" as OperatorReadiness,
  pr157Execution: "not_ready" as OperatorReadiness,
  overallUntilCodex: "conditional_ready" as OperatorReadiness,
} as const;

export const PR152_OPEN_CRITICAL_COUNT = 0;

export const PR153_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR153", title: "Beta User Notice Pack", purpose: "베타 안내문", risk: "Medium~High", codex: "조건부" },
  { id: "PR154", title: "Public Smoke Expansion", purpose: "public smoke", risk: "High", codex: "조건부" },
  { id: "PR155", title: "Admin Access Regression", purpose: "admin 회귀", risk: "Critical", codex: "필수" },
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백 운영", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "실행 전/중/후 체크리스트 누락",
  "Critical 즉시 중단 기준",
  "public/planner/admin 접근",
  "visibility·RBAC·AA allowlist",
  "audit metadata-only",
  "PII·secret 기록 금지",
  "PR143 연결",
  "build/CI 운영 DB",
  "결제·가입·발송 부재",
  "PR153 진입 가능",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "README 취향",
  "UI 미세 취향",
] as const;

export const PR152_LINKED_HUBS = [
  "PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md",
  "PR-150-EXTERNAL-RELEASE-DECISION-OPS.md",
  "PR-149-SECURITY-FINAL-AUDIT-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
] as const;
