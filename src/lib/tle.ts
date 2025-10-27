import type { TLE } from '../types'


const TLE_CACHE_PREFIX = "tle_cache_";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

const fetchTLEFor = async (name: string): Promise<TLE> => {
  const key = TLE_CACHE_PREFIX + name;
  const cached = localStorage.getItem(key);

  if (cached) {
    const { expiry, data } = JSON.parse(cached);
    if (Date.now() < expiry) {
      return data;
    }
  }

  // Fetch new data
  const url = `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(name)}&FORMAT=TLE`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch TLE for ${name}: ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

  if (lines.length < 2) {
    throw new Error(`Invalid TLE data for ${name}`);
  }

  const tle: TLE = {
    name: lines[0],
    line1: lines[1],
    line2: lines[2],
  };

  localStorage.setItem(
    key,
    JSON.stringify({
      expiry: Date.now() + CACHE_DURATION_MS,
      data: tle,
    })
  );

  return tle;
}


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
}


export { clearTLECache, fetchTLEFor };
