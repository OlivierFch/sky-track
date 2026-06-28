import { memo, useEffect } from "react";
import { SatelliteEngine } from "../engines/satellite-engine";
import { latLonToCartesian } from "../utils/orbit";
import { ISatellite } from "../../../core/types";
import { useSatellitePosition } from "../hooks/use-satellite-position";
import { useSatelliteTrail } from "../hooks/use-satellite-trail";

type SatelliteProps = {
  satellite: ISatellite;
  controller: SatelliteEngine | null;
};

const SatelliteInner = ({ satellite, controller }: SatelliteProps) => {
  const { id, color, tle } = satellite;

  const pos = useSatellitePosition(tle);
  const { trail, version } = useSatelliteTrail(tle);

  useEffect(() => {
    if (!controller) return;
    controller.add(id, color);
    return () => controller.removeSatelliteById(id);
  }, [controller, id, color]);

  useEffect(() => {
    if (!controller) return;
    controller.clearTrail(id);
  }, [controller, id, tle]);

  useEffect(() => {
    if (!controller || !pos || trail.length === 0) return;
    const positionInVec3 = latLonToCartesian(pos.lat, pos.lon, pos.sceneRadius);
    controller.update(id, positionInVec3, trail, version);
  }, [controller, id, pos, trail, version]);

  return null;
};

const Satellite = memo(SatelliteInner);

export { Satellite };
