/**
 * Public landing safety review copy (PR-144). Review standards only — no launch, no signup form.
 */

import { BETA_USER_FORBIDDEN_PHRASES } from "@/lib/ops/limited-beta-readiness";

export const PR144_SCOPE_NOTICE =
  "public landing **안전성 검수**입니다. 신규 마케팅 랜딩·외부 공개 실행·회원가입 확대·베타 신청 폼·결제·개인정보 수집은 포함하지 않습니다.";

export const PR144_FORBIDDEN_DOC_CONTENT =
  "검수 문서에 고객정보·상담 원문·secret·token·env·확정 가격·PG 정보를 넣지 않습니다.";

/** Landing scan uses PR141 forbidden list + PR144 extensions. */
export const LANDING_FORBIDDEN_PHRASES: readonly string[] = [
  ...BETA_USER_FORBIDDEN_PHRASES,
  "지금 가입하기",
  "유료 결제",
  "정식 서비스 신청",
  "법무 검토 완료",
  "모든 기능 사용하기",
] as const;

export const COPY_REVIEW_ROWS: readonly {
  area: string;
  good: string;
  forbidden: string;
}[] = [
  {
    area: "메인 제목",
    good: "제한 베타·실무 보조 도구",
    forbidden: "정식 출시 완료, 국내 1위, 완벽 보장",
  },
  {
    area: "설명",
    good: "검수 완료 공개 정보 중심",
    forbidden: "최신 정보 100% 보장",
  },
  {
    area: "기능 소개",
    good: "보험사·청구·지식·링크 탐색 보조",
    forbidden: "보험금 지급 확정",
  },
  {
    area: "CTA",
    good: "공개 정보·기능 범위 확인",
    forbidden: "지금 가입, 유료 결제, 자동 승인",
  },
  {
    area: "데이터 고지",
    good: "공식 출처 확인 필요",
    forbidden: "무조건 정확",
  },
  {
    area: "개인정보",
    good: "고객정보·민감정보 입력 금지",
    forbidden: "고객정보 입력 유도",
  },
  {
    area: "Answer Assistant",
    good: "제한 운영·허용 사용자만",
    forbidden: "전면 공개, 누구나 사용",
  },
  {
    area: "고객지원",
    good: "오류 제보 기준(PR-143)",
    forbidden: "실시간 상담 보장",
  },
  {
    area: "유료화",
    good: "추후 검토·별도 고지",
    forbidden: "유료 서비스 시작",
  },
  {
    area: "법무",
    good: "법무 검토 필요 항목 분리",
    forbidden: "법적 검토 완료 단정",
  },
] as const;

export type FeaturePublicDisplay = "allowed" | "conditional" | "restricted" | "forbidden";

export const FEATURE_PUBLIC_DISPLAY_LABEL: Record<FeaturePublicDisplay, string> = {
  allowed: "조건부 표시 가능",
  conditional: "조건부 표시 가능",
  restricted: "제한 표시",
  forbidden: "보류(public 금지)",
};

export const PUBLIC_FEATURE_ROWS: readonly {
  id: string;
  feature: string;
  display: FeaturePublicDisplay;
  criterion: string;
}[] = [
  {
    id: "directory",
    feature: "보험사 디렉터리",
    display: "conditional",
    criterion: "검수 완료 공개 정보만",
  },
  {
    id: "claim-docs",
    feature: "청구서류",
    display: "conditional",
    criterion: "공식 출처 확인 고지",
  },
  {
    id: "knowledge",
    feature: "지식 아카이브",
    display: "conditional",
    criterion: "상담 보조·판단 비제공",
  },
  {
    id: "links",
    feature: "업무 링크(공시·약관)",
    display: "restricted",
    criterion: "권한·공식 출처 확인",
  },
  {
    id: "search",
    feature: "통합 검색",
    display: "conditional",
    criterion: "공개 정보 중심",
  },
  {
    id: "desk",
    feature: "통합 업무 대시보드(홈)",
    display: "conditional",
    criterion: "역할별·검수 데이터만",
  },
  {
    id: "favorites",
    feature: "즐겨찾기",
    display: "restricted",
    criterion: "PII 없는 라벨·href만",
  },
  {
    id: "admin",
    feature: "관리자 기능",
    display: "forbidden",
    criterion: "public 표시 금지",
  },
  {
    id: "change-history",
    feature: "변경 이력",
    display: "forbidden",
    criterion: "public 표시 금지",
  },
  {
    id: "ops-report",
    feature: "운영 리포트/리마인더",
    display: "forbidden",
    criterion: "public 표시 금지",
  },
  {
    id: "bulk",
    feature: "Admin bulk",
    display: "forbidden",
    criterion: "public 표시 금지",
  },
  {
    id: "aa",
    feature: "Answer Assistant",
    display: "forbidden",
    criterion: "verified planner + allowlist; public 전면 문구 금지",
  },
] as const;

export const CTA_SAFE: readonly string[] = [
  "공개 정보 확인하기",
  "제한 베타 안내 보기",
  "기능 범위 확인하기",
  "오류 제보 기준 확인하기",
  "공식 출처 확인 기준 보기",
  "청구서류 확인 전 유의사항 보기",
] as const;

export const CTA_FORBIDDEN: readonly string[] = [
  "지금 가입하기",
  "무료로 자동 승인받기",
  "유료 결제 시작",
  "AI 상담 바로 시작",
  "보험금 바로 확인",
  "고객정보 입력하고 분석받기",
  "모든 기능 사용하기",
  "정식 서비스 신청하기",
] as const;

export const LIABILITY_NOTICE_GOOD: readonly string[] = [
  "PlannerDesk는 제한 베타 준비 단계의 설계사 업무 보조 도구입니다.",
  "제공 정보는 검수 완료된 공개 정보와 운영자가 확인한 기준을 중심으로 정리됩니다.",
  "보험금 지급 여부는 약관, 사고 내용, 제출 서류, 보험사 심사 기준에 따라 달라질 수 있습니다.",
  "청구서류와 업무 링크는 보험사 정책과 공식 페이지 변경에 따라 달라질 수 있습니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "Answer Assistant는 별도 허용된 사용자에게만 제한적으로 제공됩니다.",
] as const;

export const LIABILITY_NOTICE_FORBIDDEN: readonly string[] = [
  "보험금 지급을 보장합니다.",
  "모든 정보는 100% 최신입니다.",
  "고객정보를 입력하면 정확도가 올라갑니다.",
  "AI가 최종 판단합니다.",
  "설계사라면 누구나 자동으로 사용할 수 있습니다.",
  "법무 검토 완료 서비스입니다.",
  "유료 결제 후 바로 전체 기능 사용 가능합니다.",
] as const;

export const PUBLIC_ADMIN_SPLIT_ROWS: readonly {
  info: string;
  publicOk: boolean;
  adminOk: boolean;
}[] = [
  { info: "공개 보험사·청구·지식·링크", publicOk: true, adminOk: true },
  { info: "검수 대기·수정 필요", publicOk: false, adminOk: true },
  { info: "운영 이슈·변경 이력", publicOk: false, adminOk: true },
  { info: "관리자 리포트·리마인더", publicOk: false, adminOk: true },
  { info: "Admin bulk 상태", publicOk: false, adminOk: true },
  { info: "Answer Assistant 운영 상태", publicOk: false, adminOk: true },
] as const;

export type ChecklistStatus = "met" | "partial" | "gap";

export const LANDING_SAFETY_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: ChecklistStatus;
  note: string;
}[] = [
  {
    id: "launch",
    item: "정식 출시 오해 없음",
    criterion: "제한 베타·준비 단계 안내",
    status: "met",
    note: "홈·footer·PR144 안내",
  },
  {
    id: "paid",
    item: "유료화 오해 없음",
    criterion: "결제·가격·구독 문구 없음",
    status: "met",
    note: "PR140 No-Go 유지",
  },
  {
    id: "signup",
    item: "자동 가입 오해 없음",
    criterion: "가입·자동 승인 CTA 없음",
    status: "met",
    note: "PR141 수동 승인",
  },
  {
    id: "pii",
    item: "개인정보 입력 유도 없음",
    criterion: "입력 금지 안내",
    status: "met",
    note: "홈 safety·도메인 페이지",
  },
  {
    id: "claim",
    item: "보험금 확정 표현 없음",
    criterion: "심사 기준 고지",
    status: "met",
    note: "판단·산정 비제공",
  },
  {
    id: "freshness",
    item: "최신성 100% 보장 없음",
    criterion: "공식 출처 재확인",
    status: "met",
    note: "footer·claim 페이지",
  },
  {
    id: "admin-leak",
    item: "관리자 정보 미노출",
    criterion: "ops·bulk·이력 미노출",
    status: "met",
    note: "public guard·smoke",
  },
  {
    id: "aa",
    item: "Answer Assistant 제한",
    criterion: "public 전면 문구 없음",
    status: "met",
    note: "허브 노트·/planner 경로",
  },
  {
    id: "cta",
    item: "CTA 안전성",
    criterion: "가입·결제·PII 유도 없음",
    status: "met",
    note: "Quick launch 라벨 검수",
  },
  {
    id: "incident-copy",
    item: "공지·오류 문구",
    criterion: "secret·내부 오류 미노출",
    status: "met",
    note: "PR-143 기준",
  },
  {
    id: "mobile",
    item: "모바일 가독성",
    criterion: "주요 CTA 깨짐 없음",
    status: "partial",
    note: "수동 UI 확인 권장",
  },
  {
    id: "visibility",
    item: "public visibility",
    criterion: "미검수·비공개 미노출",
    status: "met",
    note: "getPublic*·smoke",
  },
] as const;

export const PR144_DEFERRED_IMPLEMENTATION = [
  "신규 마케팅 랜딩 페이지",
  "외부 공개 실행",
  "베타 신청 폼",
  "회원가입·자동 승인 확대",
  "결제·PG·구독·가격표",
] as const;

export const PR144_LINKED_DOCS = [
  "PR-140-EXTERNAL-RELEASE-READINESS-OPS.md",
  "PR-141-LIMITED-BETA-OPS.md",
  "PR-142-TERMS-PRIVACY-PLAN-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-131-PUBLIC-WORK-HUB-OPS.md",
] as const;

/** Short lines for public home hero (PR144). */
export const PUBLIC_LANDING_LIMITED_BETA_NOTICE =
  "PlannerDesk는 제한 베타 준비 단계의 설계사 업무 보조 도구입니다. 확인된 공개 정보 중심으로 제공됩니다.";

export const PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE =
  "청구서류·업무 링크·공시 정보는 보험사 공식 안내 변경에 따라 달라질 수 있으니 제출·안내 전 공식 출처를 확인해 주세요.";

export const PUBLIC_LANDING_FOOTER_LINE =
  "제한 베타 준비 단계 · 확인된 공개 정보 중심";
