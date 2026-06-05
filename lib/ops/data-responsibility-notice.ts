/**
 * Data responsibility notice copy (PR-147). Notice standards only — no data bulk edit or crawlers.
 */

import { BETA_USER_FORBIDDEN_PHRASES } from "@/lib/ops/limited-beta-readiness";

export const PR147_SCOPE_NOTICE =
  "데이터 최신성·공식 출처·책임 범위 고지입니다. 데이터 대량 수정, 자동 출처 검증, 크롤러, 외부 API, 신규 DB table은 포함하지 않습니다.";

export const PR147_FORBIDDEN_DOC_CONTENT =
  "문서에 법적 책임 확정 문구·실제 고객정보·API key·크롤 결과 원문을 넣지 않습니다.";

export type DataDomainRisk = "medium" | "high" | "critical";

export const DATA_RESPONSIBILITY_TARGETS: readonly {
  id: string;
  domain: string;
  purpose: string;
  risk: DataDomainRisk;
}[] = [
  { id: "directory", domain: "보험사 디렉터리", purpose: "링크·업무 정보 변경 가능성", risk: "medium" },
  { id: "claim", domain: "청구서류", purpose: "필요 서류·정책 변경, 지급 비확정", risk: "high" },
  { id: "links", domain: "업무 링크", purpose: "접근 제한·링크 만료", risk: "high" },
  { id: "knowledge", domain: "지식 아카이브", purpose: "상담 보조·최종 판단 아님", risk: "high" },
  { id: "search", domain: "통합 검색", purpose: "검수 완료 공개 정보 중심", risk: "high" },
  { id: "favorites", domain: "즐겨찾기", purpose: "편의 기능·원본 정보 기준", risk: "medium" },
  { id: "aa", domain: "Answer Assistant", purpose: "보조·판단 비확정", risk: "critical" },
  { id: "landing", domain: "public landing", purpose: "제한 베타·출처 확인", risk: "high" },
  { id: "support", domain: "오류 제보", purpose: "PR-143 연계", risk: "medium" },
  { id: "admin-data", domain: "관리자 데이터", purpose: "public 미노출", risk: "critical" },
] as const;

export const DIRECTORY_RESPONSIBILITY_ROWS: readonly { item: string; notice: string }[] = [
  { item: "보험사명", notice: "표기 오류 가능 — 제보 환영" },
  { item: "전산 링크", notice: "로그인·권한·보험사 정책에 따라 제한" },
  { item: "청구 안내 링크", notice: "공식 페이지 변경 가능" },
  { item: "연락처·업무 정보", notice: "공식 출처 확인 필요" },
  { item: "최신성", notice: "지속 점검하되 실시간 보장 아님" },
] as const;

export const CLAIM_RESPONSIBILITY_ROWS: readonly { item: string; notice: string }[] = [
  { item: "필요 서류", notice: "보험사·상품·사고·보장에 따라 상이" },
  { item: "진단/입원/수술 구분", notice: "추가 서류 가능" },
  { item: "보험금 지급", notice: "확정 아님" },
  { item: "공식 확인", notice: "제출 전 보험사 공식 안내 필수" },
  { item: "최신성", notice: "보험사 기준 변경 가능" },
] as const;

export const WORK_LINK_RESPONSIBILITY_ROWS: readonly { item: string; notice: string }[] = [
  { item: "접근", notice: "권한·로그인·보험사 정책 제한" },
  { item: "유효성", notice: "개편·만료 가능" },
  { item: "외부 사이트", notice: "해당 사이트 정책 적용" },
  { item: "최신성", notice: "정기 점검·실시간 보장 아님" },
] as const;

export const KNOWLEDGE_RESPONSIBILITY_ROWS: readonly { item: string; notice: string }[] = [
  { item: "목적", notice: "실무 참고·상담 준비 보조" },
  { item: "최종 판단", notice: "약관·공시·보험사 기준 확인" },
  { item: "보험금", notice: "지급 확정 아님" },
  { item: "가입/해지", notice: "개별 상황·단정 금지" },
  { item: "문구", notice: "과장·공포·가입 유도 금지" },
] as const;

export const AA_RESPONSIBILITY_ROWS: readonly { item: string; notice: string }[] = [
  { item: "범위", notice: "verified planner + allowlist" },
  { item: "목적", notice: "상담 준비·기준 정리 보조" },
  { item: "최종 판단", notice: "공식자료·심사·전문가 필요" },
  { item: "보험금·가입/해지", notice: "확정·유도 금지" },
  { item: "PII", notice: "고객정보·병력 입력 금지" },
  { item: "audit", notice: "metadata-only" },
] as const;

export const COMMON_NOTICE_GOOD: readonly string[] = [
  "PlannerDesk의 정보는 설계사 업무를 돕기 위한 참고 자료입니다.",
  "청구서류와 업무 링크는 보험사 정책, 상품, 사고 내용, 공식 페이지 변경에 따라 달라질 수 있습니다.",
  "최종 제출 전에는 반드시 보험사 공식 안내와 약관, 공시자료를 확인해 주세요.",
  "보험금 지급 여부는 약관, 사고 내용, 제출 서류, 보험사 심사 기준에 따라 달라질 수 있으며 본 서비스에서 확정하지 않습니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "잘못된 정보나 만료된 링크를 발견하면 운영 이슈로 제보해 주세요.",
  "Answer Assistant는 제한된 사용자에게 제공되는 상담 보조 기능이며, 최종 판단을 대신하지 않습니다.",
] as const;

export const NOTICE_FORBIDDEN_PHRASES: readonly string[] = [
  ...BETA_USER_FORBIDDEN_PHRASES,
  "모든 정보는 100% 최신",
  "이 서류만 내면 됩니다",
  "AI가 최종 판단",
  "공식 확인 없이 바로 사용",
] as const;

export type PublicNoticePlacement =
  | "landing"
  | "directory"
  | "claim"
  | "work_links"
  | "knowledge"
  | "search"
  | "answer_assistant"
  | "footer";

export const PUBLIC_NOTICE_PLACEMENTS: readonly {
  placement: PublicNoticePlacement;
  purpose: string;
  tone: string;
  priority: DataDomainRisk;
}[] = [
  { placement: "landing", purpose: "제한 베타·책임 요약", tone: "짧고 명확", priority: "high" },
  { placement: "directory", purpose: "출처·변경 가능", tone: "공식 확인", priority: "medium" },
  { placement: "claim", purpose: "지급 비확정·공식 확인", tone: "High priority", priority: "high" },
  { placement: "work_links", purpose: "접근·만료", tone: "High priority", priority: "high" },
  { placement: "knowledge", purpose: "보조·판단 아님", tone: "Medium", priority: "high" },
  { placement: "search", purpose: "검수 공개만", tone: "High", priority: "high" },
  { placement: "answer_assistant", purpose: "PII·판단 아님", tone: "Critical", priority: "critical" },
  { placement: "footer", purpose: "공통 요약", tone: "짧은 문구", priority: "medium" },
] as const;

/** Short lines for public route banners (PR147). */
export const PUBLIC_INLINE_NOTICE: Record<
  "directory" | "claim" | "disclosure" | "knowledge" | "search",
  string
> = {
  directory:
    "보험사 링크·연락처는 공식 출처 확인 후 사용하세요. 정보는 수시로 변경될 수 있습니다.",
  claim:
    "필요 서류는 보험사·상품·사고에 따라 달라질 수 있습니다. 보험금 지급 여부는 확정하지 않으며, 제출 전 공식 안내를 확인하세요.",
  disclosure:
    "공식 링크는 보험사·협회 채널 기준이며 개정·접근 제한이 있을 수 있습니다.",
  knowledge:
    "상담 보조용 참고 자료입니다. 약관·공시·보험사 기준으로 최종 확인하세요.",
  search:
    "검수·공개 완료된 정보만 검색됩니다. 미검수·비공개 데이터는 표시되지 않습니다.",
};

export const ERROR_REPORT_ESCALATION: readonly {
  errorType: string;
  severity: string;
  link: string;
}[] = [
  { errorType: "보험사 정보 오류", severity: "Medium~High", link: "PR-143" },
  { errorType: "청구서류 오류", severity: "High", link: "PR-143" },
  { errorType: "링크 만료", severity: "Medium~High", link: "PR-134·PR-143" },
  { errorType: "지식 오류", severity: "Medium~High", link: "PR-143" },
  { errorType: "검색 오류", severity: "Medium~High", link: "PR-132·PR-143" },
  { errorType: "미검수/비공개 노출", severity: "Critical", link: "PR-143 즉시" },
  { errorType: "AA 위험 답변", severity: "Critical", link: "PR-137·PR-143" },
  { errorType: "PII 유도", severity: "Critical", link: "PR-143" },
] as const;

export type ResponsibilityVerdict = "go" | "conditional_go" | "no_go";

export const PR147_READINESS_VERDICT: ResponsibilityVerdict = "conditional_go";

export const PR147_READINESS_CONDITIONS: readonly string[] = [
  "청구·AA 페이지 고지 보완(PR147-A)",
  "법무 검토 전 책임 제한 문구 확정 없음",
  "자동 출처 검증·크롤러는 PR147-B/C 후보",
] as const;

export type ResponsibilityCheckStatus = "met" | "partial" | "gap";

export const DATA_RESPONSIBILITY_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: ResponsibilityCheckStatus;
  note: string;
}[] = [
  { id: "dir", item: "보험사 고지", criterion: "공식 출처", status: "met", note: "directory" },
  { id: "claim", item: "청구서류 고지", criterion: "지급 비확정", status: "met", note: "claim page" },
  { id: "links", item: "업무 링크 고지", criterion: "접근·만료", status: "partial", note: "disclosure·work-tools" },
  { id: "know", item: "지식 고지", criterion: "보조·판단 아님", status: "met", note: "knowledge" },
  { id: "search", item: "검색 고지", criterion: "검수 공개만", status: "met", note: "search" },
  { id: "aa", item: "AA 고지", criterion: "제한·판단 아님", status: "met", note: "planner route" },
  { id: "100", item: "100% 보장 없음", criterion: "과장 제거", status: "met", note: "static scan" },
  { id: "pay", item: "보험금 확정 없음", criterion: "단정 제거", status: "met", note: "public pages" },
  { id: "pii", item: "PII 유도 없음", criterion: "입력 금지", status: "met", note: "—" },
  { id: "report", item: "오류 제보", criterion: "PR-143", status: "met", note: "—" },
  { id: "vis", item: "visibility", criterion: "미검수 미노출", status: "met", note: "guard" },
  { id: "admin", item: "관리자 정보", criterion: "public 금지", status: "met", note: "—" },
  { id: "legal", item: "법무", criterion: "확정 없음", status: "partial", note: "info gap" },
] as const;

export const PR147_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR147-B", title: "Source Verification Model Plan", risk: "High", codex: "조건부" },
  { id: "PR147-C", title: "Link Monitoring Automation Plan", risk: "High", codex: "조건부" },
  { id: "PR147-D", title: "Public Notice UI Polish", risk: "Medium", codex: "선택" },
  { id: "PR148", title: "AI Limited Beta Policy", risk: "Critical", codex: "필수" },
  { id: "PR149", title: "Security Final Audit", risk: "Critical", codex: "필수" },
  { id: "PR150", title: "External Release Decision", risk: "Critical", codex: "필수" },
] as const;

export const PR147_DEFERRED_IMPLEMENTATION = [
  "자동 공식 출처 검증",
  "크롤러·외부 API",
  "source verification DB",
  "데이터 대량 수정",
] as const;

export const PR147_LINKED_DOCS = [
  "PR-134-LINK-STATUS-OPS.md",
  "PR-122-DATA-FRESHNESS-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-144-PUBLIC-LANDING-SAFETY-OPS.md",
  "PR-142-DATA-LIABILITY-NOTICE.md",
] as const;
