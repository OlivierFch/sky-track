import { TLE } from "../../../core/types";
import { loadTLECache, saveTLECache } from "./tle-cache";

const fetchTLE = async (name: string): Promise<TLE> => {
  const cached = loadTLECache(name);

  if (cached) return cached;

  // Fetch new data
  const url = `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(name)}&FORMAT=TLE`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch TLE for ${name}: ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split("\n").map(line => line.trim());

  if (lines.length < 3) {
    throw new Error(`Invalid TLE data for ${name}`);
  }

  const tle: TLE = {
    name: lines[0],
    line1: lines[1],
    line2: lines[2],
  };

  saveTLECache(name, tle);

  return tle;
}

export { fetchTLE };
