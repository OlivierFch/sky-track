import { gstime } from "satellite.js";

// Simplified solar position (Spencer 1971, ~1° accuracy).
// Returns ECEF/scene-space position and GMST so callers need only one call.
const getSunData = (date: Date, distance: number) => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0; // days from J2000.0
  const L = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360 + 360) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const eps = 23.439 * Math.PI / 180;

  // Unit ECI vector toward sun
  const ex = Math.cos(lambda);
  const ey = Math.cos(eps) * Math.sin(lambda);
  const ez = Math.sin(eps) * Math.sin(lambda);

  // ECI → ECEF (rotate by GMST around polar axis),
  // then ECEF → scene (scene.x=ECEF.x, scene.y=ECEF.z, scene.z=ECEF.y)
  const gmst = gstime(date);
  return {
    position: {
      x: distance * (Math.cos(gmst) * ex + Math.sin(gmst) * ey),
      y: distance * ez,
      z: distance * (-Math.sin(gmst) * ex + Math.cos(gmst) * ey),
    },
    gmst,
  };
};

export { getSunData };
