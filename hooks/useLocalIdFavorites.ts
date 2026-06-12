"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_VERSION = 1;

interface StoredFavorites {
  v: number;
  ids: string[];
}

const EMPTY_FROZEN: ReadonlySet<string> = Object.freeze(new Set<string>());

function readIds(storageKey: string): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY_FROZEN;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return EMPTY_FROZEN;

    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
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
    return EMPTY_FROZEN;
  }
}

function writeIds(storageKey: string, ids: ReadonlySet<string>): void {
  if (typeof window === "undefined") return;

  try {
    const payload: StoredFavorites = {
      v: STORAGE_VERSION,
      ids: Array.from(ids),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // quota / private mode — in-memory session still works
  }
}

function storageEventName(storageKey: string): string {
  return `${storageKey}:update`;
}

function createStore(storageKey: string) {
  let cachedSnapshot: ReadonlySet<string> = EMPTY_FROZEN;
  let snapshotInitialized = false;

  const getClientSnapshot = (): ReadonlySet<string> => {
    if (!snapshotInitialized) {
      cachedSnapshot = readIds(storageKey);
      snapshotInitialized = true;
    }
    return cachedSnapshot;
  };

  const subscribe = (callback: () => void): (() => void) => {
    if (typeof window === "undefined") return () => undefined;

    const eventName = storageEventName(storageKey);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      cachedSnapshot = readIds(storageKey);
      callback();
    };
    const handleSameTab = () => {
      callback();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(eventName, handleSameTab);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(eventName, handleSameTab);
    };
  };

  const notifySameTab = (): void => {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(new Event(storageEventName(storageKey)));
    } catch {
      // defensive
    }
  };

  const toggle = (id: string): void => {
    if (!id || /[\s\n]/.test(id)) return;
    const current = getClientSnapshot();
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    cachedSnapshot = next;
    writeIds(storageKey, next);
    notifySameTab();
  };

  return { getClientSnapshot, subscribe, toggle };
}

const storeCache = new Map<string, ReturnType<typeof createStore>>();

function getStore(storageKey: string) {
  let store = storeCache.get(storageKey);
  if (!store) {
    store = createStore(storageKey);
    storeCache.set(storageKey, store);
  }
  return store;
}

export interface UseLocalIdFavoritesResult {
  favorites: ReadonlySet<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

export function useLocalIdFavorites(storageKey: string): UseLocalIdFavoritesResult {
  const store = getStore(storageKey);

  const favorites = useSyncExternalStore(
    store.subscribe,
    store.getClientSnapshot,
    () => EMPTY_FROZEN,
  );

  const toggle = useCallback((id: string) => {
    store.toggle(id);
  }, [store]);

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
