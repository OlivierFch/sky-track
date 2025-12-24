import { useCallback, useEffect, useState } from "react";
import { HexColor, ISatellite } from "../../../core/types";
import { fetchTLE } from "../api/fetch-tle";
import { randomHexColor } from "../../../core/utils/random-hex-color";
import { clearTLECache } from "../api/tle-cache";

// TODO: Move to an other folder
async function loadDefaultSatellites(): Promise<ISatellite[]> {
  const names = [
    "AMC-3",
    "ASTRA 4A",
    "CALSPHERE 2",
    "COSMOS 2484",
    "FORTE",
    "HORIZONS-2",
    "HTV-X1",
    "ISS (ZARYA)",
    "LAGEOS 1",
    "NAVSTAR 43 (USA 132)",
    "POLAR",
    "STARLINK-31874",
    "TDRS 5",
    "WILDBLUE-1"
  ];
  const results = await Promise.all(
    names.map(async (name) => {
      const tle = await fetchTLE(name);
      return {
        id: name,
        name,
        tle,
        color: randomHexColor()
      };
    })
  );
  return results;
}

const useSatellites = () => {
    const [satellites, setSatellites] = useState<ISatellite[]>([]);
    const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);

    // TODO: Adding a new satellite manually
    const addSatellite = useCallback(async (id: string, name: string, color: HexColor) => {
      const tle = await fetchTLE(name);
      setSatellites(sats => [...sats, { id, tle, color }]);
    }, [fetchTLE]);

    useEffect(() => {
        clearTLECache();
        loadDefaultSatellites()
            .then(setSatellites)
            .catch((err) => {
                console.error("Failed to load default satellites", err);
            });
    }, [clearTLECache, loadDefaultSatellites]);

    return {
        satellites,
        selectedSatelliteId,
        setSelectedSatelliteId
    };
};

export { useSatellites };
