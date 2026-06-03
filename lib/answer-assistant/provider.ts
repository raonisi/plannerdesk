// Answer draft LLM provider adapter (PR-94 stub — no API keys added).

import type { RetrievalCandidate } from "./retrieval-types";
import type { AnswerAssistantInput } from "./types";

/**
 * No approved LLM provider abstraction exists in the repository yet.
 * PR-94 must not add API keys or external provider packages.
 */
export function isAnswerDraftProviderConfigured(): boolean {
  return false;
}

export interface AnswerDraftProviderInput {
  input: AnswerAssistantInput;
  normalizedQuery: string;
  candidates: RetrievalCandidate[];
  needsOfficialCheck: boolean;
}

export interface AnswerDraftProviderResult {
  ok: boolean;
  draft?: string;
  errorMessage?: string;
}

/** Reserved for a future approved provider adapter. */
export function buildAnswerAssistantPrompt(
  payload: AnswerDraftProviderInput,
): { system: string; user: string } {
  const contextLines = payload.candidates
    .slice(0, 5)
    .map(
      (candidate, index) =>
        `${index + 1}. [${candidate.type}] ${candidate.title}${
          candidate.sourceUrl ? ` (${candidate.sourceUrl})` : ""
        }\n${candidate.safeText ?? candidate.summary ?? ""}`,
    )
    .join("\n\n");

  return {
    system: [
      "PlannerDesk 관리자 검수용 초안만 작성한다.",
      "보험금 지급 가능성, 손해사정성, 의료정보 해석, 특정 상품 추천, 가입 강권, 공포 조장을 금지한다.",
      "제공된 근거 밖 사실 단정을 금지한다.",
      "정보 부족 시 정보 부족을 명시하고 공식 확인 필요 항목을 표시한다.",
      "마지막에 관리자 검수 필요를 표시한다.",
    ].join("\n"),
    user: [
      `목적: ${payload.input.purpose}`,
      `톤: ${payload.input.tone}`,
      `요청: ${payload.normalizedQuery}`,
      `공식 확인 필요: ${payload.needsOfficialCheck ? "예" : "아니오"}`,
      "",
      "근거:",
      contextLines,
    ].join("\n"),
  };
}

export async function runAnswerDraftProvider(
  payload: AnswerDraftProviderInput,
): Promise<AnswerDraftProviderResult> {
  void payload;
  if (!isAnswerDraftProviderConfigured()) {
    return {
      ok: false,
      errorMessage: "PROVIDER_NOT_CONFIGURED",
    };
  }

  return {
    ok: false,
    errorMessage: "PROVIDER_NOT_IMPLEMENTED",
  };
}
