import {
  PlannerBusinessChannel,
  PlannerCareerRange,
  PlannerLicenseScope,
  PlannerType,
  PlannerVerificationStatus,
} from "@prisma/client";

export const ADMIN_PLANNER_VERIFICATION_COPY = {
  pageTitle: "설계사 검증 관리",
  pageDescription:
    "설계사 검증 신청을 수동으로 검토합니다. 승인은 PlannerDesk 내부 커뮤니티 권한 기준이며, 외부 기관의 공식 자격 보증·보험상품 판매·보험금 판단 권한을 의미하지 않습니다.",
  detailTitle: "설계사 검증 상세",
  policySummary:
    "설계사 검증은 PlannerDesk 내부 권한 관리 기준입니다. 외부 기관의 공식 자격 보증, 보험상품 판매 권한 보증, 보험금 지급 판단 권한을 의미하지 않습니다.",
  collectionNotice:
    "신분증, 자격증 이미지, 고객정보, 계약정보, 의료정보는 이 화면에서 수집하거나 보관하지 않습니다.",
  sensitiveBanner:
    "이 신청에는 개인정보·고객정보·의료정보가 포함되었을 가능성이 있습니다. 원문을 외부로 복사하지 말고, 필요 시 삭제 처리하세요.",
  memoHint:
    "내부 검토 메모만 기록하세요. 고객 개인정보·의료정보·계약정보·민감정보 원문은 입력하지 마세요.",
  rejectionHint:
    "사용자에게 노출될 수 있는 중립 문구만 입력하세요. 주민등록번호·연락처·자격번호·고객정보를 재기재하지 마세요. 상세 내부 사유는 관리자 메모에 기록하세요.",
  statusChangeNote:
    "상태 변경만으로 User.role은 자동 변경되지 않습니다. 커뮤니티 권한 연결은 PR-89 이후 별도 구현됩니다.",
} as const;

export const STATUS_LABEL: Record<PlannerVerificationStatus, string> = {
  pending: "신청 접수",
  under_review: "검토 중",
  approved: "승인",
  rejected: "거절",
  suspended: "정지",
  expired: "만료",
  deleted: "삭제",
};

export const PLANNER_TYPE_LABEL: Record<PlannerType, string> = {
  life: "생명보험",
  non_life: "손해보험",
  both: "생명·손해",
  ga: "GA",
  agency: "대리점",
  other: "기타",
};

export const CAREER_RANGE_LABEL: Record<PlannerCareerRange, string> = {
  under_1_year: "1년 미만",
  one_to_three_years: "1~3년",
  three_to_five_years: "3~5년",
  five_to_ten_years: "5~10년",
  over_ten_years: "10년 이상",
  not_disclosed: "미공개",
};

export const LICENSE_SCOPE_LABEL: Record<PlannerLicenseScope, string> = {
  life_only: "생명",
  non_life_only: "손해",
  life_and_non_life: "생명·손해",
  third_insurance: "제3보험",
  unknown: "미확인",
  not_disclosed: "미공개",
};

export const BUSINESS_CHANNEL_LABEL: Record<PlannerBusinessChannel, string> = {
  face_to_face: "대면",
  online: "온라인",
  telemarketing: "TM",
  corporate: "법인",
  mixed: "복합",
  other: "기타",
  not_disclosed: "미공개",
};

export const WRITABLE_STATUSES = Object.values(
  PlannerVerificationStatus,
) as PlannerVerificationStatus[];

export function statusTone(
  status: PlannerVerificationStatus,
): "green" | "gold" | "gray" | "navy" | "red" {
  if (status === PlannerVerificationStatus.approved) return "green";
  if (
    status === PlannerVerificationStatus.pending ||
    status === PlannerVerificationStatus.under_review
  ) {
    return "gold";
  }
  if (
    status === PlannerVerificationStatus.rejected ||
    status === PlannerVerificationStatus.deleted
  ) {
    return "red";
  }
  if (status === PlannerVerificationStatus.suspended) return "red";
  if (status === PlannerVerificationStatus.expired) return "navy";
  return "gray";
}

export function plannerTypeLabel(value: PlannerType): string {
  return PLANNER_TYPE_LABEL[value];
}

export function careerRangeLabel(value: PlannerCareerRange): string {
  return CAREER_RANGE_LABEL[value];
}

export function licenseScopeLabel(value: PlannerLicenseScope): string {
  return LICENSE_SCOPE_LABEL[value];
}

export function businessChannelLabel(value: PlannerBusinessChannel): string {
  return BUSINESS_CHANNEL_LABEL[value];
}

export function formatApplicantLabel(user: {
  id: string;
  name: string | null;
}): string {
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed;
  return `사용자 ${user.id.slice(0, 8)}…`;
}

export function isReviewedStatus(status: PlannerVerificationStatus): boolean {
  return (
    status === PlannerVerificationStatus.approved ||
    status === PlannerVerificationStatus.rejected ||
    status === PlannerVerificationStatus.suspended ||
    status === PlannerVerificationStatus.expired ||
    status === PlannerVerificationStatus.deleted
  );
}
