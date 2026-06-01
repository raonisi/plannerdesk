import { DisclosureLinkStatus } from "@prisma/client";
import { isValidAdminUrl } from "@/lib/validators/disclosure-link";

export function getDisclosureBulkPublishBlockReason(row: {
  status: DisclosureLinkStatus;
  reviewedAt: Date | null;
  title: string;
  url: string;
}): string | null {
  if (row.status === DisclosureLinkStatus.archived) {
    return "보관 상태에서는 공개할 수 없습니다.";
  }
  if (row.status !== DisclosureLinkStatus.published) {
    return "검수 완료(published) 상태에서만 공개할 수 있습니다.";
  }
  if (!row.reviewedAt) {
    return "검수일이 없어 공개할 수 없습니다.";
  }
  if (!row.title.trim()) {
    return "제목이 비어 있습니다.";
  }
  if (!row.url.trim()) {
    return "URL이 비어 있습니다.";
  }
  if (!isValidAdminUrl(row.url)) {
    return "안전하지 않은 URL입니다.";
  }
  return null;
}
