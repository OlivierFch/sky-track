import { useEffect } from "react";
import { SatelliteController } from "../engines/satellite-controller";
import { latLonToCartesian } from "../utils/orbit";
import { ISatellite } from "../../../core/types";
import { useSatellitePosition } from "../hooks/use-satellite-position";
import { useSatelliteTrail } from "../hooks/use-satellite-trail";

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
        if (!pos || trail.length === 0) return;
        const positionInVec3 = latLonToCartesian(pos.lat, pos.lon, 1.04);
        controller?.update(id, positionInVec3, trail);
    }, [pos, trail]);

    return null;
};

export { Satellite };
