import { useCallback, useEffect, useState } from "react";
import { Globe } from "./components/globe";
import { useClock } from "./hooks/use-clock";
import { GlobeVisibility, HexColor, ISatellite } from "./types";
import { clearTLECache, fetchTLEFor } from "./lib/tle";
import { ColorBox, randomHexColor } from "./components/color-box/color-box";
import "./styles.css";

// TODO: Move to an other folder
async function loadDefaultSatellites(): Promise<ISatellite[]> {
  const names = ["ISS (ZARYA)", "CALSPHERE 2", "LAGEOS 1", "TDRS 5", "POLAR", "CUBESAT XI-IV (CO-57)", "GAOFEN-14 02"];
  const results = await Promise.all(
    names.map(async (name) => {
      const tle = await fetchTLEFor(name);
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

const App = () => {
    const clock = useClock();

    const [satellites, setSatellites] = useState<ISatellite[]>([]);
    const [globeVisibility, setGlobeVisibility] = useState<GlobeVisibility>("visible");
    const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);

    const handleVisibilityToggle = useCallback(() => {
      const newMode: GlobeVisibility = globeVisibility === "visible" ? "hidden" : "visible";
      setGlobeVisibility(newMode);
    }, [globeVisibility]);

    const handleSatelliteSidebarSelect = useCallback((id: string) => {
      setSelectedSatelliteId((prev) => (prev === id ? null : id)); // toggle behavior
    }, [selectedSatelliteId]);

    // TODO: Adding a new satellite manually
    const addSatellite = async (id: string, name: string, color: HexColor) => {
      const tle = await fetchTLEFor(name);
      setSatellites(sats => [...sats, { id, tle, color }]);
    };

    // Load satellite by default
    useEffect(() => {
      clearTLECache();
      loadDefaultSatellites()
        .then(setSatellites)
        .catch((err) => console.error("Failed to load default satellites", err));
    }, []);

    // TODO: See to separate in different files css style
    return (
      <div className="app">
        <div className="sidebar left">
          <div>
            <h1>SkyTrack</h1>
            <div className="card">
            <h2>Satellites</h2>
            <button onClick={handleVisibilityToggle}>{globeVisibility === "visible" ? "Hide Globe 🌍" : "Show Globe 🌎"}</button>
            <ul>
              {satellites.map(sat => (
                <li
                  key={sat.id}
                  className={`satellite_item ${sat.id === selectedSatelliteId ? "is-selected" : ""}`}
                  onClick={() => handleSatelliteSidebarSelect(sat.id)}
                  >
                    {sat.name} <ColorBox color={sat.color} />
                </li>
              ))}
            </ul>
          </div>
          </div>
          <div className="footer">
            <small>
              Built with <strong>Three.js</strong>, <strong>Satellite.js</strong>, and the <strong>Celestrak API</strong>.
            </small>
          </div>
        </div>

        <div className="view">
          <Globe
            satellites={satellites}
            globeVisibility={globeVisibility}
            onSatelliteSelect={setSelectedSatelliteId}
            selectedSatelliteId={selectedSatelliteId}
          />
        </div>

        <div className="sidebar right">
          <div className="card">
            <h2>Local time</h2>
            <p>{clock}</p>
          </div>
        </div>
      </div>
    );

};

export { App };
