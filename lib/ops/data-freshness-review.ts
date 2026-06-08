/**
 * Data freshness review ops standards (PR-161). Checklist/docs only — no DB edit, crawl, or sync.
 */

import {
  DATA_ERROR_FEEDBACK_HANDLING,
  PR158_FEEDBACK_VERDICTS,
  PR158_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-feedback-loop";
import {
  PR160_EXPANSION_VERDICTS,
  PR160_OPEN_CRITICAL_COUNT,
  PR160_OPEN_HIGH_COUNT,
} from "@/lib/ops/beta-expansion-decision";
import { DATA_RESPONSIBILITY_TARGETS } from "@/lib/ops/data-responsibility-notice";
import type { RiskGrade } from "@/lib/ops/external-release-decision";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR161_SCOPE_NOTICE =
  "보험사·청구서류·업무 링크·지식·public 검색 데이터 **최신성 점검 기준**입니다. 운영 DB 수정·대량 변경·크롤링·자동 동기화·외부 API·role·allowlist는 포함하지 않습니다.";

export const PR161_FORBIDDEN_DOC_CONTENT =
  "점검 문서에 고객정보·크롤 결과 원문·secret·allowlist 실값·지급 확정 표현을 넣지 않습니다.";

export type FreshnessReviewStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const FRESHNESS_REVIEW_STATUS_LABEL: Record<FreshnessReviewStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR161_OPEN_CRITICAL_COUNT = PR160_OPEN_CRITICAL_COUNT;

export const PR161_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr160",
    condition: "PR160에서 PR161 후속 제안",
    result: "PR161 Data Freshness",
    met: true,
  },
  {
    id: "pr158",
    condition: "PR158 데이터·링크·청구 오류 기준",
    result: `${DATA_ERROR_FEEDBACK_HANDLING.length}건`,
    met: DATA_ERROR_FEEDBACK_HANDLING.length > 0,
  },
  {
    id: "pr159",
    condition: "PR159 청구·보험사 오류 대응",
    result: "incident playbook",
    met: true,
  },
  {
    id: "crit",
    condition: "Critical(정적) 0",
    result: String(PR161_OPEN_CRITICAL_COUNT),
    met: PR161_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "doc",
    condition: "운영 DB 수정 없이 문서·체크list",
    result: "가능",
    met: true,
  },
] as const;

export const OFFICIAL_SOURCE_PRIORITY: readonly {
  priority: number;
  sourceType: string;
  usageRule: string;
}[] = [
  { priority: 1, sourceType: "보험사 공식 홈페이지", usageRule: "청구·고객센터·업무 링크 확인" },
  { priority: 2, sourceType: "보험사 공식 공시·약관", usageRule: "보장·청구 근거 확인" },
  { priority: 3, sourceType: "공식 앱·고객센터 안내", usageRule: "청구 경로·제출 방식 참고" },
  { priority: 4, sourceType: "협회·공공기관 공식 자료", usageRule: "공통 제도·일반 기준" },
  { priority: 5, sourceType: "내부 검수 자료", usageRule: "공식 출처 대조 후 보조" },
  { priority: 6, sourceType: "사용자 제보", usageRule: "공식 확인 전 확정 금지" },
] as const;

export const INSURER_DIRECTORY_CHECK: readonly {
  item: string;
  criterion: string;
  errorGrade: IssueSeverity | "critical";
}[] = [
  { item: "보험사명", criterion: "공식 표기 일치", errorGrade: "high" },
  { item: "고객센터 번호", criterion: "공식 홈페이지 확인", errorGrade: "high" },
  { item: "청구 안내 링크", criterion: "공식 청구 페이지", errorGrade: "high" },
  { item: "전산 링크", criterion: "권한·링크 상태", errorGrade: "medium" },
  { item: "카드납 정보", criterion: "공식 확인 전 확정 금지", errorGrade: "high" },
  { item: "팩스 번호", criterion: "공식 안내 확인", errorGrade: "high" },
  { item: "모바일 청구", criterion: "공식 앱·홈페이지", errorGrade: "medium" },
  { item: "우편 주소", criterion: "공식 안내 확인", errorGrade: "high" },
  { item: "비공개 상태", criterion: "public 미노출", errorGrade: "critical" },
  { item: "미검수 상태", criterion: "public 미노출·제한", errorGrade: "critical" },
] as const;

export const CLAIM_DOCUMENT_CHECK: readonly {
  item: string;
  criterion: string;
  errorGrade: IssueSeverity | "critical";
}[] = [
  { item: "보험사별 청구서류", criterion: "공식 청구 안내", errorGrade: "high" },
  { item: "사고 유형별 서류", criterion: "약관·공식 안내", errorGrade: "high" },
  { item: "공통 서류", criterion: "공식 청구 안내", errorGrade: "high" },
  { item: "추가 서류", criterion: "확정 표현 금지", errorGrade: "high" },
  { item: "진단서·입퇴원확인서", criterion: "보험사별 차이 확인", errorGrade: "high" },
  { item: "제출 방법", criterion: "앱·팩스·우편·방문", errorGrade: "medium" },
  { item: "보험금 지급 표현", criterion: "지급 확정 금지", errorGrade: "critical" },
  { item: "“이 서류만” 표현", criterion: "금지", errorGrade: "high" },
  { item: "공식 출처 없음", criterion: "확인 필요·비공개 후보", errorGrade: "high" },
  { item: "미검수 청구서류", criterion: "public 미노출", errorGrade: "critical" },
] as const;

export const WORK_LINK_CHECK: readonly {
  item: string;
  criterion: string;
  errorGrade: IssueSeverity | "critical";
}[] = [
  { item: "공식 홈페이지", criterion: "접근 가능", errorGrade: "medium" },
  { item: "청구 안내 링크", criterion: "공식 페이지 연결", errorGrade: "high" },
  { item: "전산 사이트", criterion: "권한 필요 명시", errorGrade: "medium" },
  { item: "헬프데스크", criterion: "공식 안내", errorGrade: "medium" },
  { item: "서식 다운로드", criterion: "공식 파일 확인", errorGrade: "high" },
  { item: "링크 만료", criterion: "404·리다이렉트", errorGrade: "medium" },
  { item: "내부 전용 링크", criterion: "public 금지·권한 안내", errorGrade: "high" },
  { item: "secret URL", criterion: "즉시 제거", errorGrade: "critical" },
  { item: "관리자 링크", criterion: "public 금지", errorGrade: "critical" },
] as const;

export const KNOWLEDGE_ARCHIVE_CHECK: readonly {
  item: string;
  criterion: string;
  errorGrade: IssueSeverity | "critical";
}[] = [
  { item: "공식 근거", criterion: "약관·공시·보험사 안내", errorGrade: "high" },
  { item: "최신성", criterion: "개정 가능성 확인", errorGrade: "high" },
  { item: "상담 문구", criterion: "지급 확정·가입 유도·공포 금지", errorGrade: "critical" },
  { item: "고객정보 예시", criterion: "실제 PII 금지", errorGrade: "critical" },
  { item: "의료·법률·세무", criterion: "확정 표현 금지", errorGrade: "high" },
  { item: "투자 권유", criterion: "금지", errorGrade: "high" },
  { item: "미검수 문서", criterion: "public 미노출", errorGrade: "critical" },
  { item: "비공개 문서", criterion: "public 미노출", errorGrade: "critical" },
  { item: "출처 불명", criterion: "확인 필요·보류", errorGrade: "high" },
] as const;

export const PUBLIC_SEARCH_FRESHNESS_CHECK: readonly {
  item: string;
  criterion: string;
  errorGrade: IssueSeverity | "critical";
}[] = [
  { item: "공개 데이터만", criterion: "PUBLIC_*_WHERE", errorGrade: "critical" },
  { item: "관리자 데이터 제외", criterion: "운영·bulk 제외", errorGrade: "critical" },
  { item: "청구서류 결과", criterion: "공식 확인 고지", errorGrade: "high" },
  { item: "지식 결과", criterion: "상담 보조 고지", errorGrade: "high" },
  { item: "오래된 데이터", criterion: "최신성 확인 표시", errorGrade: "medium" },
  { item: "잘못된 링크", criterion: "보류·수정 후보", errorGrade: "medium" },
  { item: "과장 표현", criterion: "금지", errorGrade: "high" },
  { item: "고객정보 포함", criterion: "즉시 제거", errorGrade: "critical" },
] as const;

export const DATA_ERROR_GRADES: readonly {
  grade: RiskGrade;
  criteria: string;
  example: string;
  action: string;
}[] = [
  { grade: "critical", criteria: "public·권한·PII·secret·지급 확정", example: "비공개 노출·관리자 링크·지급 확정", action: "즉시 보류·hotfix PR" },
  { grade: "high", criteria: "업무 판단 영향 오류", example: "청구서류·고객센터·출처 불명", action: "공식 확인 후 수정 PR" },
  { grade: "medium", criteria: "사용성·링크·검색", example: "만료·누락·안내 부족", action: "backlog·개선 PR" },
  { grade: "low", criteria: "오탈자·표현", example: "띄어쓰기", action: "polish PR" },
] as const;

export const PUBLIC_HOLD_CRITERIA: readonly {
  situation: string;
  action: string;
}[] = [
  { situation: "공식 출처 확인 불가", action: "public 보류 후보" },
  { situation: "공식 안내와 불일치", action: "수정 전 보류" },
  { situation: "청구서류 최신성 불명", action: "확인 필요·보류" },
  { situation: "보험금 지급 확정 표현", action: "즉시 보류" },
  { situation: "고객정보·민감정보", action: "즉시 보류" },
  { situation: "관리자 정보", action: "즉시 보류" },
  { situation: "secret/env/token", action: "즉시 보류" },
  { situation: "미검수 상태", action: "public 미노출" },
  { situation: "비공개 상태", action: "public 미노출" },
] as const;

export const FRESHNESS_FOLLOW_UP_PRS: readonly {
  issueType: string;
  prCandidate: string;
  risk: string;
  codex: string;
}[] = [
  { issueType: "비공개·미검수 public 노출", prCandidate: "PR161-B Public Visibility Hotfix", risk: "Critical", codex: "필요" },
  { issueType: "보험금 지급 확정 문구", prCandidate: "PR161-C Claim Wording Hotfix", risk: "Critical", codex: "필요" },
  { issueType: "청구서류 오류", prCandidate: "PR161-D Claim Document Correction", risk: "High", codex: "조건부" },
  { issueType: "보험사 정보 오류", prCandidate: "PR161-E Insurer Directory Correction", risk: "High", codex: "조건부" },
  { issueType: "업무 링크 오류", prCandidate: "PR161-F Work Link Freshness", risk: "Medium~High", codex: "조건부" },
  { issueType: "지식 출처 불명", prCandidate: "PR161-G Knowledge Source Review", risk: "High", codex: "조건부" },
  { issueType: "검색 결과 오류", prCandidate: "PR161-H Public Search Quality", risk: "Medium~High", codex: "조건부" },
  { issueType: "사용자 안내 부족", prCandidate: "PR153-B Notice Update", risk: "Medium", codex: "조건부" },
  { issueType: "오탈자", prCandidate: "PR163 Public UX Polish", risk: "Low", codex: "불필요" },
] as const;

export type FreshnessChecklistStatus = "met" | "partial" | "pending";

export const FRESHNESS_REVIEW_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: FreshnessChecklistStatus;
}[] = [
  { id: "source", item: "공식 출처 우선순위", criterion: "명확", status: "met" },
  { id: "dir", item: "보험사 디렉터리", criterion: "명확", status: "met" },
  { id: "claim", item: "청구서류", criterion: "명확", status: "met" },
  { id: "link", item: "업무 링크", criterion: "명확", status: "met" },
  { id: "know", item: "지식 아카이브", criterion: "명확", status: "met" },
  { id: "search", item: "public 검색", criterion: "명확", status: "met" },
  { id: "grade", item: "오류 등급표", criterion: "Critical~Low", status: "met" },
  { id: "hold", item: "public 보류", criterion: "명확", status: "met" },
  { id: "follow", item: "후속 PR", criterion: "유형별", status: "met" },
  { id: "nodb", item: "운영 DB 수정 없음", criterion: "필수", status: "met" },
  { id: "nocrawl", item: "크롤링 없음", criterion: "필수", status: "met" },
  { id: "nosync", item: "자동 동기화 없음", criterion: "필수", status: "met" },
  { id: "nopii", item: "PII·secret 없음", criterion: "필수", status: "met" },
  { id: "live", item: "실제 데이터 감사 실행", criterion: "PR161-A 문서만", status: "pending" },
] as const;

export const PR162_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR162", title: "User Support Inbox Plan", purpose: "제보 운영", risk: "High", codex: "조건부" },
  { id: "PR163", title: "Public UX Polish", purpose: "사용성", risk: "Medium", codex: "불필요" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
  { id: "PR166", title: "Beta Cohort Control", purpose: "대상군 관리", risk: "High", codex: "조건부" },
  { id: "PR167", title: "Beta Metrics Review", purpose: "지표 검토", risk: "High", codex: "조건부" },
  { id: "PR168", title: "Data Correction Workflow", purpose: "수정 workflow", risk: "High", codex: "조건부" },
] as const;

export const PR161_FRESHNESS_VERDICTS = {
  freshnessReviewPrepared: "conditional" as FreshnessReviewStatus,
  /** live row-by-row audit — deferred */
  liveDataAudit: "not_ready" as FreshnessReviewStatus,
  officialSourcePolicy: "ready" as FreshnessReviewStatus,
  publicHoldPolicy: "ready" as FreshnessReviewStatus,
} as const;

export const PR161_OPEN_HIGH_COUNT = PR160_OPEN_HIGH_COUNT;

/** Codebase visibility reference for docs/tests — no runtime DB query. */
export const FRESHNESS_CODE_REFERENCES = {
  publicVisibility: "lib/public/visibility.ts · isPublishedContentPubliclyVisible",
  insurerWhere: "lib/public/insurers.ts · PUBLIC_*",
  claimWhere: "lib/public/claim-documents.ts",
  knowledgeWhere: "lib/public/knowledge-articles.ts · PUBLIC_KNOWLEDGE_WHERE",
  searchScope: "lib/search/public.ts · PUBLIC_* filters",
  verificationField: "verificationStatus · isPublished",
  responsibilityDomains: DATA_RESPONSIBILITY_TARGETS.length,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "공식 출처 우선순위",
  "디렉터리·청구·링크·지식·검색 점검",
  "오류 등급·public 보류",
  "비공개·미검수·지급 확정 Critical",
  "운영 DB·크롤·동기화 부재",
  "PR162 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR161_LINKED_HUBS = [
  "PR-160-BETA-EXPANSION-DECISION-OPS.md",
  "PR-158-BETA-FEEDBACK-LOOP-OPS.md",
  "PR-159-BETA-INCIDENT-DRILL-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
] as const;

export const PR161_TEST_FILES = [
  "tests/ops/pr161-data-freshness-review.test.ts",
  "tests/ops/pr160-beta-expansion-decision.test.ts",
] as const;

export const PR158_CRITICAL_BASELINE = PR158_OPEN_CRITICAL_COUNT;

export const PR160_EXPANSION_BASELINE = PR160_EXPANSION_VERDICTS.limitedBetaExpansion;

export const PR158_FEEDBACK_BASELINE = PR158_FEEDBACK_VERDICTS.deidentificationSafety;
