import { useEffect, useState } from "react";
import { getLatLonAltFromTLE } from "../utils/orbit";
import { TLE, LatLngAlt } from "../../../core/types";

const useSatellitePosition = (tle: TLE) => {
  const [position, setPosition] = useState<LatLngAlt | null>(null);

  useEffect(() => {
    const update = () => setPosition(getLatLonAltFromTLE(tle));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [tle]);

  return position;
}

export { useSatellitePosition };
