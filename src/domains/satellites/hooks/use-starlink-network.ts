import { useEffect, useState } from "react";
import { TLE } from "../../../core/types";
import { fetchStarlinkGroup } from "../api/fetch-starlink-group";

const useStarlinkNetwork = (enabled: boolean) => {
  const [tles, setTles] = useState<TLE[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setTles([]);
      return;
    }
    setLoading(true);
    fetchStarlinkGroup(500)
      .then(setTles)
      .catch(err => console.error("Failed to load Starlink group:", err))
      .finally(() => setLoading(false));
  }, [enabled]);

  return { tles, loading };
};

export { useStarlinkNetwork };
