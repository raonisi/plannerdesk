/**
 * Terms & privacy drafting plan copy (PR-142). Planning only — no legal finalization, no consent UI.
 */

export const PR142_SCOPE_NOTICE =
  "본 PR은 이용약관·개인정보처리방침 **준비 계획**입니다. 법적 확정, 동의 플로우, 개인정보 수집 폼, 회원가입 확대, 결제는 포함하지 않습니다.";

export const PR142_FORBIDDEN_DOC_CONTENT =
  "문서에 ‘최종 약관’, ‘확정 개인정보처리방침’, ‘법적 검토 완료’, 실제 수집 항목 확정, 고객 실명·연락처 예시를 넣지 않습니다.";

export const PR142_LEGAL_REVIEW_LABEL = "법무 검토 필요";
export const PR142_INFO_GAP_LABEL = "정보 부족";
export const PR142_DRAFT_ITEM_LABEL = "초안 항목";

export type PrepTreatment =
  | "draft_item"
  | "notice_item"
  | "legal_review"
  | "info_gap"
  | "deferred_pr";

export const PREP_TREATMENT_LABEL: Record<PrepTreatment, string> = {
  draft_item: "초안 항목",
  notice_item: "고지 항목",
  legal_review: "법무 검토 필요",
  info_gap: "정보 부족",
  deferred_pr: "별도 PR",
};

export const TERMS_PREP_ROWS: readonly {
  id: string;
  label: string;
  purpose: string;
  treatment: PrepTreatment;
}[] = [
  { id: "purpose", label: "서비스 목적", purpose: "기능 범위", treatment: "draft_item" },
  { id: "audience", label: "이용 대상", purpose: "설계사·제한 베타", treatment: "draft_item" },
  { id: "features", label: "제공 기능", purpose: "디렉터리·청구·지식·링크·검색", treatment: "draft_item" },
  { id: "restrictions", label: "이용 제한", purpose: "민감정보 입력 금지", treatment: "draft_item" },
  { id: "data-limits", label: "데이터 한계", purpose: "최신성·출처", treatment: "notice_item" },
  { id: "payout-limits", label: "보험금 판단 한계", purpose: "지급 확정 아님", treatment: "notice_item" },
  { id: "link-limits", label: "업무 링크 한계", purpose: "접근·변경 가능", treatment: "notice_item" },
  { id: "aa-limits", label: "Answer Assistant 한계", purpose: "보조·제한 베타", treatment: "notice_item" },
  { id: "admin-scope", label: "관리자 권한", purpose: "외부 비공개", treatment: "draft_item" },
  { id: "interruption", label: "서비스 중단", purpose: "베타 중단·점검", treatment: "notice_item" },
  { id: "paid-transition", label: "유료화 전환", purpose: "별도 고지·동의", treatment: "legal_review" },
  { id: "dispute", label: "분쟁/책임", purpose: "면책·관할", treatment: "legal_review" },
] as const;

export const PRIVACY_PREP_ROWS: readonly {
  id: string;
  label: string;
  purpose: string;
  treatment: PrepTreatment;
  note: string;
}[] = [
  {
    id: "collection",
    label: "수집 항목",
    purpose: "현재 수집 여부",
    treatment: "info_gap",
    note: "Auth·운영 로그 범위 — 법무·인프라 확인",
  },
  {
    id: "purpose-use",
    label: "수집 목적",
    purpose: "계정·접근·이슈",
    treatment: "legal_review",
    note: "PR-129·admin 운영",
  },
  {
    id: "retention",
    label: "보관 기간",
    purpose: "DB·로그",
    treatment: "legal_review",
    note: "AA audit retention — PR137",
  },
  {
    id: "third-party",
    label: "제3자 제공",
    purpose: "제공 여부",
    treatment: "info_gap",
    note: "현재 제공 없음 가정 — 확인 필요",
  },
  {
    id: "processor",
    label: "처리 위탁",
    purpose: "호스팅·인프라",
    treatment: "legal_review",
    note: "Railway·Neon 등 — 법무",
  },
  {
    id: "rights",
    label: "이용자 권리",
    purpose: "열람·삭제·정정",
    treatment: "legal_review",
    note: "",
  },
  {
    id: "no-customer-pii",
    label: "고객정보 입력 금지",
    purpose: "상담 대상 정보",
    treatment: "notice_item",
    note: "PR-133·PR-141",
  },
  {
    id: "no-sensitive",
    label: "민감정보 입력 금지",
    purpose: "병력·주민번호",
    treatment: "notice_item",
    note: "입력 유도 금지",
  },
  {
    id: "logs",
    label: "로그 기록",
    purpose: "metadata-only",
    treatment: "notice_item",
    note: "PR-137 usage audit",
  },
  {
    id: "security",
    label: "보안 조치",
    purpose: "RBAC·secret",
    treatment: "notice_item",
    note: "PR-139",
  },
  {
    id: "cookies",
    label: "쿠키/분석",
    purpose: "사용 여부",
    treatment: "info_gap",
    note: "별도 PR",
  },
  {
    id: "payment-data",
    label: "결제정보",
    purpose: "PR142 미수집",
    treatment: "deferred_pr",
    note: "PR145",
  },
] as const;

export const LIMITED_BETA_NOTICE_ROWS: readonly string[] = [
  "현재 PlannerDesk는 제한 베타 준비 단계입니다.",
  "검수 완료된 공개 정보 중심으로 제공됩니다.",
  "이용 대상은 운영자가 수동 승인한 소수 사용자입니다.",
  "관리자 기능·운영 리포트·변경 이력·Admin bulk는 제공하지 않습니다.",
  "보험금 지급 여부는 약관, 사고 내용, 보험사 심사에 따라 달라질 수 있습니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "링크와 청구 정보는 공식 출처 기준으로 지속 점검 중입니다.",
  "Answer Assistant는 별도 허용된 사용자에게만 제한적으로 제공됩니다.",
  "Critical 리스크 발생 시 이용을 중단할 수 있습니다.",
] as const;

export const NOTICE_FORBIDDEN_PHRASES: readonly string[] = [
  "정식 출시 완료",
  "법적 검토 완료",
  "개인정보처리방침 확정",
  "최종 약관",
  "보험금 지급 확정",
  "최신 정보 100% 보장",
  "고객정보를 입력하면 더 정확합니다",
  "전체 설계사 자동 가입 가능",
  "유료 서비스 시작",
] as const;

export const DATA_LIABILITY_ROWS: readonly {
  area: string;
  notice: string;
}[] = [
  {
    area: "보험사 정보",
    notice: "공식 출처·운영 점검 기준이며 변경 가능",
  },
  {
    area: "청구서류",
    notice: "보험사·사고별 요구 상이",
  },
  {
    area: "업무 링크",
    notice: "페이지 개편·전산 정책에 따라 달라질 수 있음",
  },
  {
    area: "지식 아카이브",
    notice: "상담 보조용·공식자료 확인 필요",
  },
  {
    area: "검색",
    notice: "검수 완료 공개 정보 중심",
  },
  {
    area: "즐겨찾기",
    notice: "PII 없이 공개 id만",
  },
  {
    area: "Answer Assistant",
    notice: "보조 초안·최종 판단 아님",
  },
  {
    area: "운영 이슈",
    notice: "오류 시 수정·보류·중단",
  },
] as const;

export const LEGAL_REVIEW_ITEMS: readonly {
  id: string;
  label: string;
  reason: string;
  followUp: string;
}[] = [
  {
    id: "tos-final",
    label: "최종 이용약관",
    reason: "법적 효력",
    followUp: "법무 초안 검토 PR",
  },
  {
    id: "privacy-final",
    label: "개인정보처리방침",
    reason: "수집·보관·위탁",
    followUp: "수집 항목 확정 후",
  },
  {
    id: "liability-cap",
    label: "책임 제한·면책",
    reason: "서비스 범위",
    followUp: "법무",
  },
  {
    id: "damages",
    label: "손해배상",
    reason: "분쟁",
    followUp: "확정 금지",
  },
  {
    id: "jurisdiction",
    label: "분쟁·관할",
    reason: "법적",
    followUp: "법무",
  },
  {
    id: "paid-terms",
    label: "유료화 약관",
    reason: "결제·해지",
    followUp: "PR145",
  },
  {
    id: "refund",
    label: "환불 정책",
    reason: "결제 전",
    followUp: "PR145",
  },
  {
    id: "marketing-consent",
    label: "마케팅 수신 동의",
    reason: "발송 시",
    followUp: "PR138-B",
  },
  {
    id: "processor-list",
    label: "제3자·위탁",
    reason: "인프라",
    followUp: "정보 부족 → 법무",
  },
  {
    id: "ai-policy",
    label: "AI 사용 고지",
    reason: "AA 책임",
    followUp: "PR148",
  },
] as const;

export const PR142_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR143", title: "Support & Incident", risk: "Medium~High", codex: "조건부" },
  { id: "PR144", title: "Public Landing Safety", risk: "High", codex: "조건부" },
  { id: "PR145", title: "Payment Feasibility", risk: "Critical", codex: "필수" },
  { id: "PR146", title: "Beta Access Flow", risk: "High", codex: "권장" },
  { id: "PR147", title: "Data Responsibility Notice", risk: "High", codex: "조건부" },
  { id: "PR148", title: "AI Limited Beta Policy", risk: "Critical", codex: "필수" },
  { id: "PR149", title: "Security Final Audit", risk: "Critical", codex: "필수" },
  { id: "PR150", title: "External Release Decision", risk: "Critical", codex: "필수" },
] as const;

export const PR142_B_IMPLEMENTATION_DEFERRED = [
  "약관·개인정보 **확정본** 배포",
  "동의 체크박스·전자서명 플로우",
  "개인정보 수집·저장 스키마 확장",
  "마케팅 수신 DB",
] as const;
