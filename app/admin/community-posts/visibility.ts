import {
  CommunityPostCategory,
  CommunityPostStatus,
  CommunityReportReason,
} from "@prisma/client";
import { CATEGORY_LABEL, REPORT_REASON_LABEL, STATUS_LABEL } from "@/app/community/visibility";

export const ADMIN_COMMUNITY_COPY = {
  pageTitle: "커뮤니티 게시글 관리",
  pageDescription:
    "커뮤니티 게시글을 검토하고 블라인드·삭제·상태 변경을 수동 처리합니다.",
  detailTitle: "커뮤니티 게시글 상세",
  policySummary:
    "개인정보·의료정보·계약정보·청구자료·보험금 판단성 게시글은 수동 블라인드 또는 삭제 대상입니다. 자동 블라인드는 적용하지 않습니다.",
  memoHint:
    "관리자 메모는 내부 기록용입니다. 민감정보 원문을 복사하지 마세요.",
} as const;

export { CATEGORY_LABEL, STATUS_LABEL, REPORT_REASON_LABEL };

export const WRITABLE_POST_STATUSES = Object.values(
  CommunityPostStatus,
) as CommunityPostStatus[];

export function statusTone(
  status: CommunityPostStatus,
): "green" | "gold" | "gray" | "navy" | "red" {
  if (status === CommunityPostStatus.published) return "green";
  if (status === CommunityPostStatus.under_review) return "gold";
  if (status === CommunityPostStatus.blinded || status === CommunityPostStatus.deleted) {
    return "red";
  }
  if (status === CommunityPostStatus.archived) return "navy";
  return "gray";
}

export function parseCategory(value: string): CommunityPostCategory | null {
  return (Object.values(CommunityPostCategory) as string[]).includes(value)
    ? (value as CommunityPostCategory)
    : null;
}

export function parseStatus(value: string): CommunityPostStatus | null {
  return (Object.values(CommunityPostStatus) as string[]).includes(value)
    ? (value as CommunityPostStatus)
    : null;
}

export function parseReason(value: string): CommunityReportReason | null {
  return (Object.values(CommunityReportReason) as string[]).includes(value)
    ? (value as CommunityReportReason)
    : null;
}

