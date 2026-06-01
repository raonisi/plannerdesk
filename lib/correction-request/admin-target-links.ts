import type { CorrectionTargetType } from "@prisma/client";

const CUID_PATTERN = /^c[a-z0-9]{20,30}$/i;

export function getCorrectionAdminTargetHref(
  targetType: CorrectionTargetType,
  targetId: string | null | undefined,
): { href: string | null; label: string } {
  if (!targetId || !CUID_PATTERN.test(targetId)) {
    return { href: null, label: "대상 없음 또는 ID 없음" };
  }

  switch (targetType) {
    case "insurer":
      return {
        href: `/admin/insurers/${targetId}/edit`,
        label: "보험사 관리 화면",
      };
    case "claim_document":
      return {
        href: `/admin/claim-documents/${targetId}/edit`,
        label: "청구서류 관리 화면",
      };
    case "disclosure_link":
      return {
        href: `/admin/disclosure-links/${targetId}/edit`,
        label: "공시·약관 관리 화면",
      };
    case "message_template":
      return {
        href: `/admin/message-templates/${targetId}/edit`,
        label: "고객문구 관리 화면",
      };
    case "knowledge_article":
      return {
        href: `/admin/knowledge/${targetId}/edit`,
        label: "지식 아카이브 관리 화면",
      };
    case "general":
      return { href: null, label: "일반 제보 (특정 대상 없음)" };
    default:
      return { href: null, label: "알 수 없는 대상" };
  }
}
