/**
 * Work-tools claim / payout boundary copy (PR-173-C). Reference-only — no payout guarantees.
 */

export const WORK_TOOLS_CLAIM_BOUNDARY_NOTICE =
  "이 계산은 설계사 내부 참고용 자기부담금 시뮬레이션입니다. 실제 보험금 지급 여부·지급 금액은 약관, 사고 내용, 제출 서류, 보험사 심사에 따라 달라지며 PlannerDesk가 확정하지 않습니다. 고객 안내 전 보험사 공식 안내를 확인하세요.";

export const SILBI_CALC_TITLE = "실손 자기부담금 참고 분석";

export const SILBI_CALC_DESCRIPTION =
  "세대별(1~5세대) 실손의료보험 자기부담금 비율을 영수증 금액 기준으로 참고 계산합니다.";

export const SILBI_REFERENCE_BALANCE_LABEL = "공제 규칙 기준 참고 차액";

export const SILBI_RESULT_SECTION_TITLE = "자기부담금 참고 분석";

export const SILBI_GEN_TIPS: Record<"1" | "2" | "3" | "4" | "5", string> = {
  "5":
    "5세대는 비중증·비중증 비급여 자기부담 구분이 있습니다. 세대별 차이는 약관·공시 자료로 확인하고, 고객 안내 전 보험사 공식 기준을 재확인하세요.",
  "4":
    "4세대는 급여·비급여 차등 자기부담이 적용됩니다. 실제 부담액은 청구 내용·약관·심사에 따라 달라질 수 있습니다.",
  "3":
    "3세대(착한실손)는 비급여 항목 구분이 있습니다. 세대 변경 여부는 개별 계약·약관 기준으로 판단하며, 단정적 안내는 피하세요.",
  "2":
    "2세대는 급여·비급여 합산 자기부담 규칙이 적용됩니다. 갱신 보험료·약관 변경 가능성은 공식 자료로 확인하세요.",
  "1":
    "1세대(구실손)는 세대별 규칙이 다릅니다. 보험료·보장 범위는 상품·약관·공시 기준으로 확인하고, 특정 상품 전환을 권유하지 마세요.",
};

/** Phrases that must not appear in work-tools client copy (public beta boundary). */
export const WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES: readonly string[] = [
  "예상 보험금",
  "환급 예상",
  "예상 환급",
  "최종 보험금",
  "지급됩니다",
  "받을 수 있습니다",
  "무조건 지급",
  "가입을 권유",
  "전환을 제시",
];
