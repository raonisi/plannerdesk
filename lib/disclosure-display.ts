import type { DisclosureCategory, VerificationStatus } from "@/lib/content";

export const disclosureCategoryLabels: Record<DisclosureCategory, string> = {
  product_disclosure: "상품공시",
  policy_terms: "약관",
  insurance_association: "협회 자료",
  insurer_official_materials: "보험사 공식자료",
  claim_compensation_reference: "기타",
  education_practice_reference: "기타",
};

export const disclosureCategoryOrder: DisclosureCategory[] = [
  "product_disclosure",
  "policy_terms",
  "insurance_association",
  "insurer_official_materials",
  "claim_compensation_reference",
  "education_practice_reference",
];

/** PR 필터 탭: 기타 = 청구·교육 참고 분류 */
export const disclosureFilterTabs = [
  { id: "all", label: "전체" },
  { id: "product_disclosure", label: "상품공시" },
  { id: "policy_terms", label: "약관" },
  { id: "insurance_association", label: "협회 자료" },
  { id: "insurer_official_materials", label: "보험사 공식자료" },
  { id: "other", label: "기타" },
] as const;

export type DisclosureFilterTabId = (typeof disclosureFilterTabs)[number]["id"];

export function matchesDisclosureCategory(
  entryCategory: DisclosureCategory,
  filterId: DisclosureFilterTabId
): boolean {
  if (filterId === "all") return true;
  if (filterId === "other") {
    return (
      entryCategory === "claim_compensation_reference" ||
      entryCategory === "education_practice_reference"
    );
  }
  return entryCategory === filterId;
}

export function verificationMetaLabel(status: VerificationStatus): string {
  if (status === "verified") return "확인됨";
  if (status === "needs_review") return "재확인 권장";
  return "준비 중";
}

/** 카드·디렉토리 검색용 보험사명 추정 */
export function extractInsurerSearchTerm(title: string): string {
  const trimmed = title.trim();
  const match = trimmed.match(/^(.+?)\s+(상품공시|공식|약관|보험|실손|협회)/);
  if (match?.[1]) return match[1].trim();
  const first = trimmed.split(/\s+/)[0];
  return first || trimmed;
}
