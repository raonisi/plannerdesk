import {
  CorrectionRequestPriority,
  CorrectionRequestStatus,
  CorrectionRequestType,
  CorrectionTargetType,
} from "@prisma/client";
import {
  REQUEST_TYPE_LABELS,
  TARGET_TYPE_LABELS,
} from "@/lib/correction-request/constants";

export const ADMIN_CORRECTION_COPY = {
  pageTitle: "정보 수정 제보 인박스",
  pageDescription:
    "public에서 접수된 정보 오류·개선 제보를 검토합니다. 상태 변경만으로 public 데이터는 바뀌지 않으며, 실제 수정은 각 도메인 관리 화면에서 수동으로 진행하세요.",
  detailTitle: "제보 상세",
  policySummary:
    "제보는 public에 자동 반영되지 않습니다. 보험금·의료·손해사정 판단 요청으로 처리하지 말고, 민감정보 의심 제보는 마스킹·삭제를 우선하세요.",
  sensitiveBanner:
    "이 제보에는 개인정보·의료정보·계약정보가 포함되었을 가능성이 있습니다. 원문을 외부로 복사하거나 다른 화면에 옮기지 말고, 필요 시 마스킹 또는 삭제 처리하세요.",
  payoutBanner:
    "이 제보는 보험금 지급 가능 여부나 손해사정성 판단 대상으로 처리하면 안 됩니다. 정보 오류 제보 여부만 확인하세요.",
  memoHint:
    "내부 처리 메모만 기록하세요. 고객 개인정보·의료정보·계약정보 원문은 입력하지 마세요.",
  targetLinkNote:
    "대상 관리 화면에서 직접 수정한 뒤, 이 제보의 상태를 APPLIED로 표시하세요. 자동 반영 기능은 없습니다.",
} as const;

export const STATUS_LABEL: Record<CorrectionRequestStatus, string> = {
  new: "신규",
  triaged: "1차 확인",
  needs_redaction: "마스킹 필요",
  accepted: "반영 승인",
  rejected: "반려",
  applied: "반영 완료",
  archived: "보관",
  deleted: "삭제",
};

export const PRIORITY_LABEL: Record<CorrectionRequestPriority, string> = {
  low: "낮음",
  normal: "보통",
  high: "높음",
  urgent: "긴급",
};

export { TARGET_TYPE_LABELS, REQUEST_TYPE_LABELS };

export const WRITABLE_STATUSES = Object.values(
  CorrectionRequestStatus,
) as CorrectionRequestStatus[];

export const WRITABLE_PRIORITIES = Object.values(
  CorrectionRequestPriority,
) as CorrectionRequestPriority[];

export function truncateListTitle(
  title: string,
  sensitive: boolean,
): string {
  const max = sensitive ? 40 : 72;
  if (title.length <= max) return title;
  return `${title.slice(0, max)}…`;
}

export function isTerminalStatus(status: CorrectionRequestStatus): boolean {
  return (
    status === CorrectionRequestStatus.rejected ||
    status === CorrectionRequestStatus.applied ||
    status === CorrectionRequestStatus.archived ||
    status === CorrectionRequestStatus.deleted
  );
}

export function statusTone(
  status: CorrectionRequestStatus,
): "green" | "gold" | "gray" | "navy" | "red" {
  if (status === CorrectionRequestStatus.applied) return "green";
  if (
    status === CorrectionRequestStatus.new ||
    status === CorrectionRequestStatus.needs_redaction
  ) {
    return "gold";
  }
  if (
    status === CorrectionRequestStatus.rejected ||
    status === CorrectionRequestStatus.deleted
  ) {
    return "red";
  }
  if (status === CorrectionRequestStatus.accepted) return "navy";
  return "gray";
}

export function priorityTone(
  priority: CorrectionRequestPriority,
): "green" | "gold" | "gray" | "red" {
  if (priority === CorrectionRequestPriority.urgent) return "red";
  if (priority === CorrectionRequestPriority.high) return "gold";
  return "gray";
}

export function targetTypeLabel(value: CorrectionTargetType): string {
  return TARGET_TYPE_LABELS[value];
}

export function requestTypeLabel(value: CorrectionRequestType): string {
  return REQUEST_TYPE_LABELS[value];
}
