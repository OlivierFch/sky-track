import { gstime } from "satellite.js";

const D2R = Math.PI / 180;
const EPS = 23.439 * D2R; // obliquity of ecliptic

// Keplerian elements at J2000.0 (Standish & Williams 2001)
// a: AU, e: dimensionless, i/omega/wBar/L0: degrees, n: degrees/day
const ELEMENTS = {
  mercury: { a: 0.38710, e: 0.20564, i: 7.006,  omega: 48.332,  wBar:  77.456, L0: 252.251, n: 4.09235 },
  venus:   { a: 0.72332, e: 0.00676, i: 3.398,  omega: 76.680,  wBar: 131.768, L0: 181.980, n: 1.60213 },
  earth:   { a: 1.00000, e: 0.01673, i: 0.000,  omega: 0.000,   wBar: 102.930, L0: 100.467, n: 0.98561 },
  mars:    { a: 1.52366, e: 0.09341, i: 1.851,  omega: 49.579,  wBar: 336.041, L0: 355.453, n: 0.52403 },
};

// Solve Kepler's equation via 6-step fixed-point iteration
const solveKepler = (M: number, e: number): number => {
  let E = M;
  for (let j = 0; j < 6; j++) E = M + e * Math.sin(E);
  return E;
};

// Heliocentric position in equatorial ECI (AU)
const helioECI = (el: typeof ELEMENTS.earth, daysSinceJ2000: number): [number, number, number] => {
  const L = ((el.L0 + el.n * daysSinceJ2000) % 360 + 360) % 360 * D2R;
  const wBar = el.wBar * D2R;
  const M = L - wBar;
  const omegaRad = el.omega * D2R;
  const argPeri = wBar - omegaRad;
  const incRad = el.i * D2R;

  const E = solveKepler(M, el.e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + el.e) * Math.sin(E / 2), Math.sqrt(1 - el.e) * Math.cos(E / 2));
  const r = el.a * (1 - el.e * Math.cos(E));
  const u = argPeri + nu;

  // Heliocentric ecliptic → equatorial ECI
  const xEcl = r * (Math.cos(omegaRad) * Math.cos(u) - Math.sin(omegaRad) * Math.sin(u) * Math.cos(incRad));
  const yEcl = r * (Math.sin(omegaRad) * Math.cos(u) + Math.cos(omegaRad) * Math.sin(u) * Math.cos(incRad));
  const zEcl = r * Math.sin(u) * Math.sin(incRad);

  return [xEcl, yEcl * Math.cos(EPS) - zEcl * Math.sin(EPS), yEcl * Math.sin(EPS) + zEcl * Math.cos(EPS)];
};

// ECI equatorial → scene (ECEF): scene.x=ECEF.x, scene.y=ECEF.z, scene.z=ECEF.y
const eciToScene = (ex: number, ey: number, ez: number, gmst: number, scale: number) => ({
  x: scale * (Math.cos(gmst) * ex + Math.sin(gmst) * ey),
  y: scale * ez,
  z: scale * (-Math.sin(gmst) * ex + Math.cos(gmst) * ey),
});

// Returns geocentric scene-space positions of the inner planets + Mars (scale: auToScene units per AU)
const getPlanetPositions = (date: Date, auToScene: number) => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const gmst = gstime(date);

  const earth = helioECI(ELEMENTS.earth, n);
  const geo = (el: typeof ELEMENTS.earth) => {
    const [px, py, pz] = helioECI(el, n);
    return eciToScene(px - earth[0], py - earth[1], pz - earth[2], gmst, auToScene);
  };

  return {
    mercury: geo(ELEMENTS.mercury),
    venus: geo(ELEMENTS.venus),
    mars: geo(ELEMENTS.mars),
  };
};

// Orbit path in group-local ECI notation (x=ECI.x, y=ECI.z, z=ECI.y) — same convention as ecliptic ring.
// Sweeps planet over one full orbital period with Earth fixed at `date`.
const getPlanetOrbitPoints = (
  planetName: "mercury" | "venus" | "earth" | "mars",
  date: Date,
  auToScene: number,
  steps = 181
): Array<[number, number, number]> => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const earth = helioECI(ELEMENTS.earth, n);
  const el = ELEMENTS[planetName];
  const period = 360 / el.n;
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const [px, py, pz] = helioECI(el, n + (i / steps) * period);
    pts.push([(px - earth[0]) * auToScene, (pz - earth[2]) * auToScene, (py - earth[1]) * auToScene]);
  }
  return pts;
};

export { getPlanetPositions, getPlanetOrbitPoints };
