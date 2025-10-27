import { useState, useCallback, useEffect } from "react";
import { TLE } from "../../types";
import { fetchTLEFor } from "../../lib/tle";

const useSatelliteTle = (satelliteName: "ISS (ZARYA)", refreshMs = 6 * 60 * 60 * 1000) => {
    const [tle, setTle] = useState<TLE | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            const t = await fetchTLEFor(satelliteName);
            setTle(t);
        } catch (e) {
            setError(String(e));
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, refreshMs);
        return () => clearInterval(id);
    }, [load, refreshMs])

    return { tle, error, refresh: load };
};

export { useSatelliteTle };