import { useCallback, useEffect, useState } from "react";
import { HexColor, ISatellite } from "../../../core/types";
import { fetchTLE } from "../api/fetch-tle";
import { randomHexColor } from "../../../core/utils/random-hex-color";
import { clearTLECache } from "../api/tle-cache";

// TODO: Move to an other folder
async function loadDefaultSatellites(): Promise<ISatellite[]> {
  const names = ["ISS (ZARYA)", "CALSPHERE 2", "LAGEOS 1", "TDRS 5", "POLAR", "CUBESAT XI-IV (CO-57)", "GAOFEN-14 02"];
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
