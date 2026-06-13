import type { PublicInsurer } from "@/lib/public/insurers";
import { CATEGORY_LABELS } from "./formatting";

export const DIRECTORY_WORKBENCH_GLOBAL_NOTICE =
  "보험사 링크와 연락처는 변경될 수 있습니다. 고객 안내 전 공식 출처를 함께 확인하세요. 개인정보와 의료자료는 입력하지 마세요.";

export const DIRECTORY_CORRECTION_SECTION_TITLE = "정보 수정 요청";

export function getInsurerWorkbenchCategoryLabel(insurer: PublicInsurer): string {
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
  return CATEGORY_LABELS[insurer.category];
}

export function getCompactInsurerStatusLabel(insurer: PublicInsurer): string {
  if (insurer.verificationStatus === "needs_review") {
    return "공식 확인 필요";
  }
  if (insurer.verificationStatus === "verified") {
    return insurer.lastVerifiedAt ? "공식 링크 확인됨" : "확인일 정보 부족";
  }
  return "확인일 정보 부족";
}
