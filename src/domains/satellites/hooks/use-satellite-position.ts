import { useEffect, useState } from "react";
import { getLatLonAltFromTLE } from "../utils/orbit";
import { TLE } from "../../../core/types";

const useSatellitePosition = (tle: TLE) => {
  const [position, setPosition] = useState<ReturnType<typeof getLatLonAltFromTLE>>(null);

  useEffect(() => {
    const update = () => setPosition(getLatLonAltFromTLE(tle));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [tle]);

  return position;
}

export { useSatellitePosition };
