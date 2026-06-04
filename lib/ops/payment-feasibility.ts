/**
 * Payment feasibility plan copy (PR-145). Review only — no PG, billing, or pricing finalization.
 */

export const PR145_SCOPE_NOTICE =
  "결제·환불·구독 **가능성 검토**입니다. PG 연동, 구독, 가격표, 환불 기능, 결제정보 수집, 유료 권한 자동 부여는 구현하지 않습니다.";

export const PR145_FORBIDDEN_DOC_CONTENT =
  "검토 문서에 카드번호·실제 가격·PG 계약·API key·webhook secret·고객 결제 원문을 넣지 않습니다.";

export type PaymentVerdict = "go" | "conditional_go" | "no_go" | "review_only";

export const PAYMENT_VERDICT_LABEL: Record<PaymentVerdict, string> = {
  go: "Go",
  conditional_go: "Conditional Go",
  no_go: "No-Go",
  review_only: "검토만 (실행 없음)",
};

/** PR145 covers through “유료화 검토” stage only. */
export const MONETIZATION_STAGE_ROWS: readonly {
  id: string;
  stage: string;
  meaning: string;
  allowed: string;
  forbidden: string;
}[] = [
  {
    id: "free-limited-beta",
    stage: "무료 제한 베타",
    meaning: "소수 수동 승인·무료 제공",
    allowed: "피드백·데이터·운영 안정성",
    forbidden: "결제·가격표·자동 가입",
  },
  {
    id: "feasibility-review",
    stage: "유료화 검토",
    meaning: "PR145 범위",
    allowed: "문서·체크리스트·리스크",
    forbidden: "실제 결제 구현",
  },
  {
    id: "paid-beta-prep",
    stage: "유료 베타 준비",
    meaning: "법무·결제·지원 준비",
    allowed: "별도 승인 PR",
    forbidden: "PR145 실행",
  },
  {
    id: "paid-beta",
    stage: "유료 베타",
    meaning: "제한 과금 테스트",
    allowed: "체계 완비 후",
    forbidden: "준비 없는 과금",
  },
  {
    id: "formal-paid",
    stage: "정식 유료화",
    meaning: "외부 유료 서비스",
    allowed: "전체 정책·보안·지원",
    forbidden: "미검증 기능 판매",
  },
] as const;

export const PR145_OVERALL_VERDICTS: Readonly<{
  feasibilityReview: PaymentVerdict;
  limitedPaidBeta: PaymentVerdict;
  formalMonetization: PaymentVerdict;
}> = {
  feasibilityReview: "review_only",
  limitedPaidBeta: "no_go",
  formalMonetization: "no_go",
};

export const PR145_OVERALL_CONDITIONS: readonly string[] = [
  "PR140~144 준비·랜딩·지원 기준 완료 (문서)",
  "PR142-B·PR145-C~H 법무·결제·보안 별도 PR 선행",
  "가격·환불·약관·개인정보 확정 없음 — 본 PR은 검토만",
] as const;

export const FEATURE_MONETIZATION_ROWS: readonly {
  id: string;
  feature: string;
  freeBeta: string;
  paidCandidate: string;
  precondition: string;
  risk: "low" | "medium" | "high" | "critical";
}[] = [
  {
    id: "directory",
    feature: "보험사 디렉터리",
    freeBeta: "가능",
    paidCandidate: "가능 후보",
    precondition: "최신성·공식 출처 고지",
    risk: "medium",
  },
  {
    id: "claim-docs",
    feature: "청구서류",
    freeBeta: "가능",
    paidCandidate: "가능 후보",
    precondition: "오류 대응·출처 확인",
    risk: "high",
  },
  {
    id: "knowledge",
    feature: "지식 아카이브",
    freeBeta: "가능",
    paidCandidate: "가능 후보",
    precondition: "검수·문구 안정성",
    risk: "medium",
  },
  {
    id: "work-links",
    feature: "업무 링크",
    freeBeta: "제한 가능",
    paidCandidate: "신중 검토",
    precondition: "링크 신뢰도·권한 고지",
    risk: "high",
  },
  {
    id: "search",
    feature: "고급 통합 검색",
    freeBeta: "가능",
    paidCandidate: "가능 후보",
    precondition: "public visibility",
    risk: "medium",
  },
  {
    id: "desk",
    feature: "통합 업무 대시보드",
    freeBeta: "가능",
    paidCandidate: "가능 후보",
    precondition: "역할별 정보 분리",
    risk: "medium",
  },
  {
    id: "favorites",
    feature: "즐겨찾기",
    freeBeta: "제한 가능",
    paidCandidate: "가능 후보",
    precondition: "PII 저장 차단",
    risk: "medium",
  },
  {
    id: "aa",
    feature: "Answer Assistant",
    freeBeta: "제한 베타",
    paidCandidate: "고위험 후보",
    precondition: "PR-148·allowlist·audit",
    risk: "critical",
  },
  {
    id: "admin",
    feature: "관리자·bulk·운영 리포트",
    freeBeta: "해당 없음",
    paidCandidate: "운영자 전용",
    precondition: "외부 유료 대상 아님",
    risk: "critical",
  },
] as const;

export const PG_REVIEW_ROWS: readonly {
  item: string;
  review: string;
  pr145: string;
}[] = [
  { item: "PG 후보", review: "토스·나이스·KG이니시스 등", pr145: "이름 나열·연동 금지" },
  { item: "결제수단", review: "카드·계좌·가상계좌", pr145: "검토 항목만" },
  { item: "정기결제", review: "갱신·실패·해지", pr145: "별도 Critical PR" },
  { item: "결제 실패", review: "안내·재시도", pr145: "문서화" },
  { item: "결제 취소", review: "취소 조건", pr145: "법무·PG" },
  { item: "환불", review: "기한·부분 환불", pr145: "법무·확정 금지" },
  { item: "영수증", review: "결제 증빙", pr145: "별도 PR" },
  { item: "세금계산서", review: "B2B 여부", pr145: "사업자 검토" },
  { item: "결제 웹훅", review: "상태 동기화", pr145: "구현 금지" },
  { item: "결제정보 보관", review: "카드 직접 저장 금지", pr145: "원칙 문서화" },
] as const;

export const REFUND_SUBSCRIPTION_ROWS: readonly {
  item: string;
  criteria: string;
  review: string;
}[] = [
  { item: "무료 체험", criteria: "기간·제한", review: "법무·운영" },
  { item: "월 구독", criteria: "갱신·해지·이용 기간", review: "법무" },
  { item: "연 구독", criteria: "할인·중도 해지 환불", review: "법무" },
  { item: "환불 조건", criteria: "사용 전/후·장애", review: "법무" },
  { item: "부분 환불", criteria: "월·연 중도", review: "법무" },
  { item: "결제 실패", criteria: "접근 제한·재시도", review: "운영" },
  { item: "해지", criteria: "즉시/기간 종료", review: "법무" },
  { item: "서비스 장애", criteria: "연장·환불", review: "법무·PR-143" },
  { item: "데이터 오류", criteria: "환불 사유 여부", review: "법무" },
  { item: "AI 오류", criteria: "책임·환불 범위", review: "법무·PR-148" },
] as const;

export const PAYMENT_PII_RISK_ROWS: readonly {
  field: string;
  risk: string;
  pr145Rule: string;
}[] = [
  { field: "이름·연락처·이메일", risk: "개인정보", pr145Rule: "수집 구조 추가 금지" },
  { field: "카드번호", risk: "결제 민감정보", pr145Rule: "직접 저장 금지" },
  { field: "결제 승인번호", risk: "결제정보", pr145Rule: "별도 정책" },
  { field: "사업자등록번호", risk: "사업자정보", pr145Rule: "별도 검토" },
  { field: "세금계산서 정보", risk: "세무·개인정보", pr145Rule: "별도 검토" },
  { field: "환불 계좌", risk: "금융정보", pr145Rule: "직접 수집 금지" },
  { field: "결제 로그", risk: "보안·개인정보", pr145Rule: "metadata 최소화" },
  { field: "webhook secret", risk: "보안정보", pr145Rule: "노출 금지" },
] as const;

export const LEGAL_REVIEW_ITEMS: readonly {
  id: string;
  topic: string;
  status: "deferred" | "info_gap";
  note: string;
}[] = [
  { id: "terms-paid", topic: "유료 약관", status: "deferred", note: "PR145-C" },
  { id: "privacy-payment", topic: "결제 포함 개인정보처리방침", status: "deferred", note: "PR142-B" },
  { id: "refund-policy", topic: "환불정책", status: "deferred", note: "법무 확정 금지" },
  { id: "ecommerce-notice", topic: "전자상거래 고지", status: "info_gap", note: "사업 형태 확인" },
  { id: "tax-receipt", topic: "세금·영수증", status: "deferred", note: "PR145-G" },
] as const;

export type PaymentCheckStatus = "met" | "partial" | "gap";

export const PAYMENT_READINESS_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: PaymentCheckStatus;
  note: string;
}[] = [
  { id: "no-billing-code", item: "결제 기능 없음", criterion: "PR145 미구현", status: "met", note: "static test" },
  { id: "no-pg", item: "PG 연동 없음", criterion: "API·webhook 없음", status: "met", note: "package unchanged" },
  { id: "no-price", item: "가격표 확정 없음", criterion: "사업 판단 후", status: "met", note: "후보만" },
  { id: "terms", item: "약관 준비", criterion: "PR142·법무", status: "partial", note: "확정 없음" },
  { id: "privacy", item: "개인정보", criterion: "결제 전 별도", status: "partial", note: "PR142-B" },
  { id: "refund", item: "환불 기준", criterion: "법무", status: "gap", note: "검토 항목만" },
  { id: "support", item: "고객지원", criterion: "PR143", status: "met", note: "운영 기준" },
  { id: "incident", item: "장애 대응", criterion: "PR143 rollback", status: "met", note: "—" },
  { id: "rbac", item: "유료 권한", criterion: "자동 부여 없음", status: "met", note: "—" },
  { id: "visibility", item: "public visibility", criterion: "미검수 미노출", status: "met", note: "guard" },
  { id: "aa", item: "Answer Assistant", criterion: "유료화 미연결", status: "met", note: "PR-148" },
  { id: "tax", item: "세금·정산", criterion: "사업자 검토", status: "gap", note: "정보 부족" },
  { id: "card-store", item: "결제정보 저장", criterion: "직접 저장 금지", status: "met", note: "원칙" },
  { id: "secrets", item: "보안정보", criterion: "secret 미노출", status: "met", note: "—" },
] as const;

export const PR145_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR145-B", title: "Payment Architecture Research", risk: "High", codex: "조건부" },
  { id: "PR145-C", title: "Billing Terms Draft Plan", risk: "Critical", codex: "필수" },
  { id: "PR145-D", title: "Subscription Data Model Plan", risk: "Critical", codex: "필수" },
  { id: "PR145-E", title: "Payment Security Review", risk: "Critical", codex: "필수" },
  { id: "PR145-F", title: "Paid Access Control Plan", risk: "Critical", codex: "필수" },
  { id: "PR145-G", title: "Tax & Receipt Plan", risk: "High", codex: "필요 가능" },
  { id: "PR145-H", title: "Refund Support Playbook", risk: "High", codex: "조건부" },
] as const;

export const PR145_DEFERRED_IMPLEMENTATION = [
  "PG 연동·결제 API",
  "구독·플랜 Prisma model",
  "가격표 UI",
  "결제 callback/webhook",
  "환불·영수증·세금계산서",
  "유료 권한 자동 해금",
] as const;

export const PR145_FORBIDDEN_PHRASES: readonly string[] = [
  "환불 보장",
  "유료 서비스 시작",
  "가격 확정",
  "결제 완료",
  "구독 자동 갱신 확정",
  "법무 검토 완료",
  "PG 연동 완료",
] as const;

export const PR145_LINKED_DOCS = [
  "PR-140-EXTERNAL-RELEASE-READINESS-OPS.md",
  "PR-140-B-PAYMENT-MONETIZATION-DESIGN.md",
  "PR-142-TERMS-PRIVACY-PLAN-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-144-PUBLIC-LANDING-SAFETY-OPS.md",
] as const;
