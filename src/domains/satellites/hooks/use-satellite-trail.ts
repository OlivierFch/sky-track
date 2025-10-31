import { useState, useEffect } from "react";
import { twoline2satrec } from "satellite.js";
import { TLE, Vec3 } from "../../../core/types";
import { getLatLonAltFromTLE, latLonToCartesian } from "../utils/orbit";


const useSatelliteTrail = (
  tle: TLE | null,
  opts: {stepSec?: number; radius?: number } = {}
) => {
  const { stepSec = 5, radius = 1.03 } = opts;
  const [trail, setTrail] = useState<Vec3[]>([]);

  useEffect(() => {
    if (!tle) return;

    // Période orbitale (s) depuis le TLE
    const satrec = twoline2satrec(tle.line1, tle.line2);
    const periodSec = (2 * Math.PI) / satrec.no * 60; // satrec.no en rad/min

    const compute = () => {
      const now = Date.now();
      const pts: Vec3[] = [];

      for (let t = 0; t <= periodSec; t += stepSec) {
          const p = getLatLonAltFromTLE(tle, new Date(now + t * 1000))
          if (p && Number.isFinite(p.lat) && Number.isFinite(p.lon)) {
            pts.push(latLonToCartesian(p.lat, p.lon, radius));
          }
      }

      setTrail(pts);
    }

    compute();
    const id = setInterval(compute, 5000);
    return () => clearInterval(id);
  }, [tle, stepSec, radius]);

  return trail;
};

export { useSatelliteTrail };
