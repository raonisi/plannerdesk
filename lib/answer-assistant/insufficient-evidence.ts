// Insufficient evidence reason builder (PR-97-A).

import { purposeRequiresOfficialCheck } from "./labels";
import type { RetrievalCandidate } from "./retrieval-types";
import type { AnswerAssistantPurpose } from "./types";

function hasOfficialCandidate(candidates: RetrievalCandidate[]): boolean {
  return candidates.some(
    (candidate) =>
      candidate.isOfficialSource ||
      candidate.type === "disclosure_link" ||
      (candidate.type === "insurer" && Boolean(candidate.sourceUrl)),
  );
}

function hasFactualCandidate(candidates: RetrievalCandidate[]): boolean {
  return candidates.some(
    (candidate) =>
      candidate.type === "knowledge_article" ||
      candidate.type === "disclosure_link" ||
      candidate.type === "claim_document" ||
      (candidate.type === "insurer" && Boolean(candidate.sourceUrl)),
  );
}

export function describeInsufficientEvidenceReasons(
  candidates: RetrievalCandidate[],
  purpose: AnswerAssistantPurpose,
  requiresOfficialCheck: boolean,
): string[] {
  const reasons: string[] = [];

  if (candidates.length === 0) {
    reasons.push("검색된 근거 후보가 0건입니다.");
  }

  const officialRequired =
    requiresOfficialCheck || purposeRequiresOfficialCheck(purpose);
  const hasOfficial = hasOfficialCandidate(candidates);
  const hasFactual = hasFactualCandidate(candidates);
  const onlyTemplates = candidates.every(
    (candidate) => candidate.type === "message_template",
  );

  if (officialRequired && !hasOfficial) {
    reasons.push("공식 출처(공시·약관·보험사 공식 링크)가 확인되지 않았습니다.");
  }

  if (
    onlyTemplates &&
    (purpose === "GENERAL_EXPLANATION" ||
      purpose === "KNOWLEDGE_SUMMARY" ||
      purpose === "DISCLOSURE_GUIDE")
  ) {
    reasons.push(
      "고객 안내 문구(safeCopy)만 있고 사실 설명 근거 문서가 부족합니다.",
    );
  }

  if (purpose === "DISCLOSURE_GUIDE" && !hasOfficial) {
    reasons.push("공시·약관 확인 경로 안내에 필요한 공식 링크가 부족합니다.");
  }

  if (purpose === "KNOWLEDGE_SUMMARY" && !hasFactual) {
    reasons.push("검수 완료 지식 문서 또는 공식 근거가 부족합니다.");
  }

  if (
    purpose === "CLAIM_DOCUMENT_GUIDE" &&
    !candidates.some((candidate) => candidate.type === "claim_document")
  ) {
    reasons.push("청구서류 안내 도메인 근거가 없습니다.");
  }

  if (reasons.length === 0 && candidates.length > 0) {
    reasons.push("요청 목적에 맞는 충분한 근거를 확보하지 못했습니다.");
  }

  return reasons;
}
