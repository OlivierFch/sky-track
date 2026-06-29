import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ISatellite, GlobeVisibility, TLE } from "../../../../core/types";
import { Satellite } from "../../../satellites/components/satellite";
import { SatelliteEngine } from "../../../satellites/engines/satellite-engine";
import { GlobeEngine } from "../../engines/globe-engine";
import { GlobeHint } from "../globe-hint/globe-hint";

interface GlobeProps {
  satellites: ISatellite[];
  globeVisibility?: GlobeVisibility;
  showTrails?: boolean;
  selectedSatelliteId?: string | null;
  onSatelliteSelect?: (id: string | null) => void;
  showSatellites?: boolean;
}

interface GlobeHandle {
  focusSun: () => void;
  focusEarth: () => void;
  enableLaserNetwork: (tles: TLE[]) => void;
  disableLaserNetwork: () => void;
}

const Globe = forwardRef<GlobeHandle, GlobeProps>(({
  satellites,
  globeVisibility = "visible",
  showTrails = true,
  onSatelliteSelect,
  selectedSatelliteId,
  showSatellites = true,
}, ref) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GlobeEngine | null>(null);
  const satelliteEngineRef = useRef<SatelliteEngine | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useImperativeHandle(ref, () => ({
    focusSun: () => engineRef.current?.focusSun(),
    focusEarth: () => engineRef.current?.focusEarth(),
    enableLaserNetwork: (tles: TLE[]) => engineRef.current?.enableLaserNetwork(tles),
    disableLaserNetwork: () => engineRef.current?.disableLaserNetwork(),
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GlobeEngine(mountRef.current, () => setHasInteracted(true));
    const satelliteEngine = engine.getSatelliteEngine();

    if (onSatelliteSelect) satelliteEngine.onSatelliteSelected(onSatelliteSelect);

    engineRef.current = engine;
    satelliteEngineRef.current = satelliteEngine;

    return () => engine.dispose();
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setGlobeVisibility(globeVisibility);
  }, [globeVisibility]);

  useEffect(() => {
    engineRef.current?.setTrailsVisible(showTrails);
  }, [showTrails]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (selectedSatelliteId) {
      engine.selectSatelliteById(selectedSatelliteId);
    } else {
      engine.clearSatelliteSelection();
    }
  }, [selectedSatelliteId]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%" }}>
      {engineRef.current && satelliteEngineRef.current && showSatellites &&
        satellites.map((satellite) => (
          <Satellite
            key={satellite.id}
            satellite={satellite}
            controller={satelliteEngineRef.current}
          />
        ))}
      {!hasInteracted && <GlobeHint />}
    </div>
  );
});

Globe.displayName = "Globe";

export { Globe };
export type { GlobeHandle };
