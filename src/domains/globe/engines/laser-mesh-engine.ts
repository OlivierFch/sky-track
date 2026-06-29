import * as THREE from "three";
import { TLE } from "../../../core/types";
import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLat, degreesLong } from "satellite.js";
import { latLonToCartesian, EARTH_RADIUS_KM } from "../../satellites/utils/orbit";

const MAX_LINKS = 1000;
const MAX_PULSES = MAX_LINKS * 2;
const LINK_DISTANCE_THRESHOLD = 0.25; // ~1590 km at Starlink altitude in scene units
const POSITION_UPDATE_INTERVAL = 1000; // ms — satellites don't move fast enough to need per-frame
const PULSE_TRAVEL_TIME = 2500; // ms per link traversal

export class LaserMeshEngine {
  private satrecs: ReturnType<typeof twoline2satrec>[] = [];
  private positions: THREE.Vector3[] = [];
  private activePairs: [number, number][] = [];
  private links: THREE.LineSegments;
  private pulses: THREE.InstancedMesh;
  private pulseTs: Float32Array;
  private dummy = new THREE.Object3D();
  private msSincePositionUpdate = Infinity; // force update on first tick

  constructor(private scene: THREE.Scene) {
    const linkGeom = new THREE.BufferGeometry();
    linkGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAX_LINKS * 6), 3));
    linkGeom.setDrawRange(0, 0);
    this.links = new THREE.LineSegments(linkGeom, new THREE.LineBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.4,
    }));
    this.links.frustumCulled = false;
    this.scene.add(this.links);

    this.pulses = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.005, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xaaddff }),
      MAX_PULSES,
    );
    this.pulses.count = 0;
    this.pulses.frustumCulled = false;
    this.scene.add(this.pulses);

    // Two pulses per link, staggered by half a cycle
    this.pulseTs = new Float32Array(MAX_PULSES);
    for (let i = 0; i < MAX_PULSES; i++) {
      this.pulseTs[i] = (i % 2) * 0.5;
    }
  }

  setTLEs(tles: TLE[]) {
    this.satrecs = tles.map(tle => twoline2satrec(tle.line1, tle.line2));
    this.positions = tles.map(() => new THREE.Vector3());
    this.msSincePositionUpdate = Infinity;
  }

  tick(deltaMs: number) {
    if (!this.satrecs.length) return;

    this.msSincePositionUpdate += deltaMs;

    if (this.msSincePositionUpdate >= POSITION_UPDATE_INTERVAL) {
      this.msSincePositionUpdate = 0;
      this.updatePositionsAndLinks();
    }

    this.advancePulses(deltaMs);
  }

  private updatePositionsAndLinks() {
    const now = new Date();
    const gmst = gstime(now);

    for (let i = 0; i < this.satrecs.length; i++) {
      const pv = propagate(this.satrecs[i], now);
      if (!pv?.position) continue;
      const geo = eciToGeodetic(pv.position as { x: number; y: number; z: number }, gmst);
      if (!isFinite(geo.latitude)) continue;
      const lat = degreesLat(geo.latitude);
      const lon = degreesLong(geo.longitude);
      const sceneRadius = 1.0 + Math.log1p(geo.height / EARTH_RADIUS_KM);
      const cart = latLonToCartesian(lat, lon, sceneRadius);
      this.positions[i].set(cart.x, cart.y, cart.z);
    }

    this.activePairs = [];
    const posAttr = this.links.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    let idx = 0;

    outer: for (let i = 0; i < this.positions.length; i++) {
      for (let j = i + 1; j < this.positions.length; j++) {
        if (this.positions[i].distanceTo(this.positions[j]) < LINK_DISTANCE_THRESHOLD) {
          const pairIdx = this.activePairs.length;
          this.activePairs.push([i, j]);
          arr[idx++] = this.positions[i].x; arr[idx++] = this.positions[i].y; arr[idx++] = this.positions[i].z;
          arr[idx++] = this.positions[j].x; arr[idx++] = this.positions[j].y; arr[idx++] = this.positions[j].z;
          if (pairIdx + 1 >= MAX_LINKS) break outer;
        }
      }
    }

    posAttr.needsUpdate = true;
    this.links.geometry.setDrawRange(0, this.activePairs.length * 2);
  }

  private advancePulses(deltaMs: number) {
    const pulseCount = this.activePairs.length * 2;
    if (pulseCount === 0) {
      this.pulses.count = 0;
      return;
    }

    this.pulses.count = pulseCount;
    const dt = deltaMs / PULSE_TRAVEL_TIME;

    for (let p = 0; p < pulseCount; p++) {
      this.pulseTs[p] = (this.pulseTs[p] + dt) % 1;
      const [i, j] = this.activePairs[Math.floor(p / 2)];
      this.dummy.position.lerpVectors(this.positions[i], this.positions[j], this.pulseTs[p]);
      this.dummy.updateMatrix();
      this.pulses.setMatrixAt(p, this.dummy.matrix);
    }
    this.pulses.instanceMatrix.needsUpdate = true;
  }

  setVisible(visible: boolean) {
    this.links.visible = visible;
    this.pulses.visible = visible;
  }

  dispose() {
    this.scene.remove(this.links, this.pulses);
    this.links.geometry.dispose();
    (this.links.material as THREE.Material).dispose();
    this.pulses.geometry.dispose();
    (this.pulses.material as THREE.Material).dispose();
  }
}
