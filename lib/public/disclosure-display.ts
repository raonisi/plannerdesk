import {
  DisclosureLinkCategory,
  DisclosureLinkTargetType,
} from "@prisma/client";

export const publicDisclosureCategoryLabels: Record<
  DisclosureLinkCategory,
  string
> = {
  [DisclosureLinkCategory.product_disclosure]: "상품공시",
  [DisclosureLinkCategory.policy_terms]: "약관",
  [DisclosureLinkCategory.claim_disclosure]: "청구 공시",
  [DisclosureLinkCategory.insurer_notice]: "보험사 안내",
  [DisclosureLinkCategory.insurer_official_materials]: "보험사 공식자료",
  [DisclosureLinkCategory.insurance_association]: "협회 자료",
  [DisclosureLinkCategory.regulator]: "감독기관",
  [DisclosureLinkCategory.claim_compensation_reference]: "청구·보상 참고",
  [DisclosureLinkCategory.education_practice_reference]: "교육·실무 참고",
  [DisclosureLinkCategory.customer_guide]: "고객 안내",
  [DisclosureLinkCategory.other]: "기타",
};

export const publicDisclosureCategoryOrder: DisclosureLinkCategory[] = [
  DisclosureLinkCategory.product_disclosure,
  DisclosureLinkCategory.policy_terms,
  DisclosureLinkCategory.claim_disclosure,
  DisclosureLinkCategory.insurer_notice,
  DisclosureLinkCategory.insurer_official_materials,
  DisclosureLinkCategory.insurance_association,
  DisclosureLinkCategory.regulator,
  DisclosureLinkCategory.claim_compensation_reference,
  DisclosureLinkCategory.education_practice_reference,
  DisclosureLinkCategory.customer_guide,
  DisclosureLinkCategory.other,
];

export const publicDisclosureFilterTabs = [
  { id: "all", label: "전체" },
  { id: "product_disclosure", label: "상품공시" },
  { id: "policy_terms", label: "약관" },
  { id: "insurance_association", label: "협회 자료" },
  { id: "insurer_official_materials", label: "보험사 공식자료" },
  { id: "regulator", label: "감독기관" },
  { id: "other", label: "기타" },
] as const;

export type PublicDisclosureFilterTabId =
  (typeof publicDisclosureFilterTabs)[number]["id"];

export const publicTargetTypeLabels: Record<DisclosureLinkTargetType, string> =
  {
    [DisclosureLinkTargetType.insurer]: "보험사",
    [DisclosureLinkTargetType.regulator]: "감독기관",
    [DisclosureLinkTargetType.association]: "협회",
    [DisclosureLinkTargetType.internal]: "내부",
    [DisclosureLinkTargetType.other]: "공통",
  };

export type PublicTargetTypeFilter = "all" | DisclosureLinkTargetType;

export type PublicOfficialFilter = "all" | "official" | "general";

export function matchesPublicDisclosureCategory(
  category: DisclosureLinkCategory,
  filterId: PublicDisclosureFilterTabId,
): boolean {
  if (filterId === "all") return true;
  if (filterId === "other") {
    return (
      category === DisclosureLinkCategory.claim_compensation_reference ||
      category === DisclosureLinkCategory.education_practice_reference ||
      category === DisclosureLinkCategory.customer_guide ||
      category === DisclosureLinkCategory.claim_disclosure ||
      category === DisclosureLinkCategory.insurer_notice ||
      category === DisclosureLinkCategory.other
    );
  }
  return category === filterId;
}

export function matchesPublicTargetType(
  targetType: DisclosureLinkTargetType,
  filter: PublicTargetTypeFilter,
): boolean {
  if (filter === "all") return true;
  return targetType === filter;
}

export function matchesPublicOfficialFilter(
  isOfficialSource: boolean,
  filter: PublicOfficialFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "official") return isOfficialSource;
  return !isOfficialSource;
}

/** Directory / correction search term when insurer relation is missing. */
export function extractInsurerSearchTerm(
  title: string,
  insurerName: string | null,
): string {
  if (insurerName?.trim()) return insurerName.trim();
  const trimmed = title.trim();
  const match = trimmed.match(/^(.+?)\s+(상품공시|공식|약관|보험|실손|협회)/);
  if (match?.[1]) return match[1].trim();
  const first = trimmed.split(/\s+/)[0];
  return first || trimmed;
}
