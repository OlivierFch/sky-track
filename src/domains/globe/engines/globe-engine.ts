import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GlobeVisibility } from "../../../core/types";
import { SatelliteEngine } from "../../satellites/engines/satellite-engine";

export class GlobeEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private earth: THREE.Mesh;
  private atmosphere: THREE.Mesh;
  private stars: THREE.Points;
  private raf = 0;
  private ro: ResizeObserver;
  private satellites: SatelliteEngine;
  public controls: OrbitControls;


  constructor(private mount: HTMLDivElement, private onFirstInteraction?: () => void) {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#030712");

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
    this.camera.position.set(0, 0, 3.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    // ResizeObserver
    this.ro = new ResizeObserver(() => {
      const w = this.mount.clientWidth || 800;
      const h = this.mount.clientHeight || 600;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.ro.observe(this.mount);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 3, 1);
    this.scene.add(light);
    

    // Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load("/earth_daymap.jpg");

    // Earth
    // Earth Geometry + Material
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture
    });
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);

    // Atmosphere
    this.atmosphere = new THREE.Mesh(
     new THREE.SphereGeometry(1.02, 64, 64),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#1e3a8a'), transparent: true, opacity: 0.2 })
    );
    this.scene.add(this.atmosphere);
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("start", () => {
      this.onFirstInteraction?.();
    });

    // Satellites marker
    this.satellites = new SatelliteEngine(
      this.scene,
      this.camera,
      this.renderer.domElement,
      this.controls
    );

    // Stars
    const starPos = new Float32Array(3000);
    for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 200;
    this.stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3)),
      new THREE.PointsMaterial({ size: 0.005 })
    );
    this.scene.add(this.stars);

    this.animate = this.animate.bind(this);
    this.animate();
  };

  private animate(): void {
    this.raf = requestAnimationFrame(this.animate);
    this.controls.update();

    const elapsed = performance.now();
    this.satellites.updateGlowPulse(elapsed);
    this.satellites.updateCameraFollow();

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

  setGlobeVisibility(mode: GlobeVisibility) {
    const visible = mode !== "hidden";

    this.earth.visible = visible;
    this.atmosphere.visible = visible;

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
  };
}
