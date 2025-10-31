import { TLE } from "../../../core/types";

const TLE_CACHE_PREFIX = "tle_cache_";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours


const loadTLECache = (name: string): TLE | null => {
    const raw = localStorage.getItem(TLE_CACHE_PREFIX + name);
    if (!raw) return null;

    try {
        const { expiry, data } = JSON.parse(raw);
        if (Date.now() < expiry) return data;
    } catch {}

    return null;
};

const saveTLECache = (name: string, tle: TLE): void => {
    localStorage.setItem(
        TLE_CACHE_PREFIX + name,
        JSON.stringify({ expiry: Date.now() + CACHE_DURATION_MS, data: tle })
    );
};


type ClearLocalStorageCacheMode = "all" | "expired" | "single";

/**
 * Clears TLE cache entries based on mode:
 * - "all": clears all entries
 * - "expired": clears only expired ones
 * - "single": clears a specific satellite by name
 */
const clearTLECache = (mode: ClearLocalStorageCacheMode = "expired", name?: string) => {
  const now = Date.now();

  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(TLE_CACHE_PREFIX)) return;

    if (mode === "single" && name && key === TLE_CACHE_PREFIX + name) {
      localStorage.removeItem(key);
    }

    if (mode === "all") {
      localStorage.removeItem(key);
    }

    if (mode === "expired") {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const { expiry } = JSON.parse(raw);
        if (typeof expiry === "number" && now > expiry) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key); // Clean up broken entries too
      }
    }
  });
};

export { clearTLECache, loadTLECache, saveTLECache };
