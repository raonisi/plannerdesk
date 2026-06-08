/**
 * Public UX polish ops standards (PR-163). UI polish only — no guard/DB/auth changes.
 */

import {
  PR154_OPEN_CRITICAL_COUNT,
  PR154_SMOKE_VERDICTS,
} from "@/lib/ops/public-smoke-expansion";
import {
  PR161_FRESHNESS_VERDICTS,
  PR161_OPEN_CRITICAL_COUNT,
  PR161_OPEN_HIGH_COUNT,
} from "@/lib/ops/data-freshness-review";
import {
  PR162_INBOX_VERDICTS,
  PR162_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/user-support-inbox-plan";

export const PR163_SCOPE_NOTICE =
  "제한 베타 **public·planner 화면 사용성** 개선입니다. 권한·public visibility·Answer Assistant·DB·schema·allowlist·결제·발송은 변경하지 않습니다.";

export const PR163_FORBIDDEN_DOC_CONTENT =
  "UX 문구에 지급 확정·가입 유도·권한 우회·고객정보 입력 유도·secret·allowlist 실값을 넣지 않습니다.";

export type UxPolishStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const UX_POLISH_STATUS_LABEL: Record<UxPolishStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR163_OPEN_CRITICAL_COUNT = PR161_OPEN_CRITICAL_COUNT;

export const PR163_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr162",
    condition: "PR162 User Support Inbox Plan",
    result: PR162_INBOX_VERDICTS.inboxPlanPrepared,
    met: PR162_INBOX_VERDICTS.inboxPlanPrepared !== "not_ready",
  },
  {
    id: "pr161",
    condition: "PR161 Data Freshness Review",
    result: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared,
    met: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared !== "not_ready",
  },
  {
    id: "pr154",
    condition: "PR154 public smoke 기준 유지",
    result: PR154_SMOKE_VERDICTS.smokeExpansionReady,
    met: PR154_SMOKE_VERDICTS.staticSmokePass,
  },
  {
    id: "crit",
    condition: "public visibility Critical(정적) 0",
    result: String(PR163_OPEN_CRITICAL_COUNT),
    met: PR163_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "guard",
    condition: "권한·DB·AA 확대 없이 UX만",
    result: "가능",
    met: true,
  },
] as const;

export const UX_POLISH_PRINCIPLES: readonly {
  principle: string;
  rule: string;
}[] = [
  { principle: "실무 도구성", rule: "광고형 문구보다 업무 효율 중심" },
  { principle: "신뢰감", rule: "책임 고지·공식 확인 안내 유지" },
  { principle: "단순성", rule: "카드·버튼·문구를 짧고 명확하게" },
  { principle: "모바일 우선", rule: "작은 화면 터치·가독성 확보" },
  { principle: "공개 정보 제한", rule: "공개·검수 정보만 노출" },
  { principle: "개인정보 보호", rule: "고객정보 입력 금지 안내 유지" },
  { principle: "과장 금지", rule: "지급·가입·해지 단정 금지" },
  { principle: "권한 유지", rule: "admin/planner/AI 접근 제한 유지" },
  { principle: "기능 확대 금지", rule: "UX만 개선" },
  { principle: "테스트 유지", rule: "lint/typecheck/test 통과" },
] as const;

export const SCREEN_UX_CRITERIA: readonly {
  screen: string;
  direction: string;
  forbidden: string;
}[] = [
  { screen: "Landing", direction: "제한 베타·공개 정보 기준 설명", forbidden: "정식 출시·유료화 오해" },
  { screen: "보험사 디렉터리", direction: "검색·카드·청구 진입 개선", forbidden: "미검수 데이터 노출" },
  { screen: "청구서류", direction: "보험사별 그룹·책임 고지", forbidden: "지급 확정 표현" },
  { screen: "업무 링크", direction: "공식·권한 필요 링크 구분", forbidden: "내부 링크 무분별 노출" },
  { screen: "지식 아카이브", direction: "상담 보조·검수 안내", forbidden: "가입 유도·공포 조장" },
  { screen: "public 검색", direction: "공개·검수 정보만 검색 안내", forbidden: "관리자 데이터 노출" },
  { screen: "오류 제보", direction: "PII 제외 제보 안내", forbidden: "고객정보 입력 유도" },
  { screen: "접근 차단", direction: "권한 필요 안내", forbidden: "권한 우회 힌트" },
  { screen: "빈 상태", direction: "다음 행동 제안", forbidden: "과장·판매성 문구" },
  { screen: "오류 상태", direction: "일반 오류 안내", forbidden: "stack trace·내부 경로" },
] as const;

export const CLAIM_UX_CRITERIA: readonly {
  item: string;
  criterion: string;
}[] = [
  { item: "보험사별 묶음", criterion: "카드 확장으로 목록 확인" },
  { item: "서류 유형", criterion: "공통·사고 유형·추가 확인 구분" },
  { item: "책임 고지", criterion: "지급 확정 아님 고지 유지" },
  { item: "공식 확인", criterion: "제출 전 보험사 공식 안내 확인" },
  { item: "모바일", criterion: "카드 간격·버튼·줄바꿈" },
  { item: "문구", criterion: "짧고 명확, 단정 금지" },
  { item: "빈 상태", criterion: "공개 청구서류 없음 안내" },
] as const;

export const ACCESS_DENIED_UX: readonly {
  scenario: string;
  guidance: string;
  forbidden: string;
}[] = [
  { scenario: "public → admin", guidance: "관리자 권한 필요", forbidden: "admin 구조 노출" },
  { scenario: "public → planner", guidance: "로그인·권한 필요", forbidden: "우회 힌트" },
  { scenario: "planner → admin", guidance: "관리자 전용", forbidden: "내부 메뉴" },
  { scenario: "public → Answer Assistant", guidance: "제한 베타 기능", forbidden: "AI 사용 유도" },
  { scenario: "allowlist 없음 → AA", guidance: "제한 베타 기준", forbidden: "allowlist 우회" },
] as const;

export type UxPolishChecklistStatus = "met" | "partial" | "pending";

export const UX_POLISH_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: UxPolishChecklistStatus;
}[] = [
  { id: "principle", item: "UX 원칙", criterion: "실무·신뢰·모바일", status: "met" },
  { id: "claim", item: "청구서류 UX", criterion: "그룹·고지 유지", status: "met" },
  { id: "report", item: "오류 제보 안내", criterion: "PII 금지", status: "met" },
  { id: "access", item: "접근 차단 UX", criterion: "우회 힌트 없음", status: "met" },
  { id: "search", item: "검색 빈 상태", criterion: "공개 정보 안내", status: "met" },
  { id: "mobile", item: "모바일 가독성", criterion: "break-keep·min-h", status: "met" },
  { id: "guard", item: "visibility guard", criterion: "변경 없음", status: "met" },
  { id: "auth", item: "Auth/RBAC", criterion: "변경 없음", status: "met" },
  { id: "aa", item: "AA 접근", criterion: "확대 없음", status: "met" },
  { id: "nodb", item: "DB/schema", criterion: "변경 없음", status: "met" },
  { id: "nopkg", item: "package/lock", criterion: "변경 없음", status: "met" },
] as const;

export const PR163_UX_VERDICTS = {
  uxPolishPrepared: "conditional" as UxPolishStatus,
  mobileReadability: "conditional" as UxPolishStatus,
  disclaimerSafety: "ready" as UxPolishStatus,
  guardIntegrity: "ready" as UxPolishStatus,
} as const;

export const PR163_OPEN_HIGH_COUNT = PR161_OPEN_HIGH_COUNT;

export const PR163_TOUCHED_ROUTES = [
  "app/home-client.tsx",
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/knowledge/page.tsx",
  "app/search/page.tsx (constants)",
  "app/planner/answer-assistant/page.tsx",
  "components/footer.tsx",
  "components/content/public-error-report-notice.tsx",
  "components/content/access-restricted-panel.tsx",
  "components/content/explorer-loading-panel.tsx",
  "lib/public/public-ux-copy.ts",
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "public visibility guard 영향",
  "admin/planner/AA 접근 제한 유지",
  "청구서류 책임 고지 유지",
  "지급 확정 표현 부재",
  "PII 입력 유도 부재",
  "DB/schema/package 변경 부재",
  "PR164 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "디자인 취향",
  "버튼 색상",
  "여백 취향",
  "Low 오탈자",
] as const;

export const PR164_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
  { id: "PR168", title: "Data Correction Workflow", purpose: "수정 workflow", risk: "High", codex: "조건부" },
] as const;

export const PR163_LINKED_HUBS = [
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-161-DATA-FRESHNESS-REVIEW-OPS.md",
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
] as const;

export const PR163_TEST_FILES = [
  "tests/ops/pr163-public-ux-polish.test.ts",
  "tests/ops/pr127-search-ux.test.ts",
  "tests/ops/pr162-user-support-inbox-plan.test.ts",
] as const;

export const PR154_SMOKE_BASELINE = PR154_OPEN_CRITICAL_COUNT;
export const PR162_INBOX_BASELINE = PR162_INBOX_VERDICTS.inboxPlanPrepared;
