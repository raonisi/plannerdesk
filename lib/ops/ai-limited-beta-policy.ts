/**
 * Answer Assistant limited beta policy (PR-148). Policy/docs only — no access expansion.
 */

import { ACCESS_SCOPE_ROWS } from "@/lib/ops/beta-access-request-flow";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import { ANSWER_ASSISTANT_ROLLBACK_TRIGGERS } from "@/lib/answer-assistant/rollback-disable";

export const PR148_SCOPE_NOTICE =
  "Answer Assistant 제한 베타 운영 정책입니다. 접근 확대, allowlist·role 변경, output safety 약화, audit 원문 저장, schema migration은 포함하지 않습니다.";

export const PR148_FORBIDDEN_DOC_CONTENT =
  "문서에 API key·secret·실제 고객정보·상담 원문·allowlist 실값을 넣지 않습니다.";

export type AiPolicyCheckStatus = "met" | "partial" | "gap";

export const AA_LIMITED_BETA_SCOPE: readonly {
  item: string;
  rule: string;
}[] = [
  { item: "제공 대상", rule: "verified planner + allowlist" },
  { item: "public 사용자", rule: "접근 금지" },
  { item: "일반 planner", rule: "기본 접근 금지" },
  { item: "제한 베타 사용자", rule: "자동 AA 허용 없음 (PR-146 분리)" },
  { item: "content_admin", rule: "운영·상태 확인 (allowlist 변경은 본 PR 금지)" },
  { item: "super_admin", rule: "운영 확인·gate (allowlist 실변경 금지)" },
  { item: "사용 목적", rule: "상담 준비·기준 정리·문구 초안 보조" },
  { item: "금지 목적", rule: "보험금 확정·가입/해지 유도·투자·법률·의료 확정" },
  { item: "개인정보", rule: "입력 금지" },
  { item: "저장 원칙", rule: "usage audit metadata-only" },
  { item: "운영 원칙", rule: "rate limit·output safety·retention·disable 유지" },
] as const;

/** PR-146 beta vs AA split (re-export for admin panel). */
export const BETA_VS_AA_ACCESS_ROWS = ACCESS_SCOPE_ROWS.filter(
  (r) => r.scope.includes("Answer") || r.scope.includes("planner"),
);

export const AA_FORBIDDEN_INPUT_ROWS: readonly {
  inputType: string;
  handling: string;
}[] = [
  { inputType: "고객명", handling: "입력 금지" },
  { inputType: "주민번호", handling: "입력 금지" },
  { inputType: "연락처·주소", handling: "입력 금지" },
  { inputType: "계약번호·보험증권번호", handling: "입력 금지" },
  { inputType: "병력·진단명 원문", handling: "입력 금지 (비식별 요약만)" },
  { inputType: "검사·의무기록 원문", handling: "입력 금지" },
  { inputType: "상담·카카오 원문 전체", handling: "입력 금지" },
  { inputType: "가족·계좌·결제정보", handling: "입력 금지" },
  { inputType: "신분증·증권 이미지", handling: "입력 금지" },
  { inputType: "secret/token/env", handling: "입력 금지" },
] as const;

export const AA_ALLOWED_INPUT_DIRECTIONS: readonly string[] = [
  "비식별 상황 요약",
  "상품명 없이 일반 보장 기준 질문",
  "공식자료 기반 문구 정리 요청",
  "개인정보 제거된 상담 흐름 점검",
  "보험금 확정이 아닌 확인 기준 정리",
] as const;

export const AA_FORBIDDEN_OUTPUT_ROWS: readonly {
  outputType: string;
  handling: string;
}[] = [
  { outputType: "보험금 지급 확정", handling: "금지" },
  { outputType: "무조건 지급/부지급", handling: "금지" },
  { outputType: "특정 상품 가입·해지 유도", handling: "금지" },
  { outputType: "공포 조장", handling: "금지" },
  { outputType: "병력·질병 단정", handling: "금지" },
  { outputType: "법률·세무·의료 확정", handling: "금지" },
  { outputType: "투자 매수·매도", handling: "금지" },
  { outputType: "개인정보 재노출", handling: "금지" },
  { outputType: "내부 권한·운영·secret", handling: "금지" },
  { outputType: "공식자료 확인 불필요", handling: "금지" },
] as const;

export const AA_GOOD_OUTPUT_DIRECTIONS: readonly string[] = [
  "확정이 아니라 확인 기준",
  "보험사 심사·약관 확인 필요",
  "공식자료 재확인 필요",
  "개인정보 제거 후 흐름 점검",
  "가입·해지는 상황·약관 확인 후",
  "상담 보조용 문구 초안",
] as const;

export const OUTPUT_SAFETY_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: AiPolicyCheckStatus;
  note: string;
}[] = [
  { id: "pay", item: "보험금 확정 없음", criterion: "단정 금지", status: "met", note: "output-safety.ts" },
  { id: "join", item: "가입 유도 없음", criterion: "특정 상품 권유 금지", status: "met", note: "—" },
  { id: "cancel", item: "해지 유도 없음", criterion: "해지 권유 금지", status: "met", note: "—" },
  { id: "fear", item: "공포 조장 없음", criterion: "불안 자극 금지", status: "met", note: "—" },
  { id: "official", item: "공식 확인 안내", criterion: "약관·심사 확인", status: "met", note: "constants notices" },
  { id: "pii-out", item: "PII 재노출 없음", criterion: "패턴 스캔", status: "met", note: "output-safety PII patterns" },
  { id: "raw-store", item: "상담 원문 저장 없음", criterion: "audit 금지 필드", status: "met", note: "FORBIDDEN_USAGE_AUDIT_FIELDS" },
  { id: "pro", item: "법률·의료·세무 확정 없음", criterion: "전문가 확인", status: "met", note: "—" },
  { id: "invest", item: "투자 권유 없음", criterion: "매수·매도 금지", status: "met", note: "—" },
  { id: "internal", item: "내부 정보 노출 없음", criterion: "운영·secret 금지", status: "met", note: "—" },
] as const;

export const USAGE_AUDIT_POLICY_ROWS: readonly { item: string; rule: string }[] = [
  { item: "저장 원칙", rule: "metadata-only" },
  { item: "저장 가능", rule: "userId, timestamp, outcome, blockedReason, safety flags, evidence ids" },
  { item: "저장 금지", rule: FORBIDDEN_USAGE_AUDIT_FIELDS.join(", ") },
  { item: "prompt/response 원문", rule: "저장 금지 (스키마에 필드 없음)" },
  { item: "safety event", rule: "유형·등급 중심 (원문 없음)" },
  { item: "retention", rule: "PR-102 retention-config 기본값" },
  { item: "access", rule: "admin / super_admin" },
  { item: "public 노출", rule: "금지" },
] as const;

export const RATE_LIMIT_POLICY_ROWS: readonly { item: string; rule: string }[] = [
  { item: "사용자별 제한", rule: "VERIFIED_ANSWER_ASSIST_RATE_LIMIT 유지" },
  { item: "과도한 요청", rule: "분·일 한도·abuse 차단" },
  { item: "실패 반복", rule: "safety 검토" },
  { item: "우회 시도", rule: "Critical" },
  { item: "public 접근", rule: "차단 (/planner only)" },
  { item: "allowlist 밖", rule: "not_allowlisted" },
] as const;

export const RETENTION_POLICY_ROWS: readonly { item: string; rule: string }[] = [
  { item: "usage metadata", rule: "기본 180일 (env 조정 가능, 문서만)" },
  { item: "원문 데이터", rule: "저장 금지" },
  { item: "safety event", rule: "feedback metadata, 원문 없음" },
  { item: "cleanup", rule: "retention-cleanup.ts (운영자 실행)" },
  { item: "장기 보관", rule: "법무·개인정보 검토 필요 (미확정)" },
] as const;

export const AA_DISABLE_CRITERIA = ANSWER_ASSISTANT_ROLLBACK_TRIGGERS;

export const OPERATOR_REVIEW_ROWS: readonly {
  item: string;
  criterion: string;
}[] = [
  { item: "접근 대상", criterion: "verified + allowlist" },
  { item: "요청 로그", criterion: "metadata-only" },
  { item: "safety flag", criterion: "Critical/High → PR-143" },
  { item: "rate limit", criterion: "우회 없음" },
  { item: "retention", criterion: "cleanup 기준" },
  { item: "PII 입력", criterion: "제보 시 즉시 중단" },
  { item: "출력 위험", criterion: "보험금·가입/해지 유도" },
  { item: "사용자 안내", criterion: "VERIFIED_ANSWER_ASSIST_PAGE_NOTICES" },
  { item: "public visibility", criterion: "public route 없음" },
  { item: "후속", criterion: "PR-143 장애 대응" },
] as const;

export const PR148_USER_NOTICE_GOOD: readonly string[] = [
  "Answer Assistant는 허용된 사용자에게만 제한적으로 제공되는 상담 준비 보조 기능입니다.",
  "보험금 지급 여부, 가입, 해지, 법률·의료·세무 판단을 확정하지 않습니다.",
  "최종 판단은 약관, 공시자료, 보험사 심사 기준, 공식자료를 확인해야 합니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "개인정보가 포함된 상담 원문을 그대로 입력하지 마세요.",
  "출력 결과는 상담 보조용 초안이며, 실제 고객 안내 전 반드시 검토해야 합니다.",
  "제한 베타 접근이 허용되어도 Answer Assistant는 verified planner + allowlist가 필요합니다.",
] as const;

export const PR148_USER_NOTICE_FORBIDDEN: readonly string[] = [
  "누구나 사용할 수 있습니다",
  "AI가 최종 판단",
  "보험금 지급 여부를 바로 확정",
  "고객정보를 입력하면 더 정확",
  "상담 원문을 그대로 넣어",
  "가입해야 합니다",
  "해지해야 합니다",
  "무조건 지급",
  "공식자료 확인 없이 사용",
] as const;

export const AI_LIMITED_BETA_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: AiPolicyCheckStatus;
  note: string;
}[] = [
  { id: "verified", item: "verified planner", criterion: "유지", status: "met", note: "verified-access.ts" },
  { id: "allow", item: "allowlist", criterion: "유지", status: "met", note: "allowlist.ts" },
  { id: "public", item: "public 접근", criterion: "차단", status: "met", note: "no /answer-assistant public" },
  { id: "planner", item: "일반 planner", criterion: "차단", status: "met", note: "role check" },
  { id: "beta-auto", item: "베타 자동 허용", criterion: "없음", status: "met", note: "PR-146" },
  { id: "pii-in", item: "PII 입력 금지", criterion: "안내", status: "met", note: "constants" },
  { id: "raw", item: "상담 원문 저장", criterion: "없음", status: "met", note: "audit schema" },
  { id: "audit", item: "usage audit", criterion: "metadata-only", status: "met", note: "usage-log.ts" },
  { id: "out", item: "output safety", criterion: "유지", status: "met", note: "output-safety.ts" },
  { id: "rl", item: "rate limit", criterion: "유지", status: "met", note: "rate-limit*.ts" },
  { id: "ret", item: "retention", criterion: "문서화", status: "met", note: "retention-config.ts" },
  { id: "dis", item: "disable", criterion: "Critical 즉시", status: "met", note: "rollback-disable.ts" },
  { id: "vis", item: "public visibility", criterion: "admin only", status: "met", note: "—" },
  { id: "pay", item: "결제 연결", criterion: "없음", status: "met", note: "PR-145" },
  { id: "allow-chg", item: "allowlist 변경", criterion: "실변경 없음", status: "met", note: "PR148-A" },
  { id: "migrate", item: "DB migration", criterion: "없음", status: "met", note: "—" },
] as const;

export type AiLimitedBetaVerdict = "conditional_go" | "no_go";

export const PR148_READINESS_VERDICT: AiLimitedBetaVerdict = "conditional_go";

export const PR148_READINESS_CONDITIONS: readonly string[] = [
  "법무·개인정보 검토 전 retention 장기 보관 미확정",
  "입력 차단 로직 강화는 PR148-C 후보 (Critical)",
  "allowlist 운영 UI는 PR148-G 후보",
  "외부 공개 최종 판단은 PR150",
] as const;

export const PR148_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR148-B", title: "Output Safety Rule Hardening", risk: "Critical", codex: "필수" },
  { id: "PR148-C", title: "Input Redaction Plan", risk: "Critical", codex: "필수" },
  { id: "PR148-D", title: "Usage Audit Review", risk: "Critical", codex: "필수" },
  { id: "PR148-E", title: "Rate Limit Hardening", risk: "High", codex: "조건부" },
  { id: "PR148-F", title: "Retention Cleanup Review", risk: "High", codex: "조건부" },
  { id: "PR148-G", title: "Allowlist Admin Plan", risk: "Critical", codex: "필수" },
  { id: "PR148-H", title: "AI Incident Playbook", risk: "Critical", codex: "필수" },
  { id: "PR149", title: "Security Final Audit", risk: "Critical", codex: "필수" },
  { id: "PR150", title: "External Release Decision", risk: "Critical", codex: "필수" },
] as const;

export const PR148_DEFERRED_IMPLEMENTATION = [
  "접근 범위 확대",
  "allowlist 자동 확대",
  "audit prompt/response 원문 저장",
  "output safety 약화",
  "provider/API key 변경",
  "schema migration",
] as const;

export const PR148_LINKED_DOCS = [
  "PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md",
  "PR-147-ANSWER-ASSISTANT-NOTICE.md",
  "PR-146-ACCESS-SCOPE-SPLIT.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-126-ANSWER-ASSISTANT-BETA-OPS.md",
] as const;

export const PR148_CODE_REFERENCES = [
  "lib/answer-assistant/verified-access.ts",
  "lib/answer-assistant/allowlist.ts",
  "lib/answer-assistant/output-safety.ts",
  "lib/answer-assistant/usage-log.ts",
  "lib/answer-assistant/rate-limit-config.ts",
  "lib/answer-assistant/retention-config.ts",
  "app/planner/answer-assistant/",
] as const;
