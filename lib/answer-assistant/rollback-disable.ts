/**
 * Answer Assistant rollback / disable criteria (PR-137).
 * Documentation-aligned constants — no runtime auto-disable without operator action.
 */

export const ANSWER_ASSISTANT_ROLLBACK_TRIGGERS = [
  {
    id: "allowlist_bypass",
    label: "allowlist 우회",
    action: "즉시 gate OFF 검토 · allowlist 재확인",
  },
  {
    id: "verified_bypass",
    label: "verified planner 제한 우회",
    action: "배포 보류 · verified-access 점검",
  },
  {
    id: "output_safety_bypass",
    label: "output safety 우회",
    action: "긴급 수정 PR · 생성 중단",
  },
  {
    id: "audit_plaintext",
    label: "상담 원문·고객정보 저장 가능성",
    action: "즉시 중단 · audit 스키마·persist 점검",
  },
  {
    id: "rate_limit_bypass",
    label: "rate limit 우회",
    action: "확대 보류 · limit config 점검",
  },
  {
    id: "retention_failure",
    label: "retention cleanup 실패",
    action: "운영자 수동 cleanup · PR-126 체크리스트",
  },
  {
    id: "public_exposure",
    label: "public에서 AI 실행 동선",
    action: "rollback · route/guard 점검",
  },
] as const;

export const ANSWER_ASSISTANT_DISABLE_ENV_FLAGS = [
  "ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false",
  "allowlist 비우기(생성 차단)",
] as const;
