import { useEffect, useRef, useState } from "react";
import { ISatellite, GlobeVisibility } from "../../../../core/types";
import { Satellite } from "../../../satellites/components/satellite";
import { SatelliteController } from "../../../satellites/engines/satellite-controller";
import { GlobeEngine } from "../../engines/globe-engine";
import { GlobeHint } from "../globe-hint/globe-hint";

interface GlobeProps {
    satellites: ISatellite[];
    globeVisibility?: GlobeVisibility;
    selectedSatelliteId?: string | null;
    onSatelliteSelect?: (id: string | null) => void;
}

const Globe = ({
    satellites,
    globeVisibility = "visible",
    onSatelliteSelect,
    selectedSatelliteId
}: GlobeProps) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef<GlobeEngine | null>(null);
    const satellitecontrollerRef = useRef<SatelliteController | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    


    // Initialize the engine on mount
    useEffect(() => {
        if (!mountRef.current) return;

        const engine = new GlobeEngine(mountRef.current, () => setHasInteracted(true));
        const satelliteEngine = engine.getSatelliteEngine();

        if (onSatelliteSelect) satelliteEngine.onSatelliteSelected(onSatelliteSelect);

        const satelliteController = new SatelliteController(satelliteEngine);
        engineRef.current = engine;
        satellitecontrollerRef.current = satelliteController;

        return () => engine.dispose();
    }, []);

    // Update globe visibility
    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.setGlobeVisibility(globeVisibility);
    }, [globeVisibility]);

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
        {engineRef.current && satellitecontrollerRef.current &&
            satellites.map((satellite) => (
            <Satellite
                key={satellite.id}
                satellite={satellite}
                controller={satellitecontrollerRef.current}
            />
            ))}
            {!hasInteracted && <GlobeHint />}
        </div>
    );
};

export { Globe };
