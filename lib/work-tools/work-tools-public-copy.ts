/**
 * PR-BS-19C: Public Work Tools notice copy (reference-only, no certainty claims).
 */

export const WORK_TOOLS_PUBLIC_OPEN_SUMMARY =
  "업무도구는 로그인 없이 사용할 수 있는 공개 참고 도구입니다.";

export const WORK_TOOLS_PUBLIC_COMPLETION_NOTICE =
  "현재 화면에는 개발이 완료된 기능만 표시됩니다.";

export const WORK_TOOLS_PUBLIC_ADMIN_NOTICE =
  "관리자 기능은 로그인 후 Admin 화면에서만 사용할 수 있습니다.";

export const WORK_TOOLS_PUBLIC_PII_NOTICE =
  "고객정보, 주민번호, 계약번호, 진단서, 상담 원문은 입력하지 마세요.";

export const WORK_TOOLS_PUBLIC_REFERENCE_NOTICE =
  "결과는 참고용이며, 최종 판단은 약관·공식 출처·보험사 기준을 함께 확인해야 합니다.";

export const WORK_TOOLS_PUBLIC_FRESHNESS_NOTICE =
  "표시된 도구는 공개 가능한 완료 기능만 노출됩니다. 준비 중·검수 필요 도구는 공개 화면에 나타나지 않습니다.";

export const WORK_TOOLS_PUBLIC_FORBIDDEN_PHRASES = [
  "로그인하면 모든 도구를 사용할 수 있습니다",
  "관리자 기능도 업무도구에서 사용할 수 있습니다",
  "청구 가능합니다",
  "보험금 지급 가능합니다",
  "보장됩니다",
  "카드납 가능합니다",
  "AI가 최종 판단합니다",
] as const;

export const WORK_TOOLS_PUBLIC_HOME_CARD_DESCRIPTION =
  "보험나이, 상병코드, 공식 링크 등 로그인 없이 쓸 수 있는 참고 도구입니다.";
