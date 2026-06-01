import {
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
} from "@prisma/client";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
} from "@/lib/message-template/safety";
import { validatePublishRules } from "@/lib/validators/message-template";

export function getMessageTemplateBulkPublishBlockReason(row: {
  status: MessageTemplateStatus;
  isInternalOnly: boolean;
  reviewedAt: Date | null;
  safeCopy: string | null;
  riskLevel: MessageTemplateRiskLevel;
}): string | null {
  if (row.status === MessageTemplateStatus.archived) {
    return "보관 상태에서는 공개할 수 없습니다.";
  }

  const publishRules = validatePublishRules({
    isPublished: true,
    status: row.status,
    isInternalOnly: row.isInternalOnly,
    safeCopy: row.safeCopy,
    riskLevel: row.riskLevel,
  });
  if (publishRules) return publishRules;

  if (!row.reviewedAt) {
    return "검수일이 없어 공개할 수 없습니다.";
  }

  const prohibited = findProhibitedPhrase(row.safeCopy);
  if (prohibited) {
    return `안전 문구에 금지 표현이 포함되어 있습니다: ${prohibited}`;
  }

  const sensitive = findSensitiveVariable(row.safeCopy);
  if (sensitive) {
    return `안전 문구에 민감 정보 변수가 포함되어 있습니다: ${sensitive}`;
  }

  return null;
}
