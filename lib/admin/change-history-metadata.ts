/**
 * PR-133 — Admin-only row metadata for change governance (no audit table, no before/after diff).
 * Full change history requires PR133-B (separate migration PR).
 */

import {
  VerificationStatus,
  type ClaimDocument,
  type DisclosureLink,
  type Insurer,
  type KnowledgeArticle,
  type MessageTemplate,
} from "@prisma/client";

const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  [VerificationStatus.draft]: "초안",
  [VerificationStatus.needs_review]: "검수 필요",
  [VerificationStatus.verified]: "검수 완료",
  [VerificationStatus.unverified]: "검수 이력 없음",
  [VerificationStatus.pending]: "검수 대기",
};

export const CHANGE_HISTORY_LIMITATION_NOTE =
  "이 패널은 현재 행의 생성·수정 시각과 검수·게시 상태만 표시합니다. 변경 전/후 diff·일괄 작업·변경 사유 이력은 PR133-B(별도 DB PR)에서 제공 예정입니다.";

export const CHANGE_HISTORY_REASON_GUIDANCE =
  "변경 사유는 공식 출처 확인, 오탈자, 링크 만료, 검수 요청 등 업무 기준으로만 기록합니다. 상담 원문·고객정보·secret은 기록하지 않습니다.";

export type ChangeHistoryEntityType =
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template";

export type ChangeHistoryMetadataRow = {
  label: string;
  value: string;
};

export type ChangeHistoryMetadataSnapshot = {
  entityType: ChangeHistoryEntityType;
  entityTypeLabel: string;
  entityId: string;
  rows: ChangeHistoryMetadataRow[];
};

function formatIsoDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function maskOperatorId(id: string | null | undefined): string {
  if (!id?.trim()) return "—";
  if (id.length <= 8) return "운영자(내부 ID)";
  return `운영자 ···${id.slice(-6)}`;
}

function verificationLabel(status: VerificationStatus): string {
  return VERIFICATION_STATUS_LABEL[status] ?? status;
}

const ENTITY_TYPE_LABEL: Record<ChangeHistoryEntityType, string> = {
  insurer: "보험사",
  claim_document: "청구서류",
  knowledge_article: "지식 아카이브",
  disclosure_link: "공시·약관 링크",
  message_template: "고객 안내 문구",
};

const KNOWLEDGE_STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  verified: "검수 완료",
  rejected: "반려",
  archived: "보관",
};

const DISCLOSURE_STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  published: "게시",
  archived: "보관",
};

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  published: "게시",
  archived: "보관",
};

export function buildInsurerChangeHistoryMetadata(
  row: Insurer,
): ChangeHistoryMetadataSnapshot {
  return {
    entityType: "insurer",
    entityTypeLabel: ENTITY_TYPE_LABEL.insurer,
    entityId: row.id,
    rows: [
      { label: "생성 시각", value: formatIsoDate(row.createdAt) },
      { label: "최근 수정", value: formatIsoDate(row.updatedAt) },
      { label: "최근 검수 기준일", value: formatIsoDate(row.lastVerifiedAt) },
      { label: "검수 상태", value: verificationLabel(row.verificationStatus) },
      {
        label: "게시 여부",
        value: row.isPublished ? "게시 중" : "비게시",
      },
      { label: "등록 운영자", value: maskOperatorId(row.createdById) },
      { label: "최근 수정 운영자", value: maskOperatorId(row.updatedById) },
      {
        label: "업무 링크",
        value:
          "전산·청구·홈페이지 등 링크 필드는 보험사 레코드에 포함됩니다. 링크 변경도 최근 수정 시각에 반영됩니다.",
      },
    ],
  };
}

export function buildClaimDocumentChangeHistoryMetadata(
  row: ClaimDocument,
): ChangeHistoryMetadataSnapshot {
  return {
    entityType: "claim_document",
    entityTypeLabel: ENTITY_TYPE_LABEL.claim_document,
    entityId: row.id,
    rows: [
      { label: "생성 시각", value: formatIsoDate(row.createdAt) },
      { label: "최근 수정", value: formatIsoDate(row.updatedAt) },
      { label: "최근 검수 기준일", value: formatIsoDate(row.lastVerifiedAt) },
      { label: "검수 상태", value: verificationLabel(row.verificationStatus) },
      {
        label: "게시 여부",
        value: row.isPublished ? "게시 중" : "비게시",
      },
      { label: "등록 운영자", value: maskOperatorId(row.createdById) },
      { label: "최근 수정 운영자", value: maskOperatorId(row.updatedById) },
    ],
  };
}

export function buildKnowledgeChangeHistoryMetadata(
  row: KnowledgeArticle,
): ChangeHistoryMetadataSnapshot {
  return {
    entityType: "knowledge_article",
    entityTypeLabel: ENTITY_TYPE_LABEL.knowledge_article,
    entityId: row.id,
    rows: [
      { label: "생성 시각", value: formatIsoDate(row.createdAt) },
      { label: "최근 수정", value: formatIsoDate(row.updatedAt) },
      { label: "게시 시각", value: formatIsoDate(row.publishedAt) },
      {
        label: "문서 상태",
        value: KNOWLEDGE_STATUS_LABEL[row.status] ?? row.status,
      },
      {
        label: "게시 여부",
        value: row.isPublished ? "게시 중" : "비게시",
      },
      { label: "등록 운영자", value: maskOperatorId(row.createdById) },
      { label: "최근 수정 운영자", value: maskOperatorId(row.updatedById) },
      { label: "검수 담당", value: maskOperatorId(row.reviewedById) },
      {
        label: "출처 확인",
        value: row.sourceCheckedAt
          ? formatIsoDate(row.sourceCheckedAt)
          : "미기록",
      },
    ],
  };
}

export function buildDisclosureLinkChangeHistoryMetadata(
  row: DisclosureLink,
): ChangeHistoryMetadataSnapshot {
  return {
    entityType: "disclosure_link",
    entityTypeLabel: ENTITY_TYPE_LABEL.disclosure_link,
    entityId: row.id,
    rows: [
      { label: "생성 시각", value: formatIsoDate(row.createdAt) },
      { label: "최근 수정", value: formatIsoDate(row.updatedAt) },
      { label: "게시 시각", value: formatIsoDate(row.publishedAt) },
      { label: "최근 검수 기준일", value: formatIsoDate(row.lastVerifiedAt) },
      {
        label: "링크 상태",
        value: DISCLOSURE_STATUS_LABEL[row.status] ?? row.status,
      },
      {
        label: "게시 여부",
        value: row.isPublished ? "게시 중" : "비게시",
      },
      { label: "등록 운영자", value: maskOperatorId(row.createdById) },
      { label: "최근 수정 운영자", value: maskOperatorId(row.updatedById) },
      { label: "검수 담당", value: maskOperatorId(row.reviewedById) },
    ],
  };
}

export function buildMessageTemplateChangeHistoryMetadata(
  row: MessageTemplate,
): ChangeHistoryMetadataSnapshot {
  return {
    entityType: "message_template",
    entityTypeLabel: ENTITY_TYPE_LABEL.message_template,
    entityId: row.id,
    rows: [
      { label: "생성 시각", value: formatIsoDate(row.createdAt) },
      { label: "최근 수정", value: formatIsoDate(row.updatedAt) },
      { label: "게시 시각", value: formatIsoDate(row.publishedAt) },
      {
        label: "문구 상태",
        value: MESSAGE_STATUS_LABEL[row.status] ?? row.status,
      },
      {
        label: "게시 여부",
        value: row.isPublished ? "게시 중" : "비게시",
      },
      {
        label: "내부 전용",
        value: row.isInternalOnly ? "예" : "아니오",
      },
      { label: "등록 운영자", value: maskOperatorId(row.createdById) },
      { label: "최근 수정 운영자", value: maskOperatorId(row.updatedById) },
      { label: "검수 담당", value: maskOperatorId(row.reviewedById) },
    ],
  };
}
