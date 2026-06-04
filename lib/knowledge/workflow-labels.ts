import { KnowledgeArticleStatus } from "@prisma/client";
import type { PublicKnowledgeStatus } from "@/lib/public/knowledge-display";

/** Admin list/form — operational wording (PR113). */
export const ADMIN_KNOWLEDGE_STATUS_LABEL: Record<
  KnowledgeArticleStatus,
  string
> = {
  [KnowledgeArticleStatus.draft]: "초안",
  [KnowledgeArticleStatus.needs_review]: "검수 대기",
  [KnowledgeArticleStatus.verified]: "공개 가능",
  [KnowledgeArticleStatus.archived]: "보류",
  [KnowledgeArticleStatus.rejected]: "수정 필요",
};

export const KNOWLEDGE_REGISTRATION_STEPS = [
  "제목·카테고리·태그·요약·본문을 입력합니다.",
  "저장 시 초안 또는 검수 대기 상태로 등록합니다.",
  "공식 출처와 금지 표현을 확인한 뒤 공개 가능 상태로 변경합니다.",
  "게시(공개)를 켜면 공개 화면 후보가 됩니다. draft·보류·수정 필요는 노출되지 않습니다.",
] as const;

export const KNOWLEDGE_REVIEW_CHECKLIST = [
  "공식 출처 URL·확인일이 기록되어 있는가",
  "보험금 지급 단정·손해사정 오인·개인정보 요청 문구가 없는가",
  "게시 전 검수 대기·수정 필요·보류 상태가 아닌가",
] as const;

/** Public list/detail — minimal trust hints (PR113). */
export function publicKnowledgeTrustHint(
  status: PublicKnowledgeStatus,
): string | null {
  if (status === "needs_review") {
    return "공식 확인 진행 중 · 최종 기준은 공식 출처를 확인하세요";
  }
  return null;
}
