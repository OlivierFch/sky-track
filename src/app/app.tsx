import { useCallback, useEffect, useRef, useState } from "react";
import { useSatellites } from "../domains/satellites/hooks/use-satellites";
import { useStarlinkNetwork } from "../domains/satellites/hooks/use-starlink-network";
import { GlobeVisibility } from "../core/types";
import { Globe, GlobeHandle } from "../domains/globe/components/globe/globe";
import { LeftSidebar } from "../ui/layouts/left-sidebar/left-sidebar";
import { RightSidebar } from "../ui/layouts/right-sidebar/right-sidebar";
import { useKeyShortcut } from "../hooks/use-key-shortcut";
import "../styles.css";

const App = () => {
  const { satellites, selectedSatelliteId, setSelectedSatelliteId } = useSatellites();
  const [globeVisibility, setGlobeVisibility] = useState<GlobeVisibility>("visible");
  const [showTrails, setShowTrails] = useState(true);
  const [starlinkNetworkMode, setStarlinkNetworkMode] = useState(false);
  const globeRef = useRef<GlobeHandle>(null);

  const { tles } = useStarlinkNetwork(starlinkNetworkMode);

  useEffect(() => {
    if (tles.length > 0) {
      globeRef.current?.enableLaserNetwork(tles);
    }
  }, [tles]);

  useEffect(() => {
    if (!starlinkNetworkMode) {
      globeRef.current?.disableLaserNetwork();
    }
  }, [starlinkNetworkMode]);

  const handleVisibilityToggle = useCallback(() => {
    setGlobeVisibility(v => v === "visible" ? "hidden" : "visible");
  }, []);

  const handleTrailsToggle = useCallback(() => setShowTrails(v => !v), []);

  const handleSatelliteSidebarSelect = useCallback((id: string) => {
    setSelectedSatelliteId(prev => prev === id ? null : id);
  }, []);

  const handleFocusSun = useCallback(() => globeRef.current?.focusSun(), []);
  const handleFocusEarth = useCallback(() => globeRef.current?.focusEarth(), []);

  useKeyShortcut("h", handleVisibilityToggle);

  return (
    <div className="app">
      <LeftSidebar
        satellites={satellites}
        onSelect={handleSatelliteSidebarSelect}
        onToggleVisibility={handleVisibilityToggle}
        isGlobeVisible={globeVisibility === "visible"}
        showTrails={showTrails}
        onToggleTrails={handleTrailsToggle}
        onFocusSun={handleFocusSun}
        onFocusEarth={handleFocusEarth}
        selectedSatelliteId={selectedSatelliteId}
        starlinkNetworkMode={starlinkNetworkMode}
        onToggleStarlinkNetwork={() => setStarlinkNetworkMode(v => !v)}
      />

      <div className="view">
        <Globe
          ref={globeRef}
          satellites={satellites}
          selectedSatelliteId={selectedSatelliteId}
          globeVisibility={globeVisibility}
          showTrails={showTrails}
          onSatelliteSelect={setSelectedSatelliteId}
          showSatellites={!starlinkNetworkMode}
        />
      </div>

      <RightSidebar
        satellites={satellites}
        selectedSatelliteId={selectedSatelliteId}
      />
    </div>
  );
};

export { App };
