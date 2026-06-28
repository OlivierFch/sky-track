import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLong, degreesLat } from "satellite.js";
import { TLE, LatLngAlt } from "../../../core/types";

const EARTH_RADIUS_KM = 6371;

// ponytail: module-level cache, safe for a fixed small set of TLEs loaded at startup
const sarecCache = new Map<string, ReturnType<typeof twoline2satrec>>();

const getSatrec = (tle: TLE) => {
  const key = tle.line1 + tle.line2;
  let satrec = sarecCache.get(key);
  if (!satrec) {
    satrec = twoline2satrec(tle.line1, tle.line2);
    sarecCache.set(key, satrec);
  }
  return satrec;
};

const getLatLonAltFromTLE = (
  tle: TLE,
  date: Date = new Date()
): (LatLngAlt & { velocityKms: number; sceneRadius: number }) | null => {
  const satrec = getSatrec(tle);

  const pv = propagate(satrec, date);
  if (!pv || !pv.position || !pv.velocity) return null;

  const gmst = gstime(date);
  const geo = eciToGeodetic(pv.position, gmst);
  if (!isFinite(geo.latitude) || !isFinite(geo.longitude) || !isFinite(geo.height)) return null;

  const lat = degreesLat(geo.latitude);
  const lon = degreesLong(geo.longitude);
  const alt = geo.height; // km above Earth surface
  const v = pv.velocity as { x: number; y: number; z: number };
  const velocityKms = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  // Log-compressed altitude: preserves LEO/MEO/GEO ordering while keeping all orbits on screen
  // ISS(400km)≈1.06  Starlink(550km)≈1.08  LAGEOS(5900km)≈1.67  GEO(35786km)≈2.89
  const sceneRadius = 1.0 + Math.log1p(alt / EARTH_RADIUS_KM);
  return { lat, lon, alt, velocityKms, sceneRadius };
};

// Great-circle lat/lon to 3D Cartesian on a sphere of given radius (Y-up convention)
const latLonToCartesian = (latDeg: number, lonDeg: number, radius = 1) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const z = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  return { x, y, z };
};

export { getLatLonAltFromTLE, latLonToCartesian, getSatrec, EARTH_RADIUS_KM };
