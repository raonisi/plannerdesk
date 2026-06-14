/** Public-safe copy for work-tools folder/storage UI — no env or provider names. */

export const WORK_TOOLS_STORAGE_LOAD_ERROR =
  "현재 업무 자료를 불러오지 못했습니다. 잠시 후 다시 확인하거나, 상단 메뉴에서 필요한 업무를 계속 이용해 주세요.";

export const WORK_TOOLS_STORAGE_EMPTY_MESSAGE =
  "현재 표시할 업무 자료가 없습니다. 필요한 업무는 보험사 바로가기와 청구서류 메뉴에서 확인할 수 있습니다.";

export const WORK_TOOLS_STORAGE_FORBIDDEN_UI_TERMS = [
  ".env",
  "WORK_TOOLS_SUPABASE_URL",
  "WORK_TOOLS_SUPABASE_ANON_KEY",
  "WORK_TOOLS_FIREBASE_BUCKET",
  "ANON_KEY",
  "Supabase",
  "Firebase",
  "database",
  "fetch failed",
  "server error",
  "stack trace",
  "mock",
  "sample",
  "샘플",
  "예시",
] as const;

export function isWorkToolsStoragePublicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}
