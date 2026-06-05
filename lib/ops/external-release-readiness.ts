/**
 * External release and monetization readiness copy (PR-140). Judgment only — no launch, no billing.
 */

export const PR140_SCOPE_NOTICE =
  "본 PR은 외부 공개·유료화 실행이 아니라 Go / Conditional Go / No-Go 판단 기준과 체크리스트입니다. 결제·PG·구독·가입 확대·약관 확정은 포함하지 않습니다.";

export const PR140_FORBIDDEN_DOC_CONTENT =
  "판단 문서에 고객정보·상담 원문·secret·token·env·API key·실제 가격·PG 계약 정보를 넣지 않습니다.";

export type ReleaseVerdict = "go" | "conditional_go" | "no_go" | "not_applicable";

export const RELEASE_VERDICT_LABEL: Record<ReleaseVerdict, string> = {
  go: "Go",
  conditional_go: "Conditional Go",
  no_go: "No-Go",
  not_applicable: "해당 없음",
};

export type ReleaseStageId =
  | "internal_ops"
  | "limited_beta"
  | "public_beta"
  | "paid_beta"
  | "formal_monetization";

export const RELEASE_STAGES: readonly {
  id: ReleaseStageId;
  label: string;
  meaning: string;
  allowed: string;
  forbidden: string;
  verdict: ReleaseVerdict;
  conditions: string;
}[] = [
  {
    id: "internal_ops",
    label: "내부 운영",
    meaning: "운영자·승인 계정만 점검",
    allowed: "전체 admin·문서·수동 검수",
    forbidden: "외부 사용자 모집·과금",
    verdict: "go",
    conditions: "현재 MVP 운영 단계",
  },
  {
    id: "limited_beta",
    label: "제한 베타",
    meaning: "소수 검증 설계사·피드백",
    allowed: "공개 기능 중심·수동 온보딩",
    forbidden: "자동 가입·결제·AA 확대",
    verdict: "conditional_go",
    conditions: "PR117 런타임 smoke·PR119 데이터 게이트·OPS/FB Critical 0",
  },
  {
    id: "public_beta",
    label: "공개 베타",
    meaning: "외부 설계사 일부 공개",
    allowed: "검증된 공개 콘텐츠·안내 문구",
    forbidden: "미검수 노출·AI 무제한·민감정보 수집",
    verdict: "conditional_go",
    conditions: "제한 베타 안정화 후·데이터 전건 출처 정책·고객지원 초안",
  },
  {
    id: "paid_beta",
    label: "유료 베타",
    meaning: "제한 유료 테스트",
    allowed: "결제·약관·환불·지원 체계 검증 후",
    forbidden: "준비 없는 과금",
    verdict: "no_go",
    conditions: "PR140-B 결제·법무 PR 선행",
  },
  {
    id: "formal_monetization",
    label: "정식 유료화",
    meaning: "외부 유료 서비스",
    allowed: "결제·개인정보·고객지원·장애 대응 완비 후",
    forbidden: "미검증 기능 판매",
    verdict: "no_go",
    conditions: "유료화 체크리스트 전항목 + Codex 제한검수",
  },
] as const;

export type FeatureReleaseRow = {
  id: string;
  label: string;
  external: ReleaseVerdict;
  monetization: ReleaseVerdict;
  rationale: string;
};

export const FEATURE_RELEASE_ROWS: readonly FeatureReleaseRow[] = [
  {
    id: "directory",
    label: "보험사 디렉터리",
    external: "conditional_go",
    monetization: "conditional_go",
    rationale: "PUBLIC_VERIFICATION + isPublished; PR124·PR122 최신성 수동",
  },
  {
    id: "claim-docs",
    label: "청구서류",
    external: "conditional_go",
    monetization: "no_go",
    rationale: "공식 출처·검수; 오류 시 High — 운영자 확인",
  },
  {
    id: "knowledge",
    label: "지식 아카이브",
    external: "conditional_go",
    monetization: "conditional_go",
    rationale: "PR125 품질·과장 금지; 미검수 public 차단",
  },
  {
    id: "work-links",
    label: "업무 링크/전산",
    external: "conditional_go",
    monetization: "not_applicable",
    rationale: "PR134 수동 점검; 만료 링크 정상 단정 금지",
  },
  {
    id: "search",
    label: "고급 통합 검색",
    external: "conditional_go",
    monetization: "conditional_go",
    rationale: "PR132 public/admin 분리; work_link admin only",
  },
  {
    id: "dashboard",
    label: "통합 업무 대시보드",
    external: "conditional_go",
    monetization: "conditional_go",
    rationale: "PR131 public/admin 분리",
  },
  {
    id: "favorites",
    label: "즐겨찾기",
    external: "go",
    monetization: "not_applicable",
    rationale: "PR135 client-only id; PII 미저장",
  },
  {
    id: "admin",
    label: "관리자 기능",
    external: "no_go",
    monetization: "no_go",
    rationale: "admin 전용 · getAdminAccess",
  },
  {
    id: "ops-report-reminder",
    label: "운영 리포트/리마인더",
    external: "no_go",
    monetization: "no_go",
    rationale: "PR136·PR138 admin only",
  },
  {
    id: "answer-assistant",
    label: "Answer Assistant",
    external: "conditional_go",
    monetization: "no_go",
    rationale: "제한 베타만; verified+allowlist; PR137",
  },
  {
    id: "admin-bulk",
    label: "Admin bulk",
    external: "no_go",
    monetization: "no_go",
    rationale: "고위험; super_admin 운영 주의",
  },
] as const;

export type ChecklistStatus = "met" | "partial" | "gap" | "na";

export const EXTERNAL_READINESS_CHECKLIST: readonly {
  id: string;
  label: string;
  criterion: string;
  status: ChecklistStatus;
  note: string;
}[] = [
  {
    id: "visibility",
    label: "public visibility",
    criterion: "미검수/비공개 public 미노출",
    status: "met",
    note: "getPublic* · 정적 테스트 유지",
  },
  {
    id: "rbac",
    label: "권한/RBAC",
    criterion: "public/planner/admin 분리",
    status: "met",
    note: "PR139 매트릭스·layout guard",
  },
  {
    id: "data-quality",
    label: "데이터 품질",
    criterion: "PR122·PR124·PR134 점검 기준",
    status: "partial",
    note: "production 전건 재검수 미완",
  },
  {
    id: "copy-safety",
    label: "문구 안정성",
    criterion: "지급 확정·가입 유도·공포 조장 없음",
    status: "met",
    note: "PR125·AA output safety",
  },
  {
    id: "links",
    label: "링크 신뢰도",
    criterion: "확인 필요를 정상으로 단정하지 않음",
    status: "partial",
    note: "수동 점검·Registry",
  },
  {
    id: "mobile",
    label: "모바일",
    criterion: "주요 화면 깨짐 없음",
    status: "partial",
    note: "PR127·class smoke; 실기기 미완",
  },
  {
    id: "admin-leak",
    label: "관리자 정보",
    criterion: "이슈·이력·bulk public 미노출",
    status: "met",
    note: "PR131·133·136·138",
  },
  {
    id: "aa",
    label: "Answer Assistant",
    criterion: "allowlist·확대 없음",
    status: "met",
    note: "PR137·verified-access",
  },
  {
    id: "pii",
    label: "개인정보",
    criterion: "고객정보 수집 유도 없음",
    status: "met",
    note: "신규 수집 폼 없음",
  },
  {
    id: "ops-process",
    label: "운영 프로세스",
    criterion: "이슈·월간·리마인더 기준",
    status: "met",
    note: "PR129·130·138",
  },
  {
    id: "build",
    label: "배포 검증",
    criterion: "lint/typecheck/test/build",
    status: "met",
    note: "PR105 migrate 분리",
  },
  {
    id: "runtime-smoke",
    label: "런타임 smoke",
    criterion: "PR117 HTTP smoke 기록",
    status: "gap",
    note: "운영자 G1 미충족 시 제한 베타 보류",
  },
] as const;

export const MONETIZATION_READINESS_CHECKLIST: readonly {
  id: string;
  label: string;
  criterion: string;
  status: ChecklistStatus;
  note: string;
}[] = [
  {
    id: "payment",
    label: "결제/PG",
    criterion: "구현·연동 없음 → 별도 PR",
    status: "gap",
    note: "PR140-B 설계만",
  },
  {
    id: "pricing",
    label: "가격 정책",
    criterion: "사업·법무 확정",
    status: "gap",
    note: "PR140에서 확정 금지",
  },
  {
    id: "terms",
    label: "약관",
    criterion: "법무 검토",
    status: "gap",
    note: "PR142 후보",
  },
  {
    id: "privacy-policy",
    label: "개인정보처리방침",
    criterion: "수집 항목 확정 후",
    status: "gap",
    note: "PR142 후보",
  },
  {
    id: "refund",
    label: "환불",
    criterion: "결제 도입 전",
    status: "gap",
    note: "PR145 후보",
  },
  {
    id: "support",
    label: "고객지원",
    criterion: "문의·장애·환불",
    status: "gap",
    note: "PR143 후보",
  },
  {
    id: "incident",
    label: "장애 대응",
    criterion: "rollback·공지",
    status: "partial",
    note: "PR115·116 문서; 실행은 운영자",
  },
  {
    id: "data-liability",
    label: "데이터 책임",
    criterion: "최신성·출처 고지",
    status: "partial",
    note: "PR147 후보",
  },
  {
    id: "fintech-copy",
    label: "보험·금융 심의",
    criterion: "가입·지급 확정 금지",
    status: "met",
    note: "제품 경계 AGENTS.md",
  },
  {
    id: "ai-liability",
    label: "AI 책임",
    criterion: "AA 제한 베타",
    status: "met",
    note: "정식 유료 판매 대상 아님",
  },
  {
    id: "admin-manual",
    label: "운영 매뉴얼",
    criterion: "PR123·136·138",
    status: "met",
    note: "수동 운영 전제",
  },
  {
    id: "security",
    label: "보안/권한",
    criterion: "RBAC·visibility 안정",
    status: "met",
    note: "PR139",
  },
] as const;

export const RELEASE_RISK_ROWS: readonly {
  id: string;
  label: string;
  severity: "critical" | "high" | "medium";
  state: "mitigated" | "open" | "partial";
  response: string;
}[] = [
  {
    id: "visibility",
    label: "public visibility 노출",
    severity: "critical",
    state: "mitigated",
    response: "guard 유지·정적 테스트",
  },
  {
    id: "auth-bypass",
    label: "권한 우회",
    severity: "critical",
    state: "mitigated",
    response: "getAdminAccess·server actions",
  },
  {
    id: "unreviewed",
    label: "미검수 데이터 노출",
    severity: "critical",
    state: "partial",
    response: "운영 데이터·Registry 수동",
  },
  {
    id: "pii-store",
    label: "개인정보 저장",
    severity: "critical",
    state: "mitigated",
    response: "수집 구조 없음",
  },
  {
    id: "aa-expand",
    label: "Answer Assistant 확대",
    severity: "critical",
    state: "mitigated",
    response: "allowlist·gate",
  },
  {
    id: "claim-error",
    label: "잘못된 청구정보",
    severity: "high",
    state: "partial",
    response: "PR124·정정 제보",
  },
  {
    id: "link-error",
    label: "링크 오류",
    severity: "high",
    state: "partial",
    response: "PR134 수동",
  },
  {
    id: "copy-risk",
    label: "문구·심의",
    severity: "high",
    state: "partial",
    response: "콘텐츠 검수",
  },
  {
    id: "support-absent",
    label: "고객지원 부재",
    severity: "high",
    state: "open",
    response: "외부 공개 전 PR143",
  },
  {
    id: "billing-absent",
    label: "결제/환불 기준 부재",
    severity: "high",
    state: "open",
    response: "유료화 No-Go",
  },
] as const;

export const DEFERRED_RELEASE_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  {
    id: "PR141",
    title: "External Beta Readiness",
    purpose: "제한 베타 온보딩·체크리스트 실행",
    risk: "Medium~High",
    codex: "조건부",
  },
  {
    id: "PR142",
    title: "Terms & Privacy Drafting Plan",
    purpose: "약관·개인정보 준비 계획(확정 아님)",
    risk: "High",
    codex: "권장",
  },
  {
    id: "PR143",
    title: "Support & Incident Playbook",
    purpose: "고객지원·장애 대응",
    risk: "Medium~High",
    codex: "조건부",
  },
  {
    id: "PR144",
    title: "Public Landing Safety Review",
    purpose: "외부 랜딩 문구·범위",
    risk: "High",
    codex: "조건부",
  },
  {
    id: "PR145",
    title: "Payment Feasibility Plan",
    purpose: "결제·환불 구조 검토만",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR146",
    title: "Beta Access Request Flow",
    purpose: "제한 베타 신청 설계",
    risk: "High",
    codex: "권장",
  },
  {
    id: "PR147",
    title: "Data Responsibility Notice",
    purpose: "데이터 책임 고지",
    risk: "High",
    codex: "조건부",
  },
  {
    id: "PR148",
    title: "AI Limited Beta Policy",
    purpose: "AA 제한 베타 정책",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR149",
    title: "Security & Access Final Audit",
    purpose: "권한·보안 최종 감사",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR150",
    title: "External Release Decision",
    purpose: "최종 공개 여부 (**PR150-A 완료**, 실행 없음)",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR151",
    title: "External Beta Dry Run",
    purpose: "공개 전 dry-run (**PR151-A 완료**, 실행 없음)",
    risk: "High",
    codex: "필수",
  },
  {
    id: "PR152",
    title: "Beta Operator Checklist",
    purpose: "운영자 실행 체크리스트 (**PR152-A 완료**, 실행 없음)",
    risk: "Medium~High",
    codex: "조건부",
  },
  {
    id: "PR153",
    title: "Beta User Notice Pack",
    purpose: "베타 사용자 안내문 (**PR153-A 완료**, 발송 없음)",
    risk: "Medium~High",
    codex: "조건부",
  },
  {
    id: "PR154",
    title: "Public Smoke Expansion",
    purpose: "public route smoke",
    risk: "High",
    codex: "조건부",
  },
] as const;

export const OVERALL_VERDICTS = {
  limitedBeta: "conditional_go" as const,
  publicBeta: "conditional_go" as const,
  paidBeta: "no_go" as const,
  formalMonetization: "no_go" as const,
  monetizationDiscussion: "conditional_go" as const,
} as const;
