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
    const { id, color, tle } = satellite;

    // Live satellite position (updates every animation frame or tick)
    const pos = useSatellitePosition(tle);

    // Orbit/trail computation (async, chunked)
    const { trail, version } = useSatelliteTrail(tle, { radius: 1.04 });

    /**
     * ✅ Add/remove satellite mesh + line on mount/unmount
     */
    useEffect(() => {
        if (!controller) return;

        controller.add(id, color);
        return () => controller.remove(id);
    }, [controller, id, color]);

    /**
     * ✅ Clear the trail immediately when TLE changes
     *    (important: makes ghost trails impossible)
     */
    useEffect(() => {
        if (!controller) return;
        controller.clearTrail(id);
    }, [controller, id, tle]); // run strictly when satellite.tle changes

    /**
     * ✅ Update mesh position + trail geometry
     *    Only once trail is computed
     */
    useEffect(() => {
        if (!controller || !pos || trail.length === 0) return;

        const positionInVec3 = latLonToCartesian(pos.lat, pos.lon, 1.04);
        controller.update(id, positionInVec3, trail, version);
    }, [controller, id, pos, trail, version]);

    return null;
};

export { Satellite };
