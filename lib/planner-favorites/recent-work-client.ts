import {
  pushRecentWorkItem,
  readRecentWorkFromStorage,
  recentWorkStorageKey,
  RECENT_WORK_STORAGE_UPDATE_EVENT,
  writeRecentWorkToStorage,
  type RecentWorkInput,
} from "./recent-work";

/** Client-only: record a public workspace visit without breaking SSR or hydration. */
export function recordRecentWorkVisit(input: RecentWorkInput): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(recentWorkStorageKey());
    const current = readRecentWorkFromStorage(raw);
    const updated = pushRecentWorkItem(current, input);
    window.localStorage.setItem(recentWorkStorageKey(), writeRecentWorkToStorage(updated));
    window.dispatchEvent(new Event(RECENT_WORK_STORAGE_UPDATE_EVENT));
  } catch {
    // localStorage unavailable (private mode, quota, etc.)
  }
}
