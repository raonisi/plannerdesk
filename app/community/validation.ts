const BLOCKED_PATTERNS: RegExp[] = [
  /\b\d{2,3}-\d{3,4}-\d{4}\b/u,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/u,
  /\b\d{6}-\d{7}\b/u,
  /주민등록번호|신분증|운전면허|여권번호|계약번호|증권번호|계좌번호|고객명|고객번호/u,
  /병명|진단명|진단서|소견서|병원명|수술명|입원일|퇴원일|진료기록|처방전|검사결과|약제비|진료비/u,
  /보험금\s*받|지급\s*가능|보상\s*가능|청구\s*가능|면책|부지급|손해사정|지급\s*판단|얼마\s*받/u,
  /무조건\s*가입|반드시\s*가입|지금\s*안\s*하면\s*손해|해지하면\s*큰일|100%\s*보장|무조건\s*지급/u,
];

export const COMMUNITY_VALIDATION = {
  titleMin: 5,
  titleMax: 100,
  contentMin: 20,
  contentMax: 5000,
  reportMessageMax: 500,
};

export function sanitizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function hasBlockedContent(value: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(value));
}

export function hasUnsafeHtml(value: string): boolean {
  if (/<[^>]+>/u.test(value)) return true;
  if (/javascript:/iu.test(value)) return true;
  return false;
}

export function hasTooManyUrls(value: string): boolean {
  const matches = value.match(/https?:\/\//giu);
  return (matches?.length ?? 0) > 3;
}

export function communityBlockedMessage(): string {
  return "보험금 지급 가능 여부, 손해사정성 판단, 의료정보 해석에 해당할 수 있는 내용은 커뮤니티에 게시할 수 없습니다. 개인정보와 민감정보를 제외하고 일반 기준 중심으로 다시 작성해 주세요.";
}

