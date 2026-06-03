// Rules-based draft assembly when LLM provider is unavailable (PR-94).

import {
  ANSWER_ASSIST_PAGE_NOTICES,
} from "./constants";
import {
  ANSWER_ASSIST_PURPOSE_OPTIONS,
  ANSWER_ASSIST_TONE_OPTIONS,
} from "./labels";
import type { RetrievalCandidate } from "./retrieval-types";
import type { AnswerAssistantInput } from "./types";

function purposeLabel(purpose: AnswerAssistantInput["purpose"]): string {
  return (
    ANSWER_ASSIST_PURPOSE_OPTIONS.find((option) => option.value === purpose)
      ?.label ?? purpose
  );
}

function toneLabel(tone: AnswerAssistantInput["tone"]): string {
  return (
    ANSWER_ASSIST_TONE_OPTIONS.find((option) => option.value === tone)?.label ??
    tone
  );
}

function buildOfficialCheckItems(
  candidates: RetrievalCandidate[],
  needsOfficialCheck: boolean,
): string[] {
  const items: string[] = [];

  if (needsOfficialCheck) {
    items.push("공식 약관·보험사 안내·공시 자료에서 최종 문구를 확인하세요.");
  }

  for (const candidate of candidates.slice(0, 3)) {
    if (candidate.sourceUrl) {
      items.push(
        `${candidate.title}: ${candidate.sourceUrl} (공식 출처 확인 필요)`,
      );
    }
  }

  if (items.length === 0) {
    items.push(
      "개별 사실관계, 약관 조항, 보험사 안내 기준은 관리자가 직접 확인해야 합니다.",
    );
  }

  return items;
}

export function buildRulesBasedDraft(params: {
  input: AnswerAssistantInput;
  normalizedQuery: string;
  candidates: RetrievalCandidate[];
  needsOfficialCheck: boolean;
}): string {
  const { input, normalizedQuery, candidates, needsOfficialCheck } = params;
  const topCandidates = candidates.slice(0, 4);
  const lines: string[] = [];

  lines.push(`## ${ANSWER_ASSIST_PAGE_NOTICES.draftLabel}`);
  lines.push("");
  lines.push(`> ${ANSWER_ASSIST_PAGE_NOTICES.providerNotConfigured}`);
  lines.push("");
  lines.push("### 요청 요약");
  lines.push(
    `- 목적: ${purposeLabel(input.purpose)} · 톤: ${toneLabel(input.tone)}`,
  );
  lines.push(`- 요청: ${normalizedQuery}`);
  lines.push("");
  lines.push("### 초안 (근거 기반 참고 문안)");
  lines.push(
    "아래 문단은 검수·공개 완료 자료를 바탕으로 조립한 **관리자 검토용 참고 초안**입니다. 고객 발송용 최종 문구가 아닙니다.",
  );
  lines.push("");

  if (topCandidates.length === 0) {
    lines.push("- 근거 자료가 없어 본문 초안을 조립하지 않았습니다.");
  } else {
    for (const candidate of topCandidates) {
      const snippet = candidate.safeText ?? candidate.summary ?? "";
      lines.push(`- **${candidate.title}**`);
      if (snippet) {
        lines.push(`  ${snippet}`);
      }
      if (candidate.sourceUrl) {
        lines.push(`  참고: ${candidate.sourceUrl}`);
      }
      lines.push(
        "  ※ 개별 지급 여부·의료 해석·상품 추천은 포함하지 않습니다.",
      );
    }
  }

  lines.push("");
  lines.push("### 공식 확인 필요");
  for (const item of buildOfficialCheckItems(candidates, needsOfficialCheck)) {
    lines.push(`- ${item}`);
  }

  lines.push("");
  lines.push("### 관리자 검수 필요");
  lines.push(
    "이 초안은 자동 생성된 참고 문안입니다. 사실관계, 약관, 보험사 공식 안내를 확인한 뒤에만 활용하세요.",
  );

  return lines.join("\n");
}

export function buildOfficialCheckItemsForResult(
  candidates: RetrievalCandidate[],
  needsOfficialCheck: boolean,
): string[] {
  return buildOfficialCheckItems(candidates, needsOfficialCheck);
}
