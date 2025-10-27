
type LatLon = { lat: number; lon: number; };
type LatLngAlt = { lat: number; lon: number; alt: number };

type TLE = {
    name: string;
    line1: string;
    line2: string;
};

type Vec3 = { x: number; y: number; z: number };

type GlobeVisibility = "visible" | "hidden";

type HexColor = `#${string}`;

type ISatellite = {
  id: string;              // Unique ID for the satellite
  name?: string;           // Optional human-readable name
  tle: TLE;                // TLE data to compute position
  color?: HexColor;          // Custom color (default if not provided)
};

export type { GlobeVisibility, HexColor, LatLon, LatLngAlt, ISatellite, TLE, Vec3 };
