/** PR-131 — public work hub copy (no admin or draft counts). */

export {
  PUBLIC_LANDING_LIMITED_BETA_NOTICE,
  PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE,
} from "@/lib/ops/public-landing-safety";

export const PUBLIC_WORK_HUB_VISIBILITY_NOTICE =
  "검수·공개 기준을 통과한 항목만 이 화면에 표시됩니다. 미검수·비공개 데이터는 공개 화면에 노출되지 않습니다.";

export const PUBLIC_WORK_HUB_SEARCH_HINT =
  "보험사를 먼저 검색해 보세요. 청구서류·지식·고객 문구도 같은 검색창에서 찾을 수 있습니다.";

export const PUBLIC_WORK_HUB_EMPTY_SEARCH =
  "검색어를 입력해 필요한 정보를 찾아보세요.";

export const PUBLIC_WORK_HUB_NO_RESULTS =
  "검색 결과가 없습니다. 다른 키워드로 검색하거나 통합 검색 페이지를 이용해 보세요.";

export const PUBLIC_WORK_HUB_LOAD_ERROR =
  "정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";

export const PLANNER_ANSWER_ASSISTANT_HUB_NOTE =
  "답변 보조(베타)는 검증 설계사·허용 목록에 한해 이용할 수 있습니다. 접근 범위는 자동으로 확대되지 않습니다.";

export const ADMIN_REVIEW_QUEUE_INTRO =
  "검수 대기·확인 필요 항목은 관리자 권한에서만 집계합니다. 공개 화면에는 노출되지 않습니다.";

export const ADMIN_OPS_ISSUES_NOTE =
  "운영 이슈는 심각도(Critical·High·Medium·Low) 기준으로 사내 레지스트리에서 관리합니다. 공개 대시보드에는 요약을 표시하지 않습니다.";

export const WORK_HUB_LINKS = [
  { label: "보험사 디렉터리", href: "/directory", description: "전산·연락처·청구 안내" },
  { label: "청구서류", href: "/claim-documents", description: "보험사별 필요서류" },
  { label: "지식 아카이브", href: "/knowledge", description: "상담·청구·계약 실무 기준" },
  { label: "통합 검색", href: "/search", description: "도메인별 통합 탐색" },
  { label: "공시·약관", href: "/disclosure-links", description: "공식 공시·약관 링크" },
] as const;

export const CLAIM_WORK_FLOW_LINKS = [
  { label: "청구서류 목록", href: "/claim-documents" },
  { label: "보험사별 청구 안내", href: "/directory" },
  { label: "고객 안내 문구", href: "/message-templates" },
] as const;
