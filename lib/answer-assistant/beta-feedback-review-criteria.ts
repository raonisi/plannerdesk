// Beta feedback safety review decision criteria (PR-101). Documentation constants only.

export type BetaSafetyReviewRecommendation =
  | "maintain_beta"
  | "pause_beta"
  | "improve_before_continue"
  | "hold_expansion";

export const BETA_SAFETY_REVIEW_DECISION_CRITERIA = {
  maintain_beta: [
    "Output safety·rate limit·allowlist 차단 비율이 예상 범위",
    "HIGH severity·incident_candidate 비율이 낮음",
    "Prompt injection·privacy_risk 신호가 반복되지 않음",
    "운영자 수동 검토 backlog가 관리 가능",
  ],
  pause_beta: [
    "incident_candidate가 단기간에 다수 누적",
    "output_too_assertive·missing_disclaimer 신호 급증",
    "provider 오류·rate limit abuse가 동시에 증가",
    "allowlist 외 접근 시도와 함께 안전 신호 악화",
  ],
  improve_before_continue: [
    "blocking_felt_wrong·evidence_too_weak 피드백이 집중",
    "UI·고지 이해 부족(ui_understanding) 다수",
    "차단 정책 조정 필요하나 전체 공개는 아직 부적절",
  ],
  hold_expansion: [
    "전체 VERIFIED_PLANNER 공개는 금지 — allowlist 유지",
    "GENERAL_USER·public chatbot 확대 금지",
    "자동 allowlist 제거·자동 gate OFF 금지 — 운영자 수동 판단만",
  ],
} as const;

export const BETA_SAFETY_REVIEW_OPERATOR_RULES = [
  "피드백은 structured 분류만 저장 — 상담 원문·생성 초안·raw prompt/output 금지",
  "인시던트 후보는 adminStatus 수동 변경으로만 표시",
  "자동 제재·자동 allowlist 제거·자동 feature gate OFF 금지",
  "usage audit dashboard와 함께 집계·추세 확인",
  "beta 확대 결정은 별도 PR·운영 sign-off 필요",
] as const;
