/**
 * Beta feedback loop ops standards (PR-158). Docs/checklist only — no form, send, or DB.
 */

import { PR152_OPERATOR_VERDICTS } from "@/lib/ops/beta-operator-checklist";
import { PR153_PACK_VERDICTS } from "@/lib/ops/beta-user-notice-pack";
import {
  IN_FLIGHT_HALT_CRITERIA,
  PR157_LAUNCH_VERDICTS,
  PR157_OPEN_CRITICAL_COUNT,
  PR157_OPEN_HIGH_COUNT,
} from "@/lib/ops/beta-launch-decision";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR158_SCOPE_NOTICE =
  "제한 베타 운영 중 피드백·오류 제보를 **metadata 중심**으로 수집·분류·후속 PR 연결하는 운영 기준입니다. 피드백 폼·외부 발송·beta user·role·allowlist·운영 DB·provider 호출은 포함하지 않습니다.";

export const PR158_FORBIDDEN_DOC_CONTENT =
  "피드백 기록에 고객명·주민번호·연락처·계약번호·상담 원문·prompt/response 원문·secret·allowlist 실값을 넣지 않습니다.";

export type FeedbackLoopStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const FEEDBACK_LOOP_STATUS_LABEL: Record<FeedbackLoopStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR158_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr157",
    condition: "PR157 Conditional Launch 이상 또는 Hold(문서화 필요)",
    result: PR157_LAUNCH_VERDICTS.limitedBetaLaunch,
    met: PR157_LAUNCH_VERDICTS.limitedBetaLaunch !== "no_go",
  },
  {
    id: "crit",
    condition: "PR157 Critical(정적) 0",
    result: String(PR157_OPEN_CRITICAL_COUNT),
    met: PR157_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "halt",
    condition: "PR157 즉시 중단 기준 정리",
    result: `${IN_FLIGHT_HALT_CRITERIA.length}건`,
    met: IN_FLIGHT_HALT_CRITERIA.length > 0,
  },
  {
    id: "pr152",
    condition: "PR152 운영자 체크리스트",
    result: PR152_OPERATOR_VERDICTS.checklistPrepared,
    met: PR152_OPERATOR_VERDICTS.checklistPrepared !== "not_ready",
  },
  {
    id: "pr153",
    condition: "PR153 오류 제보·PII 제외 안내",
    result: PR153_PACK_VERDICTS.noticePackPrepared,
    met: PR153_PACK_VERDICTS.noticePackPrepared !== "not_ready",
  },
  {
    id: "pr143",
    condition: "PR143 고객지원·장애 연계",
    result: "playbook",
    met: true,
  },
  {
    id: "doc",
    condition: "폼·발송 없이 문서·체크리스트만",
    result: "가능",
    met: true,
  },
] as const;

export const FEEDBACK_COLLECTION_PRINCIPLES: readonly {
  principle: string;
  rule: string;
}[] = [
  { principle: "최소 수집", rule: "문제 해결에 필요한 최소 정보만 기록" },
  { principle: "비식별 우선", rule: "고객정보·민감정보·상담 원문 제거" },
  { principle: "metadata 중심", rule: "화면·유형·등급·조치 상태 중심" },
  { principle: "원문 저장 금지", rule: "prompt/response/상담 원문 전체 저장 금지" },
  { principle: "공식 확인", rule: "보험사·청구서류 오류는 공식 출처 확인 전 확정 금지" },
  { principle: "즉시 중단", rule: "Critical 발생 시 기능 또는 베타 운영 중단 검토" },
  { principle: "후속 PR 분리", rule: "구조·권한·DB 변경은 별도 PR" },
  { principle: "보안 우선", rule: "secret/env/token 포함 시 즉시 제거·보고" },
  { principle: "자동화 금지", rule: "PR158에서 외부 발송·폼·알림 자동화 구현 금지" },
  { principle: "운영 기록", rule: "고객정보 없는 비식별 요약만 유지" },
] as const;

export const FEEDBACK_RECORD_ALLOW_DENY: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "발생 화면", allowed: "route 또는 화면명", forbidden: "개인정보 포함 캡처 원본" },
  { field: "문제 유형", allowed: "선택형 분류", forbidden: "고객정보 포함 설명" },
  { field: "재현 조건", allowed: "비식별 행동 요약", forbidden: "상담 원문 전체" },
  { field: "기대/실제 결과", allowed: "오류 요약", forbidden: "주민번호·연락처·계약번호" },
  { field: "사용자 구분", allowed: "public/planner/admin 역할명", forbidden: "실명·연락처" },
  { field: "Answer Assistant", allowed: "safety 유형·등급", forbidden: "prompt/response 원문" },
  { field: "청구서류 오류", allowed: "보험사명·문서 유형", forbidden: "고객 사고 상세" },
  { field: "링크 오류", allowed: "URL 범주 또는 화면명", forbidden: "secret 포함 URL" },
  { field: "조치 내용", allowed: "비식별 조치 요약", forbidden: "내부 secret·token" },
  { field: "후속 PR", allowed: "PR 후보명·위험도", forbidden: "민감정보 포함 로그" },
] as const;

export const FEEDBACK_TYPE_CLASSIFICATION: readonly {
  type: string;
  example: string;
  defaultGrade: IssueSeverity | "critical~high";
}[] = [
  { type: "public visibility 오류", example: "비공개·미검수 데이터 public 노출", defaultGrade: "critical" },
  { type: "admin 접근 오류", example: "public/planner가 admin 접근", defaultGrade: "critical" },
  { type: "planner 접근 오류", example: "public이 planner 화면 접근", defaultGrade: "critical" },
  { type: "Answer Assistant 접근 오류", example: "allowlist 없는 사용자 접근", defaultGrade: "critical" },
  { type: "AI safety 오류", example: "지급 확정·PII 유도·injection", defaultGrade: "critical" },
  { type: "개인정보 포함 제보", example: "고객명·주민번호·계약번호 포함", defaultGrade: "critical~high" },
  { type: "secret 노출 의심", example: "env/token/API key 노출", defaultGrade: "critical" },
  { type: "청구서류 오류", example: "잘못된 서류 안내 가능성", defaultGrade: "high" },
  { type: "보험사 정보 오류", example: "연락처·업무 링크 오류", defaultGrade: "high" },
  { type: "링크 만료", example: "404 또는 권한 오류", defaultGrade: "medium" },
  { type: "검색 품질", example: "공개 정보 검색 누락", defaultGrade: "medium" },
  { type: "UI 사용성", example: "버튼·문구 이해 어려움", defaultGrade: "medium" },
  { type: "문구 오탈자", example: "단순 오타", defaultGrade: "low" },
  { type: "기능 제안", example: "신규 기능 요청", defaultGrade: "low" },
  { type: "성능 지연", example: "반복 로딩·응답 지연", defaultGrade: "high" },
] as const;

export const CRITICAL_FEEDBACK_RESPONSE: readonly {
  situation: string;
  immediate: string;
  followUp: string;
}[] = [
  { situation: "public admin 접근", immediate: "즉시 중단", followUp: "admin access hardening PR" },
  { situation: "public planner 접근", immediate: "즉시 중단", followUp: "route guard 보완 PR" },
  { situation: "비공개·미검수 public 노출", immediate: "즉시 중단", followUp: "public visibility PR" },
  { situation: "관리자 정보 public 노출", immediate: "즉시 중단", followUp: "admin data exposure PR" },
  { situation: "allowlist 없는 AI 접근", immediate: "AI 기능 중단", followUp: "AA access PR" },
  { situation: "AI 지급 확정 출력", immediate: "AI 중단 검토", followUp: "output safety PR" },
  { situation: "AI PII 입력 유도", immediate: "AI 중단 검토", followUp: "privacy safety PR" },
  { situation: "prompt injection 성공", immediate: "AI 기능 중단", followUp: "prompt safety PR" },
  { situation: "secret/env/token 노출", immediate: "즉시 중단", followUp: "secret exposure PR" },
  { situation: "고객정보 저장 위험", immediate: "즉시 중단", followUp: "privacy handling PR" },
  { situation: "build/CI 운영 DB 접촉", immediate: "즉시 중단", followUp: "deployment safety PR" },
  { situation: "결제/회원가입 노출", immediate: "즉시 중단", followUp: "exposure cleanup PR" },
] as const;

export const HIGH_FEEDBACK_RESPONSE: readonly {
  situation: string;
  action: string;
  followUp: string;
}[] = [
  { situation: "청구서류 오류 가능성", action: "공식 확인 전 임시 보류", followUp: "PR161 data freshness" },
  { situation: "보험사 정보 오류", action: "공식 페이지 확인", followUp: "insurer correction PR" },
  { situation: "업무 링크 만료 반복", action: "링크 상태 점검", followUp: "link freshness PR" },
  { situation: "사용자 안내 부족", action: "문구 보완", followUp: "PR153-B notice update" },
  { situation: "오류 제보 기준 부족", action: "체크리스트 보완", followUp: "support workflow PR" },
  { situation: "반복 route 오류", action: "재현 후 우선 수정", followUp: "route stability PR" },
  { situation: "검색 결과 누락 반복", action: "검색 기준 점검", followUp: "search quality PR" },
  { situation: "개인정보 입력 시도", action: "안내 강화", followUp: "privacy notice PR" },
  { situation: "AI 안전 경고 반복", action: "제한 강화", followUp: "PR164 AI hardening" },
] as const;

export const MEDIUM_LOW_FEEDBACK_RESPONSE: readonly {
  grade: "medium" | "low";
  handling: string;
  followUp: string;
}[] = [
  { grade: "medium", handling: "반복성·업무 영향 확인 후 backlog", followUp: "UX/검색/문구 PR" },
  { grade: "low", handling: "단순 개선·오탈자", followUp: "polish PR" },
  { grade: "medium", handling: "기능 제안 — 수요·위험도 평가", followUp: "roadmap candidate" },
  { grade: "low", handling: "UI 취향 — 업무 효율 영향 시만", followUp: "UI polish" },
  { grade: "low", handling: "단순 문구 — 책임 고지 영향 확인", followUp: "copy polish" },
] as const;

export const AA_FEEDBACK_HANDLING: readonly {
  feedback: string;
  record: string;
  grade: IssueSeverity | "high~critical";
}[] = [
  { feedback: "보험금 지급 확정 출력", record: "유형·요약·safety flag (원문 없음)", grade: "critical" },
  { feedback: "개인정보 입력 유도", record: "입력 유도 유형만", grade: "critical" },
  { feedback: "가입·해지 유도", record: "유형·위험도·재현 요약", grade: "critical" },
  { feedback: "공포 조장", record: "유형·위험도·재현 요약", grade: "high" },
  { feedback: "법률·의료·세무 확정", record: "전문 판단 유형", grade: "high" },
  { feedback: "투자 권유", record: "투자 권유 유형", grade: "high" },
  { feedback: "prompt injection 성공", record: "공격 유형·차단 실패 여부", grade: "critical" },
  { feedback: "secret 요청 응답", record: "secret leakage 유형", grade: "critical" },
  { feedback: "답변 품질 낮음", record: "주제·개선 방향 요약", grade: "medium" },
  { feedback: "응답 지연", record: "시간대·상황 metadata", grade: "medium" },
] as const;

export const DATA_ERROR_FEEDBACK_HANDLING: readonly {
  data: string;
  verify: string;
  action: string;
}[] = [
  { data: "보험사 정보", verify: "공식 홈페이지·공시", action: "확인 전 확정 금지" },
  { data: "청구서류", verify: "보험사 공식 청구 안내", action: "오류 가능 시 임시 보류" },
  { data: "업무 링크", verify: "접근 가능 여부", action: "링크 업데이트 후보" },
  { data: "전산 링크", verify: "권한 필요 여부", action: "public 안내 보완" },
  { data: "지식 아카이브", verify: "검수·공식 근거", action: "미검수 전환 가능" },
  { data: "검색 결과", verify: "공개·검수 상태", action: "검색 인덱스 점검" },
  { data: "안내문", verify: "책임 고지·PII 금지", action: "문구 보완" },
] as const;

export const FEEDBACK_WORKFLOW_STEPS: readonly {
  phase: string;
  detail: string;
}[] = [
  { phase: "1. 접수", detail: "PII·secret 포함 여부 확인 → 포함 시 즉시 비식별화, 원문 미저장" },
  { phase: "2. 분류", detail: "Critical/High/Medium/Low + 유형(public/admin/AA/PII/데이터/링크/UX)" },
  { phase: "3. 초기 조치", detail: "Critical 즉시 중단·High 임시 보류·Medium/Low backlog" },
  { phase: "4. 확인", detail: "데이터는 공식 출처 확인 전 확정 금지; AA는 safety 유형·재현 요약만" },
  { phase: "5. 후속 PR", detail: "권한→Critical PR, 데이터→PR161, AI→PR164, UX→PR163" },
  { phase: "6. 종료", detail: "비식별 요약만 기록; PII·secret 미기록" },
] as const;

export type ChecklistItemStatus = "met" | "partial" | "pending";

export const FEEDBACK_LOOP_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: ChecklistItemStatus;
}[] = [
  { id: "collect", item: "피드백 수집 기준", criterion: "최소·비식별", status: "met" },
  { id: "pii", item: "고객정보 입력 금지", criterion: "명확", status: "met" },
  { id: "secret", item: "secret/env/token 기록 금지", criterion: "명확", status: "met" },
  { id: "no-raw", item: "prompt/response 원문 저장 금지", criterion: "명확", status: "met" },
  { id: "crit", item: "Critical 분류", criterion: "명확", status: "met" },
  { id: "high", item: "High 분류", criterion: "명확", status: "met" },
  { id: "medlow", item: "Medium/Low backlog", criterion: "명확", status: "met" },
  { id: "aa", item: "Answer Assistant 피드백", criterion: "metadata 중심", status: "met" },
  { id: "data", item: "데이터 오류 처리", criterion: "공식 출처 확인", status: "met" },
  { id: "claim", item: "청구서류 오류", criterion: "확정 전 보류", status: "met" },
  { id: "pubvis", item: "public visibility", criterion: "즉시 중단", status: "met" },
  { id: "admin", item: "admin 접근 오류", criterion: "즉시 중단", status: "met" },
  { id: "follow", item: "후속 PR 연결", criterion: "유형별 분리", status: "met" },
  { id: "noform", item: "발송·폼 구현 없음", criterion: "필수", status: "met" },
  { id: "nodb", item: "운영 DB 접근 없음", criterion: "필수", status: "met" },
  { id: "inbox", item: "실제 수집 채널(inbox)", criterion: "PR162 후보", status: "pending" },
] as const;

export const FOLLOW_UP_PR_LINKS: readonly {
  feedbackType: string;
  prCandidate: string;
  risk: string;
  codex: string;
}[] = [
  { feedbackType: "public visibility", prCandidate: "PR158-B Public Visibility Hotfix", risk: "Critical", codex: "필요" },
  { feedbackType: "admin 접근", prCandidate: "PR158-C Admin Access Hotfix", risk: "Critical", codex: "필요" },
  { feedbackType: "Answer Assistant safety", prCandidate: "PR158-D AI Safety Hotfix", risk: "Critical", codex: "필요" },
  { feedbackType: "개인정보 저장 위험", prCandidate: "PR158-E Privacy Hotfix", risk: "Critical", codex: "필요" },
  { feedbackType: "secret 노출", prCandidate: "PR158-F Secret Hotfix", risk: "Critical", codex: "필요" },
  { feedbackType: "청구서류 오류", prCandidate: "PR161 Data Freshness", risk: "High", codex: "조건부" },
  { feedbackType: "보험사 정보 오류", prCandidate: "PR161 Data Freshness", risk: "High", codex: "조건부" },
  { feedbackType: "링크 오류 반복", prCandidate: "PR161 Link Freshness", risk: "Medium~High", codex: "조건부" },
  { feedbackType: "사용자 안내 부족", prCandidate: "PR153-B Notice Update", risk: "Medium~High", codex: "조건부" },
  { feedbackType: "사용성 불편", prCandidate: "PR163 Public UX Polish", risk: "Medium", codex: "불필요" },
  { feedbackType: "기능 제안", prCandidate: "Roadmap Candidate", risk: "Low~Medium", codex: "불필요" },
] as const;

export const PR159_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR159", title: "Beta Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
  { id: "PR161", title: "Data Freshness Review", purpose: "최신성 점검", risk: "High", codex: "조건부" },
  { id: "PR162", title: "User Support Inbox Plan", purpose: "제보 운영", risk: "High", codex: "조건부" },
  { id: "PR163", title: "Public UX Polish", purpose: "사용성", risk: "Medium", codex: "불필요" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
] as const;

export const PR158_FEEDBACK_VERDICTS = {
  feedbackLoopPrepared: "conditional" as FeedbackLoopStatus,
  /** 실제 inbox/폼 — PR162 이후 */
  collectionChannel: "not_ready" as FeedbackLoopStatus,
  /** PII·원문·secret 금지 기준 */
  deidentificationSafety: "ready" as FeedbackLoopStatus,
  /** Critical/High 분류 */
  severityClassification: "conditional" as FeedbackLoopStatus,
} as const;

export const PR158_OPEN_CRITICAL_COUNT = 0;

export const PR158_OPEN_HIGH_COUNT = FEEDBACK_LOOP_CHECKLIST.filter(
  (c) => c.status === "pending" || c.status === "partial",
).length;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "피드백 최소화·비식별 기준",
  "PII·secret·원문 저장 금지",
  "Critical/High/Medium/Low 분류",
  "public/admin/AA 위험 Critical 분류",
  "AA metadata-only 처리",
  "데이터 오류 공식 확인",
  "후속 PR 연결",
  "폼·발송·DB/schema 변경 부재",
  "PR159 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR158_LINKED_HUBS = [
  "PR-157-BETA-LAUNCH-DECISION-OPS.md",
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
] as const;

export const PR158_TEST_FILES = [
  "tests/ops/pr158-beta-feedback-loop.test.ts",
  "tests/ops/pr157-beta-launch-decision.test.ts",
] as const;

/** High baseline from PR157 — feedback ops inherits launch context. */
export const PR157_HIGH_BASELINE = PR157_OPEN_HIGH_COUNT;
