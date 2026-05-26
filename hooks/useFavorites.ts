"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Public, non-sensitive localStorage namespace. Stores only insurer ids — no
// phone numbers, no URLs, no user identity. See PR-32 description and
// docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md Section J.
const STORAGE_KEY = "plannerdesk:favoriteInsurers";
const STORAGE_VERSION = 1;
const STORAGE_EVENT = "plannerdesk:favoriteInsurers:update";

interface StoredFavorites {
  v: number;
  ids: string[];
}

const EMPTY_FROZEN: ReadonlySet<string> = Object.freeze(new Set<string>());

function readFromStorage(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY_FROZEN;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FROZEN;

    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      // Tolerate legacy/plain-array shape so any earlier prototypes still
      // hydrate. Defensive filter keeps non-string junk from crashing the UI.
      const ids = parsed.filter((s): s is string => typeof s === "string");
      return ids.length === 0 ? EMPTY_FROZEN : new Set(ids);
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "ids" in parsed &&
      Array.isArray((parsed as StoredFavorites).ids)
    ) {
      const ids = (parsed as StoredFavorites).ids.filter(
        (s): s is string => typeof s === "string",
      );
      return ids.length === 0 ? EMPTY_FROZEN : new Set(ids);
    }

    return EMPTY_FROZEN;
  } catch {
    // localStorage can throw on corrupt JSON, disabled storage, quota errors,
    // etc. Never surface the error to the public UI.
    return EMPTY_FROZEN;
  }
}

function writeToStorage(ids: ReadonlySet<string>): void {
  if (typeof window === "undefined") return;

  try {
    const payload: StoredFavorites = {
      v: STORAGE_VERSION,
      ids: Array.from(ids),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be disabled (private browsing, quota, sandbox). The
    // in-memory state still works for this session.
  }
}

// Cache the snapshot reference so useSyncExternalStore's referential equality
// check is stable across renders. We rebuild only after toggle() or after a
// cross-tab storage event.
let cachedSnapshot: ReadonlySet<string> = EMPTY_FROZEN;
let snapshotInitialized = false;

function getClientSnapshot(): ReadonlySet<string> {
  if (!snapshotInitialized) {
    cachedSnapshot = readFromStorage();
    snapshotInitialized = true;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_FROZEN;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedSnapshot = readFromStorage();
    callback();
  };
  const handleSameTab = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, handleSameTab);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, handleSameTab);
  };
}

function notifySameTab(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Event constructor is universally supported in modern browsers; this
    // guard is defensive only.
  }
}

export interface UseFavoritesResult {
  favorites: ReadonlySet<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

export function useFavorites(): UseFavoritesResult {
  const favorites = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((id: string) => {
    if (!id) return;
    const current = getClientSnapshot();
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    cachedSnapshot = next;
    writeToStorage(next);
    notifySameTab();
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  return useMemo(
    () => ({
      favorites,
      isFavorite,
      toggle,
      count: favorites.size,
    }),
    [favorites, isFavorite, toggle],
  );
}
