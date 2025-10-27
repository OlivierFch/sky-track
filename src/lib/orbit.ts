import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLong, degreesLat } from "satellite.js";
import type { LatLngAlt, TLE } from "../types";

function now() {
  return new Date();
};

const getLatLonAltFromTLE = (
  tle: TLE,
  date: Date = now()
): LatLngAlt | null => {
  const satrec = twoline2satrec(tle.line1, tle.line2)

  // `propagate` can yield undefined position/velocity for invalid epochs or bad TLEs.
  const pv = propagate(satrec, date);
  if (!pv || !pv.position) return null;

  const gmst = gstime(date);
  const geo = eciToGeodetic(pv.position, gmst);

  // Guard against NaNs (can happen with pathological inputs)
  if (!isFinite(geo.latitude) || !isFinite(geo.longitude) || !isFinite(geo.height)) return null;

  const lat = degreesLat(geo.latitude);
  const lon = degreesLong(geo.longitude);
  const alt = geo.height;
  return { lat, lon, alt };
};

// Simple great-circle to 3D cartesian on unit sphere (Y up)
const latLonToCartesian = (latDeg: number, lonDeg: number, radius = 1) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const z = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  return { x, y, z };
};

export { getLatLonAltFromTLE, latLonToCartesian };
