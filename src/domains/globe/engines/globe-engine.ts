import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GlobeVisibility } from "../../../core/types";
import { SatelliteEngine } from "../../satellites/engines/satellite-engine";
import { getSunData } from "../utils/solar-position";
import { getPlanetPositions, getPlanetOrbitPoints } from "../utils/planetary-positions";

const SUN_DISTANCE = 20;

export class GlobeEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private earth: THREE.Mesh;
  private atmosphere: THREE.Mesh;
  private atmosphereGlow: THREE.Mesh;
  private stars: THREE.Points;
  private sunLight: THREE.DirectionalLight;
  private sunMesh: THREE.Mesh;
  private planetMeshes: { mercury: THREE.Mesh; venus: THREE.Mesh; mars: THREE.Mesh };
  private planetOrbitGroup: THREE.Group;
  private lerpTarget: THREE.Vector3 | null = null;
  private lerpCamera: THREE.Vector3 | null = null;
  private raf = 0;
  private ro: ResizeObserver;
  private satellites: SatelliteEngine;
  public controls: OrbitControls;

  constructor(private mount: HTMLDivElement, private onFirstInteraction?: () => void) {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#030712");

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 500);
    this.camera.position.set(0, 0, 7);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.ro = new ResizeObserver(() => {
      const w = this.mount.clientWidth || 800;
      const h = this.mount.clientHeight || 600;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.ro.observe(this.mount);

    // Sun light — position updated each frame to match real solar position
    this.sunLight = new THREE.DirectionalLight(0xfdfcea, 1.8);
    this.scene.add(this.sunLight);
    // Faint blue-tinted ambient so the night side isn't pitch black
    this.scene.add(new THREE.AmbientLight(0x0d1a2a, 1));

    const earthTexture = new THREE.TextureLoader().load("/earth_daymap.jpg");
    this.earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: earthTexture,
        specular: new THREE.Color(0x333333),
        shininess: 30,
      })
    );
    this.scene.add(this.earth);

    // Front-side atmosphere haze
    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 64, 64),
      new THREE.MeshBasicMaterial({ color: '#1e3a8a', transparent: true, opacity: 0.15 })
    );
    this.scene.add(this.atmosphere);

    // Back-side limb glow (gives the blue edge-glow visible from space)
    this.atmosphereGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshBasicMaterial({ color: '#2255cc', transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    this.scene.add(this.atmosphereGlow);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 1.2;
    this.controls.addEventListener("start", () => {
      this.lerpTarget = null;
      this.lerpCamera = null;
      this.onFirstInteraction?.();
    });

    this.satellites = new SatelliteEngine(this.scene, this.camera, this.renderer.domElement, this.controls);

    // Sun sphere — radius 3.0 (not to true scale, but clearly dominant over planets)
    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffee88 })
    );
    // Corona glow layer
    this.sunMesh.add(new THREE.Mesh(
      new THREE.SphereGeometry(5.0, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffcc44,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    ));
    this.scene.add(this.sunMesh);

    // Inner planets + Mars
    const makePlanet = (color: number, radius: number) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 12, 12),
        new THREE.MeshBasicMaterial({ color })
      );
      this.scene.add(mesh);
      return mesh;
    };
    // Radii proportional to Earth=1 (Mercury 0.38, Venus 0.95, Mars 0.53)
    this.planetMeshes = {
      mercury: makePlanet(0x8b8682, 0.38),
      venus: makePlanet(0xe8cda0, 0.95),
      mars: makePlanet(0xc1440e, 0.53),
    };

    // Planet orbit paths — hidden by default, shown when focusing the Sun
    const now = new Date();
    const makeOrbitLine = (pts: Array<[number, number, number]>, color: number) =>
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 })
      );
    this.planetOrbitGroup = new THREE.Group();
    this.planetOrbitGroup.add(makeOrbitLine(getPlanetOrbitPoints("mercury", now, SUN_DISTANCE), 0x888888));
    this.planetOrbitGroup.add(makeOrbitLine(getPlanetOrbitPoints("venus", now, SUN_DISTANCE), 0xe8cda0));
    this.planetOrbitGroup.add(makeOrbitLine(getPlanetOrbitPoints("earth", now, SUN_DISTANCE), 0x4488ff));
    this.planetOrbitGroup.add(makeOrbitLine(getPlanetOrbitPoints("mars", now, SUN_DISTANCE), 0xc1440e));
    this.planetOrbitGroup.visible = false;
    this.scene.add(this.planetOrbitGroup);

    // Stars
    const starPos = new Float32Array(3000);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 200;
    this.stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3)),
      new THREE.PointsMaterial({ size: 0.005 })
    );
    this.scene.add(this.stars);

    this.updateSun();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private updateSun() {
    const now = new Date();
    const { position, gmst } = getSunData(now, SUN_DISTANCE);
    this.sunLight.position.set(position.x, position.y, position.z);
    this.sunMesh.position.set(position.x, position.y, position.z);
    this.planetOrbitGroup.rotation.y = gmst;

    const planets = getPlanetPositions(now, SUN_DISTANCE);
    this.planetMeshes.mercury.position.set(planets.mercury.x, planets.mercury.y, planets.mercury.z);
    this.planetMeshes.venus.position.set(planets.venus.x, planets.venus.y, planets.venus.z);
    this.planetMeshes.mars.position.set(planets.mars.x, planets.mars.y, planets.mars.z);
  }

  private animate(): void {
    this.raf = requestAnimationFrame(this.animate);
    if (this.lerpTarget && this.lerpCamera) {
      this.camera.position.lerp(this.lerpCamera, 0.08);
      this.controls.target.lerp(this.lerpTarget, 0.08);
      if (this.camera.position.distanceTo(this.lerpCamera) < 0.05) {
        this.lerpTarget = null;
        this.lerpCamera = null;
      }
    }
    this.controls.update();

    const elapsed = performance.now();
    this.satellites.updateGlowPulse(elapsed);
    this.satellites.updateCameraFollow();
    this.updateSun();

    this.renderer.render(this.scene, this.camera);
  }

  getSatelliteEngine() {
    return this.satellites;
  }

  clearSatelliteSelection() {
    this.satellites.clearSelection();
  }

  public selectSatelliteById(id: string) {
    this.satellites.selectSatelliteById(id);
  }

  focusSun() {
    const sunPos = this.sunMesh.position.clone();
    // Pull back above the ecliptic plane to show all planetary orbits
    // Mars orbit can reach ~50 units from Earth; 120 units up covers the full system
    const mid = sunPos.clone().multiplyScalar(0.4);
    this.lerpTarget = mid;
    this.lerpCamera = mid.clone().add(new THREE.Vector3(0, 120, 0));
    this.planetOrbitGroup.visible = true;
    this.controls.minDistance = 3.5; // just outside sun radius of 3.0
  }

  focusEarth() {
    this.lerpTarget = new THREE.Vector3(0, 0, 0);
    this.lerpCamera = new THREE.Vector3(0, 0, 4);
    this.planetOrbitGroup.visible = false;
    this.controls.minDistance = 1.2;
  }

  setTrailsVisible(visible: boolean) {
    this.satellites.setTrailsVisible(visible);
  }

  setGlobeVisibility(mode: GlobeVisibility) {
    const visible = mode !== "hidden";
    this.earth.visible = visible;
    this.atmosphere.visible = visible;
    this.atmosphereGlow.visible = visible;
    const earthMat = this.earth.material as THREE.MeshPhongMaterial;
    earthMat.transparent = mode !== "visible";
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.satellites.disposeAll();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.mount) {
      this.mount.removeChild(this.renderer.domElement);
    }
    this.scene.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach(mm => mm.dispose());
      else material?.dispose();
    });
  }
}
