import * as THREE from "three";
import { Vec3 } from "../../../core/types";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface SatelliteData {
  id: string;
  mesh: THREE.Mesh;
  trail: THREE.Line;
  color?: string;
  version?: number;
}

/**
 * SatelliteEngine manages all satellite meshes, trails, selection, glow pulsing,
 * and camera focus logic inside the Three.js scene.
 */
export class SatelliteEngine {
  private satellites = new Map<string, SatelliteData>();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedId: string | null = null;
  private onSelect?: (id: string | null) => void;
  private followSelected = false;

  constructor(
    private scene: THREE.Scene,
    private camera?: THREE.PerspectiveCamera,
    private domElement?: HTMLElement,
    private controls?: OrbitControls
  ) {
    if (this.camera && this.domElement) {
      this.domElement.addEventListener("click", this.handleClick);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Public API                                */
  /* -------------------------------------------------------------------------- */

  /** Register a callback fired whenever a satellite is selected or deselected. */
  public onSatelliteSelected(cb: (id: string | null) => void) {
    this.onSelect = cb;
  }

  /** Add a new satellite to the scene with its mesh and trail. */
  public add(id: string, color?: string) {
    if (this.satellites.has(id)) return;

    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: new THREE.Color(color ?? 0xffffff),
      emissiveIntensity: 0.3,
      shininess: 30,
    });

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 16), material);

    // Persistent empty geometry/line (we’ll just fill/update the buffer)
    const trailGeom = new THREE.BufferGeometry();
    // start with an empty attribute; we’ll replace buffer in update()
    trailGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
    const trailLine = new THREE.Line(
      trailGeom,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false,
      })
    );
    trailLine.frustumCulled = false; // long arcs shouldn’t be culled

    this.scene.add(mesh, trailLine);
    this.satellites.set(id, { id, mesh, trail: trailLine, color });
  }

  /** Update a satellite’s position and trail geometry each frame. */
  public update(id: string, position: Vec3, trailPoints: Vec3[], version: number) {
    const sat = this.satellites.get(id);
    if (!sat) return;

    // ✅ Ignore older trail updates
    if (sat.version !== undefined && version < sat.version) return;

    sat.version = version;

    // Update satellite position
    sat.mesh.position.set(position.x, position.y, position.z);

    // ✅ ALWAYS recreate geometry to ensure previous trail is gone
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array(trailPoints.length * 3);

    let i = 0;
    for (const p of trailPoints) {
      vertices[i++] = p.x;
      vertices[i++] = p.y;
      vertices[i++] = p.z;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geom.setDrawRange(0, trailPoints.length);

    // Dispose old geometry to avoid memory leaks
    sat.trail.geometry.dispose();

    // Replace geometry with fresh trail data
    sat.trail.geometry = geom;
  }

  public clearTrail(id: string) {
    const sat = this.satellites.get(id);
    if (!sat) return;

    const geom = sat.trail.geometry as THREE.BufferGeometry;
    // dispose old geometry and replace with an empty one
    geom.dispose();
    const empty = new THREE.BufferGeometry();
    empty.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
    sat.trail.geometry = empty;
    // reset version so next update is always accepted
    sat.version = undefined;
  }

  /** Select a satellite by ID (used by sidebar clicks). */
  public selectSatelliteById(id: string) {
    const sat = this.satellites.get(id);
    if (!sat || id === this.selectedId) return;

    this.clearSelection();
    this.highlight(id);
    this.onSelect?.(id);
    this.focusCameraOn(sat.mesh.position);
  }

  /** Safely remove a satellite by its ID. */
  public removeSatelliteById(id: string) {
    this.remove(id);
  }


  /** Show or hide all satellite trail lines. */
  public setTrailsVisible(visible: boolean) {
    for (const { trail } of this.satellites.values()) {
      trail.visible = visible;
    }
  }

  /** Deselect all satellites and stop following. */
  public clearSelection() {
    this.resetEmissive();
    this.selectedId = null;
    this.followSelected = false;
    this.onSelect?.(null);
  }

  /** Animate glow intensity over time (for unselected satellites). */
  public updateGlowPulse(time: number) {
    const base = 0.3;
    const amplitude = 0.08;
    const speed = 0.003;

    let i = 0;
    for (const [id, { mesh }] of this.satellites) {
      if (id === this.selectedId) continue;

      const mat = mesh.material as THREE.MeshPhongMaterial;
      const offset = i++ * 0.5;
      const pulse = base + Math.sin(time * speed + offset) * amplitude;
      mat.emissiveIntensity = THREE.MathUtils.clamp(pulse, 0, 1);
    }
  }

  /** Smoothly follow the currently selected satellite. */
  public updateCameraFollow() {
    if (!this.followSelected || !this.selectedId || !this.camera || !this.controls)
      return;

    const sat = this.satellites.get(this.selectedId);
    if (!sat) return;

    const targetPos = sat.mesh.position.clone();
    const distance = this.camera.position.length();
    const dir = targetPos.clone().normalize();
    const desiredCamPos = dir.multiplyScalar(distance);

    this.camera.position.lerp(desiredCamPos, 0.05);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /** Remove all satellites and cleanup listeners/materials. */
  public disposeAll() {
    this.satellites.forEach((_, id) => this.remove(id));
    this.domElement?.removeEventListener("click", this.handleClick);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Private Logic                              */
  /* -------------------------------------------------------------------------- */

  private handleClick = (event: MouseEvent) => {
    if (!this.camera || !this.domElement) return;

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.satellites.values()).map((s) => s.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const sat = Array.from(this.satellites.values()).find((s) => s.mesh === mesh);
      if (sat && sat.id !== this.selectedId) {
        this.clearSelection();
        this.highlight(sat.id);
        this.onSelect?.(sat.id);
        this.focusCameraOn(sat.mesh.position);
      }
    } else {
      this.clearSelection(); // clicked empty space → deselect all
    }
  };

  private highlight(id: string) {
    const sat = this.satellites.get(id);
    if (!sat) return;

    const mat = sat.mesh.material as THREE.MeshPhongMaterial;
    mat.emissiveIntensity = 1.2;
    this.selectedId = id;
    this.followSelected = true;
  }

  private resetEmissive() {
    for (const { mesh } of this.satellites.values()) {
      const mat = mesh.material as THREE.MeshPhongMaterial;
      mat.emissiveIntensity = 0.3;
    }
  }

  private remove(id: string) {
    const sat = this.satellites.get(id);
    if (!sat) return;

    this.scene.remove(sat.mesh, sat.trail);
    sat.mesh.geometry.dispose();
    sat.trail.geometry.dispose();
    (sat.mesh.material as THREE.Material).dispose();
    (sat.trail.material as THREE.Material).dispose();
    this.satellites.delete(id);
  }

  private focusCameraOn(target: THREE.Vector3) {
    if (!this.camera) return;

    const camera = this.camera;
    const start = camera.position.clone();
    const dir = target.clone().normalize();

    const minDist = 2.5;
    const newPos = dir.multiplyScalar(minDist);
    const duration = 1200;
    const startTime = performance.now();

    const animate = (t: number) => {
      const elapsed = Math.min(1, (t - startTime) / duration);
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * elapsed);
      camera.position.lerpVectors(start, newPos, ease);
      camera.lookAt(0, 0, 0);
      this.controls?.target.set(0, 0, 0);
      this.controls?.update();

      if (elapsed < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}
