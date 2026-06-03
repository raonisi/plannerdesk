// Limited allowlist expansion plan thresholds (PR-104-C). Plan only — no auto apply.

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value?.trim()) return fallback;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const ALLOWLIST_EXPANSION_PLAN_DEFAULTS = {
  wave1MaxAdd: 3,
  wave1PctCap: 20,
  wave2MaxAdd: 5,
  wave2CumulativeCap: 10,
  wave1MinDays: 7,
  wave2MinDays: 14,
  wave3MinDays: 30,
  promptInjectionRepeatMin: 3,
  rateLimitRepeatMin: 5,
  highBlockRepeatMin: 10,
  candidatePreviewLimit: 25,
} as const;

export type AllowlistExpansionPlanConfig = {
  wave1MaxAdd: number;
  wave1PctCap: number;
  wave2MaxAdd: number;
  wave2CumulativeCap: number;
  wave1MinDays: number;
  wave2MinDays: number;
  wave3MinDays: number;
  promptInjectionRepeatMin: number;
  rateLimitRepeatMin: number;
  highBlockRepeatMin: number;
  candidatePreviewLimit: number;
};

export function getAllowlistExpansionPlanConfig(): AllowlistExpansionPlanConfig {
  return {
    wave1MaxAdd: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE1_MAX_ADD,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave1MaxAdd,
      1,
      10,
    ),
    wave1PctCap: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE1_PCT_CAP,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave1PctCap,
      5,
      50,
    ),
    wave2MaxAdd: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE2_MAX_ADD,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave2MaxAdd,
      1,
      20,
    ),
    wave2CumulativeCap: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE2_CUMULATIVE_CAP,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave2CumulativeCap,
      3,
      50,
    ),
    wave1MinDays: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE1_MIN_DAYS,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave1MinDays,
      3,
      60,
    ),
    wave2MinDays: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE2_MIN_DAYS,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave2MinDays,
      7,
      90,
    ),
    wave3MinDays: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_WAVE3_MIN_DAYS,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.wave3MinDays,
      14,
      180,
    ),
    promptInjectionRepeatMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_PROMPT_INJECTION_REPEAT_MIN,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.promptInjectionRepeatMin,
      2,
      20,
    ),
    rateLimitRepeatMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_RATE_LIMIT_REPEAT_MIN,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.rateLimitRepeatMin,
      3,
      50,
    ),
    highBlockRepeatMin: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_HIGH_BLOCK_REPEAT_MIN,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.highBlockRepeatMin,
      5,
      50,
    ),
    candidatePreviewLimit: parsePositiveInt(
      process.env.ANSWER_ASSISTANT_EXPANSION_CANDIDATE_PREVIEW_LIMIT,
      ALLOWLIST_EXPANSION_PLAN_DEFAULTS.candidatePreviewLimit,
      5,
      100,
    ),
  };
}

export function computeWave1AddSlots(
  currentAllowlistCount: number,
  config: AllowlistExpansionPlanConfig,
): number {
  const pctSlots = Math.floor(
    (currentAllowlistCount * config.wave1PctCap) / 100,
  );
  if (currentAllowlistCount === 0) {
    return Math.min(config.wave1MaxAdd, 3);
  }
  return Math.min(config.wave1MaxAdd, pctSlots > 0 ? pctSlots : config.wave1MaxAdd);
}
