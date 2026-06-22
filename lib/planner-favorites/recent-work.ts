import { isUnsafeFavoriteHref } from "./favorite-safety";
import { containsProhibitedFavoriteText, isProhibitedFavoriteType } from "./pii-guard";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "./storage-keys";

export const PUBLIC_WORKSPACE_KINDS = [
  "directory",
  "claim-document",
  "disclosure-link",
  "work-tool",
  "message-template",
  "knowledge",
] as const;

export type PublicWorkspaceKind = (typeof PUBLIC_WORKSPACE_KINDS)[number];

export type StoredPublicWorkspaceItem = {
  version: 1;
  kind: PublicWorkspaceKind;
  publicId: string;
  href: string;
  title: string;
  updatedAt: number;
};

export type RecentWorkItem = {
  id: string;
  label: string;
  href: string;
  /** Legacy display category; prefer `kind` for new code. */
  type: string;
  kind: PublicWorkspaceKind;
  updatedAt: number;
};

export type RecentWorkInput = {
  id: string;
  label: string;
  href: string;
  type: string;
  kind?: PublicWorkspaceKind;
  updatedAt?: number;
};

export const RECENT_WORK_MAX_ITEMS = 6;
export const HOME_RECENT_DISPLAY_LIMIT = 4;
export const HOME_FAVORITES_DISPLAY_LIMIT = 8;

/** Allowed recent-work categories (no free-text search queries). */
export const ALLOWED_RECENT_WORK_TYPES = new Set([
  "insurer",
  "doc",
  "knowledge",
  "tool",
  "message",
  "shortcut",
]);

const PUBLIC_WORKSPACE_KIND_SET = new Set<string>(PUBLIC_WORKSPACE_KINDS);

const LEGACY_TYPE_TO_KIND: Record<string, PublicWorkspaceKind> = {
  insurer: "directory",
  doc: "claim-document",
  knowledge: "knowledge",
  tool: "work-tool",
  message: "message-template",
  shortcut: "directory",
};

const INTERNAL_HREF_PATTERN =
  /^\/(directory|claim-documents|knowledge|work-tools|search|message-templates|disclosure-links)(\/|$|\?)/;

const KIND_LABELS: Record<PublicWorkspaceKind, string> = {
  directory: "보험사",
  "claim-document": "청구",
  "disclosure-link": "공시",
  "work-tool": "도구",
  "message-template": "문구",
  knowledge: "지식",
};

function isSafeRecentHref(href: string): boolean {
  if (isUnsafeFavoriteHref(href)) return false;
  return INTERNAL_HREF_PATTERN.test(href.trim());
}

function inferKindFromHref(href: string): PublicWorkspaceKind {
  const path = href.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (path.startsWith("/claim-documents")) return "claim-document";
  if (path.startsWith("/disclosure-links")) return "disclosure-link";
  if (path.startsWith("/work-tools")) return "work-tool";
  if (path.startsWith("/message-templates")) return "message-template";
  if (path.startsWith("/knowledge")) return "knowledge";
  return "directory";
}

export function resolvePublicWorkspaceKind(
  type: string,
  href: string,
): PublicWorkspaceKind {
  if (type === "shortcut") return inferKindFromHref(href);
  return LEGACY_TYPE_TO_KIND[type] ?? inferKindFromHref(href);
}

export function publicWorkspaceKindLabel(kind: PublicWorkspaceKind): string {
  return KIND_LABELS[kind];
}

function legacyTypeFromKind(kind: PublicWorkspaceKind): string {
  switch (kind) {
    case "directory":
      return "insurer";
    case "claim-document":
      return "doc";
    case "knowledge":
      return "knowledge";
    case "work-tool":
      return "tool";
    case "message-template":
      return "message";
    case "disclosure-link":
      return "shortcut";
    default:
      return "shortcut";
  }
}

export function enrichRecentWorkItem(input: RecentWorkInput): RecentWorkItem {
  const kind = input.kind ?? resolvePublicWorkspaceKind(input.type, input.href);
  return {
    id: input.id.trim(),
    label: input.label.trim(),
    href: input.href.trim(),
    type: input.type,
    kind,
    updatedAt: input.updatedAt ?? Date.now(),
  };
}

export function isAllowedRecentWorkItem(
  item: Pick<RecentWorkItem, "id" | "label" | "href" | "type"> &
    Partial<Pick<RecentWorkItem, "kind">>,
): boolean {
  if (!item.id?.trim() || !item.label?.trim() || !item.href?.trim()) {
    return false;
  }
  const kind = item.kind ?? resolvePublicWorkspaceKind(item.type, item.href);
  if (!PUBLIC_WORKSPACE_KIND_SET.has(kind)) return false;
  if (!ALLOWED_RECENT_WORK_TYPES.has(item.type) && item.type !== "shortcut") {
    return false;
  }
  if (isProhibitedFavoriteType(item.type)) return false;
  if (containsProhibitedFavoriteText(item.label)) return false;
  if (containsProhibitedFavoriteText(item.id)) return false;
  if (!isSafeRecentHref(item.href)) return false;
  return true;
}

function recentWorkDedupeKey(item: Pick<RecentWorkItem, "id" | "kind">): string {
  return `${item.kind}:${item.id}`;
}

function normalizeStoredItem(raw: unknown, fallbackUpdatedAt: number): RecentWorkItem | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;

  if (record.version === 1) {
    const kind = record.kind;
    const publicId = record.publicId;
    const href = record.href;
    const title = record.title;
    const updatedAt = record.updatedAt;
    if (
      typeof kind !== "string" ||
      typeof publicId !== "string" ||
      typeof href !== "string" ||
      typeof title !== "string"
    ) {
      return null;
    }
    if (!PUBLIC_WORKSPACE_KIND_SET.has(kind)) return null;
    const item: RecentWorkItem = {
      id: publicId.trim(),
      label: title.trim(),
      href: href.trim(),
      type: legacyTypeFromKind(kind as PublicWorkspaceKind),
      kind: kind as PublicWorkspaceKind,
      updatedAt: typeof updatedAt === "number" && Number.isFinite(updatedAt)
        ? updatedAt
        : fallbackUpdatedAt,
    };
    return isAllowedRecentWorkItem(item) ? item : null;
  }

  const id = record.id;
  const label = record.label;
  const href = record.href;
  const type = record.type;
  if (
    typeof id !== "string" ||
    typeof label !== "string" ||
    typeof href !== "string" ||
    typeof type !== "string"
  ) {
    return null;
  }
  const kind =
    typeof record.kind === "string" && PUBLIC_WORKSPACE_KIND_SET.has(record.kind)
      ? (record.kind as PublicWorkspaceKind)
      : resolvePublicWorkspaceKind(type, href);
  const item: RecentWorkItem = {
    id: id.trim(),
    label: label.trim(),
    href: href.trim(),
    type,
    kind,
    updatedAt:
      typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt)
        ? record.updatedAt
        : fallbackUpdatedAt,
  };
  return isAllowedRecentWorkItem(item) ? item : null;
}

export function sanitizeRecentWorkItems(items: unknown[]): RecentWorkItem[] {
  if (!Array.isArray(items)) return [];

  const normalized: RecentWorkItem[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = normalizeStoredItem(items[index], Date.now() - index);
    if (item) normalized.push(item);
  }

  normalized.sort((a, b) => b.updatedAt - a.updatedAt);

  const seen = new Set<string>();
  const result: RecentWorkItem[] = [];
  for (const item of normalized) {
    const key = recentWorkDedupeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= RECENT_WORK_MAX_ITEMS) break;
  }

  return result;
}

export function pushRecentWorkItem(
  current: RecentWorkItem[],
  input: RecentWorkInput,
): RecentWorkItem[] {
  const item = enrichRecentWorkItem({ ...input, updatedAt: Date.now() });
  if (!isAllowedRecentWorkItem(item)) return current;

  const without = current.filter(
    (row) => recentWorkDedupeKey(row) !== recentWorkDedupeKey(item),
  );
  return [item, ...without]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, RECENT_WORK_MAX_ITEMS);
}

export function serializeRecentWorkForStorage(
  items: RecentWorkItem[],
): StoredPublicWorkspaceItem[] {
  return items.map((item) => ({
    version: 1 as const,
    kind: item.kind,
    publicId: item.id,
    href: item.href,
    title: item.label,
    updatedAt: item.updatedAt,
  }));
}

export function writeRecentWorkToStorage(items: RecentWorkItem[]): string {
  return JSON.stringify(serializeRecentWorkForStorage(items));
}

export function readRecentWorkFromStorage(raw: string | null): RecentWorkItem[] {
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

export const RECENT_WORK_STORAGE_UPDATE_EVENT = "plannerdesk.home.recents:update";
