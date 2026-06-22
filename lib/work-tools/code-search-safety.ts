/**
 * PR-BS-18 / PR-BS-19C: Disease / surgery / KCD code search safety gate.
 *
 * - Public on /work-tools when marked complete in registry; not site-wide public search.
 * - Not Answer Assistant retrieval, not payout/claim judgment.
 * - External BohumSchool archive proxy is an investigation aid — not an official source.
 */

import { isWorkToolIdPublicVisible } from "@/lib/work-tools/work-tools-registry";

export const CODE_SEARCH_HIGH_RISK_TYPES = [
  "diseaseCode",
  "surgeryCode",
  "diseaseSearch",
  "kcdCode",
  "surgeryClassification",
  "diseaseException",
] as const;

export type CodeSearchHighRiskType = (typeof CODE_SEARCH_HIGH_RISK_TYPES)[number];

/** Work Tools panel ids wired to code search APIs (registry-governed server_read). */
export const CODE_SEARCH_WORK_TOOLS_TOOL_IDS = [
  "disease-code",
  "surgery-code",
  "disease-search",
] as const;

export const CODE_SEARCH_API_ROUTE_PREFIXES = [
  "/api/work-tools/disease-codes",
  "/api/work-tools/surgery-codes",
  "/api/work-tools/diseases",
] as const;

/** Affirmative certainty phrases — scan code-search UI panels (PR-173-C / BS-18). */
export const CODE_SEARCH_FORBIDDEN_UI_PHRASES = [
  "청구 가능 표준 담보",
  "청구 가능합니다",
  "청구 가능 확정",
  "보험금을 받을 수 있습니다",
  "이 코드는 보장됩니다",
  "이 수술은 보장됩니다",
  "이 질병은 지급 대상입니다",
  "이 코드면 충분합니다",
  "이 서류만 내면 됩니다",
  "AI가 최종 판단합니다",
] as const;

/** Full policy list — includes phrases that may appear only in negated boundary copy elsewhere. */
export const CODE_SEARCH_FORBIDDEN_PHRASES = [
  ...CODE_SEARCH_FORBIDDEN_UI_PHRASES,
  "보험금 지급 가능",
] as const;

export const CODE_SEARCH_FORBIDDEN_INPUT_HINTS = [
  "진단서",
  "진단명 원문",
  "병력",
  "검사 결과",
  "수술기록지",
  "입퇴원확인서",
  "상담 원문",
  "고객명",
  "주민번호",
  "계약번호",
  "보험증권 번호",
] as const;

export const CODE_SEARCH_ALLOWED_NOTICES = [
  "참고용 정보입니다.",
  "보험금 지급 여부는 약관, 가입 내용, 진단 내용, 보험사 심사 기준에 따라 달라질 수 있습니다.",
  "청구 가능 여부는 보험사 공식 안내와 약관을 함께 확인해야 합니다.",
  "고객정보, 주민번호, 계약번호, 진단서, 상담 원문은 입력하지 마세요.",
] as const;

/** External archive used as planner-only proxy — not official KCD/약관 source (PR-BS-09 / BS-18). */
export const CODE_SEARCH_ARCHIVE_PROXY_HOST = "bohumschool-archive.onrender.com";

export const CODE_SEARCH_ARCHIVE_NOT_OFFICIAL_NOTICE =
  "BohumSchool 등 외부 archive API는 조사·참고 proxy일 뿐 공식 KCD·약관·보험사 심사 출처가 아닙니다. public 또는 확정 근거로 사용하지 마세요.";

export const CODE_SEARCH_OFFICIAL_SOURCE_TYPES = [
  { type: "kcd", label: "질병분류 코드", sources: "통계청 KCD, HIRA 등 공식 분류" },
  { type: "surgery", label: "수술분류 기준", sources: "보험사 약관·공시, 약관 수술분류표" },
  { type: "claim", label: "청구서류", sources: "보험사 공식 청구 안내" },
  { type: "disclosure", label: "공시·약관", sources: "생명·손해보험협회, 보험사 공시" },
] as const;

export const CODE_SEARCH_NON_OFFICIAL_SOURCE_EXAMPLES = [
  "블로그",
  "카페",
  "커뮤니티",
  "단톡방 캡처",
  "출처 없는 PDF",
  "외부 아카이브 요약표",
  "AI 답변 단독",
  "BohumSchool archive API",
] as const;

export function isCodeSearchHighRiskType(type: string): boolean {
  return (CODE_SEARCH_HIGH_RISK_TYPES as readonly string[]).includes(type);
}

/** True when all code-search Work Tools panels are complete and public (PR-BS-19C). */
export function isCodeSearchPublicAllowed(): boolean {
  return CODE_SEARCH_WORK_TOOLS_TOOL_IDS.every((id) => isWorkToolIdPublicVisible(id));
}

export function isCodeSearchWorkToolsToolId(toolId: string): boolean {
  return (CODE_SEARCH_WORK_TOOLS_TOOL_IDS as readonly string[]).includes(toolId);
}

export function containsForbiddenCodeSearchPhrase(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return CODE_SEARCH_FORBIDDEN_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function containsForbiddenCodeSearchInputHint(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return CODE_SEARCH_FORBIDDEN_INPUT_HINTS.some((hint) => normalized.includes(hint));
}

export function routeUsesArchiveProxy(source: string): boolean {
  return source.includes(CODE_SEARCH_ARCHIVE_PROXY_HOST);
}
