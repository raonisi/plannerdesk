import type { PublicInsurer } from "@/lib/public/insurers";

/** Single global notice on /directory — no per-card status repetition (PR-BS-31). */
export const DIRECTORY_PUBLIC_GLOBAL_NOTICE =
  "보험사 링크와 연락처는 변경될 수 있습니다. 고객 안내 전 공식 홈페이지와 안내 페이지를 함께 확인하세요. 개인정보와 의료자료는 입력하지 마세요.";

export const DIRECTORY_PUBLIC_FORBIDDEN_CARD_PHRASES = [
  "확인일 정보 부족",
  "최신성 확인 필요",
  "공식 출처 확인 필요",
  "공식 확인 후 업데이트 예정",
  "공식 출처 확인 최신성 확인 필요",
  "검수 완료 업무 링크",
  "예시 보험사",
  "mock 공개",
  "BohumSchool",
  "보험학교",
  "archive.pages.dev",
] as const;

export function getInsurerDirectoryCategoryLabel(
  insurer: PublicInsurer,
): string {
  if (
    insurer.id.endsWith("-mutual") ||
    insurer.name.includes("공제") ||
    insurer.name.includes("우체국")
  ) {
    return "공제보험";
  }
  if (
    insurer.id.endsWith("-digital") ||
    insurer.name.includes("디지털") ||
    insurer.name.includes("캐롯")
  ) {
    return "디지털손보";
  }
  return insurer.category === "life" ? "생명보험" : "손해보험";
}
