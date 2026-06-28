import { useEffect, useState } from "react";
import { ISatellite, HexColor } from "../../../core/types";
import { fetchTLE } from "../api/fetch-tle";
import { clearTLECache } from "../api/tle-cache";

const SCIENTIFIC_COLOR: HexColor = "#3b82f6";
const STARLINK_COLOR: HexColor = "#22c55e";
const COMMS_COLOR: HexColor = "#f97316";

const SCIENTIFIC_NAMES = [
  "ISS (ZARYA)", "LAGEOS 1", "POLAR", "FORTE", "CALSPHERE 2",
  "HST", "TERRA", "AQUA", "AURA", "CALIPSO",
  "CLOUDSAT", "GRACE-FO 1", "GRACE-FO 2", "JASON-3", "SENTINEL-3A",
];
const STARLINK_NAMES = [
  "STARLINK-31874", "STARLINK-31875", "STARLINK-31876", "STARLINK-31877",
  "STARLINK-31878", "STARLINK-31879", "STARLINK-31880", "STARLINK-31881",
  "STARLINK-31882", "STARLINK-31883", "STARLINK-31884", "STARLINK-31885",
  "STARLINK-31886", "STARLINK-31887",
];
const COMMS_NAMES = [
  "INMARSAT 4-F1", "INMARSAT 4-F2", "INTELSAT 18", "THURAYA 3", "IRIDIUM 102",
  "INMARSAT 4-F3", "IRIDIUM 103", "IRIDIUM 104", "IRIDIUM 105", "IRIDIUM 106",
  "INTELSAT 17", "INTELSAT 19", "INTELSAT 20", "GALAXY 15", "TELSTAR 18V",
];

async function loadCategory(names: string[], color: HexColor): Promise<ISatellite[]> {
  const results = await Promise.allSettled(
    names.map(async (name): Promise<ISatellite> => {
      const tle = await fetchTLE(name);
      return { id: name, name, tle, color };
    })
  );
  return results.flatMap(r => r.status === "fulfilled" ? [r.value] : []);
}

async function loadDefaultSatellites(): Promise<ISatellite[]> {
  const [scientific, starlink, comms] = await Promise.all([
    loadCategory(SCIENTIFIC_NAMES, SCIENTIFIC_COLOR),
    loadCategory(STARLINK_NAMES, STARLINK_COLOR),
    loadCategory(COMMS_NAMES, COMMS_COLOR),
  ]);
  return [...scientific, ...starlink, ...comms];
}

const useSatellites = () => {
  const [satellites, setSatellites] = useState<ISatellite[]>([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);

  useEffect(() => {
    clearTLECache();
    loadDefaultSatellites()
      .then(setSatellites)
      .catch((err) => console.error("Failed to load satellites", err));
  }, []);

  return { satellites, selectedSatelliteId, setSelectedSatelliteId };
};

export { useSatellites, SCIENTIFIC_COLOR, STARLINK_COLOR, COMMS_COLOR };
