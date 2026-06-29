import { TLE } from "../../../core/types";

const CACHE_KEY = "starlink_group";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

const loadCache = (): TLE[] | null => {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const { expiry, data } = JSON.parse(raw);
    if (Date.now() < expiry) return data;
  } catch {}
  return null;
};

const saveCache = (tles: TLE[]): void => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    expiry: Date.now() + CACHE_DURATION_MS,
    data: tles,
  }));
};

const fetchStarlinkGroup = async (limit = 250): Promise<TLE[]> => {
  const cached = loadCache();
  if (cached) return cached.slice(0, limit);

  const url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch Starlink group: ${response.statusText}`);

  const text = await response.text();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const tles: TLE[] = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    tles.push({ name: lines[i], line1: lines[i + 1], line2: lines[i + 2] });
  }

  saveCache(tles);
  return tles.slice(0, limit);
};

export { fetchStarlinkGroup };
