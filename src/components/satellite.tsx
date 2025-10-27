import { useEffect } from "react";
import { ISatellite } from "../types";
import { SatelliteController } from "../lib/three/satellite-controller";
import { useSatellitePosition } from "../hooks/satellite/use-satellite-position";
import { useSatelliteTrail } from "../hooks/satellite/use-satellite-trail";
import { latLonToCartesian } from "../lib/orbit";

type SatelliteProps = {
  satellite: ISatellite;
  controller: SatelliteController | null;
};

const Satellite = ({ satellite, controller }: SatelliteProps) => {
    const { id, color } = satellite;
    const pos = useSatellitePosition(satellite.tle);
    const trail = useSatelliteTrail(satellite.tle, { radius: 1.04 });

    useEffect(() => {
        controller?.add(id, color);
        return () => controller?.remove(id);
    }, [id, color]);

    useEffect(() => {
        if (pos && trail.length) {
        const positionInVec3 = latLonToCartesian(pos.lat, pos.lon, 1.04);
        controller?.update(id, positionInVec3, trail);
        }
    }, [pos, trail]);

    return null;
};

export { Satellite };
