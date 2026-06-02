import {
  CommunityPostCategory,
  CommunityPostStatus,
  CommunityPostVisibility,
  CommunityReportReason,
} from "@prisma/client";

export const COMMUNITY_COPY = {
  pageTitle: "PlannerDesk 커뮤니티",
  pageDescription:
    "검증 설계사를 위한 실무 정보 공유 공간입니다. 보험금 판단, 손해사정성 판단, 의료정보 해석은 제공하지 않습니다.",
  writeNotice:
    "고객명, 연락처, 계약번호, 병명, 진단명, 청구서류 이미지는 입력하지 마세요.",
  blockedNotice:
    "현재 권한으로는 커뮤니티를 이용할 수 없습니다.",
  blindNotice: "운영 기준에 따라 블라인드 처리된 게시글입니다.",
  missingNotice: "삭제되었거나 접근할 수 없는 게시글입니다.",
} as const;

export const CATEGORY_LABEL: Record<CommunityPostCategory, string> = {
  notice: "공지",
  field_tips: "실무 노하우",
  claim_guide: "청구 안내",
  system_links: "전산·링크",
  knowledge_qa: "지식 Q&A",
  script_review: "문구 검토",
  community_qa: "일반 Q&A",
  other: "기타",
};

export const STATUS_LABEL: Record<CommunityPostStatus, string> = {
  draft: "임시",
  published: "게시",
  under_review: "검토",
  blinded: "블라인드",
  archived: "보관",
  deleted: "삭제",
};

export const VISIBILITY_LABEL: Record<CommunityPostVisibility, string> = {
  public: "공개",
  verified_only: "검증 설계사",
  admin_only: "관리자",
};

export const REPORT_REASON_LABEL: Record<CommunityReportReason, string> = {
  personal_info: "개인정보",
  medical_info: "의료정보",
  contract_info: "계약정보",
  claim_document: "청구자료",
  claim_judgment: "보험금 판단 요청",
  loss_adjustment: "손해사정성 판단",
  product_solicitation: "상품 강권",
  fear_marketing: "공포 조장",
  spam: "광고·스팸",
  external_contact: "외부 연락 유도",
  abuse: "비방·욕설",
  misinformation: "허위정보 의심",
  duplicate: "중복 게시",
  other: "기타",
};

export function postStatusTone(
  status: CommunityPostStatus,
): "green" | "gold" | "gray" | "red" | "navy" {
  if (status === CommunityPostStatus.published) return "green";
  if (status === CommunityPostStatus.under_review) return "gold";
  if (status === CommunityPostStatus.blinded || status === CommunityPostStatus.deleted) {
    return "red";
  }
  if (status === CommunityPostStatus.archived) return "navy";
  return "gray";
}

export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

