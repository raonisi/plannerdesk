export type ToolKind =
  | "stats"
  | "search"
  | "calculator"
  | "external"
  | "newsletter"
  | "folder"
  | "internal"
  | "accordion";

export type ToolTypeLabel = "내부 도구" | "외부 공식 링크" | "공식 자료" | "문구 도구" | "실무 연결";

export function getToolTypeLabel(kind: ToolKind): ToolTypeLabel {
  if (kind === "external") return "외부 공식 링크";
  if (kind === "folder" || kind === "newsletter" || kind === "accordion") return "공식 자료";
  if (kind === "internal") return "실무 연결";
  return "내부 도구";
}

export function getToolActionLabel(
  kind: ToolKind,
  source?: string
): string {
  if (kind === "external") {
    const officialOrg =
      source &&
      /협회|정부|공단|심사평가원|법원|국세청|보험개발원|내보험찾아줌/i.test(
        source
      );
    return officialOrg ? "공식 사이트 열기" : "공식 링크 열기";
  }
  if (kind === "folder") return "자료 열기";
  if (kind === "accordion") return "월별 자료 보기";
  if (kind === "internal") return "업무로 이동";
  return "실행하기";
}

export const WORK_TOOL_CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "favorites", label: "자주 쓰는 도구" },
  { id: "insure-calc", label: "보험 계산" },
  { id: "finance-calc", label: "금융 계산" },
  { id: "claim-silbi", label: "청구·실손" },
  { id: "search", label: "인수·질병" },
  { id: "car-fire", label: "자동차·화재" },
  { id: "docs", label: "공문서" },
  { id: "assoc-edu", label: "협회·교육" },
  { id: "exam-mock", label: "시험·모의고사" },
  { id: "newsletter", label: "소식지" },
] as const;

export type WorkToolCategoryId = (typeof WORK_TOOL_CATEGORIES)[number]["id"];

const CATEGORY_GROUP: Record<string, readonly string[]> = {
  "insure-calc": ["insure-calc"],
  "finance-calc": ["finance-calc"],
  "claim-silbi": ["claim", "silbi"],
  search: ["search"],
  "car-fire": ["car", "fire"],
  docs: ["docs"],
  "assoc-edu": ["stats", "recruits"],
  "exam-mock": ["exam"],
  "newsletter": ["news"],
};

export function matchesWorkToolCategory(
  toolCategoryId: string,
  selectedCategory: string,
  toolId: string,
  favoriteIds: readonly string[]
): boolean {
  if (selectedCategory === "all") return true;
  if (selectedCategory === "favorites") return favoriteIds.includes(toolId);
  const group = CATEGORY_GROUP[selectedCategory];
  if (!group) return toolCategoryId === selectedCategory;
  return group.includes(toolCategoryId);
}

const CATEGORY_LABEL_BY_TOOL_CAT: Record<string, string> = {
  stats: "협회·교육",
  search: "인수·질병",
  "insure-calc": "보험 계산",
  "finance-calc": "금융 계산",
  claim: "청구·실손",
  silbi: "청구·실손",
  car: "자동차·화재",
  fire: "자동차·화재",
  docs: "공문서",
  recruits: "협회·교육",
  exam: "시험·모의고사",
  news: "소식지",
};

export function getCategoryLabelForTool(toolCategoryId: string): string {
  return CATEGORY_LABEL_BY_TOOL_CAT[toolCategoryId] ?? "업무 도구";
}
