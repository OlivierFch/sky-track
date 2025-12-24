import { Vec3 } from "../../../core/types";
import { SatelliteEngine } from "./satellite-engine";

/**
 * SatelliteController acts as a simple adapter between
 * React components and the Three.js SatelliteEngine.
 */
export class SatelliteController {
  constructor(private engine: SatelliteEngine) {}

  /** Add a new satellite to the scene. */
  add(id: string, color?: string) {
    this.engine.add(id, color);
  }

  clearTrail(id: string) {
    this.engine.clearTrail(id);
  }

  /** Update a satellite’s position and trail geometry. */
  update(id: string, pos: Vec3, trail: Vec3[], version: number) {
    this.engine.update(id, pos, trail, version);
  }

  /** Remove a satellite from the scene safely. */
  remove(id: string) {
    this.engine.removeSatelliteById(id);
  }

}
