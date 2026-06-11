import { containsProhibitedFavoriteText, isProhibitedFavoriteType } from "./pii-guard";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "./storage-keys";

export type RecentWorkItem = {
  id: string;
  label: string;
  href: string;
  type: string;
};

export const RECENT_WORK_MAX_ITEMS = 4;

/** Allowed recent-work categories (no free-text search queries). */
export const ALLOWED_RECENT_WORK_TYPES = new Set([
  "insurer",
  "doc",
  "knowledge",
  "tool",
  "message",
  "shortcut",
]);

const INTERNAL_HREF_PATTERN = /^\/(directory|claim-documents|knowledge|work-tools|search|message-templates|disclosure-links)(\/|$|\?)/;

function isSafeRecentHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  return INTERNAL_HREF_PATTERN.test(trimmed);
}

export function isAllowedRecentWorkItem(item: RecentWorkItem): boolean {
  if (!item.id?.trim() || !item.label?.trim() || !item.href?.trim()) {
    return false;
  }
  if (!ALLOWED_RECENT_WORK_TYPES.has(item.type)) return false;
  if (isProhibitedFavoriteType(item.type)) return false;
  if (containsProhibitedFavoriteText(item.label)) return false;
  if (!isSafeRecentHref(item.href)) return false;
  return true;
}

export function sanitizeRecentWorkItems(items: unknown[]): RecentWorkItem[] {
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const result: RecentWorkItem[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const candidate = raw as Partial<RecentWorkItem>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.label !== "string" ||
      typeof candidate.href !== "string" ||
      typeof candidate.type !== "string"
    ) {
      continue;
    }
    const item: RecentWorkItem = {
      id: candidate.id,
      label: candidate.label,
      href: candidate.href,
      type: candidate.type,
    };
    if (!isAllowedRecentWorkItem(item)) continue;
    const dedupeKey = `${item.id}:${item.href}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(item);
    if (result.length >= RECENT_WORK_MAX_ITEMS) break;
  }

  return result;
}

export function pushRecentWorkItem(
  current: RecentWorkItem[],
  item: RecentWorkItem,
): RecentWorkItem[] {
  if (!isAllowedRecentWorkItem(item)) return current;
  const without = current.filter((row) => row.id !== item.id);
  return [item, ...without].slice(0, RECENT_WORK_MAX_ITEMS);
}

export function readRecentWorkFromStorage(
  raw: string | null,
): RecentWorkItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeRecentWorkItems(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function recentWorkStorageKey(): string {
  return PLANNER_FAVORITE_STORAGE_KEYS.homeRecents;
}
