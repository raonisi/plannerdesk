// Beta feedback UI labels (PR-101).

import type {
  AnswerAssistantFeedbackNoteCategory,
  AnswerAssistantFeedbackReviewStatus,
  AnswerAssistantFeedbackSeverity,
  AnswerAssistantFeedbackType,
  AnswerAssistantFeedbackUsefulness,
  AnswerAssistantSafetySignal,
} from "@prisma/client";

export const BETA_FEEDBACK_TYPE_OPTIONS: {
  value: AnswerAssistantFeedbackType;
  label: string;
  description: string;
}[] = [
  {
    value: "post_session",
    label: "세션 후 안전 신호",
    description: "방금 사용한 세션의 안전·차단·고지 관련 신호",
  },
  {
    value: "blocked_experience",
    label: "차단 경험",
    description: "차단이 적절했는지, 과도했는지",
  },
  {
    value: "safety_concern",
    label: "안전 우려",
    description: "출력·근거·개인정보 노출 우려",
  },
  {
    value: "ui_understanding",
    label: "UI·고지 이해",
    description: "beta 고지·제한 안내 이해도",
  },
  {
    value: "other_signal",
    label: "기타 신호",
    description: "위 분류에 해당하지 않는 운영 신호",
  },
];

export const BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS: {
  value: AnswerAssistantSafetySignal;
  label: string;
}[] = [
  { value: "none", label: "특이 신호 없음" },
  { value: "blocking_felt_wrong", label: "차단이 부적절/과도함" },
  { value: "evidence_too_weak", label: "근거·출처 부족" },
  { value: "output_too_assertive", label: "출력이 단정적임" },
  { value: "missing_disclaimer", label: "고지·면책 부족" },
  { value: "prompt_injection_risk", label: "우회·주입 위험" },
  { value: "privacy_risk", label: "개인정보·민감정보 우려" },
];

export const BETA_FEEDBACK_SEVERITY_OPTIONS: {
  value: AnswerAssistantFeedbackSeverity;
  label: string;
}[] = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "중간" },
  { value: "high", label: "높음" },
];

export const BETA_FEEDBACK_USEFULNESS_OPTIONS: {
  value: AnswerAssistantFeedbackUsefulness;
  label: string;
}[] = [
  { value: "not_applicable", label: "해당 없음" },
  { value: "not_useful", label: "도움 안 됨" },
  { value: "partial", label: "일부 도움" },
  { value: "helpful", label: "도움 됨" },
];

export const BETA_FEEDBACK_NOTE_CATEGORY_OPTIONS: {
  value: AnswerAssistantFeedbackNoteCategory;
  label: string;
}[] = [
  { value: "blocking", label: "차단" },
  { value: "evidence", label: "근거" },
  { value: "output_safety", label: "출력 안전" },
  { value: "ui_copy", label: "UI·고지" },
  { value: "rate_limit", label: "사용량 제한" },
  { value: "other", label: "기타" },
];

export const BETA_FEEDBACK_REVIEW_STATUS_LABEL: Record<
  AnswerAssistantFeedbackReviewStatus,
  string
> = {
  new: "신규",
  triaged: "분류 완료",
  incident_candidate: "인시던트 후보",
  dismissed: "기각",
  resolved: "조치 완료",
};
