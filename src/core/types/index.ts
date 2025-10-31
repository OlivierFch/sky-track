type GlobeVisibility = "visible" | "hidden";
type HexColor = `#${string}`;

type Vec3 = { x: number; y: number; z: number };

type LatLon = { lat: number; lon: number; };
type LatLngAlt = { lat: number; lon: number; alt: number };

type TLE = {
    name: string;
    line1: string;
    line2: string;
};

type ISatellite = {
  id: string;
  name?: string;
  tle: TLE;
  color?: HexColor;
};

export type { GlobeVisibility, HexColor, LatLon, LatLngAlt, ISatellite, TLE, Vec3 };