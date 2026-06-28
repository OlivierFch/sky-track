import { useCallback, useRef, useState } from "react";
import { useSatellites } from "../domains/satellites/hooks/use-satellites";
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
  const globeRef = useRef<GlobeHandle>(null);

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
      />

      <div className="view">
        <Globe
          ref={globeRef}
          satellites={satellites}
          selectedSatelliteId={selectedSatelliteId}
          globeVisibility={globeVisibility}
          showTrails={showTrails}
          onSatelliteSelect={setSelectedSatelliteId}
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
