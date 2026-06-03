// Answer Assistant draft generation orchestration (PR-94 / PR-97-A).

import {
  ANSWER_ASSIST_BLOCKED_MESSAGES,
  validateAnswerAssistantInput,
} from "./validation";
import {
  retrieveAnswerCandidates,
  toEvidenceItems,
} from "./retrieval";
import { buildOfficialCheckItemsForResult } from "./draft-builder";
import { describeInsufficientEvidenceReasons } from "./insufficient-evidence";
import { validateGeneratedDraft } from "./output-safety";
import {
  isAnswerDraftProviderConfigured,
  runAnswerDraftProvider,
} from "./provider";
import {
  ADMIN_REVIEW_CHECKLIST,
  ANSWER_ASSIST_PAGE_NOTICES,
  INSUFFICIENT_EVIDENCE_MESSAGE,
  OUTPUT_SAFETY_BLOCKED_MESSAGE,
} from "./constants";
import { purposeRequiresOfficialCheck } from "./labels";
import type {
  AnswerAssistantBlockedReason,
  AnswerAssistantDraftResult,
  AnswerAssistantInput,
} from "./types";

function blockedResult(
  blockedReason: AnswerAssistantBlockedReason,
  message: string,
  candidateCount = 0,
  evidence: ReturnType<typeof toEvidenceItems> = [],
  extra?: Partial<{
    needsOfficialCheck: boolean;
    insufficientEvidence: boolean;
    insufficientEvidenceReasons: string[];
    warnings: string[];
    safetyGatePassed: boolean;
    retrievalCompleted: boolean;
  }>,
): AnswerAssistantDraftResult {
  return {
    ok: false,
    blockedReason,
    message,
    evidence,
    warnings: extra?.warnings ?? [],
    candidateCount,
    needsOfficialCheck: extra?.needsOfficialCheck,
    insufficientEvidence: extra?.insufficientEvidence,
    insufficientEvidenceReasons: extra?.insufficientEvidenceReasons,
    safetyGatePassed: extra?.safetyGatePassed,
    retrievalCompleted: extra?.retrievalCompleted,
  };
}

export async function generateInternalAnswerDraft(
  input: AnswerAssistantInput,
): Promise<AnswerAssistantDraftResult> {
  const validation = validateAnswerAssistantInput(input);
  if (!validation.ok || !validation.normalizedQuery) {
    return blockedResult(
      validation.blockedReason ?? "VALIDATION",
      validation.message,
      0,
      [],
      { safetyGatePassed: false, retrievalCompleted: false },
    );
  }

  const normalizedQuery = validation.normalizedQuery;
  const requiresOfficialCheck =
    input.requiresOfficialCheck ||
    purposeRequiresOfficialCheck(input.purpose);

  const retrieval = await retrieveAnswerCandidates({
    query: normalizedQuery,
    audience: "admin",
    domain: input.domain,
    purpose: input.purpose,
    requiresOfficialCheck,
  });

  if (!retrieval.ok) {
    return blockedResult(
      "VALIDATION",
      retrieval.blockedMessage ?? "요청을 처리할 수 없습니다.",
      0,
      [],
      { safetyGatePassed: true, retrievalCompleted: false },
    );
  }

  const evidence = toEvidenceItems(retrieval.candidates);
  const candidateCount = retrieval.candidates.length;
  const warnings: string[] = [];

  if (retrieval.insufficientEvidence) {
    const insufficientEvidenceReasons = describeInsufficientEvidenceReasons(
      retrieval.candidates,
      input.purpose,
      requiresOfficialCheck,
    );
    return blockedResult(
      "INSUFFICIENT_EVIDENCE",
      INSUFFICIENT_EVIDENCE_MESSAGE,
      candidateCount,
      evidence,
      {
        needsOfficialCheck: retrieval.needsOfficialCheck,
        insufficientEvidence: true,
        insufficientEvidenceReasons,
        safetyGatePassed: true,
        retrievalCompleted: true,
      },
    );
  }

  if (retrieval.needsOfficialCheck) {
    warnings.push(
      "공식 약관·보험사 안내·공시 자료에서 최종 확인이 필요합니다.",
    );
  }

  const officialCheckItems = buildOfficialCheckItemsForResult(
    retrieval.candidates,
    Boolean(retrieval.needsOfficialCheck || requiresOfficialCheck),
  );

  if (!isAnswerDraftProviderConfigured()) {
    return blockedResult(
      "PROVIDER_NOT_CONFIGURED",
      ANSWER_ASSIST_BLOCKED_MESSAGES.PROVIDER_NOT_CONFIGURED,
      candidateCount,
      evidence,
      {
        warnings,
        needsOfficialCheck: Boolean(retrieval.needsOfficialCheck),
        safetyGatePassed: true,
        retrievalCompleted: true,
      },
    );
  }

  const providerResult = await runAnswerDraftProvider({
    input,
    normalizedQuery,
    candidates: retrieval.candidates,
    needsOfficialCheck: Boolean(retrieval.needsOfficialCheck),
  });

  if (!providerResult.ok || !providerResult.draft) {
    return blockedResult(
      providerResult.errorMessage === "PROVIDER_NOT_CONFIGURED"
        ? "PROVIDER_NOT_CONFIGURED"
        : "PROVIDER_ERROR",
      providerResult.errorMessage === "PROVIDER_NOT_CONFIGURED"
        ? ANSWER_ASSIST_BLOCKED_MESSAGES.PROVIDER_NOT_CONFIGURED
        : ANSWER_ASSIST_BLOCKED_MESSAGES.PROVIDER_ERROR,
      candidateCount,
      evidence,
      {
        warnings,
        safetyGatePassed: true,
        retrievalCompleted: true,
      },
    );
  }

  const outputSafety = validateGeneratedDraft(providerResult.draft);
  if (!outputSafety.ok) {
    return blockedResult(
      "OUTPUT_SAFETY_BLOCKED",
      OUTPUT_SAFETY_BLOCKED_MESSAGE,
      candidateCount,
      evidence,
      {
        warnings,
        safetyGatePassed: true,
        retrievalCompleted: true,
      },
    );
  }

  return {
    ok: true,
    draft: providerResult.draft,
    draftMode: "llm",
    providerConfigured: true,
    evidence,
    officialCheckItems,
    warnings,
    needsOfficialCheck: Boolean(
      retrieval.needsOfficialCheck || requiresOfficialCheck,
    ),
    insufficientEvidence: false,
    candidateCount,
    draftLabel: ANSWER_ASSIST_PAGE_NOTICES.draftLabel,
    footerDisclaimer: ANSWER_ASSIST_PAGE_NOTICES.footerDisclaimer,
    adminReviewChecklist: ADMIN_REVIEW_CHECKLIST,
  };
}
