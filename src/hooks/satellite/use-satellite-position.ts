import { useState, useEffect } from "react";
import { getLatLonAltFromTLE } from "../../lib/orbit";
import { LatLngAlt, TLE } from "../../types";

const useSatellitePosition = (tle: TLE | null, tickMs = 1000) => {
    const [pos, setPos] = useState<LatLngAlt | null>(null);
    useEffect(() => {
        if (!tle) return;
        const id = setInterval(() => {
            const p = getLatLonAltFromTLE(tle, new Date())
            if (p) setPos(p);
        }, tickMs);
        return () => clearInterval(id);
    }, [tle, tickMs]);
    return pos;
};

export { useSatellitePosition };
