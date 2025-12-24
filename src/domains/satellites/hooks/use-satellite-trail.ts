import { useState, useEffect, useMemo } from "react";
import { twoline2satrec } from "satellite.js";
import { TLE, Vec3 } from "../../../core/types";
import { getLatLonAltFromTLE, latLonToCartesian } from "../utils/orbit";

type TrailOptions = {
  stepSec?: number;   // finer sample = smoother orbit
  radius?: number;
};

const CHUNK_DURATION_MS = 6; // limit blocking to prevent "Violation"

const useSatelliteTrail = (
  tle: TLE | null,
  opts: TrailOptions = {}
) => {
  const { stepSec = 5, radius = 1.03 } = opts;
  const [trail, setTrail] = useState<Vec3[]>([]);
  const [version, setVersion] = useState(0);

  // compute orbital period from tle once
  const periodSec = useMemo(() => {
    if (!tle) return null;
    const satrec = twoline2satrec(tle.line1, tle.line2);
    return (2 * Math.PI) / satrec.no * 60; // rad/min -> sec
  }, [tle]);

  useEffect(() => {
    if (!tle || !periodSec) return;

    let cancelled = false;
    let idleId: number | null = null;

    const computeTrailChunked = () => {
      const now = Date.now();
      const pts: Vec3[] = [];
      let t = 0;

      const processChunk = () => {
        if (cancelled) return;

        const start = performance.now();
        while (t <= periodSec && performance.now() - start < CHUNK_DURATION_MS) {
          const pos = getLatLonAltFromTLE(tle, new Date(now + t * 1000));
          if (pos) pts.push(latLonToCartesian(pos.lat, pos.lon, radius));
          t += stepSec;
        }

        if (!cancelled && t <= periodSec) {
          idleId = requestIdleCallback(processChunk);
        } else if (!cancelled) {
          setTrail(pts); // 🚀 trail finalized only once
          setVersion(v => v + 1);
        }
      };

      idleId = requestIdleCallback(processChunk);
    };

    computeTrailChunked();

    return () => {
      cancelled = true;
      if (idleId !== null) cancelIdleCallback(idleId);   // ✅ CANCEL PENDING IDLE JOB
    };
  }, [tle, periodSec, stepSec, radius]);


  return { trail, version };
};

export { useSatelliteTrail };
