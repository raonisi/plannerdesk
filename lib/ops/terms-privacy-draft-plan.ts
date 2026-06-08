/**
 * Terms & privacy draft plan ops standards (PR-169). Draft/review docs only — no legal finalization,
 * consent UI, PII collection expansion, billing, or schema changes.
 */

import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import {
  PR168_CORRECTION_VERDICTS,
  CORRECTION_WORKFLOW_PRINCIPLES,
} from "@/lib/ops/data-correction-workflow";
import { PR165_READINESS_VERDICTS } from "@/lib/ops/payment-legal-readiness";
import {
  PR162_INBOX_VERDICTS,
  REPORT_RECORD_ALLOW_DENY,
} from "@/lib/ops/user-support-inbox-plan";
import { PR142_FORBIDDEN_DOC_CONTENT } from "@/lib/ops/terms-privacy-plan";

export const PR169_SCOPE_NOTICE =
  "이용약관·개인정보처리방침·데이터·AI·고객지원·환불 관련 **초안 작성 계획**입니다. 약관 확정·개인정보처리방침 확정·환불정책 확정·결제 구현·회원가입 확대·개인정보 수집 구조 추가는 포함하지 않습니다.";

export const PR169_FORBIDDEN_DOC_CONTENT =
  "문서에 법무 검토 완료·약관 확정·개인정보처리방침 확정·환불 보장·결제 즉시 이용·준수 보장 표현을 넣지 않습니다. " +
  PR142_FORBIDDEN_DOC_CONTENT;

export type DraftPlanStatus = "ready" | "conditional" | "not_ready" | "blocked" | "review_needed";

export const DRAFT_PLAN_STATUS_LABEL: Record<DraftPlanStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  review_needed: "검토 필요",
};

export type DraftItemStatus = "draft_needed" | "review_needed" | "required" | "deferred";

export const DRAFT_ITEM_STATUS_LABEL: Record<DraftItemStatus, string> = {
  draft_needed: "초안 필요",
  review_needed: "검토 필요",
  required: "필수",
  deferred: "보류",
};

export const PR169_OPEN_CRITICAL_COUNT = 0;

export const PR169_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr165",
    condition: "PR165 Payment Legal Readiness",
    result: PR165_READINESS_VERDICTS.paymentLegalReadiness,
    met: PR165_READINESS_VERDICTS.documentationComplete === "ready",
  },
  {
    id: "pr168",
    condition: "PR168 데이터 책임 기준",
    result: PR168_CORRECTION_VERDICTS.officialSourcePolicy,
    met: PR168_CORRECTION_VERDICTS.officialSourcePolicy === "ready",
  },
  {
    id: "pr162",
    condition: "PR162 오류 제보·PII 금지",
    result: PR162_INBOX_VERDICTS.deidentificationSafety,
    met: PR162_INBOX_VERDICTS.deidentificationSafety === "ready",
  },
  {
    id: "pr164",
    condition: "PR164 AI safety 기준",
    result: PR164_SAFETY_VERDICTS.accessGuardIntegrity,
    met: PR164_SAFETY_VERDICTS.accessGuardIntegrity === "ready",
  },
  {
    id: "no-final",
    condition: "약관 확정 없이 초안 계획만",
    result: "가능",
    met: true,
  },
  {
    id: "no-pii-struct",
    condition: "개인정보 수집 구조 추가 불필요",
    result: "가능",
    met: true,
  },
] as const;

export const TERMS_OF_SERVICE_DRAFT_PLAN: readonly {
  id: string;
  item: string;
  purpose: string;
  status: DraftItemStatus;
}[] = [
  { id: "purpose", item: "서비스 목적", purpose: "설계사 업무 보조 도구 명시", status: "draft_needed" },
  { id: "audience", item: "이용 대상", purpose: "제한 베타·권한 사용자 기준", status: "draft_needed" },
  { id: "account", item: "계정·권한", purpose: "admin/planner/public 구분", status: "draft_needed" },
  { id: "prohibited", item: "금지 행위", purpose: "권한 우회·PII 입력·악용 금지", status: "draft_needed" },
  { id: "data-duty", item: "데이터 책임", purpose: "공식 출처 확인 필요", status: "draft_needed" },
  { id: "claim-duty", item: "청구서류 책임", purpose: "보험금 지급 확정 아님", status: "draft_needed" },
  { id: "aa", item: "Answer Assistant", purpose: "최종 판단 아님·보조 도구", status: "draft_needed" },
  { id: "interrupt", item: "서비스 중단", purpose: "베타 중 기능 제한 가능", status: "draft_needed" },
  { id: "liability", item: "면책·책임 제한", purpose: "법무 검토 필요", status: "review_needed" },
  { id: "dispute", item: "분쟁·관할", purpose: "법무 검토 필요", status: "review_needed" },
  { id: "paid", item: "유료화 조항", purpose: "결제 전 별도 검토", status: "deferred" },
] as const;

export const PRIVACY_POLICY_DRAFT_PLAN: readonly {
  id: string;
  item: string;
  purpose: string;
  status: DraftItemStatus;
}[] = [
  { id: "collection", item: "수집 항목", purpose: "실제 수집 항목만 기재", status: "review_needed" },
  { id: "purpose-use", item: "수집 목적", purpose: "계정·고객지원·보안", status: "review_needed" },
  { id: "retention", item: "보관 기간", purpose: "최소 보관·파기", status: "review_needed" },
  { id: "third-party", item: "제3자 제공", purpose: "제공 여부 명확화", status: "review_needed" },
  { id: "processor", item: "처리 위탁", purpose: "PG·호스팅·이메일 향후 검토", status: "review_needed" },
  { id: "usage-log", item: "사용 로그", purpose: "metadata 중심 명시", status: "draft_needed" },
  { id: "ai-record", item: "AI 사용 기록", purpose: "prompt/response 원문 저장 금지", status: "required" },
  { id: "report", item: "오류 제보", purpose: "개인정보 제외 원칙", status: "required" },
  { id: "sensitive", item: "민감정보", purpose: "입력·수집 금지", status: "required" },
  { id: "destruction", item: "파기 기준", purpose: "법무 검토 필요", status: "review_needed" },
  { id: "rights", item: "이용자 권리", purpose: "열람·정정·삭제 절차", status: "review_needed" },
] as const;

export const DATA_RESPONSIBILITY_DRAFT_PLAN: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "insurer", item: "보험사 정보", rule: "공식 홈·공시·고객센터 확인 필요" },
  { id: "claim", item: "청구서류", rule: "사고·보장·심사 기준에 따라 달라질 수 있음" },
  { id: "link", item: "업무 링크", rule: "보험사 정책·전산 변경 가능" },
  { id: "knowledge", item: "지식 아카이브", rule: "상담 보조 자료·최종 판단 아님" },
  { id: "search", item: "public 검색", rule: "공개·검수 정보만" },
  { id: "correction", item: "데이터 오류", rule: "공식 출처 확인 후 수정" },
  { id: "report", item: "사용자 제보", rule: "공식 확인 전 확정 근거 아님" },
  { id: "freshness", item: "최신성", rule: "실시간 최신성 보장 금지" },
  { id: "scope", item: "책임 범위", rule: "고객 안내 전 공식 자료 확인" },
] as const;

export const AA_NOTICE_DRAFT_PLAN: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "role", item: "기능 성격", rule: "설계사 업무 보조용" },
  { id: "no-final", item: "최종 판단", rule: "보험금·법률·의료·세무·투자 확정 금지" },
  { id: "no-pii", item: "개인정보", rule: "고객정보·민감정보 입력 금지" },
  { id: "no-raw", item: "원문 저장", rule: "prompt/response/상담 원문 저장 금지" },
  { id: "access", item: "사용 대상", rule: "verified planner + allowlist" },
  { id: "output", item: "출력 제한", rule: "지급 확정·가입·해지·공포 금지" },
  { id: "official", item: "공식 확인", rule: "약관·보험사 공식 자료 확인 필요" },
  { id: "disable", item: "중단 기준", rule: "safety failure 시 기능 제한 가능" },
] as const;

export const SUPPORT_REPORT_NOTICE_DRAFT_PLAN: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "types", item: "제보 가능 항목", rule: "데이터·링크·화면·AI safety 오류" },
  { id: "allow", item: "포함할 정보", rule: "화면명·유형·비식별 요약" },
  { id: "deny", item: "포함 금지", rule: "고객명·주민번호·계약번호·병력·상담 원문" },
  { id: "attach", item: "첨부 금지", rule: "증권·신분증·진단서·PII 이미지" },
  { id: "status", item: "처리 기준", rule: "접수·확인·보류·완료" },
  { id: "official", item: "공식 확인", rule: "보험사·청구 오류는 출처 확인 후 반영" },
  { id: "urgent", item: "긴급 중단", rule: "Critical 이슈 시 기능 제한 가능" },
  { id: "sla", item: "답변 보장", rule: "처리 시간·해결 보장 표현 금지" },
] as const;

export const REFUND_CANCEL_REVIEW_ITEMS: readonly {
  id: string;
  item: string;
  reviewBasis: string;
  pr169Judgment: DraftItemStatus;
}[] = [
  { id: "cancel", item: "결제 취소", reviewBasis: "결제 전 단계·확정 금지", pr169Judgment: "review_needed" },
  { id: "mid-term", item: "중도 해지", reviewBasis: "유료화 전 확정 금지", pr169Judgment: "review_needed" },
  { id: "refund", item: "환불 기준", reviewBasis: "결제 수단·기간·장애 검토", pr169Judgment: "review_needed" },
  { id: "trial", item: "무료 체험", reviewBasis: "운영 가능성 검토", pr169Judgment: "review_needed" },
  { id: "renewal", item: "구독 갱신", reviewBasis: "사전 고지 필요", pr169Judgment: "review_needed" },
  { id: "price-change", item: "가격 변경", reviewBasis: "고지·적용 시점 검토", pr169Judgment: "review_needed" },
  { id: "invoice", item: "세금계산서·영수증", reviewBasis: "발행 방식 검토", pr169Judgment: "review_needed" },
  { id: "support-flow", item: "고객지원", reviewBasis: "환불 요청 처리 흐름", pr169Judgment: "review_needed" },
] as const;

export const TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "법무 검토 완료", reason: "실제 검토 전 확정 금지" },
  { phrase: "개인정보처리방침 확정", reason: "실제 확정 전 금지" },
  { phrase: "환불 보장", reason: "정책 미확정" },
  { phrase: "결제 즉시 이용 가능", reason: "결제 기능 미구현" },
  { phrase: "모든 정보 최신 보장", reason: "실시간 최신성 보장 불가" },
  { phrase: "보험금 지급 가능성 판단", reason: "보험금 확정 오인" },
  { phrase: "AI가 최종 판단", reason: "보조 도구 원칙 위반" },
  { phrase: "고객정보를 입력하면 정확함", reason: "개인정보 위험" },
  { phrase: "상담 원문을 그대로 입력", reason: "원문 저장 위험" },
  { phrase: "가입 전환율 보장", reason: "성과 보장 위험" },
  { phrase: "매출 보장", reason: "과장 표현 위험" },
  { phrase: "이용약관 확정", reason: "법무 검토 전 금지" },
  { phrase: "준수 보장", reason: "법적 확정 표현 금지" },
] as const;

export const LEGAL_REVIEW_REQUIRED_ITEMS: readonly {
  id: string;
  item: string;
  reason: string;
  priority: "critical" | "high";
}[] = [
  { id: "tos", item: "이용약관 전체 구조", reason: "서비스 책임 범위", priority: "critical" },
  { id: "privacy", item: "개인정보처리방침", reason: "수집·보관·파기·위탁", priority: "critical" },
  { id: "sensitive", item: "민감정보 입력 금지 문구", reason: "보험·건강정보 위험", priority: "critical" },
  { id: "aa", item: "Answer Assistant 고지", reason: "AI 보조 도구 책임", priority: "critical" },
  { id: "claim", item: "청구서류 책임 고지", reason: "지급 오인 방지", priority: "critical" },
  { id: "refund", item: "환불·취소·해지 정책", reason: "유료화 전 필수", priority: "critical" },
  { id: "ecommerce", item: "전자상거래 고지", reason: "결제 도입 전 필수", priority: "critical" },
  { id: "support", item: "고객지원 기준", reason: "장애·환불·오류 처리", priority: "high" },
  { id: "freshness", item: "데이터 최신성 고지", reason: "공식 출처 확인", priority: "high" },
  { id: "ads", item: "표시·광고 문구", reason: "과장·성과 보장 방지", priority: "high" },
] as const;

export const TERMS_PRIVACY_NO_GO_CRITERIA: readonly {
  id: string;
  situation: string;
  judgment: string;
}[] = [
  { id: "final-terms", situation: "약관·개인정보처리방침 확정 표현", judgment: "No-Go" },
  { id: "pii-mismatch", situation: "수집 항목이 실제 구조와 불일치", judgment: "No-Go" },
  { id: "raw-store", situation: "prompt/response 원문 저장 가능성", judgment: "No-Go" },
  { id: "pii-induce", situation: "고객정보·민감정보 입력 유도", judgment: "No-Go" },
  { id: "payout-guarantee", situation: "지급 확정·성과 보장 표현", judgment: "No-Go" },
  { id: "aa-final", situation: "AA를 최종 판단 도구로 표현", judgment: "No-Go" },
  { id: "refund-final", situation: "환불정책 검토 없이 확정", judgment: "No-Go" },
  { id: "pay-without-impl", situation: "결제 미구현 상태 결제 가능 문구", judgment: "No-Go" },
  { id: "legal-done", situation: "법무 검토 완료 표현", judgment: "No-Go" },
  { id: "schema-pii", situation: "DB/schema·PII 수집 구조 추가", judgment: "No-Go" },
] as const;

export const PR170_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR170", title: "Payment Architecture Plan", purpose: "결제 구조 설계", risk: "Critical", codex: "필수" },
  { id: "PR171", title: "Refund & Support Policy Plan", purpose: "환불·지원 정책", risk: "Critical", codex: "필수" },
  { id: "PR172", title: "Beta Review Summary", purpose: "베타 종합 보고", risk: "High", codex: "조건부" },
  { id: "PR173", title: "Public Release Readiness Review", purpose: "공개 베타 검토", risk: "Critical", codex: "필수" },
  { id: "PR174", title: "Terms Legal Review Prep", purpose: "법무 검토 전달용 초안", risk: "Critical", codex: "필수" },
] as const;

export type DraftPlanChecklistStatus = "met" | "partial" | "pending" | "gap";

export const TERMS_PRIVACY_DRAFT_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: DraftPlanChecklistStatus;
}[] = [
  { id: "tos-plan", item: "이용약관 초안 계획", criterion: "11항목", status: "met" },
  { id: "privacy-plan", item: "개인정보 초안 계획", criterion: "11항목", status: "met" },
  { id: "data-notice", item: "데이터 책임 고지", criterion: "9항목", status: "met" },
  { id: "aa-notice", item: "AA 고지", criterion: "8항목", status: "met" },
  { id: "support-notice", item: "오류 제보 고지", criterion: "8항목", status: "met" },
  { id: "refund-review", item: "환불 검토 항목", criterion: "8항목", status: "met" },
  { id: "forbidden", item: "금지 표현", criterion: "문서화", status: "met" },
  { id: "legal-review", item: "법무 검토 필요", criterion: "10항목", status: "met" },
  { id: "no-go", item: "No-Go 기준", criterion: "10항목", status: "met" },
  { id: "no-final", item: "약관 확정", criterion: "PR169 미실행", status: "met" },
  { id: "no-billing", item: "결제 구현", criterion: "없음", status: "met" },
  { id: "no-pii-struct", item: "PII 수집 구조 추가", criterion: "없음", status: "met" },
  { id: "legal-final", item: "법무 검토 완료", criterion: "별도 PR174", status: "gap" },
  { id: "live-terms", item: "live 약관 게시", criterion: "후속 PR만", status: "pending" },
] as const;

export const PR169_DRAFT_VERDICTS = {
  termsPrivacyDraftPlan: "conditional" as DraftPlanStatus,
  draftScopeDefined: "ready" as DraftPlanStatus,
  legalFinalization: "blocked" as DraftPlanStatus,
  billingImplementation: "blocked" as DraftPlanStatus,
} as const;

export const PR169_PREP_TARGETS = {
  dataResponsibility: "lib/ops/data-responsibility-notice.ts",
  betaNotice: "lib/ops/beta-user-notice-pack.ts",
  inboxPlan: "lib/ops/user-support-inbox-plan.ts",
  aiSafety: "lib/ops/ai-safety-hardening.ts",
  paymentLegal: "lib/ops/payment-legal-readiness.ts",
  dataCorrection: "lib/ops/data-correction-workflow.ts",
  termsPrivacy142: "lib/ops/terms-privacy-plan.ts",
  correctionPrinciples: CORRECTION_WORKFLOW_PRINCIPLES.length,
  reportAllowDeny: REPORT_RECORD_ALLOW_DENY.length,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "약관·개인정보 확정 부재",
  "환불정책 확정 부재",
  "PII 수집 구조 추가 부재",
  "prompt/response 원문 저장 부재",
  "AI 고지 책임 범위",
  "보험금 지급 확정 표현 부재",
  "결제/PG/구독 구현 부재",
  "법무 검토 필요 항목",
  "No-Go 기준",
  "PR170 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "초안 필드명",
  "후속 PR 번호 가정",
] as const;

export const PR169_LINKED_HUBS = [
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
  "PR-165-PAYMENT-LEGAL-READINESS-OPS.md",
  "PR-168-DATA-CORRECTION-WORKFLOW-OPS.md",
  "PR-142-TERMS-PRIVACY-PLAN-OPS.md",
] as const;

export const PR169_FORBIDDEN_PHRASES: readonly string[] =
  TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS.map((r) => r.phrase);

export const PR169_TEST_FILES = [
  "tests/ops/pr169-terms-privacy-draft-plan.test.ts",
  "tests/ops/pr165-payment-legal-readiness.test.ts",
  "tests/ops/pr168-data-correction-workflow.test.ts",
] as const;
